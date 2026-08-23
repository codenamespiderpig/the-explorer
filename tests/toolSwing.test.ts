import { describe, expect, it } from 'vitest'
import {
  SWING_DURATION,
  isSwinging,
  swingPhase,
  swingRotationX,
  toolForGather,
} from '../src/systems/toolSwing'

describe('toolSwing', () => {
  it('maps gather resources to the correct tool', () => {
    expect(toolForGather('wood')).toBe('wooden-axe')
    expect(toolForGather('stone')).toBe('wooden-pickaxe')
  })

  it('tracks swing phase and completion', () => {
    expect(swingPhase(0)).toBe(0)
    expect(swingPhase(SWING_DURATION / 2)).toBeCloseTo(0.5)
    expect(swingPhase(SWING_DURATION)).toBe(1)
    expect(isSwinging(0)).toBe(true)
    expect(isSwinging(SWING_DURATION - 0.01)).toBe(true)
    expect(isSwinging(SWING_DURATION)).toBe(false)
  })

  it('peaks rotation mid-swing for a swoosh arc', () => {
    const start = swingRotationX(0)
    const mid = swingRotationX(0.5)
    const end = swingRotationX(1)
    expect(mid).toBeGreaterThan(start)
    expect(mid).toBeGreaterThan(end)
  })
})
