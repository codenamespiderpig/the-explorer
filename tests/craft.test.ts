import { describe, expect, it } from 'vitest'
import { canCraft, craft } from '../src/systems/craft'
import { RECIPES } from '../src/data/recipes'
import { hasPlacedBuilding } from '../src/systems/building'
import { createBuilding } from '../src/systems/building'

describe('canCraft', () => {
  it('allows a recipe when the player has enough materials', () => {
    expect(
      canCraft(RECIPES.campfire, { wood: 3, stone: 0 }, new Set()),
    ).toBe(true)
  })

  it('blocks a recipe when materials are missing', () => {
    expect(
      canCraft(RECIPES.campfire, { wood: 2, stone: 0 }, new Set()),
    ).toBe(false)
  })

  it('blocks recipes that require an unlearned skill', () => {
    expect(
      canCraft(RECIPES.workbench, { wood: 10, stone: 10 }, new Set()),
    ).toBe(false)
    expect(
      canCraft(RECIPES.workbench, { wood: 10, stone: 10 }, new Set(['build'])),
    ).toBe(true)
  })

  it('blocks advanced recipes until a workbench is placed', () => {
    const mats = { wood: 20, stone: 20 }
    expect(canCraft(RECIPES.furnace, mats, new Set(['build']), false)).toBe(false)
    expect(canCraft(RECIPES.furnace, mats, new Set(['build']), true)).toBe(true)
  })
})

describe('craft', () => {
  it('spends materials and returns the crafted item', () => {
    const result = craft(RECIPES.campfire, { wood: 5, stone: 1 })
    expect(result).toEqual({
      ok: true,
      item: 'campfire',
      amount: 1,
      remaining: { wood: 2, stone: 1, campfire: 1 },
    })
  })

  it('fails without enough materials', () => {
    const result = craft(RECIPES.campfire, { wood: 1, stone: 0 })
    expect(result.ok).toBe(false)
  })

  it('crafts a slime castle only with goop, build skill, and a workbench', () => {
    const mats = { 'slime-goop': 28, wood: 45, stone: 35 }
    expect(canCraft(RECIPES['slime-castle'], mats, new Set(), true)).toBe(false)
    expect(canCraft(RECIPES['slime-castle'], mats, new Set(['build']), false)).toBe(
      false,
    )
    expect(canCraft(RECIPES['slime-castle'], mats, new Set(['build']), true)).toBe(
      true,
    )
    const result = craft(RECIPES['slime-castle'], {
      'slime-goop': 30,
      wood: 50,
      stone: 40,
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.item).toBe('slime-castle')
      expect(result.remaining['slime-goop']).toBe(2)
      expect(result.remaining['slime-castle']).toBe(1)
    }
  })
})

describe('hasPlacedBuilding', () => {
  it('detects a placed workbench', () => {
    expect(hasPlacedBuilding([], 'workbench')).toBe(false)
    expect(
      hasPlacedBuilding(
        [createBuilding('b1', 'workbench', [0, 0, 0])],
        'workbench',
      ),
    ).toBe(true)
  })
})
