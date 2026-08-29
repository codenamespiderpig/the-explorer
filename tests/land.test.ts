import { describe, expect, it } from 'vitest'
import {
  BASE_ISLAND_SIZE,
  buyLandFromMerchant,
  islandSize,
  landUpgradeCost,
  landUpgradeLabel,
} from '../src/systems/land'

describe('land upgrades', () => {
  it('keeps the home island the same size', () => {
    expect(islandSize(0)).toBe(BASE_ISLAND_SIZE)
    expect(islandSize(2)).toBe(BASE_ISLAND_SIZE)
  })

  it('charges for whole-island unlocks', () => {
    expect(landUpgradeCost(0)).toBe(50)
    expect(landUpgradeCost(1)).toBe(100)
    expect(landUpgradeCost(2)).toBeNull()
    expect(landUpgradeLabel(0)).toContain('Water')
    expect(landUpgradeLabel(1)).toContain('Lava')
  })

  it('buys a new island when the merchant is here and you can afford it', () => {
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
