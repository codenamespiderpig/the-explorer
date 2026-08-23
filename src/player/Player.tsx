import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Ecctrl, type EcctrlHandle } from 'ecctrl'
import { canGather, gatherYield } from '../systems/gather'
import { findNearestGatherable } from '../systems/proximity'
import { gatePlacementFromForward } from '../systems/gate'
import { cameraLook, facingDirection } from '../systems/facing'
import { ATTACK_RANGE, nearestTargetInRange, SWORD_DAMAGE } from '../systems/combat'
import { toolForGather } from '../systems/toolSwing'
import { ITEMS } from '../data/items'
import { useInventoryStore } from '../stores/inventoryStore'
import { useGameStore } from '../stores/gameStore'
import { useToolActionStore } from '../stores/toolActionStore'
import { listGatherables } from '../world/gatherableRegistry'
import { FALL_Y, clampToIsland } from '../world/bounds'
import { ToolSwing } from './ToolSwing'

const GATHER_RADIUS = 2.4

const MOVE_KEYS = {
  forward: new Set(['KeyW', 'ArrowUp']),
  backward: new Set(['KeyS', 'ArrowDown']),
  leftward: new Set(['KeyA', 'ArrowLeft']),
  rightward: new Set(['KeyD', 'ArrowRight']),
  run: new Set(['ShiftLeft', 'ShiftRight']),
}

/** Small backpack on the back with only tool handles barely poking out. */
function BackpackGear() {
  const swinging = useToolActionStore((s) => s.swinging)

  return (
    <group position={[0, 0.44, -0.32]} scale={0.9}>
      {/* Pack body */}
      <mesh castShadow>
        <boxGeometry args={[0.38, 0.42, 0.2]} />
        <meshStandardMaterial color="#7a4f28" />
      </mesh>
      {/* Top flap */}
      <mesh castShadow position={[0, 0.18, -0.01]}>
        <boxGeometry args={[0.4, 0.1, 0.22]} />
        <meshStandardMaterial color="#4a3015" />
      </mesh>

      {swinging !== 'wooden-sword' ? (
        <group position={[0.04, 0.2, 0]} rotation={[0.08, 0, 0.04]}>
          <mesh castShadow position={[0, 0.1, 0]}>
            <boxGeometry args={[0.025, 0.2, 0.025]} />
            <meshStandardMaterial color="#8a7a5a" />
          </mesh>
          <mesh castShadow position={[0, 0.01, 0]}>
            <boxGeometry args={[0.07, 0.02, 0.03]} />
            <meshStandardMaterial color="#b8b8b8" metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
      ) : null}

      {swinging !== 'wooden-axe' ? (
        <group position={[-0.14, 0.04, 0.01]} rotation={[0.15, 0, 0.55]}>
          <mesh castShadow position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.018, 0.02, 0.28, 5]} />
            <meshStandardMaterial color="#4a3018" />
          </mesh>
        </group>
      ) : null}

      {swinging !== 'wooden-pickaxe' ? (
        <group position={[0.14, 0.02, 0.01]} rotation={[0.18, 0, -0.55]}>
          <mesh castShadow position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.018, 0.02, 0.28, 5]} />
            <meshStandardMaterial color="#4a3018" />
          </mesh>
        </group>
      ) : null}
    </group>
  )
}

function CharacterModel() {
  return (
    <group>
      <mesh castShadow position={[0, 0.35, 0]}>
        <capsuleGeometry args={[0.28, 0.5, 4, 8]} />
        <meshStandardMaterial color="#3d7ea6" />
      </mesh>
      <mesh castShadow position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#f0c7a0" />
      </mesh>
      <BackpackGear />
      <ToolSwing />
    </group>
  )
}

/** Holds WASD/run state; jump is intentionally omitted. */
function useMovementKeys() {
  const keys = useRef({
    forward: false,
    backward: false,
    leftward: false,
    rightward: false,
    run: false,
  })

  useEffect(() => {
    const setKey = (code: string, pressed: boolean) => {
      if (MOVE_KEYS.forward.has(code)) keys.current.forward = pressed
      else if (MOVE_KEYS.backward.has(code)) keys.current.backward = pressed
      else if (MOVE_KEYS.leftward.has(code)) keys.current.leftward = pressed
      else if (MOVE_KEYS.rightward.has(code)) keys.current.rightward = pressed
      else if (MOVE_KEYS.run.has(code)) keys.current.run = pressed
    }
    const onDown = (e: KeyboardEvent) => setKey(e.code, true)
    const onUp = (e: KeyboardEvent) => setKey(e.code, false)
    const clear = () => {
      keys.current.forward = false
      keys.current.backward = false
      keys.current.leftward = false
      keys.current.rightward = false
      keys.current.run = false
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
      window.removeEventListener('blur', clear)
    }
  }, [])

  return keys
}

function FollowCamera({
  ecctrl,
  lookYaw,
  lastFacing,
}: {
  ecctrl: RefObject<EcctrlHandle | null>
  lookYaw: RefObject<number>
  lastFacing: RefObject<{ x: number; z: number }>
}) {
  const { camera, gl } = useThree()
  const yaw = lookYaw
  const pitch = useRef(0.45)
  const distance = useRef(8)
  const dragging = useRef(false)
  const ideal = useRef(new THREE.Vector3())
  const lookTarget = useRef(new THREE.Vector3())

  useEffect(() => {
    const el = gl.domElement
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      dragging.current = true
      el.setPointerCapture(e.pointerId)
    }
    const onPointerUp = (e: PointerEvent) => {
      dragging.current = false
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return
      yaw.current -= e.movementX * 0.005
      lastFacing.current = cameraLook(yaw.current)
      pitch.current = THREE.MathUtils.clamp(pitch.current - e.movementY * 0.005, 0.15, 1.2)
    }
    const onWheel = (e: WheelEvent) => {
      distance.current = THREE.MathUtils.clamp(distance.current + e.deltaY * 0.01, 4, 14)
    }
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointercancel', onPointerUp)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('wheel', onWheel, { passive: true })
    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointercancel', onPointerUp)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('wheel', onWheel)
    }
  }, [gl, lastFacing, yaw])

  useFrame(() => {
    if (!ecctrl.current) return
    const pos = ecctrl.current.currPos
    const d = distance.current
    const cosPitch = Math.cos(pitch.current)
    ideal.current.set(
      pos.x + Math.sin(yaw.current) * cosPitch * d,
      pos.y + Math.sin(pitch.current) * d + 1.2,
      pos.z + Math.cos(yaw.current) * cosPitch * d,
    )
    camera.position.lerp(ideal.current, 0.2)
    lookTarget.current.set(pos.x, pos.y + 1.1, pos.z)
    camera.lookAt(lookTarget.current)
  })

  return null
}

function useGatherInput() {
  const { clock } = useThree()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'KeyE' || event.repeat) return
      const state = useInventoryStore.getState()
      const { nearbyNodeId, nearbyResource, tools } = state
      if (!nearbyNodeId || !nearbyResource) {
        state.setHint('Walk closer to a tree or rock, then press E')
        return
      }
      if (!canGather(nearbyResource, tools)) {
        state.setHint(
          nearbyResource === 'wood'
            ? 'You need an axe to chop wood'
            : 'You need a pickaxe to mine stone',
        )
        return
      }
      if (useToolActionStore.getState().swinging) return
      useToolActionStore.getState().beginSwing(toolForGather(nearbyResource), clock.elapsedTime)
      const { item, amount } = gatherYield(nearbyResource)
      state.addItem(item, amount)
      window.dispatchEvent(
        new CustomEvent('explorer:harvest', { detail: { nodeId: nearbyNodeId } }),
      )
      state.setHint(`Gathered ${amount} ${item}`)
      state.setNearby(null, null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [clock])
}

function useAttackInput() {
  const { clock } = useThree()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'KeyF' || event.repeat) return
      const inv = useInventoryStore.getState()
      if (!inv.tools.includes('wooden-sword')) {
        inv.setHint('You need a sword to attack')
        return
      }
      if (useToolActionStore.getState().swinging) return

      const game = useGameStore.getState()
      const target = nearestTargetInRange(game.slimes, game.playerPos, ATTACK_RANGE)
      useToolActionStore.getState().beginSwing('wooden-sword', clock.elapsedTime)

      if (!target) {
        inv.setHint('Nothing in range — press F near a slime')
        return
      }

      const drop = game.hurtSlime(target.id, SWORD_DAMAGE)
      if (drop) {
        inv.addItem(drop.item, drop.amount)
        inv.setHint(`Slime dropped ${drop.amount} ${ITEMS[drop.item].name}`)
      } else {
        inv.setHint('You swiped at a slime')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [clock])
}

function useProximityTracking(ecctrl: RefObject<EcctrlHandle | null>) {
  const lastId = useRef<string | null>(null)

  useFrame(() => {
    if (!ecctrl.current) return
    const pos = ecctrl.current.currPos
    useGameStore.getState().setPlayerPos([pos.x, pos.y, pos.z])
    const nearest = findNearestGatherable(
      listGatherables(),
      [pos.x, pos.y, pos.z],
      GATHER_RADIUS,
    )
    const nextId = nearest?.id ?? null
    if (nextId === lastId.current) return
    lastId.current = nextId
    const store = useInventoryStore.getState()
    if (nearest) {
      store.setNearby(nearest.id, nearest.resource)
      store.setHint(`Press E to gather ${nearest.resource}`)
    } else {
      store.setNearby(null, null)
      store.setHint(
        'WASD · look · E gather · Q backpack · G place gate',
      )
    }
  })
}

function useGatePlacement(
  ecctrl: RefObject<EcctrlHandle | null>,
  lookYaw: RefObject<number>,
  keys: RefObject<{
    forward: boolean
    backward: boolean
    leftward: boolean
    rightward: boolean
    run: boolean
  }>,
  lastFacing: RefObject<{ x: number; z: number }>,
) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'KeyG' || e.repeat) return
      const inv = useInventoryStore.getState()
      const count = inv.items['wooden-gate'] ?? 0
      if (count < 1) {
        inv.setHint('Craft a Wooden Gate in your backpack first')
        return
      }
      if (!ecctrl.current) return
      const pos = ecctrl.current.currPos
      const k = keys.current
      const moving = k.forward || k.backward || k.leftward || k.rightward
      const forward = moving
        ? facingDirection(lookYaw.current, k)
        : lastFacing.current
      const { position, yaw } = gatePlacementFromForward(pos, forward, 2.8)
      inv.setItems({ ...inv.items, 'wooden-gate': count - 1 })
      useGameStore.getState().placeGate(position, yaw)
      inv.setHint('Gate placed — it will block night slimes until broken')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ecctrl, lookYaw, keys, lastFacing])
}

function useSlimeCastlePlacement(ecctrl: RefObject<EcctrlHandle | null>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'KeyC' || e.repeat) return
      const inv = useInventoryStore.getState()
      const count = inv.items['slime-castle'] ?? 0
      if (count < 1) {
        inv.setHint('Craft a Slime Castle first (needs lots of slime goop + Build)')
        return
      }
      if (!ecctrl.current) return
      const pos = ecctrl.current.currPos
      const placement: [number, number, number] = [pos.x, 0, pos.z + 2.5]
      inv.setItems({ ...inv.items, 'slime-castle': count - 1 })
      useGameStore.getState().placeSlimeCastle(placement)
      inv.setHint('Slime Castle placed — kill spawned slimes before they rot')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ecctrl])
}

export function Player() {
  const ecctrl = useRef<EcctrlHandle>(null)
  const lookYaw = useRef(0)
  const lastFacing = useRef({ x: 0, z: -1 })
  const keys = useMovementKeys()
  const respawnToken = useGameStore((s) => s.respawnToken)
  useGatherInput()
  useAttackInput()
  useProximityTracking(ecctrl)
  useGatePlacement(ecctrl, lookYaw, keys, lastFacing)
  useSlimeCastlePlacement(ecctrl)

  useFrame(() => {
    const body = ecctrl.current
    if (!body) return
    const k = keys.current
    body.setMovement({
      forward: k.forward,
      backward: k.backward,
      leftward: k.leftward,
      rightward: k.rightward,
      run: k.run,
      jump: false,
    })
    if (k.forward || k.backward || k.leftward || k.rightward) {
      lastFacing.current = facingDirection(lookYaw.current, k)
    }

    const t = body.body.translation()
    const clamped = clampToIsland(t.x, t.z)
    const fell = t.y < FALL_Y
    if (fell || clamped.x !== t.x || clamped.z !== t.z) {
      body.body.setTranslation(
        { x: fell ? 0 : clamped.x, y: fell ? 3 : t.y, z: fell ? 0 : clamped.z },
        true,
      )
      const v = body.body.linvel()
      body.body.setLinvel({ x: 0, y: fell ? 0 : v.y, z: 0 }, true)
    }
  })

  return (
    <>
      <Ecctrl
        key={respawnToken}
        ref={ecctrl}
        position={[0, 3, 0]}
        maxWalkVel={4}
        maxRunVel={6.5}
        jumpVel={0}
        floatHeight={0.2}
        capsuleHalfHeight={0.4}
        capsuleRadius={0.3}
      >
        <CharacterModel />
      </Ecctrl>
      <FollowCamera lookYaw={lookYaw} lastFacing={lastFacing} ecctrl={ecctrl} />
    </>
  )
}
