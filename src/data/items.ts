export type ItemId = 'wood' | 'stone' | 'dungeon-relic'

export interface ItemDef {
  id: ItemId
  name: string
  /** Money gained per unit when sold to the traveling merchant. */
  sellValue: number
}

export const ITEMS: Record<ItemId, ItemDef> = {
  wood: { id: 'wood', name: 'Wood', sellValue: 1 },
  stone: { id: 'stone', name: 'Stone', sellValue: 2 },
  'dungeon-relic': { id: 'dungeon-relic', name: 'Dungeon Relic', sellValue: 25 },
}
