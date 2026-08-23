import {
  BASE_ISLAND_SIZE,
  islandSize,
  playableHalf,
} from '../systems/land'

export { BASE_ISLAND_SIZE, islandSize, playableHalf }

/** @deprecated Use islandSize(landTier) from game state. */
export const ISLAND_SIZE = BASE_ISLAND_SIZE
export const ISLAND_HALF = BASE_ISLAND_SIZE / 2
/** @deprecated Use playableHalf(landTier) from game state. */
export const PLAYABLE_HALF = playableHalf(0)

/** Clamp a horizontal position onto the playable island. */
export function clampToIsland(
  x: number,
  z: number,
  landTier = 0,
): { x: number; z: number } {
  const half = playableHalf(landTier)
  return {
    x: Math.min(half, Math.max(-half, x)),
    z: Math.min(half, Math.max(-half, z)),
  }
}

export const FALL_Y = -2
