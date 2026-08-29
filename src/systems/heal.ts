import { effectiveMaxHealth, type HealthState } from './health'

/** HP restored when eating one fish. */
export const FISH_HEAL_AMOUNT = 30

export function heal(state: HealthState, amount: number): HealthState {
  if (state.dead || amount <= 0) return state
  const max = effectiveMaxHealth(state)
  return { ...state, current: Math.min(max, state.current + amount) }
}

export function canHeal(state: HealthState): boolean {
  if (state.dead) return false
  return state.current < effectiveMaxHealth(state)
}
