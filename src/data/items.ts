export type ResourceId = 'wood' | 'stone'
export type ToolId = 'wooden-sword' | 'wooden-pickaxe' | 'wooden-axe'
export type ItemId = ResourceId | 'dungeon-relic' | ToolId

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
  'wooden-sword': { id: 'wooden-sword', name: 'Wooden Sword', sellValue: 5 },
  'wooden-pickaxe': { id: 'wooden-pickaxe', name: 'Wooden Pickaxe', sellValue: 5 },
  'wooden-axe': { id: 'wooden-axe', name: 'Wooden Axe', sellValue: 5 },
}

export const STARTING_TOOLS: ToolId[] = [
  'wooden-sword',
  'wooden-pickaxe',
  'wooden-axe',
]
