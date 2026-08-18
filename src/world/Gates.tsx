import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useGameStore } from '../stores/gameStore'

const GATE_HALF_WIDTH = 2.6
const GATE_HEIGHT = 1.5
const GATE_HALF_THICKNESS = 0.18

function GateMesh({ hp, maxHp }: { hp: number; maxHp: number }) {
  const healthRatio = hp / maxHp
  const color = healthRatio > 0.5 ? '#8b5a2b' : healthRatio > 0.25 ? '#a66a2a' : '#6b3a1a'
  const postX = GATE_HALF_WIDTH - 0.15
  const lintelWidth = GATE_HALF_WIDTH * 2
  const boardWidth = lintelWidth - 0.5
  return (
    <group>
      <mesh castShadow position={[-postX, 0.75, 0]}>
        <boxGeometry args={[0.3, 1.5, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh castShadow position={[postX, 0.75, 0]}>
        <boxGeometry args={[0.3, 1.5, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh castShadow position={[0, 1.35, 0]}>
        <boxGeometry args={[lintelWidth, 0.28, 0.28]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh castShadow position={[0, 0.6, 0]}>
        <boxGeometry args={[boardWidth, 1.05, 0.14]} />
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
        <group key={gate.id}>
          {/* Visual rotation is on a Three.js group so it cannot be overwritten by Rapier. */}
          <group position={gate.position} rotation={[0, gate.yaw, 0]}>
            <GateMesh hp={gate.hp} maxHp={gate.maxHp} />
          </group>
          <RigidBody
            type="fixed"
            colliders={false}
            position={gate.position}
            rotation={[0, gate.yaw, 0]}
          >
            <CuboidCollider
              args={[GATE_HALF_WIDTH, GATE_HEIGHT / 2, GATE_HALF_THICKNESS]}
              position={[0, GATE_HEIGHT / 2, 0]}
            />
          </RigidBody>
        </group>
      ))}
    </>
  )
}
