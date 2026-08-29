import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useGameStore } from '../stores/gameStore'
import {
  BIOME_ISLAND_SIZE,
  biomeHalf,
  homeHalf,
  lavaBridgeEndpoints,
  waterBridgeEndpoints,
  worldCenter,
} from '../systems/worlds'
import { BRIDGE_GATE_HALF, BRIDGE_HALF_WIDTH } from './bounds'
import { Gatherable } from './Gatherable'

const THICK = 2.4
const WALL_H = 12
const WALL_T = 2
const WALL_Y = WALL_H / 2 - 0.5
const GATE_HALF = BRIDGE_GATE_HALF

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
  const half = biomeHalf()
  const hx = WALL_T / 2
  const hy = WALL_H / 2
  const inset = half - hx
  const span = half + hx
  const wing = (half - GATE_HALF) / 2
  const wingCenter = GATE_HALF + wing

  return (
    <RigidBody type="fixed" colliders={false} position={[cx, 0, cz]}>
      <CuboidCollider args={[span, hy, hx]} position={[0, WALL_Y, inset]} />
      {openSouth ? (
        <>
          <CuboidCollider args={[wing, hy, hx]} position={[-wingCenter, WALL_Y, -inset]} />
          <CuboidCollider args={[wing, hy, hx]} position={[wingCenter, WALL_Y, -inset]} />
        </>
      ) : (
        <CuboidCollider args={[span, hy, hx]} position={[0, WALL_Y, -inset]} />
      )}
      <CuboidCollider args={[hx, hy, span]} position={[inset, WALL_Y, 0]} />
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

function Ocean({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const mx = (from[0] + to[0]) / 2
  const mz = (from[2] + to[2]) / 2
  const dx = to[0] - from[0]
  const dz = to[2] - from[2]
  const len = Math.max(4, Math.hypot(dx, dz))
  const yaw = Math.atan2(dx, dz)
  return (
    <mesh receiveShadow position={[mx, -0.35, mz]} rotation={[0, yaw, 0]}>
      <boxGeometry args={[BIOME_ISLAND_SIZE, 0.2, len + 8]} />
      <meshStandardMaterial color="#1a6a9a" transparent opacity={0.88} />
    </mesh>
  )
}

/** Long pier bridge across the ocean to a full remote island. */
function LongBridge({
  from,
  to,
  deckColor,
  railColor,
}: {
  from: [number, number, number]
  to: [number, number, number]
  deckColor: string
  railColor: string
}) {
  const mx = (from[0] + to[0]) / 2
  const mz = (from[2] + to[2]) / 2
  const dx = to[0] - from[0]
  const dz = to[2] - from[2]
  const len = Math.max(4, Math.hypot(dx, dz))
  const yaw = Math.atan2(dx, dz)
  const halfW = BRIDGE_HALF_WIDTH
  const halfH = 0.4
  const halfL = len / 2
  const segments = Math.max(3, Math.ceil(len / 14))

  return (
    <group position={[mx, 0, mz]} rotation={[0, yaw, 0]}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[halfW, halfH, halfL]} position={[0, halfH, 0]} />
        <mesh receiveShadow castShadow position={[0, halfH, 0]}>
          <boxGeometry args={[halfW * 2, halfH * 2, len]} />
          <meshStandardMaterial color={deckColor} />
        </mesh>
        {Array.from({ length: segments }, (_, i) => {
          const t = (i + 0.5) / segments - 0.5
          return (
            <mesh key={i} position={[0, -0.15, t * len]}>
              <cylinderGeometry args={[0.18, 0.22, 1.6, 6]} />
              <meshStandardMaterial color="#4a3018" />
            </mesh>
          )
        })}
        <mesh position={[-halfW + 0.1, 1, 0]}>
          <boxGeometry args={[0.14, 0.8, len]} />
          <meshStandardMaterial color={railColor} />
        </mesh>
        <mesh position={[halfW - 0.1, 1, 0]}>
          <boxGeometry args={[0.14, 0.8, len]} />
          <meshStandardMaterial color={railColor} />
        </mesh>
      </RigidBody>
    </group>
  )
}

function IslandBeacon({
  position,
  color,
}: {
  position: [number, number, number]
  color: string
}) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 2.8, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 5.6, 6]} />
        <meshStandardMaterial color="#4a4035" />
      </mesh>
      <mesh castShadow position={[0, 5.5, 0]}>
        <sphereGeometry args={[0.55, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[3.2, 0.9, 0.2]} />
        <meshStandardMaterial color="#2a2018" />
      </mesh>
      {/* Sign post */}
    </group>
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
      <mesh castShadow position={[-2, 1.4, 0]}>
        <boxGeometry args={[0.45, 2.8, 0.45]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh castShadow position={[2, 1.4, 0]}>
        <boxGeometry args={[0.45, 2.8, 0.45]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh castShadow position={[0, 2.85, 0]}>
        <boxGeometry args={[4.5, 0.4, 0.4]} />
        <meshStandardMaterial color={labelColor} emissive={labelColor} emissiveIntensity={0.45} />
      </mesh>
    </group>
  )
}

/** Full water island far north — unlocked at land tier 1. */
export function WaterWorld() {
  const landTier = useGameStore((s) => s.landTier)
  if (landTier < 1) return null

  const [cx, , cz] = worldCenter('water')
  const { home, island } = waterBridgeEndpoints()
  const h = homeHalf()

  return (
    <group>
      <Ocean from={home} to={island} />
      <RigidBody type="fixed" colliders={false} position={[cx, 0, cz]}>
        <CuboidCollider
          args={[BIOME_ISLAND_SIZE / 2, THICK / 2, BIOME_ISLAND_SIZE / 2]}
          position={[0, -THICK / 2, 0]}
        />
        <mesh receiveShadow position={[0, -THICK / 2, 0]}>
          <boxGeometry args={[BIOME_ISLAND_SIZE, THICK, BIOME_ISLAND_SIZE]} />
          <meshStandardMaterial color="#3d8fd9" />
        </mesh>
        <mesh receiveShadow position={[0, 0.02, 0]}>
          <boxGeometry args={[BIOME_ISLAND_SIZE - 4, 0.08, BIOME_ISLAND_SIZE - 4]} />
          <meshStandardMaterial color="#5ec4ff" />
        </mesh>
      </RigidBody>
      <BiomeWalls cx={cx} cz={cz} openSouth />
      <LongBridge from={home} to={island} deckColor="#6ec4ff" railColor="#dfefff" />
      <PortalArch position={[0, 0, h - 0.3]} rotationY={0} color="#2a6a9a" labelColor="#88ddff" />
      <IslandBeacon position={[cx, 0, cz + biomeHalf() - 2]} color="#88ddff" />
      <Gatherable id="water-tree-1" resource="wood" position={[cx - 8, 0, cz + 6]} />
      <Gatherable id="water-tree-2" resource="wood" position={[cx + 6, 0, cz + 8]} />
      <Gatherable id="water-tree-3" resource="wood" position={[cx - 5, 0, cz - 4]} />
      <Gatherable id="water-rock-1" resource="stone" position={[cx + 9, 0, cz - 3]} />
      <Gatherable id="water-rock-2" resource="stone" position={[cx - 10, 0, cz + 2]} />
      {[
        [-6, 8],
        [4, -7],
        [10, 5],
        [-9, -6],
      ].map(([ox, oz], i) => (
        <mesh key={i} position={[cx + ox, 0.35, cz + oz]}>
          <coneGeometry args={[0.55, 1.4, 6]} />
          <meshStandardMaterial color="#2d8a4a" />
        </mesh>
      ))}
    </group>
  )
}

/** Full lava island far east — unlocked at land tier 2. */
export function LavaWorld() {
  const landTier = useGameStore((s) => s.landTier)
  if (landTier < 2) return null

  const [cx, , cz] = worldCenter('lava')
  const { home, island } = lavaBridgeEndpoints()
  const h = homeHalf()

  return (
    <group>
      <Ocean from={home} to={island} />
      <RigidBody type="fixed" colliders={false} position={[cx, 0, cz]}>
        <CuboidCollider
          args={[BIOME_ISLAND_SIZE / 2, THICK / 2, BIOME_ISLAND_SIZE / 2]}
          position={[0, -THICK / 2, 0]}
        />
        <mesh receiveShadow position={[0, -THICK / 2, 0]}>
          <boxGeometry args={[BIOME_ISLAND_SIZE, THICK, BIOME_ISLAND_SIZE]} />
          <meshStandardMaterial color="#8a3020" emissive="#4a1008" emissiveIntensity={0.35} />
        </mesh>
      </RigidBody>
      <BiomeWalls cx={cx} cz={cz} openWest />
      <LongBridge from={home} to={island} deckColor="#aa5533" railColor="#ffaa66" />
      <PortalArch position={[h - 0.3, 0, 0]} rotationY={Math.PI / 2} color="#6a2010" labelColor="#ff6622" />
      <IslandBeacon position={[cx + biomeHalf() - 2, 0, cz]} color="#ff6622" />
      <Gatherable id="lava-rock-1" resource="stone" position={[cx + 4, 0, cz + 8]} />
      <Gatherable id="lava-rock-2" resource="stone" position={[cx - 6, 0, cz - 5]} />
      <Gatherable id="lava-rock-3" resource="stone" position={[cx + 10, 0, cz - 2]} />
      <Gatherable id="lava-rock-4" resource="stone" position={[cx - 8, 0, cz + 4]} />
      {[
        [0, 0],
        [3, 4],
        [-4, -3],
        [6, -5],
        [-7, 6],
      ].map(([ox, oz], i) => (
        <mesh key={i} position={[cx + ox, 0.15, cz + oz]}>
          <boxGeometry args={[1.4, 0.3, 1.4]} />
          <meshStandardMaterial color="#ff6622" emissive="#cc2200" emissiveIntensity={0.65} />
        </mesh>
      ))}
    </group>
  )
}

/** Distant silhouettes so players see locked islands before buying. */
export function LockedIslandHints() {
  const landTier = useGameStore((s) => s.landTier)
  const [wx, , wz] = worldCenter('water')
  const [lx, , lz] = worldCenter('lava')

  return (
    <group>
      {landTier < 1 ? (
        <mesh position={[wx, -0.2, wz]}>
          <boxGeometry args={[BIOME_ISLAND_SIZE, 1, BIOME_ISLAND_SIZE]} />
          <meshStandardMaterial color="#1a4a6a" transparent opacity={0.35} />
        </mesh>
      ) : null}
      {landTier < 2 ? (
        <mesh position={[lx, -0.2, lz]}>
          <boxGeometry args={[BIOME_ISLAND_SIZE, 1, BIOME_ISLAND_SIZE]} />
          <meshStandardMaterial color="#4a2010" transparent opacity={0.35} />
        </mesh>
      ) : null}
    </group>
  )
}
