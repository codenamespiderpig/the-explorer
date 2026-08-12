import { ITEMS, type ItemId } from '../data/items'

/** Money received for selling `quantity` of `item` to the traveling merchant. */
export function sellValue(item: ItemId, quantity: number): number {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error(`Quantity must be a positive integer, got ${quantity}`)
  }
  return ITEMS[item].sellValue * quantity
}
