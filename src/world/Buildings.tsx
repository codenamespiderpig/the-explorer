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
        {/* Hammer */}
        <group position={[-0.35, 0.58, 0.12]} rotation={[0, 0.4, 0.15]}>
          <mesh castShadow>
            <boxGeometry args={[0.06, 0.06, 0.42]} />
            <meshStandardMaterial color="#6b4420" />
          </mesh>
          <mesh castShadow position={[0, 0, -0.18]}>
            <boxGeometry args={[0.18, 0.12, 0.12]} />
            <meshStandardMaterial color="#8a9098" metalness={0.55} roughness={0.35} />
          </mesh>
        </group>
        {/* Saw */}
        <group position={[0.15, 0.56, -0.18]} rotation={[0.05, -0.55, 0.08]}>
          <mesh castShadow>
            <boxGeometry args={[0.05, 0.05, 0.38]} />
            <meshStandardMaterial color="#5a3a18" />
          </mesh>
          <mesh castShadow position={[0, 0.02, 0.22]}>
            <boxGeometry args={[0.04, 0.1, 0.22]} />
            <meshStandardMaterial color="#b0b6be" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
        {/* Chisel */}
        <group position={[0.48, 0.55, 0.2]} rotation={[0, -0.9, 0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.04, 0.04, 0.28]} />
            <meshStandardMaterial color="#4a3020" />
          </mesh>
          <mesh castShadow position={[0, 0, 0.14]}>
            <boxGeometry args={[0.05, 0.05, 0.08]} />
            <meshStandardMaterial color="#9aa0a8" metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
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
        {/* Log pile under the flame */}
        <mesh castShadow position={[-0.12, 0.22, 0.05]} rotation={[0.15, 0.4, 1.2]}>
          <cylinderGeometry args={[0.08, 0.09, 0.7, 6]} />
          <meshStandardMaterial color="#5c3a1e" />
        </mesh>
        <mesh castShadow position={[0.14, 0.2, -0.06]} rotation={[-0.2, -0.5, 1.05]}>
          <cylinderGeometry args={[0.07, 0.08, 0.65, 6]} />
          <meshStandardMaterial color="#6a4424" />
        </mesh>
        <mesh castShadow position={[0.02, 0.24, 0.12]} rotation={[0.35, 0.1, 0.95]}>
          <cylinderGeometry args={[0.06, 0.07, 0.55, 6]} />
          <meshStandardMaterial color="#4e3218" />
        </mesh>
        <mesh castShadow position={[-0.05, 0.18, -0.16]} rotation={[-0.1, 0.8, 1.35]}>
          <cylinderGeometry args={[0.065, 0.075, 0.6, 6]} />
          <meshStandardMaterial color="#633e20" />
        </mesh>
        <mesh position={[0, 0.52, 0]}>
          <coneGeometry args={[0.28, 0.7, 6]} />
          <meshStandardMaterial color="#ff7722" emissive="#ff4400" emissiveIntensity={0.7} />
        </mesh>
      </group>
    )
  }
  return (
    <group rotation={[0, yaw, 0]}>
      {/* Short post + thin rail — fits the player scale */}
      <mesh castShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[0.1, 0.7, 0.1]} />
        <meshStandardMaterial color="#8b5a2b" />
      </mesh>
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[0.7, 0.07, 0.07]} />
        <meshStandardMaterial color="#6b4420" />
      </mesh>
      <mesh castShadow position={[0, 0.32, 0]}>
        <boxGeometry args={[0.7, 0.06, 0.06]} />
        <meshStandardMaterial color="#5a3a18" />
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
