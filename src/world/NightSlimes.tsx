import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { useGameStore, type SlimeSource } from '../stores/gameStore'
import { isGateDestroyed } from '../systems/gate'
import { slimeRotPhase } from '../systems/slimeCastle'
import {
  ENEMY_BODY_Y,
  ENEMY_RADIUS,
  enemyVisual,
  type EnemyKind,
} from '../systems/enemies'

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
  const cooldown = useRef(0)
  const localPos = useRef(position)
  const wanderAngle = useRef(Math.random() * Math.PI * 2)
  const homePos = useRef(position)

  useFrame((_, delta) => {
    const store = useGameStore.getState()
    const slime = store.slimes.find((s) => s.id === id)
    if (!slime || !body.current) return

    if (slime.source === 'castle') {
      wanderAngle.current += delta * 0.7
      const step = CASTLE_WANDER_SPEED * delta
      localPos.current = [
        localPos.current[0] + Math.cos(wanderAngle.current) * step,
        ENEMY_BODY_Y,
        localPos.current[2] + Math.sin(wanderAngle.current) * step,
      ]
      body.current.setNextKinematicTranslation({
        x: localPos.current[0],
        y: localPos.current[1],
        z: localPos.current[2],
      })
      store.moveSlime(id, localPos.current)
      return
    }

    const isBiome = slime.source === 'biome'
    if (!isBiome && store.phase() !== 'night') return

    cooldown.current = Math.max(0, cooldown.current - delta)
    const player = store.playerPos

    if (isBiome) {
      const pdx = player[0] - localPos.current[0]
      const pdz = player[2] - localPos.current[2]
      const pdist = Math.hypot(pdx, pdz)
      if (pdist > BIOME_AGGRO) {
        const hdx = homePos.current[0] - localPos.current[0]
        const hdz = homePos.current[2] - localPos.current[2]
        const hdist = Math.hypot(hdx, hdz) || 1
        if (hdist > 0.4) {
          const step = SLIME_SPEED * 0.55 * delta
          localPos.current = [
            localPos.current[0] + (hdx / hdist) * step,
            ENEMY_BODY_Y,
            localPos.current[2] + (hdz / hdist) * step,
          ]
          body.current.setNextKinematicTranslation({
            x: localPos.current[0],
            y: localPos.current[1],
            z: localPos.current[2],
          })
          store.moveSlime(id, localPos.current)
        }
        return
      }
    }

    const gates = store.gates.filter((g) => !isGateDestroyed(g))
    let target: [number, number, number] = [player[0], ENEMY_BODY_Y, player[2]]
    let targetingGate = false
    let nearestGateDist = Infinity
    if (!isBiome) {
      for (const g of gates) {
        const dx = g.position[0] - localPos.current[0]
        const dz = g.position[2] - localPos.current[2]
        const d = Math.hypot(dx, dz)
        if (d < nearestGateDist) {
          nearestGateDist = d
          if (d < 8) {
            target = [g.position[0], ENEMY_BODY_Y, g.position[2]]
            targetingGate = true
          }
        }
      }
    }

    const dx = target[0] - localPos.current[0]
    const dz = target[2] - localPos.current[2]
    const dist = Math.hypot(dx, dz) || 1
    if (dist > ATTACK_RANGE) {
      const step = SLIME_SPEED * delta
      localPos.current = [
        localPos.current[0] + (dx / dist) * step,
        ENEMY_BODY_Y,
        localPos.current[2] + (dz / dist) * step,
      ]
      body.current.setNextKinematicTranslation({
        x: localPos.current[0],
        y: localPos.current[1],
        z: localPos.current[2],
      })
      store.moveSlime(id, localPos.current)
    } else if (cooldown.current <= 0) {
      cooldown.current = ATTACK_COOLDOWN
      if (targetingGate && nearestGateDist <= GATE_RANGE) {
        store.damageNearestGate(localPos.current, GATE_DAMAGE)
      } else {
        const pdx = player[0] - localPos.current[0]
        const pdz = player[2] - localPos.current[2]
        if (Math.hypot(pdx, pdz) <= ATTACK_RANGE + 0.4) {
          store.damagePlayer(SLIME_DAMAGE)
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
