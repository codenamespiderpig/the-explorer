import { describe, expect, it } from 'vitest'
import {
  MERCHANT_VISIT_SEC,
  advanceMerchantTimer,
  formatMerchantCountdown,
  isMerchantVisiting,
} from '../src/systems/merchant'
import {
  merchantSpawnPosition,
  unlockedWorlds,
  worldCenter,
} from '../src/systems/worlds'

describe('merchant visit', () => {
  it('lasts 90 seconds', () => {
    expect(MERCHANT_VISIT_SEC).toBe(90)
    expect(isMerchantVisiting(1)).toBe(true)
    expect(isMerchantVisiting(0)).toBe(false)
    expect(advanceMerchantTimer(10, 3)).toBe(7)
  })

  it('formats a countdown', () => {
    expect(formatMerchantCountdown(90)).toBe('1:30')
    expect(formatMerchantCountdown(59)).toBe('0:59')
  })
})

describe('world unlocks', () => {
  it('starts on home only', () => {
    expect(unlockedWorlds(0)).toEqual(['home'])
  })

  it('unlocks water then lava with land tiers', () => {
    expect(unlockedWorlds(1)).toEqual(['home'])
    expect(unlockedWorlds(2)).toEqual(['home'])
    expect(unlockedWorlds(3)).toEqual(['home', 'water'])
    expect(unlockedWorlds(5)).toEqual(['home', 'water', 'lava'])
  })

  it('spawns the merchant far from the center', () => {
    const spawn = merchantSpawnPosition(0, () => 0)
    expect(Math.hypot(spawn.position[0], spawn.position[2])).toBeGreaterThan(8)
    expect(spawn.world).toBe('home')
  })

  it('can spawn in unlocked biomes', () => {
    let i = 0
    const rng = () => [0, 0.6, 0.1][i++] ?? 0
    const spawn = merchantSpawnPosition(2, rng)
    expect(['home', 'water', 'lava']).toContain(spawn.world)
    const [cx, , cz] = worldCenter(spawn.world)
    expect(Math.hypot(spawn.position[0] - cx, spawn.position[2] - cz)).toBeGreaterThan(5)
  })
})
