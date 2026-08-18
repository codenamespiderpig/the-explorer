import { describe, expect, it } from 'vitest'
import { PLAYABLE_HALF, clampToIsland } from '../src/world/bounds'

describe('clampToIsland', () => {
  it('leaves in-bounds positions alone', () => {
    expect(clampToIsland(0, 0)).toEqual({ x: 0, z: 0 })
    expect(clampToIsland(3, -4)).toEqual({ x: 3, z: -4 })
  })

  it('stops positions at the playable edge', () => {
    expect(clampToIsland(100, 0)).toEqual({ x: PLAYABLE_HALF, z: 0 })
    expect(clampToIsland(-100, 50)).toEqual({ x: -PLAYABLE_HALF, z: PLAYABLE_HALF })
  })
})
