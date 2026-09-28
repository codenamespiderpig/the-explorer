import { describe, expect, it } from 'vitest'
import {
  BASE_ISLAND_SIZE,
  buyLandFromMerchant,
  islandSize,
  landUpgradeCost,
  landUpgradeLabel,
} from '../src/systems/land'
import { LAVA_UNLOCK_INDEX, RAINFOREST_UNLOCK_INDEX, WATER_UNLOCK_INDEX, nextPlot, plotAtIndex } from '../src/systems/plots'

describe('land upgrades', () => {
  it('keeps the home island the same size', () => {
    expect(islandSize(0)).toBe(BASE_ISLAND_SIZE)
    expect(islandSize(2)).toBe(BASE_ISLAND_SIZE)
  })

  it('always offers a next plot with rising cost', () => {
    expect(landUpgradeCost(0)).toBe(50)
    expect(landUpgradeCost(1)).toBe(100)
    expect(landUpgradeCost(2)).toBe(150)
    expect(landUpgradeCost(10)).toBe(550)
    expect(landUpgradeLabel(0)).toContain('Water')
    expect(landUpgradeLabel(1)).toContain('Lava')
    expect(landUpgradeLabel(2)).toContain('Rainforest')
  })

  it('buys land forever when the merchant is here and you can afford it', () => {
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
    expect(buyLandFromMerchant(1000, 5, true).ok).toBe(true)
  })

  it('unlocks water, lava, rainforest, then extras', () => {
    expect(plotAtIndex(WATER_UNLOCK_INDEX).id).toBe('water-hub')
    expect(plotAtIndex(LAVA_UNLOCK_INDEX).id).toBe('lava-hub')
    expect(plotAtIndex(RAINFOREST_UNLOCK_INDEX).id).toBe('rainforest-hub')
    expect(nextPlot(3).kind).toBe('outpost')
  })
})
