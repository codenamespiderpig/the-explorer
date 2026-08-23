import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useGameStore } from '../stores/gameStore'
import { WORLD_ISLAND_SIZE, worldCenter } from '../systems/worlds'
import { Gatherable } from './Gatherable'

const THICK = 2
const WALL_H = 10
const WALL_T = 2

function BiomeWalls({ cx, cz }: { cx: number; cz: number }) {
  const half = WORLD_ISLAND_SIZE / 2
  const hx = WALL_T / 2
  const hy = WALL_H / 2
  const hz = half + hx
  const inset = half - hx
  return (
    <RigidBody type="fixed" colliders={false} position={[cx, 0, cz]}>
      <CuboidCollider args={[hz, hy, hx]} position={[0, hy - 0.5, inset]} />
      <CuboidCollider args={[hz, hy, hx]} position={[0, hy - 0.5, -inset]} />
      <CuboidCollider args={[hx, hy, hz]} position={[inset, hy - 0.5, 0]} />
      <CuboidCollider args={[hx, hy, hz]} position={[-inset, hy - 0.5, 0]} />
    </RigidBody>
  )
}

function Bridge({
  from,
  to,
  color,
}: {
  from: [number, number, number]
  to: [number, number, number]
  color: string
}) {
  const mx = (from[0] + to[0]) / 2
  const mz = (from[2] + to[2]) / 2
  const dx = to[0] - from[0]
  const dz = to[2] - from[2]
  const len = Math.hypot(dx, dz)
  const yaw = Math.atan2(dx, dz)
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[mx, 0.08, mz]} rotation={[0, yaw, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[2.2, 0.18, len]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  )
}

/** Shallow blue island — unlocked at land tier 1. */
export function WaterWorld() {
  const landTier = useGameStore((s) => s.landTier)
  if (landTier < 1) return null

  const [cx, , cz] = worldCenter('water', landTier)
  const homeHalf = (36 + landTier * 8) / 2

  return (
    <group>
      <RigidBody type="fixed" colliders="cuboid" position={[cx, 0, cz]}>
        <mesh receiveShadow position={[0, -THICK / 2, 0]}>
          <boxGeometry args={[WORLD_ISLAND_SIZE, THICK, WORLD_ISLAND_SIZE]} />
          <meshStandardMaterial color="#3d8fd9" />
        </mesh>
      </RigidBody>
      <mesh receiveShadow position={[cx, -0.08, cz]}>
        <boxGeometry args={[WORLD_ISLAND_SIZE + 4, 0.15, WORLD_ISLAND_SIZE + 4]} />
        <meshStandardMaterial color="#1a5a8a" transparent opacity={0.85} />
      </mesh>
      <BiomeWalls cx={cx} cz={cz} />
      <Bridge from={[0, 0, homeHalf - 1]} to={[cx, 0, cz - WORLD_ISLAND_SIZE / 2 + 1]} color="#6ec4ff" />
      <Gatherable id="water-tree-1" resource="wood" position={[cx - 4, 0, cz + 3]} />
      <Gatherable id="water-rock-1" resource="stone" position={[cx + 5, 0, cz - 2]} />
      <mesh position={[cx - 2, 0.4, cz + 6]}>
        <coneGeometry args={[0.5, 1.2, 6]} />
        <meshStandardMaterial color="#2d8a4a" />
      </mesh>
      <mesh position={[cx + 3, 0.25, cz + 5]}>
        <sphereGeometry args={[0.35, 10, 10]} />
        <meshStandardMaterial color="#88ddff" emissive="#2288cc" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

/** Hot rocky island — unlocked at land tier 2. */
export function LavaWorld() {
  const landTier = useGameStore((s) => s.landTier)
  if (landTier < 2) return null

  const [cx, , cz] = worldCenter('lava', landTier)
  const homeHalf = (36 + landTier * 8) / 2

  return (
    <group>
      <RigidBody type="fixed" colliders="cuboid" position={[cx, 0, cz]}>
        <mesh receiveShadow position={[0, -THICK / 2, 0]}>
          <boxGeometry args={[WORLD_ISLAND_SIZE, THICK, WORLD_ISLAND_SIZE]} />
          <meshStandardMaterial color="#8a3020" emissive="#4a1008" emissiveIntensity={0.35} />
        </mesh>
      </RigidBody>
      <BiomeWalls cx={cx} cz={cz} />
      <Bridge from={[homeHalf - 1, 0, 0]} to={[cx - WORLD_ISLAND_SIZE / 2 + 1, 0, cz]} color="#aa5533" />
      <Gatherable id="lava-rock-1" resource="stone" position={[cx + 2, 0, cz + 4]} />
      <Gatherable id="lava-rock-2" resource="stone" position={[cx - 3, 0, cz - 3]} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[cx + i * 2 - 2, 0.12, cz + 1]}>
          <boxGeometry args={[1.2, 0.25, 1.2]} />
          <meshStandardMaterial color="#ff6622" emissive="#cc2200" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  )
}
