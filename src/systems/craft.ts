import type { ItemId } from '../data/items'
import type { Recipe } from '../data/recipes'
import type { SkillId } from '../data/skills'

type Counts = Partial<Record<ItemId, number>>

function hasMaterials(cost: Counts, items: Counts): boolean {
  for (const [id, need] of Object.entries(cost)) {
    if ((items[id as ItemId] ?? 0) < (need ?? 0)) return false
  }
  return true
}

function spend(cost: Counts, items: Counts): Counts {
  const remaining: Counts = { ...items }
  for (const [id, need] of Object.entries(cost)) {
    const key = id as ItemId
    remaining[key] = (remaining[key] ?? 0) - (need ?? 0)
  }
  return remaining
}

export function canCraft(
  recipe: Recipe,
  items: Counts,
  learned: ReadonlySet<SkillId>,
): boolean {
  if (recipe.requiresSkill && !learned.has(recipe.requiresSkill)) return false
  return hasMaterials(recipe.cost, items)
}

export type CraftResult =
  | { ok: true; item: ItemId; amount: number; remaining: Counts }
  | { ok: false; reason: 'missing-materials' | 'missing-skill' }

export function craft(recipe: Recipe, items: Counts): CraftResult {
  if (!hasMaterials(recipe.cost, items)) {
    return { ok: false, reason: 'missing-materials' }
  }
  const remaining = spend(recipe.cost, items)
  remaining[recipe.output] = (remaining[recipe.output] ?? 0) + 1
  return { ok: true, item: recipe.output, amount: 1, remaining }
}
