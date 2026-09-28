import {
  homeHalf,
  unlockedWorlds,
  worldCenter,
  worldPlayableHalf,
  type WorldId,
} from '../systems/worlds'
import { playableHalf } from '../systems/land'
import {
  eastChainOpen,
  isPointOnPlot,
  lavaUnlocked,
  northChainOpen,
  plotPlayableHalf,
  unlockedPlots,
  waterUnlocked,
  type LandPlot,
} from '../systems/plots'
import {
  clampToWalkableRects,
  isPointOnWaterIslandWalkable,
  waterIslandWalkRects,
} from '../systems/waterIsland'

export {
  unlockedWorlds,
  worldCenter,
  worldPlayableHalf,
  type WorldId,
} from '../systems/worlds'
export { BASE_ISLAND_SIZE, islandSize, playableHalf } from '../systems/land'

export const ISLAND_SIZE = 36
export const ISLAND_HALF = 18
export const PLAYABLE_HALF = playableHalf(0)

export const FALL_Y = -2
export const BRIDGE_HALF_WIDTH = 2.4
/** Matches invisible wall gate opening (±2.8). */
export const BRIDGE_GATE_HALF = BRIDGE_HALF_WIDTH + 0.4
/** Walk collider half-height — top flush with home island at y=0. */
export const WALK_COLLIDER_HALF_H = 0.15

function homeClamp(x: number, z: number) {
  const half = playableHalf(0)
  return {
    x: Math.min(half, Math.max(-half, x)),
    z: Math.min(half, Math.max(-half, z)),
  }
}

function waterBiomeClamp(x: number, z: number): { x: number; z: number } {
  const [cx, , cz] = worldCenter('water')
  const half = worldPlayableHalf('water')
  if (Math.abs(x - cx) > half + 1 || Math.abs(z - cz) > half + 1) {
    return { x, z }
  }
  return clampToWalkableRects(x, z, waterIslandWalkRects())
}

function biomeClamp(x: number, z: number, world: WorldId): { x: number; z: number } {
  if (world === 'water') return waterBiomeClamp(x, z)
  const [cx, , cz] = worldCenter(world)
  const half = worldPlayableHalf(world)
  const lx = x - cx
  const lz = z - cz
  return {
    x: cx + Math.min(half, Math.max(-half, lx)),
    z: cz + Math.min(half, Math.max(-half, lz)),
  }
}

function plotClamp(x: number, z: number, plot: LandPlot): { x: number; z: number } {
  const [cx, , cz] = plot.center
  const half = plotPlayableHalf(plot)
  return {
    x: cx + Math.min(half, Math.max(-half, x - cx)),
    z: cz + Math.min(half, Math.max(-half, z - cz)),
  }
}

function onNorthDock(x: number, z: number, landTier: number): boolean {
  if (!northChainOpen(landTier)) return false
  const half = playableHalf(0)
  const northMax = homeHalf()
  return Math.abs(x) <= BRIDGE_GATE_HALF && z >= half && z <= northMax
}

function onEastDock(x: number, z: number, landTier: number): boolean {
  if (!eastChainOpen(landTier)) return false
  const half = playableHalf(0)
  const eastMax = homeHalf()
  return Math.abs(z) <= BRIDGE_GATE_HALF && x >= half && x <= eastMax
}

function dockClamp(x: number, z: number, landTier: number): { x: number; z: number } | null {
  if (onNorthDock(x, z, landTier)) {
    const half = playableHalf(0)
    const northMax = homeHalf()
    return {
      x: Math.min(BRIDGE_GATE_HALF, Math.max(-BRIDGE_GATE_HALF, x)),
      z: Math.min(northMax, Math.max(half, z)),
    }
  }
  if (onEastDock(x, z, landTier)) {
    const half = playableHalf(0)
    const eastMax = homeHalf()
    return {
      x: Math.min(eastMax, Math.max(half, x)),
      z: Math.min(BRIDGE_GATE_HALF, Math.max(-BRIDGE_GATE_HALF, z)),
    }
  }
  return null
}

function isPointOnHomeIsland(x: number, z: number): boolean {
  const half = playableHalf(0)
  return Math.abs(x) <= half && Math.abs(z) <= half
}

function isPointOnAnyUnlockedPlot(x: number, z: number, landTier: number): LandPlot | null {
  for (const plot of unlockedPlots(landTier)) {
    if (plot.kind === 'hub' && plot.biome === 'water') continue
    if (plot.kind === 'hub' && plot.biome === 'lava') continue
    if (isPointOnPlot(x, z, plot)) return plot
  }
  return null
}

function northBridgeEndZ(landTier: number): number {
  const north = unlockedPlots(landTier).filter((p) => p.chain === 'north')
  if (north.length === 0) return homeHalf() - 1
  const furthest = north.reduce((a, b) => (a.center[2] > b.center[2] ? a : b))
  return furthest.center[2] - furthest.size / 2 + 0.5
}

function eastBridgeEndX(landTier: number): number {
  const east = unlockedPlots(landTier).filter((p) => p.chain === 'east')
  if (east.length === 0) return homeHalf() - 1
  const furthest = east.reduce((a, b) => (a.center[0] > b.center[0] ? a : b))
  return furthest.center[0] - furthest.size / 2 + 0.5
}

export function onWaterBridge(x: number, z: number, landTier: number): boolean {
  if (!northChainOpen(landTier)) return false
  if (isPointOnHomeIsland(x, z)) return false
  if (waterUnlocked(landTier) && isPointOnWaterIslandWalkable(x, z)) return false
  if (isPointOnAnyUnlockedPlot(x, z, landTier)) return false
  if (lavaUnlocked(landTier) && isPointOnLavaIsland(x, z)) return false
  const zMin = homeHalf() - 1
  const zMax = northBridgeEndZ(landTier)
  return Math.abs(x) <= BRIDGE_GATE_HALF && z >= zMin - 1 && z <= zMax + 1
}

function isPointOnLavaIsland(x: number, z: number): boolean {
  const [cx, , cz] = worldCenter('lava')
  const half = worldPlayableHalf('lava')
  return Math.abs(x - cx) <= half + 1 && Math.abs(z - cz) <= half + 1
}

export function onLavaBridge(x: number, z: number, landTier: number): boolean {
  if (!eastChainOpen(landTier)) return false
  if (isPointOnHomeIsland(x, z)) return false
  if (lavaUnlocked(landTier) && isPointOnLavaIsland(x, z)) return false
  if (isPointOnAnyUnlockedPlot(x, z, landTier)) return false
  if (waterUnlocked(landTier) && isPointOnWaterIslandWalkable(x, z)) return false
  const xMin = homeHalf() - 1
  const xMax = eastBridgeEndX(landTier)
  return Math.abs(z) <= BRIDGE_GATE_HALF && x >= xMin - 1 && x <= xMax + 1
}

function bridgeClamp(x: number, z: number, landTier: number): { x: number; z: number } | null {
  if (onWaterBridge(x, z, landTier)) {
    const zMin = homeHalf() - 1
    const zMax = northBridgeEndZ(landTier)
    return {
      x: Math.min(BRIDGE_GATE_HALF, Math.max(-BRIDGE_GATE_HALF, x)),
      z: Math.min(zMax + 0.5, Math.max(zMin - 0.5, z)),
    }
  }
  if (onLavaBridge(x, z, landTier)) {
    const xMin = homeHalf() - 1
    const xMax = eastBridgeEndX(landTier)
    return {
      x: Math.min(xMax + 0.5, Math.max(xMin - 0.5, x)),
      z: Math.min(BRIDGE_GATE_HALF, Math.max(-BRIDGE_GATE_HALF, z)),
    }
  }
  return null
}

/** Clamp onto home, a long bridge, or an unlocked full island. */
export function clampToIsland(
  x: number,
  z: number,
  landTier = 0,
): { x: number; z: number } {
  if (waterUnlocked(landTier) && isPointOnWaterIslandWalkable(x, z)) {
    return waterBiomeClamp(x, z)
  }

  if (lavaUnlocked(landTier) && isPointOnLavaIsland(x, z)) {
    return biomeClamp(x, z, 'lava')
  }

  const onPlot = isPointOnAnyUnlockedPlot(x, z, landTier)
  if (onPlot) return plotClamp(x, z, onPlot)

  const dock = dockClamp(x, z, landTier)
  if (dock) return dock

  // Prefer home interior over pier corridor so you can leave bridges onto home.
  if (isPointOnHomeIsland(x, z)) {
    return homeClamp(x, z)
  }

  const bridge = bridgeClamp(x, z, landTier)
  if (bridge) return bridge

  const worlds = unlockedWorlds(landTier)
  for (const world of worlds) {
    if (world === 'home') continue
    const [cx, , cz] = worldCenter(world)
    const half = worldPlayableHalf(world)
    if (Math.abs(x - cx) <= half + 1 && Math.abs(z - cz) <= half + 1) {
      return biomeClamp(x, z, world)
    }
  }

  // Only clamp to home if still on/near home — don't snap back from the ocean.
  const half = playableHalf(0)
  if (Math.abs(x) <= half + 1.5 && Math.abs(z) <= half + 1.5) {
    return homeClamp(x, z)
  }

  return { x, z }
}
