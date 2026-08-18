export const ISLAND_SIZE = 36
export const ISLAND_HALF = ISLAND_SIZE / 2
/** How far the player can walk from the origin before being stopped. */
export const PLAYABLE_HALF = ISLAND_HALF - 1.5

/** Clamp a horizontal position onto the playable island. */
export function clampToIsland(x: number, z: number): { x: number; z: number } {
  return {
    x: Math.min(PLAYABLE_HALF, Math.max(-PLAYABLE_HALF, x)),
    z: Math.min(PLAYABLE_HALF, Math.max(-PLAYABLE_HALF, z)),
  }
}

export const FALL_Y = -2
