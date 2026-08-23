import { useGameStore } from '../stores/gameStore'
import { isMerchantVisiting } from '../systems/merchant'

/** Wandering vendor — only visible for 90s each morning, at a hidden spot. */
export function TravelingMerchant() {
  const timeLeft = useGameStore((s) => s.merchantTimeLeft)
  const position = useGameStore((s) => s.merchantPosition)
  if (!isMerchantVisiting(timeLeft)) return null

  return (
    <group position={position} rotation={[0, -0.6, 0]}>
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[1.6, 0.35, 1.1]} />
        <meshStandardMaterial color="#8b5a2b" />
      </mesh>
      <mesh castShadow position={[-0.75, 0.25, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.12, 12]} />
        <meshStandardMaterial color="#5a3818" />
      </mesh>
      <mesh castShadow position={[0.75, 0.25, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.12, 12]} />
        <meshStandardMaterial color="#5a3818" />
      </mesh>
      <mesh castShadow position={[0, 1.05, 0]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[1.8, 0.08, 1.4]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>
      <mesh castShadow position={[-0.85, 0.85, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.9, 6]} />
        <meshStandardMaterial color="#4a3018" />
      </mesh>
      <mesh castShadow position={[0.85, 0.85, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.9, 6]} />
        <meshStandardMaterial color="#4a3018" />
      </mesh>
      <mesh castShadow position={[-0.35, 0.72, 0.15]}>
        <boxGeometry args={[0.35, 0.25, 0.35]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>
      <mesh castShadow position={[0.25, 0.7, -0.1]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color="#6abe30" />
      </mesh>
      <mesh castShadow position={[0, 1.05, 0.85]}>
        <capsuleGeometry args={[0.22, 0.45, 4, 8]} />
        <meshStandardMaterial color="#6b4c9a" />
      </mesh>
      <mesh castShadow position={[0, 1.55, 0.85]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#f0c7a0" />
      </mesh>
    </group>
  )
}
