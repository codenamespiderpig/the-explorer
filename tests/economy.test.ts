import { describe, expect, it } from 'vitest'
import { sellValue } from '../src/systems/economy'

describe('sellValue', () => {
  it('prices a single raw resource at its item value', () => {
    expect(sellValue('wood', 1)).toBe(1)
    expect(sellValue('stone', 1)).toBe(2)
  })

  it('scales linearly with quantity', () => {
    expect(sellValue('stone', 5)).toBe(10)
    expect(sellValue('wood', 12)).toBe(12)
  })

  it('values better items higher than raw resources', () => {
    expect(sellValue('dungeon-relic', 1)).toBeGreaterThan(sellValue('stone', 1))
  })

  it('rejects non-positive or fractional quantities', () => {
    expect(() => sellValue('wood', 0)).toThrow()
    expect(() => sellValue('wood', -3)).toThrow()
    expect(() => sellValue('wood', 1.5)).toThrow()
  })
})
