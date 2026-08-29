import { useGameStore } from '../stores/gameStore'

function CrabPotMesh({ fish }: { fish: number }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.55, 0.62, 0.38, 8]} />
        <meshStandardMaterial color="#6a5030" />
      </mesh>
      <mesh castShadow position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.58, 0.5, 0.12, 8]} />
        <meshStandardMaterial color="#4a3820" wireframe={false} />
      </mesh>
      {/* Cage wire hint */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.52, 0.52, 0.32, 8, 1, true]} />
        <meshStandardMaterial color="#8a7048" wireframe />
      </mesh>
      {fish > 0 ? (
        <mesh castShadow position={[0, 0.55, 0.15]}>
          <boxGeometry args={[0.35, 0.12, 0.22]} />
          <meshStandardMaterial color="#7aa8d8" emissive="#336688" emissiveIntensity={0.25} />
        </mesh>
      ) : null}
    </group>
  )
}

export function CrabPots() {
  const pots = useGameStore((s) => s.crabPots)
  return (
    <>
      {pots.map((pot) => (
        <group key={pot.id} position={pot.position}>
          <CrabPotMesh fish={pot.storedFish} />
        </group>
      ))}
    </>
  )
}
