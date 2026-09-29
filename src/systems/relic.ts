import {
  ABSOLUTE_MAX_HEALTH,
  BASE_MAX_HEALTH,
  effectiveMaxHealth,
  type HealthState,
} from './health'

export const RELIC_ARMOUR_BONUS = 5
export const RELIC_CONSUME_COST = 1

export type ApplyRelicResult =
  | { ok: true; health: HealthState; relicsSpent: number }
  | { ok: false; reason: 'no-relic' | 'armour-capped' }

/** Spend a dungeon relic to permanently raise max HP (armour bonus). */
export function applyRelicArmour(
  health: HealthState,
  relicsOwned: number,
): ApplyRelicResult {
  if (relicsOwned < RELIC_CONSUME_COST) {
    return { ok: false, reason: 'no-relic' }
  }
  const maxNow = effectiveMaxHealth(health)
  if (maxNow >= ABSOLUTE_MAX_HEALTH) {
    return { ok: false, reason: 'armour-capped' }
  }
  const armourBonus = Math.min(
    health.armourBonus + RELIC_ARMOUR_BONUS,
    ABSOLUTE_MAX_HEALTH - BASE_MAX_HEALTH,
  )
  const nextMax = Math.min(BASE_MAX_HEALTH + armourBonus, ABSOLUTE_MAX_HEALTH)
  const gained = nextMax - maxNow
  return {
    ok: true,
    relicsSpent: RELIC_CONSUME_COST,
    health: {
      ...health,
      armourBonus,
      current: Math.min(nextMax, health.current + gained),
      dead: false,
    },
  }
}
