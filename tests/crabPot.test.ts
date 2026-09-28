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
import { HOME_LAKES } from '../src/data/homeLakes'
import { worldCenter } from '../src/systems/worlds'
import { WATER_UNLOCK_INDEX } from '../src/systems/plots'
import { pickPlaceableToPlace } from '../src/systems/place'

describe('crabPot', () => {
  it('allows placement at home ponds before the water island unlocks', () => {
    expect(isNearWater(0, 0, 0)).toBe(false)
    const lake = HOME_LAKES[0]!
    expect(isNearWater(lake.position[0], lake.position[2], 0)).toBe(true)
  })

  it('allows placement near the water island after it unlocks', () => {
    const [cx, , cz] = worldCenter('water')
    expect(isNearWater(cx, cz, WATER_UNLOCK_INDEX)).toBe(true)
  })

  it('places a crab pot at a home pond with G', () => {
    const lake = HOME_LAKES[0]!
    expect(
      pickPlaceableToPlace(
        { 'crab-pot': 1 },
        0,
        lake.position[0],
        lake.position[2],
      ),
    ).toEqual({ ok: true, item: 'crab-pot' })
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
