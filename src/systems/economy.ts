import type { ItemId } from '../data/items'

/** Wood and stone sell for this much each. */
export const COMMON_MERCHANT_PRICE = 5
/** Rarer inventory items sell for this much each. */
export const RARE_MERCHANT_PRICE = 15

const COMMON_ITEMS = new Set<ItemId>(['wood', 'stone', 'fish'])

const RARE_ITEMS = new Set<ItemId>([
  'slime-goop',
  'dungeon-relic',
  'campfire',
  'fence',
  'workbench',
  'hunting-spear',
  'furnace',
  'wooden-gate',
  'slime-castle',
])

/** Money the merchant pays per unit of `item`. */
export function merchantPrice(item: ItemId): number | null {
  if (COMMON_ITEMS.has(item)) return COMMON_MERCHANT_PRICE
  if (RARE_ITEMS.has(item)) return RARE_MERCHANT_PRICE
  return null
}

export function isMerchantSellable(item: ItemId): boolean {
  return merchantPrice(item) !== null
}

/** Money received for selling `quantity` of `item` to the traveling merchant. */
export function sellValue(item: ItemId, quantity: number): number {
  const price = merchantPrice(item)
  if (price === null) {
    throw new Error(`Item is not sellable: ${item}`)
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error(`Quantity must be a positive integer, got ${quantity}`)
  }
  return price * quantity
}

export type ItemCounts = Partial<Record<ItemId, number>>

export type SellResult =
  | { ok: true; moneyGained: number; items: ItemCounts; money: number }
  | { ok: false; reason: 'merchant-gone' | 'not-sellable' | 'not-enough' }

export function sellToMerchant(
  items: ItemCounts,
  money: number,
  item: ItemId,
  quantity: number,
  merchantPresent: boolean,
): SellResult {
  if (!merchantPresent) return { ok: false, reason: 'merchant-gone' }
  if (!isMerchantSellable(item)) return { ok: false, reason: 'not-sellable' }
  const owned = items[item] ?? 0
  if (owned < quantity) return { ok: false, reason: 'not-enough' }
  const moneyGained = sellValue(item, quantity)
  const nextItems = { ...items, [item]: owned - quantity }
  if (nextItems[item] === 0) delete nextItems[item]
  return {
    ok: true,
    moneyGained,
    items: nextItems,
    money: money + moneyGained,
  }
}
