import {
  homeHalf,
  lavaBridgeEndpoints,
  unlockedWorlds,
  waterBridgeEndpoints,
  worldCenter,
  worldPlayableHalf,
  type WorldId,
} from '../systems/worlds'
import { playableHalf } from '../systems/land'
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

function onNorthDock(x: number, z: number, landTier: number): boolean {
  if (landTier < 1) return false
  const half = playableHalf(0)
  const northMax = homeHalf()
  return Math.abs(x) <= BRIDGE_GATE_HALF && z >= half && z <= northMax
}

function onEastDock(x: number, z: number, landTier: number): boolean {
  if (landTier < 2) return false
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

export function onWaterBridge(x: number, z: number, landTier: number): boolean {
  if (landTier < 1) return false
  if (isPointOnWaterIslandWalkable(x, z)) return false
  const { home, island } = waterBridgeEndpoints()
  const zMin = Math.min(home[2], island[2])
  const zMax = Math.max(home[2], island[2])
  return Math.abs(x) <= BRIDGE_GATE_HALF && z >= zMin - 1 && z <= zMax + 1
}

export function onLavaBridge(x: number, z: number, landTier: number): boolean {
  if (landTier < 2) return false
  const { home, island } = lavaBridgeEndpoints()
  const xMin = Math.min(home[0], island[0])
  const xMax = Math.max(home[0], island[0])
  return Math.abs(z) <= BRIDGE_GATE_HALF && x >= xMin - 1 && x <= xMax + 1
}

function bridgeClamp(x: number, z: number, landTier: number): { x: number; z: number } | null {
  if (onWaterBridge(x, z, landTier)) {
    const { home, island } = waterBridgeEndpoints()
    const zMin = Math.min(home[2], island[2])
    const zMax = Math.max(home[2], island[2])
    return {
      x: Math.min(BRIDGE_GATE_HALF, Math.max(-BRIDGE_GATE_HALF, x)),
      z: Math.min(zMax + 0.5, Math.max(zMin - 0.5, z)),
    }
  }
  if (onLavaBridge(x, z, landTier)) {
    const { home, island } = lavaBridgeEndpoints()
    const xMin = Math.min(home[0], island[0])
    const xMax = Math.max(home[0], island[0])
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
  if (landTier >= 1 && isPointOnWaterIslandWalkable(x, z)) {
    return waterBiomeClamp(x, z)
  }

  const dock = dockClamp(x, z, landTier)
  if (dock) return dock

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
