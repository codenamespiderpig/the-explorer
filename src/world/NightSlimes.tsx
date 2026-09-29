import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, type RapierRigidBody } from '@react-three/rapier'
import type { Group } from 'three'
import { useGameStore, type SlimeSource } from '../stores/gameStore'
import { isGateDestroyed } from '../systems/gate'
import { slimeRotPhase } from '../systems/slimeCastle'
import {
  ENEMY_BODY_Y,
  ENEMY_RADIUS,
  clampToBiomeLeash,
  enemyVisual,
  facingYaw,
  hubCenterForEnemyKind,
  isOutsideBiomeLeash,
  type EnemyKind,
} from '../systems/enemies'
import {
  isInCampfireLight,
  steerAwayFromCampfireLight,
} from '../systems/campfireLight'
import {
  DUNGEON_ENEMY_COOLDOWN,
  DUNGEON_ENEMY_DAMAGE,
  DUNGEON_ENEMY_SPEED,
} from '../systems/dungeon'

const SLIME_SPEED = 2.2
const ATTACK_RANGE = 1.4
const GATE_RANGE = 3.4
const ATTACK_COOLDOWN = 0.9
const SLIME_DAMAGE = 8
const GATE_DAMAGE = 10
const CASTLE_WANDER_SPEED = 0.55
const BIOME_AGGRO = 14

function slimeColors(source: SlimeSource, kind: EnemyKind, ageSec: number) {
  if (source === 'castle') {
    const phase = slimeRotPhase(ageSec)
    if (phase === 'rotting') {
      return { color: '#7a6a3a', emissive: '#3a3010', intensity: 0.15 }
    }
    return { color: '#8adf6a', emissive: '#2a6a18', intensity: 0.28 }
  }
  return enemyVisual(kind)
}

function SlimeEntity({
  id,
  position,
  source,
  kind,
}: {
  id: string
  position: [number, number, number]
  source: SlimeSource
  kind: EnemyKind
}) {
  const body = useRef<RapierRigidBody>(null)
  const visual = useRef<Group>(null)
  const cooldown = useRef(0)
  const localPos = useRef(position)
  const wanderAngle = useRef(Math.random() * Math.PI * 2)

  const faceToward = (toX: number, toZ: number) => {
    if (!visual.current) return
    visual.current.rotation.y = facingYaw(
      localPos.current[0],
      localPos.current[2],
      toX,
      toZ,
    )
  }

  useFrame((_, delta) => {
    const store = useGameStore.getState()
    const slime = store.slimes.find((s) => s.id === id)
    if (!slime || !body.current) return

    if (slime.source === 'castle') {
      wanderAngle.current += delta * 0.7
      const step = CASTLE_WANDER_SPEED * delta
      const nx = localPos.current[0] + Math.cos(wanderAngle.current) * step
      const nz = localPos.current[2] + Math.sin(wanderAngle.current) * step
      localPos.current = [nx, ENEMY_BODY_Y, nz]
      body.current.setNextKinematicTranslation({
        x: localPos.current[0],
        y: localPos.current[1],
        z: localPos.current[2],
      })
      faceToward(nx + Math.cos(wanderAngle.current), nz + Math.sin(wanderAngle.current))
      store.moveSlime(id, localPos.current)
      return
    }

    const isDungeon = slime.source === 'dungeon'
    const isBiome = slime.source === 'biome'
    const bodyY = isDungeon ? localPos.current[1] : ENEMY_BODY_Y
    const moveSpeed = isDungeon ? DUNGEON_ENEMY_SPEED : SLIME_SPEED
    const hitDamage = isDungeon ? DUNGEON_ENEMY_DAMAGE : SLIME_DAMAGE
    const hitCooldown = isDungeon ? DUNGEON_ENEMY_COOLDOWN : ATTACK_COOLDOWN
    if (!isBiome && !isDungeon && store.phase() !== 'night') return

    cooldown.current = Math.max(0, cooldown.current - delta)
    const player = store.playerPos

    if (isBiome) {
      const [hubX, , hubZ] = hubCenterForEnemyKind(kind)
      const pdx = player[0] - localPos.current[0]
      const pdz = player[2] - localPos.current[2]
      const pdist = Math.hypot(pdx, pdz)
      const playerOutside = isOutsideBiomeLeash(player[0], player[2], hubX, hubZ)
      // Do not chase across the bridge onto other lands.
      if (pdist > BIOME_AGGRO || playerOutside) {
        const hdx = hubX - localPos.current[0]
        const hdz = hubZ - localPos.current[2]
        const hdist = Math.hypot(hdx, hdz) || 1
        if (hdist > 0.4) {
          const step = moveSpeed * 0.55 * delta
          const next = clampToBiomeLeash(
            localPos.current[0] + (hdx / hdist) * step,
            localPos.current[2] + (hdz / hdist) * step,
            hubX,
            hubZ,
          )
          localPos.current = [next.x, bodyY, next.z]
          body.current.setNextKinematicTranslation({
            x: localPos.current[0],
            y: localPos.current[1],
            z: localPos.current[2],
          })
          faceToward(hubX, hubZ)
          store.moveSlime(id, localPos.current)
        }
        return
      }
    }

    const gates = store.gates.filter((g) => !isGateDestroyed(g))
    let target: [number, number, number] = [player[0], bodyY, player[2]]
    let targetingGate = false
    let nearestGateDist = Infinity
    if (!isBiome && !isDungeon) {
      for (const g of gates) {
        const dx = g.position[0] - localPos.current[0]
        const dz = g.position[2] - localPos.current[2]
        const d = Math.hypot(dx, dz)
        if (d < nearestGateDist) {
          nearestGateDist = d
          if (d < 8) {
            target = [g.position[0], bodyY, g.position[2]]
            targetingGate = true
          }
        }
      }
    }

    const isNight = slime.source === 'night'
    const buildings = store.buildings
    const targetInLight =
      isNight && isInCampfireLight(target[0], target[2], buildings)

    faceToward(target[0], target[2])

    const dx = target[0] - localPos.current[0]
    const dz = target[2] - localPos.current[2]
    const dist = Math.hypot(dx, dz) || 1
    // Stay on the rim when the chase target sits inside campfire light.
    if (isNight && targetInLight && isInCampfireLight(localPos.current[0], localPos.current[2], buildings)) {
      const pushed = steerAwayFromCampfireLight(
        localPos.current[0],
        localPos.current[2],
        localPos.current[0],
        localPos.current[2],
        buildings,
      )
      localPos.current = [pushed.x, bodyY, pushed.z]
      body.current.setNextKinematicTranslation({
        x: localPos.current[0],
        y: localPos.current[1],
        z: localPos.current[2],
      })
      store.moveSlime(id, localPos.current)
      return
    }
    if (dist > ATTACK_RANGE) {
      const step = moveSpeed * delta
      let nx = localPos.current[0] + (dx / dist) * step
      let nz = localPos.current[2] + (dz / dist) * step
      if (isNight) {
        const steered = steerAwayFromCampfireLight(
          localPos.current[0],
          localPos.current[2],
          nx,
          nz,
          buildings,
        )
        nx = steered.x
        nz = steered.z
        // Don't walk into the glow toward a lit target — hold outside.
        if (targetInLight && isInCampfireLight(nx, nz, buildings)) {
          return
        }
      }
      if (isBiome) {
        const [hubX, , hubZ] = hubCenterForEnemyKind(kind)
        const clamped = clampToBiomeLeash(nx, nz, hubX, hubZ)
        nx = clamped.x
        nz = clamped.z
      }
      localPos.current = [nx, bodyY, nz]
      body.current.setNextKinematicTranslation({
        x: localPos.current[0],
        y: localPos.current[1],
        z: localPos.current[2],
      })
      store.moveSlime(id, localPos.current)
    } else if (cooldown.current <= 0) {
      if (!(isNight && targetInLight)) {
        cooldown.current = hitCooldown
        if (targetingGate && nearestGateDist <= GATE_RANGE) {
          store.damageNearestGate(localPos.current, GATE_DAMAGE)
        } else {
          const pdx = player[0] - localPos.current[0]
          const pdz = player[2] - localPos.current[2]
          if (Math.hypot(pdx, pdz) <= ATTACK_RANGE + 0.4) {
            store.damagePlayer(hitDamage)
          }
        }
      }
    }
  })

  const slime = useGameStore((s) => s.slimes.find((x) => x.id === id))
  const colors = slimeColors(source, kind, slime?.ageSec ?? 0)
  const eyeScale = kind === 'ember' ? 0.1 : kind === 'tide' ? 0.09 : 0.08

  return (
    <RigidBody
      ref={body}
      type="kinematicPosition"
      position={position}
      colliders="ball"
      sensor
    >
      <group ref={visual}>
        <mesh castShadow>
          <sphereGeometry args={[ENEMY_RADIUS, 16, 16]} />
          <meshStandardMaterial
            color={colors.color}
            emissive={colors.emissive}
            emissiveIntensity={colors.intensity}
          />
        </mesh>
        {kind === 'leaf' ? (
          <mesh castShadow position={[0, ENEMY_RADIUS * 0.55, 0]} rotation={[0.2, 0, 0.3]}>
            <boxGeometry args={[0.55, 0.08, 0.28]} />
            <meshStandardMaterial color="#1a6a28" />
          </mesh>
        ) : null}
        {kind === 'tide' ? (
          <mesh position={[0, -ENEMY_RADIUS * 0.15, 0]}>
            <torusGeometry args={[ENEMY_RADIUS * 0.55, 0.06, 8, 16]} />
            <meshStandardMaterial color="#a8e8ff" emissive="#66ccee" emissiveIntensity={0.35} />
          </mesh>
        ) : null}
        <mesh position={[0.16, 0.14, ENEMY_RADIUS * 0.7]}>
          <sphereGeometry args={[eyeScale, 8, 8]} />
          <meshStandardMaterial color="#102010" />
        </mesh>
        <mesh position={[-0.16, 0.14, ENEMY_RADIUS * 0.7]}>
          <sphereGeometry args={[eyeScale, 8, 8]} />
          <meshStandardMaterial color="#102010" />
        </mesh>
      </group>
    </RigidBody>
  )
}

export function NightSlimes() {
  const slimes = useGameStore((s) => s.slimes)
  return (
    <>
      {slimes.map((slime) => (
        <SlimeEntity
          key={slime.id}
          id={slime.id}
          position={slime.position}
          source={slime.source}
          kind={slime.kind}
        />
      ))}
    </>
  )
}
