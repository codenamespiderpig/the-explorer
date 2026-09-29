import { BIOME_ISLAND_SIZE, waterHubCenter } from './plots'

export type WalkRectKind = 'islet' | 'walkway'

export interface WalkRect {
  id: string
  kind: WalkRectKind
  xMin: number
  xMax: number
  zMin: number
  zMax: number
}

/** @deprecated mini-islet layout removed — water hub is a solid island. */
export const WATER_ISLAND_RECTS: WalkRect[] = []

const WATER_PLAYABLE_HALF = BIOME_ISLAND_SIZE / 2 - 1.5

function translateRect(rect: WalkRect, cx: number, cz: number): WalkRect {
  return {
    ...rect,
    xMin: rect.xMin + cx,
    xMax: rect.xMax + cx,
    zMin: rect.zMin + cz,
    zMax: rect.zMax + cz,
  }
}

/** Kept for callers; empty now that the hub is a solid slab. */
export function waterIslandWalkRects(): WalkRect[] {
  const [cx, , cz] = waterHubCenter()
  return WATER_ISLAND_RECTS.map((rect) => translateRect(rect, cx, cz))
}

export function waterIslandIsletRects(): WalkRect[] {
  return waterIslandWalkRects().filter((rect) => rect.kind === 'islet')
}

export function isPointInWalkRect(x: number, z: number, rect: WalkRect): boolean {
  return x >= rect.xMin && x <= rect.xMax && z >= rect.zMin && z <= rect.zMax
}

/** Solid water hub playable area (same footprint as lava/rainforest hubs). */
export function isPointOnWaterIslandWalkable(x: number, z: number): boolean {
  const [cx, , cz] = waterHubCenter()
  return Math.abs(x - cx) <= WATER_PLAYABLE_HALF + 1 && Math.abs(z - cz) <= WATER_PLAYABLE_HALF + 1
}

function closestPointOnRect(x: number, z: number, rect: WalkRect): { x: number; z: number } {
  return {
    x: Math.min(rect.xMax, Math.max(rect.xMin, x)),
    z: Math.min(rect.zMax, Math.max(rect.zMin, z)),
  }
}

/** Keep position if on a rect; otherwise snap to nearest point on the nearest rect. */
export function clampToWalkableRects(
  x: number,
  z: number,
  rects: readonly WalkRect[],
): { x: number; z: number } {
  if (rects.length === 0) {
    const [cx, , cz] = waterHubCenter()
    return {
      x: cx + Math.min(WATER_PLAYABLE_HALF, Math.max(-WATER_PLAYABLE_HALF, x - cx)),
      z: cz + Math.min(WATER_PLAYABLE_HALF, Math.max(-WATER_PLAYABLE_HALF, z - cz)),
    }
  }
  if (rects.some((rect) => isPointInWalkRect(x, z, rect))) {
    return { x, z }
  }

  let best = { x, z }
  let bestDist = Infinity
  for (const rect of rects) {
    const point = closestPointOnRect(x, z, rect)
    const dist = Math.hypot(point.x - x, point.z - z)
    if (dist < bestDist) {
      bestDist = dist
      best = point
    }
  }
  return best
}

export function randomPointInRect(
  rect: WalkRect,
  rng: () => number = Math.random,
): { x: number; z: number } {
  return {
    x: rect.xMin + rng() * (rect.xMax - rect.xMin),
    z: rect.zMin + rng() * (rect.zMax - rect.zMin),
  }
}

/** Random point on the solid water hub (for merchant, etc.). */
export function randomPointOnWaterHub(rng: () => number = Math.random): {
  x: number
  z: number
} {
  const [cx, , cz] = waterHubCenter()
  const half = BIOME_ISLAND_SIZE / 2 - 2
  const angle = rng() * Math.PI * 2
  const dist = half * (0.35 + rng() * 0.55)
  return { x: cx + Math.cos(angle) * dist, z: cz + Math.sin(angle) * dist }
}
