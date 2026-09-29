import { useGameStore } from '../stores/gameStore'

const BAR_COUNT = 8
const RED = '#c43a2a'
const BAR = '#9a8060'

function FishMesh({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0.4, 0.15]}>
      {/* Body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.07, 0.22, 4, 8]} />
        <meshStandardMaterial
          color="#3a8ab8"
          emissive="#1a5070"
          emissiveIntensity={0.35}
        />
      </mesh>
      {/* Tail */}
      <mesh castShadow position={[-0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.09, 0.14, 3]} />
        <meshStandardMaterial
          color="#2a6a90"
          emissive="#143850"
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Eye */}
      <mesh position={[0.1, 0.04, 0.05]}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshStandardMaterial color="#111820" />
      </mesh>
    </group>
  )
}

function CrabPotMesh({ fish }: { fish: number }) {
  const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
    const a = (i / BAR_COUNT) * Math.PI * 2
    return (
      <mesh
        key={i}
        castShadow
        position={[Math.cos(a) * 0.5, 0.32, Math.sin(a) * 0.5]}
      >
        <boxGeometry args={[0.04, 0.36, 0.04]} />
        <meshStandardMaterial color={BAR} metalness={0.15} roughness={0.7} />
      </mesh>
    )
  })

  return (
    <group>
      {/* Red bottom */}
      <mesh castShadow receiveShadow position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.62, 0.65, 0.1, 12]} />
        <meshStandardMaterial color={RED} />
      </mesh>
      {/* Brown cage body */}
      <mesh castShadow position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.55, 0.58, 0.28, 10]} />
        <meshStandardMaterial color="#6a5030" />
      </mesh>
      {/* Vertical bars */}
      {bars}
      {/* Horizontal ring bars */}
      <mesh position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.52, 0.025, 6, 16]} />
        <meshStandardMaterial color={BAR} metalness={0.15} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.025, 6, 16]} />
        <meshStandardMaterial color={BAR} metalness={0.15} roughness={0.65} />
      </mesh>
      {/* Red top */}
      <mesh castShadow position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.58, 0.5, 0.12, 12]} />
        <meshStandardMaterial color={RED} />
      </mesh>
      {/* Caught fish */}
      {fish >= 1 ? <FishMesh position={[0.08, 0.58, 0.12]} /> : null}
      {fish >= 2 ? <FishMesh position={[-0.12, 0.62, -0.08]} /> : null}
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
