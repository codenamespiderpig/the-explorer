import { describe, expect, it } from 'vitest'
import { createHealthState, effectiveMaxHealth } from '../src/systems/health'
import { applyRelicArmour, RELIC_ARMOUR_BONUS } from '../src/systems/relic'

describe('applyRelicArmour', () => {
  it('spends a relic to raise max health', () => {
    const health = createHealthState()
    const result = applyRelicArmour(health, 2)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.relicsSpent).toBe(1)
    expect(result.health.armourBonus).toBe(RELIC_ARMOUR_BONUS)
    expect(effectiveMaxHealth(result.health)).toBe(100 + RELIC_ARMOUR_BONUS)
    expect(result.health.current).toBe(100 + RELIC_ARMOUR_BONUS)
  })

  it('fails without a relic', () => {
    expect(applyRelicArmour(createHealthState(), 0)).toEqual({
      ok: false,
      reason: 'no-relic',
    })
  })

  it('fails when armour is already at the cap', () => {
    const health = createHealthState({ armourBonus: 45 })
    expect(applyRelicArmour(health, 3)).toEqual({
      ok: false,
      reason: 'armour-capped',
    })
  })
})
