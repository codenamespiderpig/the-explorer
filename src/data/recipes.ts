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
}

export const RECIPES: Record<RecipeId, Recipe> = {
  workbench: {
    id: 'workbench',
    name: 'Workbench',
    description: 'Build more advanced structures. Place with G.',
    output: 'workbench',
    cost: { wood: 5, stone: 3 },
    requiresSkill: 'build',
  },
  furnace: {
    id: 'furnace',
    name: 'Furnace',
    description: 'Smelt ores later in the game. Place with G. Requires Build.',
    output: 'furnace',
    cost: { wood: 4, stone: 10 },
    requiresSkill: 'build',
  },
  campfire: {
    id: 'campfire',
    name: 'Campfire',
    description: 'A small fire for camping. Place with G.',
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
      'Very hard to build. Place with G — spawns farmable slimes that rot if left unkilled.',
    output: 'slime-castle',
    cost: { 'slime-goop': 28, wood: 45, stone: 35 },
    requiresSkill: 'build',
  },
  'crab-pot': {
    id: 'crab-pot',
    name: 'Crab Pot',
    description: 'Place with G near water — catches fish you can eat to heal (R).',
    output: 'crab-pot',
    cost: { wood: 4, stone: 2 },
  },
}

export const RECIPE_LIST = Object.values(RECIPES)
