import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useGameStore } from '../stores/gameStore'

const GATE_HALF_WIDTH = 2.6
const GATE_HEIGHT = 1.5
const GATE_HALF_THICKNESS = 0.18

/** Rotate a local (x,z) point by yaw around Y. Default gate is wide on X. */
function rotated(x: number, z: number, yaw: number): [number, number] {
  const c = Math.cos(yaw)
  const s = Math.sin(yaw)
  return [x * c + z * s, -x * s + z * c]
}

function GateMesh({ hp, maxHp, yaw }: { hp: number; maxHp: number; yaw: number }) {
  const healthRatio = hp / maxHp
  const color = healthRatio > 0.5 ? '#8b5a2b' : healthRatio > 0.25 ? '#a66a2a' : '#6b3a1a'
  const postX = GATE_HALF_WIDTH - 0.15
  const lintelWidth = GATE_HALF_WIDTH * 2
  const boardWidth = lintelWidth - 0.5
  const [p1x, p1z] = rotated(-postX, 0, yaw)
  const [p2x, p2z] = rotated(postX, 0, yaw)
  return (
    <group>
      <mesh castShadow position={[p1x, 0.75, p1z]} rotation={[0, yaw, 0]}>
        <boxGeometry args={[0.3, 1.5, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh castShadow position={[p2x, 0.75, p2z]} rotation={[0, yaw, 0]}>
        <boxGeometry args={[0.3, 1.5, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh castShadow position={[0, 1.35, 0]} rotation={[0, yaw, 0]}>
        <boxGeometry args={[lintelWidth, 0.28, 0.28]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh castShadow position={[0, 0.6, 0]} rotation={[0, yaw, 0]}>
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
        <group key={gate.id} position={gate.position}>
          <GateMesh hp={gate.hp} maxHp={gate.maxHp} yaw={gate.yaw} />
          <RigidBody type="fixed" colliders={false} rotation={[0, gate.yaw, 0]}>
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
