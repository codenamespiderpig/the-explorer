import { describe, expect, it } from 'vitest'
import { rollSlimeDrop } from '../src/systems/slimeLoot'

describe('rollSlimeDrop', () => {
  it('usually drops nothing', () => {
    expect(rollSlimeDrop(() => 0.9)).toBeNull()
  })

  it('sometimes drops one slime goop', () => {
    expect(rollSlimeDrop(() => 0.1)).toEqual({ item: 'slime-goop', amount: 1 })
  })

  it('rarely drops two slime goop', () => {
    expect(rollSlimeDrop(() => 0.01)).toEqual({ item: 'slime-goop', amount: 2 })
  })
})
