import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useGameStore } from '../stores/gameStore'
import {
  lavaHubCenter,
  lavaUnlocked,
  type LandPlot,
  unlockedPlots,
  waterHubCenter,
  waterUnlocked,
} from '../systems/plots'
import { BRIDGE_GATE_HALF, BRIDGE_HALF_WIDTH, WALK_COLLIDER_HALF_H } from './bounds'
import { Gatherable } from './Gatherable'

function ChainBridge({
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
  const halfW = BRIDGE_GATE_HALF
  const deckHalfH = 0.4
  const halfL = len / 2

  return (
    <group position={[mx, 0, mz]} rotation={[0, yaw, 0]}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[halfW, WALK_COLLIDER_HALF_H, halfL]}
          position={[0, -WALK_COLLIDER_HALF_H, 0]}
        />
        <mesh receiveShadow castShadow position={[0, deckHalfH, 0]}>
          <boxGeometry args={[BRIDGE_HALF_WIDTH * 2, deckHalfH * 2, len]} />
          <meshStandardMaterial color={deckColor} />
        </mesh>
        <mesh position={[-BRIDGE_HALF_WIDTH + 0.1, 1, 0]}>
          <boxGeometry args={[0.14, 0.8, len]} />
          <meshStandardMaterial color={railColor} />
        </mesh>
        <mesh position={[BRIDGE_HALF_WIDTH - 0.1, 1, 0]}>
          <boxGeometry args={[0.14, 0.8, len]} />
          <meshStandardMaterial color={railColor} />
        </mesh>
      </RigidBody>
    </group>
  )
}

function OutpostIsland({ plot }: { plot: LandPlot }) {
  const [cx, , cz] = plot.center
  const half = plot.size / 2
  const thick = 2
  const top = plot.biome === 'water' ? '#5ec4ff' : '#aa5533'
  const side = plot.biome === 'water' ? '#2a6a9a' : '#8a3020'

  return (
    <group>
      <RigidBody type="fixed" colliders={false} position={[cx, 0, cz]}>
        <CuboidCollider args={[half, thick / 2, half]} position={[0, -thick / 2, 0]} />
        <mesh receiveShadow position={[0, -thick / 2, 0]}>
          <boxGeometry args={[plot.size, thick, plot.size]} />
          <meshStandardMaterial color={side} />
        </mesh>
        <mesh receiveShadow position={[0, 0.02, 0]}>
          <boxGeometry args={[plot.size - 2, 0.08, plot.size - 2]} />
          <meshStandardMaterial
            color={top}
            emissive={plot.biome === 'lava' ? '#cc2200' : '#000000'}
            emissiveIntensity={plot.biome === 'lava' ? 0.25 : 0}
          />
        </mesh>
      </RigidBody>
      <Gatherable
        id={`${plot.id}-wood`}
        resource="wood"
        position={[cx - half * 0.35, 0, cz + half * 0.2]}
      />
      <Gatherable
        id={`${plot.id}-stone`}
        resource="stone"
        position={[cx + half * 0.3, 0, cz - half * 0.25]}
      />
    </group>
  )
}

function dockPoint(
  center: [number, number, number],
  size: number,
  side: 'south' | 'north' | 'west' | 'east',
): [number, number, number] {
  const h = size / 2
  if (side === 'south') return [center[0], 0, center[2] - h + 0.5]
  if (side === 'north') return [center[0], 0, center[2] + h - 0.5]
  if (side === 'west') return [center[0] - h + 0.5, 0, center[2]]
  return [center[0] + h - 0.5, 0, center[2]]
}

/** Extra reefs/crags past the main water and lava hubs. */
export function LandPlots() {
  const landTier = useGameStore((s) => s.landTier)
  const outposts = unlockedPlots(landTier).filter((p) => p.kind === 'outpost')

  const bridges: Array<{
    key: string
    from: [number, number, number]
    to: [number, number, number]
    deck: string
    rail: string
  }> = []

  const waterReefs = outposts
    .filter((p) => p.biome === 'water')
    .sort((a, b) => a.center[2] - b.center[2])
  if (waterUnlocked(landTier) && waterReefs[0]) {
    bridges.push({
      key: `water-hub-${waterReefs[0].id}`,
      from: dockPoint(waterHubCenter(), 44, 'north'),
      to: dockPoint(waterReefs[0].center, waterReefs[0].size, 'south'),
      deck: '#6ec4ff',
      rail: '#dfefff',
    })
    for (let i = 1; i < waterReefs.length; i += 1) {
      const prev = waterReefs[i - 1]!
      const next = waterReefs[i]!
      bridges.push({
        key: `${prev.id}-${next.id}`,
        from: dockPoint(prev.center, prev.size, 'north'),
        to: dockPoint(next.center, next.size, 'south'),
        deck: '#6ec4ff',
        rail: '#dfefff',
      })
    }
  }

  const lavaCrags = outposts
    .filter((p) => p.biome === 'lava')
    .sort((a, b) => a.center[0] - b.center[0])
  if (lavaUnlocked(landTier) && lavaCrags[0]) {
    bridges.push({
      key: `lava-hub-${lavaCrags[0].id}`,
      from: dockPoint(lavaHubCenter(), 44, 'east'),
      to: dockPoint(lavaCrags[0].center, lavaCrags[0].size, 'west'),
      deck: '#aa5533',
      rail: '#ffaa66',
    })
    for (let i = 1; i < lavaCrags.length; i += 1) {
      const prev = lavaCrags[i - 1]!
      const next = lavaCrags[i]!
      bridges.push({
        key: `${prev.id}-${next.id}`,
        from: dockPoint(prev.center, prev.size, 'east'),
        to: dockPoint(next.center, next.size, 'west'),
        deck: '#aa5533',
        rail: '#ffaa66',
      })
    }
  }

  return (
    <group>
      {outposts.map((plot) => (
        <OutpostIsland key={plot.id} plot={plot} />
      ))}
      {bridges.map((b) => (
        <ChainBridge
          key={b.key}
          from={b.from}
          to={b.to}
          deckColor={b.deck}
          railColor={b.rail}
        />
      ))}
    </group>
  )
}
