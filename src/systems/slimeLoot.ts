import type { ItemId } from '../data/items'

export const SLIME_GOOP_DROP_CHANCE = 0.22
export const SLIME_GOOP_DOUBLE_CHANCE = 0.04

export type SlimeDrop = { item: ItemId; amount: number }

/** Roll a useful slime drop. Most kills yield nothing — goop is uncommon. */
export function rollSlimeDrop(rng: () => number = Math.random): SlimeDrop | null {
  const roll = rng()
  if (roll < SLIME_GOOP_DOUBLE_CHANCE) {
    return { item: 'slime-goop', amount: 2 }
  }
  if (roll < SLIME_GOOP_DROP_CHANCE) {
    return { item: 'slime-goop', amount: 1 }
  }
  return null
}
