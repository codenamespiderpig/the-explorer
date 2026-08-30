import { describe, expect, it } from 'vitest'
import { pickPlaceableToPlace } from '../src/systems/place'

describe('pickPlaceableToPlace', () => {
  it('prefers gate when multiple placeables are owned', () => {
    expect(
      pickPlaceableToPlace(
        { 'wooden-gate': 1, 'slime-castle': 1, 'crab-pot': 1 },
        1,
        0,
        0,
      ),
    ).toEqual({ ok: true, item: 'wooden-gate' })
  })

  it('places slime castle when no gate is owned', () => {
    expect(pickPlaceableToPlace({ 'slime-castle': 1 }, 0, 0, 0)).toEqual({
      ok: true,
      item: 'slime-castle',
    })
  })

  it('places crab pot near water when it is the only placeable', () => {
    const [, , cz] = [0, 0, 88] as const
    expect(pickPlaceableToPlace({ 'crab-pot': 1 }, 1, 0, cz)).toEqual({
      ok: true,
      item: 'crab-pot',
    })
  })

  it('blocks crab pot away from water', () => {
    expect(pickPlaceableToPlace({ 'crab-pot': 1 }, 1, 0, 0)).toEqual({
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
