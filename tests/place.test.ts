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

  it('prefers workbench over leftover fences', () => {
    expect(
      pickPlaceableToPlace({ workbench: 1, fence: 5, campfire: 2 }, 0, 0, 0),
    ).toEqual({ ok: true, item: 'workbench' })
  })

  it('prefers advanced campfire over a normal campfire', () => {
    expect(
      pickPlaceableToPlace({ campfire: 1, 'advanced-campfire': 1 }, 0, 0, 0),
    ).toEqual({ ok: true, item: 'advanced-campfire' })
  })

  it('places preferred placeable when owned', () => {
    expect(
      pickPlaceableToPlace({ workbench: 1, fence: 3 }, 0, 0, 0, 'fence'),
    ).toEqual({ ok: true, item: 'fence' })
  })

  it('falls back when preferred is not owned', () => {
    expect(
      pickPlaceableToPlace({ workbench: 1, fence: 1 }, 0, 0, 0, 'furnace'),
    ).toEqual({ ok: true, item: 'workbench' })
  })

  it('places fence only when nothing else is placeable', () => {
    expect(pickPlaceableToPlace({ fence: 2 }, 0, 0, 0)).toEqual({
      ok: true,
      item: 'fence',
    })
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
