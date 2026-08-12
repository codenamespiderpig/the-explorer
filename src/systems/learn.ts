import type { ItemId } from '../data/items'
import type { Skill, SkillId } from '../data/skills'

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

export function canLearn(
  skill: Skill,
  items: Counts,
  learned: ReadonlySet<SkillId>,
): boolean {
  if (learned.has(skill.id)) return false
  return hasMaterials(skill.cost, items)
}

export type LearnResult =
  | {
      ok: true
      skillId: SkillId
      remaining: Counts
      learned: SkillId[]
    }
  | { ok: false; reason: 'missing-materials' | 'already-learned' }

export function learn(
  skill: Skill,
  items: Counts,
  learned: ReadonlySet<SkillId>,
): LearnResult {
  if (learned.has(skill.id)) {
    return { ok: false, reason: 'already-learned' }
  }
  if (!hasMaterials(skill.cost, items)) {
    return { ok: false, reason: 'missing-materials' }
  }
  const remaining = spend(skill.cost, items)
  return {
    ok: true,
    skillId: skill.id,
    remaining,
    learned: [...learned, skill.id],
  }
}
