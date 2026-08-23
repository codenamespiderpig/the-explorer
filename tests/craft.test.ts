import { describe, expect, it } from 'vitest'
import { canCraft, craft } from '../src/systems/craft'
import { RECIPES } from '../src/data/recipes'

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

  it('crafts a slime castle only with rare goop and build skill', () => {
    expect(
      canCraft(
        RECIPES['slime-castle'],
        { 'slime-goop': 28, wood: 45, stone: 35 },
        new Set(),
      ),
    ).toBe(false)
    expect(
      canCraft(
        RECIPES['slime-castle'],
        { 'slime-goop': 28, wood: 45, stone: 35 },
        new Set(['build']),
      ),
    ).toBe(true)
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
