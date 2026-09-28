import type { ItemId } from '../data/items'

export type BuildingKind = 'workbench' | 'furnace' | 'campfire' | 'fence'

export interface PlacedBuilding {
  id: string
  kind: BuildingKind
  position: [number, number, number]
  yaw: number
}

export const BUILDING_KINDS = ['workbench', 'furnace', 'campfire', 'fence'] as const satisfies readonly BuildingKind[]

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
