import {
  unlockedWorlds,
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

/** @deprecated Use islandSize(landTier). */
export const ISLAND_SIZE = 36
export const ISLAND_HALF = 18
/** @deprecated Use playableHalf(landTier). */
export const PLAYABLE_HALF = playableHalf(0)

export const FALL_Y = -2

function homeClamp(x: number, z: number, landTier: number) {
  const half = playableHalf(landTier)
  return {
    x: Math.min(half, Math.max(-half, x)),
    z: Math.min(half, Math.max(-half, z)),
  }
}

function biomeClamp(
  x: number,
  z: number,
  world: WorldId,
  landTier: number,
): { x: number; z: number } {
  const [cx, , cz] = worldCenter(world, landTier)
  const half = worldPlayableHalf(world)
  const lx = x - cx
  const lz = z - cz
  return {
    x: cx + Math.min(half, Math.max(-half, lx)),
    z: cz + Math.min(half, Math.max(-half, lz)),
  }
}

function onBridge(
  x: number,
  z: number,
  landTier: number,
): { x: number; z: number } | null {
  const homeHalf = playableHalf(landTier)
  if (landTier >= 1) {
    const [, , wz] = worldCenter('water', landTier)
    const waterSouth = wz - worldPlayableHalf('water')
    if (Math.abs(x) < 1.3 && z > homeHalf - 2 && z < waterSouth + 2) {
      return { x: Math.min(1.3, Math.max(-1.3, x)), z: Math.min(waterSouth + 1.5, Math.max(homeHalf - 1.5, z)) }
    }
  }
  if (landTier >= 2) {
    const [lx] = worldCenter('lava', landTier)
    const lavaWest = lx - worldPlayableHalf('lava')
    if (Math.abs(z) < 1.3 && x > homeHalf - 2 && x < lavaWest + 2) {
      return { x: Math.min(lavaWest + 1.5, Math.max(homeHalf - 1.5, x)), z: Math.min(1.3, Math.max(-1.3, z)) }
    }
  }
  return null
}

/** Clamp onto home or any unlocked biome the player has walked into. */
export function clampToIsland(
  x: number,
  z: number,
  landTier = 0,
): { x: number; z: number } {
  const bridge = onBridge(x, z, landTier)
  if (bridge) return bridge

  const worlds = unlockedWorlds(landTier)
  for (const world of worlds) {
    if (world === 'home') continue
    const [cx, , cz] = worldCenter(world, landTier)
    const half = worldPlayableHalf(world)
    if (Math.abs(x - cx) <= half + 0.5 && Math.abs(z - cz) <= half + 0.5) {
      return biomeClamp(x, z, world, landTier)
    }
  }
  return homeClamp(x, z, landTier)
}
