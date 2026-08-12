import { describe, expect, it } from 'vitest'
import {
  ABSOLUTE_MAX_HEALTH,
  BASE_MAX_HEALTH,
  createHealthState,
  effectiveMaxHealth,
  respawnHealth,
  takeDamage,
} from '../src/systems/health'

describe('health', () => {
  it('starts at 100 with base max 100', () => {
    const h = createHealthState()
    expect(h.current).toBe(BASE_MAX_HEALTH)
    expect(effectiveMaxHealth(h)).toBe(BASE_MAX_HEALTH)
  })

  it('raises max health with armour up to 145', () => {
    const h = createHealthState({ armourBonus: 50 })
    expect(effectiveMaxHealth(h)).toBe(ABSOLUTE_MAX_HEALTH)
  })

  it('reduces current health on damage and marks death at 0', () => {
    let h = createHealthState()
    h = takeDamage(h, 40)
    expect(h.current).toBe(60)
    h = takeDamage(h, 100)
    expect(h.current).toBe(0)
    expect(h.dead).toBe(true)
  })

  it('respawns at full health without losing armour bonus', () => {
    let h = createHealthState({ armourBonus: 20 })
    h = takeDamage(h, 999)
    h = respawnHealth(h)
    expect(h.dead).toBe(false)
    expect(h.current).toBe(effectiveMaxHealth(h))
    expect(h.armourBonus).toBe(20)
  })
})
