import { describe, expect, it } from 'vitest'
import {
  COMMON_MERCHANT_PRICE,
  RARE_MERCHANT_PRICE,
  isMerchantSellable,
  sellToMerchant,
  sellValue,
} from '../src/systems/economy'

describe('merchant pricing', () => {
  it('pays 5 money for wood and stone', () => {
    expect(sellValue('wood', 1)).toBe(COMMON_MERCHANT_PRICE)
    expect(sellValue('stone', 3)).toBe(COMMON_MERCHANT_PRICE * 3)
  })

  it('pays 15 money for rarer items', () => {
    expect(sellValue('slime-goop', 1)).toBe(RARE_MERCHANT_PRICE)
    expect(sellValue('dungeon-relic', 2)).toBe(RARE_MERCHANT_PRICE * 2)
    expect(sellValue('wooden-gate', 1)).toBe(RARE_MERCHANT_PRICE)
  })

  it('does not buy starting tools', () => {
    expect(isMerchantSellable('wooden-sword')).toBe(false)
    expect(isMerchantSellable('wooden-axe')).toBe(false)
  })

  it('rejects non-positive or fractional quantities', () => {
    expect(() => sellValue('wood', 0)).toThrow()
    expect(() => sellValue('wood', -3)).toThrow()
    expect(() => sellValue('wood', 1.5)).toThrow()
  })
})

describe('sellToMerchant', () => {
  it('adds money and removes items when the merchant is present', () => {
    const result = sellToMerchant({ wood: 4, stone: 2 }, 10, 'wood', 2, true)
    expect(result).toEqual({
      ok: true,
      moneyGained: 10,
      items: { wood: 2, stone: 2 },
      money: 20,
    })
  })

  it('blocks selling when the merchant has left', () => {
    expect(sellToMerchant({ wood: 1 }, 0, 'wood', 1, false)).toEqual({
      ok: false,
      reason: 'merchant-gone',
    })
  })
})
