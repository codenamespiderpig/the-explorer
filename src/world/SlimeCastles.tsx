import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useGameStore } from '../stores/gameStore'

function CastleMesh() {
  return (
    <group>
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[2.4, 1.1, 2.4]} />
        <meshStandardMaterial color="#4a7a3a" />
      </mesh>
      <mesh castShadow position={[-0.85, 1.35, -0.85]}>
        <boxGeometry args={[0.55, 0.9, 0.55]} />
        <meshStandardMaterial color="#3d6a32" />
      </mesh>
      <mesh castShadow position={[0.85, 1.35, -0.85]}>
        <boxGeometry args={[0.55, 0.9, 0.55]} />
        <meshStandardMaterial color="#3d6a32" />
      </mesh>
      <mesh castShadow position={[-0.85, 1.35, 0.85]}>
        <boxGeometry args={[0.55, 0.9, 0.55]} />
        <meshStandardMaterial color="#3d6a32" />
      </mesh>
      <mesh castShadow position={[0.85, 1.35, 0.85]}>
        <boxGeometry args={[0.55, 0.9, 0.55]} />
        <meshStandardMaterial color="#3d6a32" />
      </mesh>
      <mesh castShadow position={[0, 1.55, 0]}>
        <boxGeometry args={[1.1, 1.2, 1.1]} />
        <meshStandardMaterial color="#5a9a48" emissive="#1f4a18" emissiveIntensity={0.25} />
      </mesh>
      <mesh castShadow position={[0, 2.35, 0]}>
        <coneGeometry args={[0.55, 0.55, 4]} />
        <meshStandardMaterial color="#2f5a28" />
      </mesh>
    </group>
  )
}

export function SlimeCastles() {
  const castles = useGameStore((s) => s.castles)
  return (
    <>
      {castles.map((castle) => (
        <group key={castle.id} position={castle.position}>
          <CastleMesh />
          <RigidBody type="fixed" colliders={false}>
            <CuboidCollider args={[1.2, 1.2, 1.2]} position={[0, 1.2, 0]} />
          </RigidBody>
        </group>
      ))}
    </>
  )
}
