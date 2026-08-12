import { describe, expect, it } from 'vitest'
import { canGather, gatherYield } from '../src/systems/gather'

describe('canGather', () => {
  it('allows wood with an axe', () => {
    expect(canGather('wood', ['wooden-axe', 'wooden-pickaxe', 'wooden-sword'])).toBe(true)
  })

  it('allows stone with a pickaxe', () => {
    expect(canGather('stone', ['wooden-axe', 'wooden-pickaxe', 'wooden-sword'])).toBe(true)
  })

  it('blocks wood without an axe', () => {
    expect(canGather('wood', ['wooden-pickaxe', 'wooden-sword'])).toBe(false)
  })

  it('blocks stone without a pickaxe', () => {
    expect(canGather('stone', ['wooden-axe', 'wooden-sword'])).toBe(false)
  })
})

describe('gatherYield', () => {
  it('returns a positive amount of the resource', () => {
    expect(gatherYield('wood')).toEqual({ item: 'wood', amount: 1 })
    expect(gatherYield('stone')).toEqual({ item: 'stone', amount: 1 })
  })
})
