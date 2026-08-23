import { useGameStore } from '../stores/gameStore'
import { islandSize } from './bounds'

/** Wandering vendor cart — visible during the day only. */
export function TravelingMerchant() {
  const phase = useGameStore((s) => s.dayNight.phase)
  const landTier = useGameStore((s) => s.landTier)
  if (phase !== 'day') return null

  const half = islandSize(landTier) / 2
  const x = half * 0.35
  const z = half * 0.55

  return (
    <group position={[x, 0, z]} rotation={[0, -0.6, 0]}>
      {/* Cart */}
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
      {/* Awning */}
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
      {/* Goods */}
      <mesh castShadow position={[-0.35, 0.72, 0.15]}>
        <boxGeometry args={[0.35, 0.25, 0.35]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>
      <mesh castShadow position={[0.25, 0.7, -0.1]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color="#6abe30" />
      </mesh>
      {/* Merchant */}
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
