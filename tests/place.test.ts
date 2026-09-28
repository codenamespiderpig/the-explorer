import { describe, expect, it } from 'vitest'
import { pickPlaceableToPlace } from '../src/systems/place'
import { worldCenter } from '../src/systems/worlds'
import { WATER_UNLOCK_INDEX } from '../src/systems/plots'

describe('pickPlaceableToPlace', () => {
  it('prefers workbench over gate when both are owned', () => {
    expect(
      pickPlaceableToPlace(
        { workbench: 1, 'wooden-gate': 1, 'slime-castle': 1, 'crab-pot': 1 },
        1,
        0,
        0,
      ),
    ).toEqual({ ok: true, item: 'workbench' })
  })

  it('places slime castle when no buildings or gate are owned', () => {
    expect(pickPlaceableToPlace({ 'slime-castle': 1 }, 0, 0, 0)).toEqual({
      ok: true,
      item: 'slime-castle',
    })
  })

  it('places crab pot near water when it is the only placeable', () => {
    const [cx, , cz] = worldCenter('water')
    expect(pickPlaceableToPlace({ 'crab-pot': 1 }, WATER_UNLOCK_INDEX, cx, cz)).toEqual({
      ok: true,
      item: 'crab-pot',
    })
  })

  it('blocks crab pot away from water', () => {
    expect(pickPlaceableToPlace({ 'crab-pot': 1 }, WATER_UNLOCK_INDEX, 0, 0)).toEqual({
      ok: false,
      reason: 'crab-pot-needs-water',
    })
  })

  it('returns none-owned when inventory is empty', () => {
    expect(pickPlaceableToPlace({}, 0, 0, 0)).toEqual({
      ok: false,
      reason: 'none-owned',
    })
  })
})
