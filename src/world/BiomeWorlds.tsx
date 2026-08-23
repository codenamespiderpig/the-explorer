import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useGameStore } from '../stores/gameStore'
import { WORLD_ISLAND_SIZE, worldCenter } from '../systems/worlds'
import { islandSize } from '../systems/land'
import { BRIDGE_HALF_WIDTH } from './bounds'
import { Gatherable } from './Gatherable'

const THICK = 2.4
const WALL_H = 10
const WALL_T = 2
const WALL_Y = WALL_H / 2 - 0.5
const GATE_HALF = BRIDGE_HALF_WIDTH + 0.4

function BiomeWalls({
  cx,
  cz,
  openSouth,
  openWest,
}: {
  cx: number
  cz: number
  openSouth?: boolean
  openWest?: boolean
}) {
  const half = WORLD_ISLAND_SIZE / 2
  const hx = WALL_T / 2
  const hy = WALL_H / 2
  const inset = half - hx
  const span = half + hx
  const wing = (half - GATE_HALF) / 2
  const wingCenter = GATE_HALF + wing

  return (
    <RigidBody type="fixed" colliders={false} position={[cx, 0, cz]}>
      {/* North (+Z) */}
      <CuboidCollider args={[span, hy, hx]} position={[0, WALL_Y, inset]} />
      {/* South (-Z) — opening for water bridge */}
      {openSouth ? (
        <>
          <CuboidCollider args={[wing, hy, hx]} position={[-wingCenter, WALL_Y, -inset]} />
          <CuboidCollider args={[wing, hy, hx]} position={[wingCenter, WALL_Y, -inset]} />
        </>
      ) : (
        <CuboidCollider args={[span, hy, hx]} position={[0, WALL_Y, -inset]} />
      )}
      {/* East (+X) */}
      <CuboidCollider args={[hx, hy, span]} position={[inset, WALL_Y, 0]} />
      {/* West (-X) — opening for lava bridge */}
      {openWest ? (
        <>
          <CuboidCollider args={[hx, hy, wing]} position={[-inset, WALL_Y, -wingCenter]} />
          <CuboidCollider args={[hx, hy, wing]} position={[-inset, WALL_Y, wingCenter]} />
        </>
      ) : (
        <CuboidCollider args={[hx, hy, span]} position={[-inset, WALL_Y, 0]} />
      )}
    </RigidBody>
  )
}

/** Thick walkable bridge with an explicit collider (mesh alone is too thin). */
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
  const len = Math.max(2, Math.hypot(dx, dz))
  const yaw = Math.atan2(dx, dz)
  const halfW = BRIDGE_HALF_WIDTH
  const halfH = 0.35
  const halfL = len / 2

  return (
    <RigidBody type="fixed" colliders={false} position={[mx, 0, mz]} rotation={[0, yaw, 0]}>
      <CuboidCollider args={[halfW, halfH, halfL]} position={[0, halfH, 0]} />
      <mesh receiveShadow castShadow position={[0, halfH, 0]}>
        <boxGeometry args={[halfW * 2, halfH * 2, len]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Side rails so the path is obvious */}
      <mesh position={[-halfW + 0.08, 0.9, 0]}>
        <boxGeometry args={[0.12, 0.7, len]} />
        <meshStandardMaterial color="#dfefff" />
      </mesh>
      <mesh position={[halfW - 0.08, 0.9, 0]}>
        <boxGeometry args={[0.12, 0.7, len]} />
        <meshStandardMaterial color="#dfefff" />
      </mesh>
    </RigidBody>
  )
}

function PortalArch({
  position,
  rotationY,
  color,
  labelColor,
}: {
  position: [number, number, number]
  rotationY: number
  color: string
  labelColor: string
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow position={[-1.6, 1.1, 0]}>
        <boxGeometry args={[0.35, 2.2, 0.35]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh castShadow position={[1.6, 1.1, 0]}>
        <boxGeometry args={[0.35, 2.2, 0.35]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh castShadow position={[0, 2.2, 0]}>
        <boxGeometry args={[3.5, 0.35, 0.35]} />
        <meshStandardMaterial color={labelColor} emissive={labelColor} emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

/** Shallow blue island — unlocked at land tier 1. Walk north from home. */
export function WaterWorld() {
  const landTier = useGameStore((s) => s.landTier)
  if (landTier < 1) return null

  const [cx, , cz] = worldCenter('water', landTier)
  const homeEdge = islandSize(landTier) / 2
  const waterSouth = cz - WORLD_ISLAND_SIZE / 2

  return (
    <group>
      <RigidBody key={`water-floor-${landTier}`} type="fixed" colliders={false} position={[cx, 0, cz]}>
        <CuboidCollider args={[WORLD_ISLAND_SIZE / 2, THICK / 2, WORLD_ISLAND_SIZE / 2]} position={[0, -THICK / 2, 0]} />
        <mesh receiveShadow position={[0, -THICK / 2, 0]}>
          <boxGeometry args={[WORLD_ISLAND_SIZE, THICK, WORLD_ISLAND_SIZE]} />
          <meshStandardMaterial color="#3d8fd9" />
        </mesh>
      </RigidBody>
      <mesh receiveShadow position={[cx, -0.05, cz]}>
        <boxGeometry args={[WORLD_ISLAND_SIZE + 6, 0.12, WORLD_ISLAND_SIZE + 6]} />
        <meshStandardMaterial color="#1a5a8a" transparent opacity={0.7} />
      </mesh>
      <BiomeWalls cx={cx} cz={cz} openSouth />
      <Bridge
        from={[0, 0, homeEdge - 0.5]}
        to={[0, 0, waterSouth + 0.5]}
        color="#6ec4ff"
      />
      <PortalArch
        position={[0, 0, homeEdge - 0.2]}
        rotationY={0}
        color="#2a6a9a"
        labelColor="#88ddff"
      />
      <Gatherable id="water-tree-1" resource="wood" position={[cx - 4, 0, cz + 3]} />
      <Gatherable id="water-tree-2" resource="wood" position={[cx + 3, 0, cz + 5]} />
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

/** Hot rocky island — unlocked at land tier 2. Walk east from home. */
export function LavaWorld() {
  const landTier = useGameStore((s) => s.landTier)
  if (landTier < 2) return null

  const [cx, , cz] = worldCenter('lava', landTier)
  const homeEdge = islandSize(landTier) / 2
  const lavaWest = cx - WORLD_ISLAND_SIZE / 2

  return (
    <group>
      <RigidBody key={`lava-floor-${landTier}`} type="fixed" colliders={false} position={[cx, 0, cz]}>
        <CuboidCollider args={[WORLD_ISLAND_SIZE / 2, THICK / 2, WORLD_ISLAND_SIZE / 2]} position={[0, -THICK / 2, 0]} />
        <mesh receiveShadow position={[0, -THICK / 2, 0]}>
          <boxGeometry args={[WORLD_ISLAND_SIZE, THICK, WORLD_ISLAND_SIZE]} />
          <meshStandardMaterial color="#8a3020" emissive="#4a1008" emissiveIntensity={0.35} />
        </mesh>
      </RigidBody>
      <BiomeWalls cx={cx} cz={cz} openWest />
      <Bridge
        from={[homeEdge - 0.5, 0, 0]}
        to={[lavaWest + 0.5, 0, 0]}
        color="#aa5533"
      />
      <PortalArch
        position={[homeEdge - 0.2, 0, 0]}
        rotationY={Math.PI / 2}
        color="#6a2010"
        labelColor="#ff6622"
      />
      <Gatherable id="lava-rock-1" resource="stone" position={[cx + 2, 0, cz + 4]} />
      <Gatherable id="lava-rock-2" resource="stone" position={[cx - 3, 0, cz - 3]} />
      <Gatherable id="lava-rock-3" resource="stone" position={[cx + 5, 0, cz - 1]} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[cx + i * 2 - 2, 0.12, cz + 1]}>
          <boxGeometry args={[1.2, 0.25, 1.2]} />
          <meshStandardMaterial color="#ff6622" emissive="#cc2200" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </group>
  )
}
