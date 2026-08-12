import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useGameStore } from '../stores/gameStore'

function GateMesh({
  position,
  hp,
  maxHp,
}: {
  position: [number, number, number]
  hp: number
  maxHp: number
}) {
  const healthRatio = hp / maxHp
  const color = healthRatio > 0.5 ? '#8b5a2b' : healthRatio > 0.25 ? '#a66a2a' : '#6b3a1a'
  return (
    <group position={position}>
      <mesh castShadow position={[-0.7, 0.7, 0]}>
        <boxGeometry args={[0.25, 1.4, 0.25]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh castShadow position={[0.7, 0.7, 0]}>
        <boxGeometry args={[0.25, 1.4, 0.25]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh castShadow position={[0, 1.2, 0]}>
        <boxGeometry args={[1.6, 0.3, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[1.2, 0.9, 0.12]} />
        <meshStandardMaterial color="#c4a574" />
      </mesh>
    </group>
  )
}

export function Gates() {
  const gates = useGameStore((s) => s.gates)
  return (
    <>
      {gates.map((gate) => (
        <RigidBody key={gate.id} type="fixed" position={gate.position} colliders={false}>
          <CuboidCollider args={[0.9, 0.8, 0.25]} position={[0, 0.8, 0]} />
          <GateMesh position={[0, 0, 0]} hp={gate.hp} maxHp={gate.maxHp} />
        </RigidBody>
      ))}
    </>
  )
}
