import { useGameStore } from '../stores/gameStore'
import type { BuildingKind } from '../systems/building'

function BuildingMesh({ kind, yaw }: { kind: BuildingKind; yaw: number }) {
  if (kind === 'workbench') {
    return (
      <group rotation={[0, yaw, 0]}>
        <mesh castShadow position={[0, 0.45, 0]}>
          <boxGeometry args={[1.4, 0.15, 0.8]} />
          <meshStandardMaterial color="#8b5a2b" />
        </mesh>
        <mesh castShadow position={[-0.55, 0.22, -0.28]}>
          <boxGeometry args={[0.12, 0.44, 0.12]} />
          <meshStandardMaterial color="#5a3a18" />
        </mesh>
        <mesh castShadow position={[0.55, 0.22, -0.28]}>
          <boxGeometry args={[0.12, 0.44, 0.12]} />
          <meshStandardMaterial color="#5a3a18" />
        </mesh>
        <mesh castShadow position={[-0.55, 0.22, 0.28]}>
          <boxGeometry args={[0.12, 0.44, 0.12]} />
          <meshStandardMaterial color="#5a3a18" />
        </mesh>
        <mesh castShadow position={[0.55, 0.22, 0.28]}>
          <boxGeometry args={[0.12, 0.44, 0.12]} />
          <meshStandardMaterial color="#5a3a18" />
        </mesh>
      </group>
    )
  }
  if (kind === 'furnace') {
    return (
      <group rotation={[0, yaw, 0]}>
        <mesh castShadow position={[0, 0.55, 0]}>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshStandardMaterial color="#5a5a5a" />
        </mesh>
        <mesh position={[0, 0.45, 0.56]}>
          <boxGeometry args={[0.45, 0.4, 0.08]} />
          <meshStandardMaterial color="#ff6622" emissive="#cc2200" emissiveIntensity={0.55} />
        </mesh>
      </group>
    )
  }
  if (kind === 'campfire') {
    return (
      <group rotation={[0, yaw, 0]}>
        <mesh castShadow position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.55, 0.65, 0.2, 8]} />
          <meshStandardMaterial color="#4a3018" />
        </mesh>
        <mesh position={[0, 0.45, 0]}>
          <coneGeometry args={[0.28, 0.7, 6]} />
          <meshStandardMaterial color="#ff7722" emissive="#ff4400" emissiveIntensity={0.7} />
        </mesh>
      </group>
    )
  }
  return (
    <group rotation={[0, yaw, 0]}>
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[0.18, 1.1, 0.18]} />
        <meshStandardMaterial color="#8b5a2b" />
      </mesh>
      <mesh castShadow position={[0, 0.95, 0]}>
        <boxGeometry args={[1.2, 0.12, 0.12]} />
        <meshStandardMaterial color="#6b4420" />
      </mesh>
    </group>
  )
}

export function Buildings() {
  const buildings = useGameStore((s) => s.buildings)
  return (
    <>
      {buildings.map((b) => (
        <group key={b.id} position={b.position}>
          <BuildingMesh kind={b.kind} yaw={b.yaw} />
        </group>
      ))}
    </>
  )
}
