import { describe, expect, it } from 'vitest'
import {
  BASE_ISLAND_SIZE,
  buyLandFromMerchant,
  islandSize,
  landUpgradeCost,
  playableHalf,
} from '../src/systems/land'

describe('land upgrades', () => {
  it('grows the island each tier', () => {
    expect(islandSize(0)).toBe(BASE_ISLAND_SIZE)
    expect(islandSize(1)).toBe(BASE_ISLAND_SIZE + 8)
    expect(playableHalf(1)).toBeGreaterThan(playableHalf(0))
  })

  it('charges increasing prices for land', () => {
    expect(landUpgradeCost(0)).toBe(50)
    expect(landUpgradeCost(2)).toBe(150)
    expect(landUpgradeCost(3)).toBeNull()
  })

  it('buys land when the merchant is here and you can afford it', () => {
    expect(buyLandFromMerchant(60, 0, true)).toEqual({
      ok: true,
      money: 10,
      landTier: 1,
    })
    expect(buyLandFromMerchant(40, 0, true)).toEqual({
      ok: false,
      reason: 'not-enough-money',
    })
    expect(buyLandFromMerchant(200, 0, false)).toEqual({
      ok: false,
      reason: 'merchant-gone',
    })
  })
})
