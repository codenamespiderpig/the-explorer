import type { ItemId } from './items'
import type { SkillId } from './skills'

export type RecipeId =
  | 'campfire'
  | 'fence'
  | 'workbench'
  | 'hunting-spear'
  | 'furnace'
  | 'wooden-gate'
  | 'slime-castle'
  | 'crab-pot'

export interface Recipe {
  id: RecipeId
  name: string
  description: string
  /** Item granted when crafted (buildable / placeable later). */
  output: ItemId
  cost: Partial<Record<ItemId, number>>
  /** If set, player must have learned this skill first. */
  requiresSkill?: SkillId
  /** If true, a workbench must be placed in the world. */
  requiresWorkbench?: boolean
}

export const RECIPES: Record<RecipeId, Recipe> = {
  workbench: {
    id: 'workbench',
    name: 'Workbench',
    description: 'Place with G to unlock advanced crafts (furnace, slime castle).',
    output: 'workbench',
    cost: { wood: 5, stone: 3 },
    requiresSkill: 'build',
  },
  furnace: {
    id: 'furnace',
    name: 'Furnace',
    description: 'Advanced — craft at a placed workbench. Place with G.',
    output: 'furnace',
    cost: { wood: 4, stone: 10 },
    requiresSkill: 'build',
    requiresWorkbench: true,
  },
  campfire: {
    id: 'campfire',
    name: 'Campfire',
    description: 'Place with G — lights the area around it at night.',
    output: 'campfire',
    cost: { wood: 3 },
  },
  fence: {
    id: 'fence',
    name: 'Wooden Fence',
    description: 'A simple fence post. Place with G.',
    output: 'fence',
    cost: { wood: 2 },
  },
  'wooden-gate': {
    id: 'wooden-gate',
    name: 'Wooden Gate',
    description: 'Blocks night slimes until they break it. Place with G.',
    output: 'wooden-gate',
    cost: { wood: 6, stone: 2 },
  },
  'hunting-spear': {
    id: 'hunting-spear',
    name: 'Hunting Spear',
    description: 'Needed to hunt wild animals.',
    output: 'hunting-spear',
    cost: { wood: 4, stone: 1 },
    requiresSkill: 'hunt',
  },
  'slime-castle': {
    id: 'slime-castle',
    name: 'Slime Castle',
    description:
      'Advanced — craft at a placed workbench. Place with G; farm slimes before they rot.',
    output: 'slime-castle',
    cost: { 'slime-goop': 28, wood: 45, stone: 35 },
    requiresSkill: 'build',
    requiresWorkbench: true,
  },
  'crab-pot': {
    id: 'crab-pot',
    name: 'Crab Pot',
    description: 'Place with G by a home pond or Water Island — catch fish to eat (R).',
    output: 'crab-pot',
    cost: { wood: 4, stone: 2 },
  },
}

export const RECIPE_LIST = Object.values(RECIPES)
