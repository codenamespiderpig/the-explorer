import { describe, expect, it } from 'vitest'
import {
  advanceCrabPotCatch,
  collectFishFromPot,
  createCrabPot,
  CRAB_POT_CATCH_INTERVAL,
  CRAB_POT_MAX_FISH,
  isNearWater,
  nearestPotWithFish,
} from '../src/systems/crabPot'
import { worldCenter } from '../src/systems/worlds'

describe('crabPot', () => {
  it('only allows placement near water after the water island unlocks', () => {
    expect(isNearWater(0, 0, 0)).toBe(false)
    const [cx, , cz] = worldCenter('water')
    expect(isNearWater(cx, cz, 1)).toBe(true)
  })

  it('catches fish over time up to the storage cap', () => {
    let pot = createCrabPot('p1', [0, 0, 0])
    pot = advanceCrabPotCatch(pot, CRAB_POT_CATCH_INTERVAL)
    expect(pot.storedFish).toBe(1)
    pot = advanceCrabPotCatch(pot, CRAB_POT_CATCH_INTERVAL * CRAB_POT_MAX_FISH)
    expect(pot.storedFish).toBe(CRAB_POT_MAX_FISH)
  })

  it('collects stored fish from a pot', () => {
    const pot = { ...createCrabPot('p1', [0, 0, 0]), storedFish: 2 }
    const result = collectFishFromPot(pot, 1)
    expect(result.collected).toBe(1)
    expect(result.pot.storedFish).toBe(1)
  })

  it('finds the nearest pot that has fish', () => {
    const pots = [
      { ...createCrabPot('a', [5, 0, 0]), storedFish: 0 },
      { ...createCrabPot('b', [1, 0, 0]), storedFish: 2 },
    ]
    expect(nearestPotWithFish(pots, [0, 0, 0], 3)?.id).toBe('b')
  })
})
