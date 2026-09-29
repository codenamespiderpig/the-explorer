/** Lava Island step-on burn patches. */

import { lavaUnlocked } from './plots'
import { worldCenter } from './worlds'

/** Local XZ offsets from the lava hub center (matches LavaWorld meshes). */
export const LAVA_PATCH_OFFSETS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [3, 4],
  [-4, -3],
  [6, -5],
  [-7, 6],
]

/** Half-size of each patch on X/Z (1.4 box → 0.7). */
export const LAVA_PATCH_HALF = 0.7

/** Damage per burn tick (i-frames in damagePlayer rate-limit repeats). */
export const LAVA_BURN_DAMAGE = 6

export function lavaPatchWorldPositions(
  cx: number,
  cz: number,
): Array<[number, number]> {
  return LAVA_PATCH_OFFSETS.map(([ox, oz]) => [cx + ox, cz + oz])
}

export function isOnLavaPatch(x: number, z: number, landTier: number): boolean {
  if (!lavaUnlocked(landTier)) return false
  const [cx, , cz] = worldCenter('lava')
  const half = LAVA_PATCH_HALF
  for (const [px, pz] of lavaPatchWorldPositions(cx, cz)) {
    if (Math.abs(x - px) <= half && Math.abs(z - pz) <= half) return true
  }
  return false
}
