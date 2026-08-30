import { isNearWater } from './crabPot'
import type { ItemId } from '../data/items'

export const PLACEABLE_ITEMS = ['wooden-gate', 'slime-castle', 'crab-pot'] as const satisfies readonly ItemId[]

export type PlaceableItemId = (typeof PLACEABLE_ITEMS)[number]

export type PickPlaceableResult =
  | { ok: true; item: PlaceableItemId }
  | { ok: false; reason: 'none-owned' | 'crab-pot-needs-water' }

function count(items: Partial<Record<ItemId, number>>, id: PlaceableItemId): number {
  return items[id] ?? 0
}

/** Choose which placeable to use when pressing G (priority: gate → castle → crab pot). */
export function pickPlaceableToPlace(
  items: Partial<Record<ItemId, number>>,
  landTier: number,
  x: number,
  z: number,
): PickPlaceableResult {
  if (count(items, 'wooden-gate') > 0) {
    return { ok: true, item: 'wooden-gate' }
  }
  if (count(items, 'slime-castle') > 0) {
    return { ok: true, item: 'slime-castle' }
  }
  if (count(items, 'crab-pot') > 0) {
    if (!isNearWater(x, z, landTier)) {
      return { ok: false, reason: 'crab-pot-needs-water' }
    }
    return { ok: true, item: 'crab-pot' }
  }
  return { ok: false, reason: 'none-owned' }
}

export function placeableHint(result: PickPlaceableResult): string {
  if (result.ok) {
    if (result.item === 'wooden-gate') {
      return 'Gate placed — it will block night slimes until broken'
    }
    if (result.item === 'slime-castle') {
      return 'Slime Castle placed — kill spawned slimes before they rot'
    }
    return 'Crab pot placed — it will catch fish over time'
  }
  if (result.reason === 'crab-pot-needs-water') {
    return 'Place crab pots on the Water Island or near the north pier (G)'
  }
  return 'Craft something to place in your backpack first (Q) — gate, castle, or crab pot'
}
