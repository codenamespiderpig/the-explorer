import { isNearWater } from './crabPot'
import { isBuildingKind, type BuildingKind } from './building'
import type { ItemId } from '../data/items'

export const PLACEABLE_ITEMS = [
  'workbench',
  'furnace',
  'campfire',
  'advanced-campfire',
  'fence',
  'wooden-gate',
  'slime-castle',
  'crab-pot',
] as const satisfies readonly ItemId[]

export type PlaceableItemId = (typeof PLACEABLE_ITEMS)[number]

export type PickPlaceableResult =
  | { ok: true; item: PlaceableItemId }
  | { ok: false; reason: 'none-owned' | 'crab-pot-needs-water' }

function count(items: Partial<Record<ItemId, number>>, id: PlaceableItemId): number {
  return items[id] ?? 0
}

export function isPlaceableItem(id: ItemId): id is PlaceableItemId {
  return (PLACEABLE_ITEMS as readonly string[]).includes(id)
}

/** Priority when nothing is preferred — workbench first, fence last. */
const DEFAULT_PLACE_ORDER = [
  'workbench',
  'furnace',
  'advanced-campfire',
  'campfire',
  'wooden-gate',
  'slime-castle',
  'crab-pot',
  'fence',
] as const satisfies readonly PlaceableItemId[]

function tryPick(
  id: PlaceableItemId,
  items: Partial<Record<ItemId, number>>,
  landTier: number,
  x: number,
  z: number,
): PickPlaceableResult | null {
  if (count(items, id) < 1) return null
  if (id === 'crab-pot' && !isNearWater(x, z, landTier)) {
    return { ok: false, reason: 'crab-pot-needs-water' }
  }
  return { ok: true, item: id }
}

/** Choose which placeable to use when pressing G. */
export function pickPlaceableToPlace(
  items: Partial<Record<ItemId, number>>,
  landTier: number,
  x: number,
  z: number,
  preferred: PlaceableItemId | null = null,
): PickPlaceableResult {
  if (preferred) {
    const picked = tryPick(preferred, items, landTier, x, z)
    if (picked) return picked
  }

  let blockedByWater = false
  for (const id of DEFAULT_PLACE_ORDER) {
    const picked = tryPick(id, items, landTier, x, z)
    if (!picked) continue
    if (!picked.ok) {
      blockedByWater = true
      continue
    }
    return picked
  }

  if (blockedByWater) return { ok: false, reason: 'crab-pot-needs-water' }
  return { ok: false, reason: 'none-owned' }
}

export function placeableHint(result: PickPlaceableResult): string {
  if (result.ok) {
    if (isBuildingKind(result.item)) {
      const names: Record<BuildingKind, string> = {
        workbench: 'Workbench',
        furnace: 'Furnace',
        campfire: 'Campfire',
        'advanced-campfire': 'Advanced Campfire',
        fence: 'Fence',
      }
      return `${names[result.item]} placed`
    }
    if (result.item === 'wooden-gate') {
      return 'Gate placed — it will block night slimes until broken'
    }
    if (result.item === 'slime-castle') {
      return 'Slime Castle placed — kill spawned slimes before they rot'
    }
    return 'Crab pot placed — it will catch fish over time'
  }
  if (result.reason === 'crab-pot-needs-water') {
    return 'Place crab pots by a home pond or on the Water Island (G)'
  }
  return 'Craft something to place in your backpack first (Q) — workbench, gate, castle, or crab pot'
}
