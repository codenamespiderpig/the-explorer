import { ITEMS, type ItemId } from '../data/items'

const SELLABLE: ItemId[] = ['wood', 'stone', 'dungeon-relic']

/** Money received for selling `quantity` of `item` to the traveling merchant. */
export function sellValue(item: ItemId, quantity: number): number {
  if (!SELLABLE.includes(item)) {
    throw new Error(`Item is not sellable: ${item}`)
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error(`Quantity must be a positive integer, got ${quantity}`)
  }
  return ITEMS[item].sellValue * quantity
}
