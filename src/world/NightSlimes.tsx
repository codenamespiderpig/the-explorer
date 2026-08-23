import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { useGameStore, type SlimeSource } from '../stores/gameStore'
import { isGateDestroyed } from '../systems/gate'
import { slimeRotPhase } from '../systems/slimeCastle'

const SLIME_SPEED = 2.2
const ATTACK_RANGE = 1.4
const GATE_RANGE = 3.4
const ATTACK_COOLDOWN = 0.9
const SLIME_DAMAGE = 8
const GATE_DAMAGE = 10
const CASTLE_WANDER_SPEED = 0.55

function slimeColors(source: SlimeSource, ageSec: number) {
  if (source === 'castle') {
    const phase = slimeRotPhase(ageSec)
    if (phase === 'rotting') {
      return { color: '#7a6a3a', emissive: '#3a3010', intensity: 0.15 }
    }
    return { color: '#8adf6a', emissive: '#2a6a18', intensity: 0.28 }
  }
  return { color: '#6adf4a', emissive: '#1f5a10', intensity: 0.35 }
}

function SlimeEntity({
  id,
  position,
  source,
}: {
  id: string
  position: [number, number, number]
  source: SlimeSource
}) {
  const body = useRef<RapierRigidBody>(null)
  const cooldown = useRef(0)
  const localPos = useRef(position)
  const wanderAngle = useRef(Math.random() * Math.PI * 2)

  useFrame((_, delta) => {
    const store = useGameStore.getState()
    const slime = store.slimes.find((s) => s.id === id)
    if (!slime || !body.current) return

    if (slime.source === 'castle') {
      wanderAngle.current += delta * 0.7
      const step = CASTLE_WANDER_SPEED * delta
      localPos.current = [
        localPos.current[0] + Math.cos(wanderAngle.current) * step,
        0.6,
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

    // Night hunters only chase during night.
    if (store.phase() !== 'night') return

    cooldown.current = Math.max(0, cooldown.current - delta)
    const player = store.playerPos
    const gates = store.gates.filter((g) => !isGateDestroyed(g))

    let target: [number, number, number] = [player[0], 0.6, player[2]]
    let targetingGate = false
    let nearestGateDist = Infinity
    for (const g of gates) {
      const dx = g.position[0] - localPos.current[0]
      const dz = g.position[2] - localPos.current[2]
      const d = Math.hypot(dx, dz)
      if (d < nearestGateDist) {
        nearestGateDist = d
        if (d < 8) {
          target = [g.position[0], 0.6, g.position[2]]
          targetingGate = true
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
        0.6,
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
  const colors = slimeColors(source, slime?.ageSec ?? 0)

  return (
    <RigidBody
      ref={body}
      type="kinematicPosition"
      position={position}
      colliders="ball"
      sensor
    >
      <mesh castShadow>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshStandardMaterial
          color={colors.color}
          emissive={colors.emissive}
          emissiveIntensity={colors.intensity}
        />
      </mesh>
      <mesh position={[0.18, 0.2, 0.35]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#102010" />
      </mesh>
      <mesh position={[-0.18, 0.2, 0.35]}>
        <sphereGeometry args={[0.08, 8, 8]} />
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
        />
      ))}
    </>
  )
}
