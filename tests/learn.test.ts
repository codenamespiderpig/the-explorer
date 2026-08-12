import { describe, expect, it } from 'vitest'
import { canLearn, learn } from '../src/systems/learn'
import { SKILLS } from '../src/data/skills'

describe('canLearn', () => {
  it('allows learning when the player can pay the cost and has not learned it', () => {
    expect(canLearn(SKILLS.hunt, { wood: 5, stone: 0 }, new Set())).toBe(true)
  })

  it('blocks already-learned skills', () => {
    expect(canLearn(SKILLS.hunt, { wood: 5, stone: 0 }, new Set(['hunt']))).toBe(
      false,
    )
  })

  it('blocks when the player cannot afford the cost', () => {
    expect(canLearn(SKILLS.build, { wood: 0, stone: 2 }, new Set())).toBe(false)
  })
})

describe('learn', () => {
  it('spends the cost and returns the new skill set', () => {
    const result = learn(SKILLS.hunt, { wood: 8, stone: 1 }, new Set())
    expect(result).toEqual({
      ok: true,
      skillId: 'hunt',
      remaining: { wood: 3, stone: 1 },
      learned: ['hunt'],
    })
  })
})
