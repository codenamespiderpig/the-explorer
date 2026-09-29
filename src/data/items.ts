export type ResourceId = 'wood' | 'stone'
export type ToolId = 'wooden-sword' | 'wooden-pickaxe' | 'wooden-axe'
export type CraftedItemId =
  | 'campfire'
  | 'advanced-campfire'
  | 'fence'
  | 'workbench'
  | 'hunting-spear'
  | 'furnace'
  | 'wooden-gate'
  | 'slime-castle'
  | 'crab-pot'
export type ItemId = ResourceId | 'dungeon-relic' | 'slime-goop' | 'fish' | ToolId | CraftedItemId

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
  'slime-goop': { id: 'slime-goop', name: 'Slime Goop', sellValue: 4 },
  fish: { id: 'fish', name: 'Fish', sellValue: 5 },
  'wooden-sword': { id: 'wooden-sword', name: 'Wooden Sword', sellValue: 5 },
  'wooden-pickaxe': { id: 'wooden-pickaxe', name: 'Wooden Pickaxe', sellValue: 5 },
  'wooden-axe': { id: 'wooden-axe', name: 'Wooden Axe', sellValue: 5 },
  campfire: { id: 'campfire', name: 'Campfire', sellValue: 4 },
  'advanced-campfire': {
    id: 'advanced-campfire',
    name: 'Advanced Campfire',
    sellValue: 18,
  },
  fence: { id: 'fence', name: 'Wooden Fence', sellValue: 3 },
  workbench: { id: 'workbench', name: 'Workbench', sellValue: 12 },
  'hunting-spear': { id: 'hunting-spear', name: 'Hunting Spear', sellValue: 8 },
  furnace: { id: 'furnace', name: 'Furnace', sellValue: 20 },
  'wooden-gate': { id: 'wooden-gate', name: 'Wooden Gate', sellValue: 6 },
  'slime-castle': {
    id: 'slime-castle',
    name: 'Slime Castle',
    sellValue: 80,
  },
  'crab-pot': { id: 'crab-pot', name: 'Crab Pot', sellValue: 8 },
}

export const STARTING_TOOLS: ToolId[] = [
  'wooden-sword',
  'wooden-pickaxe',
  'wooden-axe',
]
