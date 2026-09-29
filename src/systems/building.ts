import type { ItemId } from '../data/items'

export type BuildingKind =
  | 'workbench'
  | 'furnace'
  | 'campfire'
  | 'advanced-campfire'
  | 'fence'

export interface PlacedBuilding {
  id: string
  kind: BuildingKind
  position: [number, number, number]
  yaw: number
}

export const BUILDING_KINDS = [
  'workbench',
  'furnace',
  'campfire',
  'advanced-campfire',
  'fence',
] as const satisfies readonly BuildingKind[]

export function isBuildingKind(id: ItemId): id is BuildingKind {
  return (BUILDING_KINDS as readonly string[]).includes(id)
}

export function createBuilding(
  id: string,
  kind: BuildingKind,
  position: [number, number, number],
  yaw = 0,
): PlacedBuilding {
  return { id, kind, position, yaw }
}

export function hasPlacedBuilding(
  buildings: readonly PlacedBuilding[],
  kind: BuildingKind,
): boolean {
  return buildings.some((b) => b.kind === kind)
}

/** Nearest building of `kind` within `radius`, or null. */
export function nearestBuildingOfKind(
  buildings: readonly PlacedBuilding[],
  kind: BuildingKind,
  x: number,
  z: number,
  radius: number,
): PlacedBuilding | null {
  let best: PlacedBuilding | null = null
  let bestDist = radius
  for (const b of buildings) {
    if (b.kind !== kind) continue
    const d = Math.hypot(b.position[0] - x, b.position[2] - z)
    if (d <= bestDist) {
      bestDist = d
      best = b
    }
  }
  return best
}
