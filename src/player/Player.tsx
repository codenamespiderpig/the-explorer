import { useEffect, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Ecctrl, type EcctrlHandle } from 'ecctrl'
import { canGather, gatherYield } from '../systems/gather'
import { useInventoryStore } from '../stores/inventoryStore'

const MOVE_KEYS = {
  forward: new Set(['KeyW', 'ArrowUp']),
  backward: new Set(['KeyS', 'ArrowDown']),
  leftward: new Set(['KeyA', 'ArrowLeft']),
  rightward: new Set(['KeyD', 'ArrowRight']),
  run: new Set(['ShiftLeft', 'ShiftRight']),
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

function FollowCamera({ ecctrl }: { ecctrl: RefObject<EcctrlHandle | null> }) {
  const { camera, gl } = useThree()
  const yaw = useRef(0)
  const pitch = useRef(0.45)
  const distance = useRef(8)
  const dragging = useRef(false)
  const ideal = useRef(new THREE.Vector3())
  const look = useRef(new THREE.Vector3())

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
  }, [gl])

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
    look.current.set(pos.x, pos.y + 1.1, pos.z)
    camera.lookAt(look.current)
  })

  return null
}

function useGatherInput() {
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
  }, [])
}

export function Player() {
  const ecctrl = useRef<EcctrlHandle>(null)
  const keys = useMovementKeys()
  useGatherInput()

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
  })

  return (
    <>
      <Ecctrl
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
      <FollowCamera ecctrl={ecctrl} />
    </>
  )
}
