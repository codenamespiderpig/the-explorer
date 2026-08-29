import { worldCenter } from './worlds'

export type WalkRectKind = 'islet' | 'walkway'

export interface WalkRect {
  id: string
  kind: WalkRectKind
  xMin: number
  xMax: number
  zMin: number
  zMax: number
}

/** Island-local walkable rectangles (origin = worldCenter('water')). */
export const WATER_ISLAND_RECTS: WalkRect[] = [
  { id: 'dock', kind: 'islet', xMin: -4, xMax: 4, zMin: -22, zMax: -14 },
  { id: 'central', kind: 'islet', xMin: -7, xMax: 7, zMin: -6, zMax: 6 },
  { id: 'west', kind: 'islet', xMin: -18, xMax: -10, zMin: -4, zMax: 4 },
  { id: 'east', kind: 'islet', xMin: 10, xMax: 18, zMin: -4, zMax: 4 },
  { id: 'northeast', kind: 'islet', xMin: 8, xMax: 16, zMin: 8, zMax: 16 },
  { id: 'north', kind: 'islet', xMin: -4, xMax: 4, zMin: 10, zMax: 18 },
  { id: 'walk-dock-central', kind: 'walkway', xMin: -1.2, xMax: 1.2, zMin: -14, zMax: -6 },
  { id: 'walk-central-west', kind: 'walkway', xMin: -10, xMax: -7, zMin: -1.2, zMax: 1.2 },
  { id: 'walk-central-east', kind: 'walkway', xMin: 7, xMax: 10, zMin: -1.2, zMax: 1.2 },
  { id: 'walk-central-north', kind: 'walkway', xMin: -1.2, xMax: 1.2, zMin: 6, zMax: 10 },
  { id: 'walk-central-ne-e', kind: 'walkway', xMin: 5.8, xMax: 9.2, zMin: 5.8, zMax: 7.2 },
  { id: 'walk-central-ne-n', kind: 'walkway', xMin: 6.8, xMax: 9.2, zMin: 7.2, zMax: 10 },
]

function translateRect(rect: WalkRect, cx: number, cz: number): WalkRect {
  return {
    ...rect,
    xMin: rect.xMin + cx,
    xMax: rect.xMax + cx,
    zMin: rect.zMin + cz,
    zMax: rect.zMax + cz,
  }
}

export function waterIslandWalkRects(): WalkRect[] {
  const [cx, , cz] = worldCenter('water')
  return WATER_ISLAND_RECTS.map((rect) => translateRect(rect, cx, cz))
}

export function waterIslandIsletRects(): WalkRect[] {
  return waterIslandWalkRects().filter((rect) => rect.kind === 'islet')
}

export function isPointInWalkRect(x: number, z: number, rect: WalkRect): boolean {
  return x >= rect.xMin && x <= rect.xMax && z >= rect.zMin && z <= rect.zMax
}

export function isPointOnWaterIslandWalkable(x: number, z: number): boolean {
  return waterIslandWalkRects().some((rect) => isPointInWalkRect(x, z, rect))
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
