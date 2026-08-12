export const BASE_MAX_HEALTH = 100
export const ABSOLUTE_MAX_HEALTH = 145

export interface HealthState {
  current: number
  armourBonus: number
  dead: boolean
}

export function createHealthState(
  partial: Partial<HealthState> = {},
): HealthState {
  const armourBonus = partial.armourBonus ?? 0
  const max = effectiveMaxHealth({ armourBonus })
  return {
    current: partial.current ?? max,
    armourBonus,
    dead: partial.dead ?? false,
  }
}

export function effectiveMaxHealth(state: Pick<HealthState, 'armourBonus'>): number {
  return Math.min(BASE_MAX_HEALTH + state.armourBonus, ABSOLUTE_MAX_HEALTH)
}

export function takeDamage(state: HealthState, amount: number): HealthState {
  if (state.dead) return state
  const current = Math.max(0, state.current - amount)
  return { ...state, current, dead: current <= 0 }
}

export function respawnHealth(state: HealthState): HealthState {
  const max = effectiveMaxHealth(state)
  return { ...state, current: max, dead: false }
}
