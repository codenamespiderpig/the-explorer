import {
  lavaBridgeEndpoints,
  unlockedWorlds,
  waterBridgeEndpoints,
  worldCenter,
  worldPlayableHalf,
  type WorldId,
} from '../systems/worlds'
import { playableHalf } from '../systems/land'

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

function homeClamp(x: number, z: number) {
  const half = playableHalf(0)
  return {
    x: Math.min(half, Math.max(-half, x)),
    z: Math.min(half, Math.max(-half, z)),
  }
}

function biomeClamp(x: number, z: number, world: WorldId): { x: number; z: number } {
  const [cx, , cz] = worldCenter(world)
  const half = worldPlayableHalf(world)
  const lx = x - cx
  const lz = z - cz
  return {
    x: cx + Math.min(half, Math.max(-half, lx)),
    z: cz + Math.min(half, Math.max(-half, lz)),
  }
}

export function onWaterBridge(x: number, z: number, landTier: number): boolean {
  if (landTier < 1) return false
  const { home, island } = waterBridgeEndpoints()
  const zMin = Math.min(home[2], island[2])
  const zMax = Math.max(home[2], island[2])
  return Math.abs(x) <= BRIDGE_HALF_WIDTH && z >= zMin - 1 && z <= zMax + 1
}

export function onLavaBridge(x: number, z: number, landTier: number): boolean {
  if (landTier < 2) return false
  const { home, island } = lavaBridgeEndpoints()
  const xMin = Math.min(home[0], island[0])
  const xMax = Math.max(home[0], island[0])
  return Math.abs(z) <= BRIDGE_HALF_WIDTH && x >= xMin - 1 && x <= xMax + 1
}

function bridgeClamp(x: number, z: number, landTier: number): { x: number; z: number } | null {
  if (onWaterBridge(x, z, landTier)) {
    const { home, island } = waterBridgeEndpoints()
    const zMin = Math.min(home[2], island[2])
    const zMax = Math.max(home[2], island[2])
    return {
      x: Math.min(BRIDGE_HALF_WIDTH, Math.max(-BRIDGE_HALF_WIDTH, x)),
      z: Math.min(zMax + 0.5, Math.max(zMin - 0.5, z)),
    }
  }
  if (onLavaBridge(x, z, landTier)) {
    const { home, island } = lavaBridgeEndpoints()
    const xMin = Math.min(home[0], island[0])
    const xMax = Math.max(home[0], island[0])
    return {
      x: Math.min(xMax + 0.5, Math.max(xMin - 0.5, x)),
      z: Math.min(BRIDGE_HALF_WIDTH, Math.max(-BRIDGE_HALF_WIDTH, z)),
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
