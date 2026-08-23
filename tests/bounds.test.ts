import { describe, expect, it } from 'vitest'
import {
  clampToIsland,
  onLavaBridge,
  onWaterBridge,
  PLAYABLE_HALF,
} from '../src/world/bounds'
import { worldCenter, WORLD_ISLAND_SIZE } from '../src/systems/worlds'
import { islandSize } from '../src/systems/land'

describe('clampToIsland', () => {
  it('leaves in-bounds positions alone', () => {
    expect(clampToIsland(0, 0)).toEqual({ x: 0, z: 0 })
    expect(clampToIsland(3, -4)).toEqual({ x: 3, z: -4 })
  })

  it('stops positions at the playable edge', () => {
    expect(clampToIsland(100, 0)).toEqual({ x: PLAYABLE_HALF, z: 0 })
    expect(clampToIsland(-100, 50)).toEqual({ x: -PLAYABLE_HALF, z: PLAYABLE_HALF })
  })

  it('allows crossing the water bridge after tier 1', () => {
    const homeEdge = islandSize(1) / 2
    const [, , wz] = worldCenter('water', 1)
    const midZ = (homeEdge + (wz - WORLD_ISLAND_SIZE / 2)) / 2
    expect(onWaterBridge(0, midZ, 1)).toBe(true)
    expect(clampToIsland(0, midZ, 1)).toEqual({ x: 0, z: midZ })
  })

  it('allows standing on the water world floor', () => {
    const [cx, , cz] = worldCenter('water', 1)
    expect(clampToIsland(cx, cz, 1)).toEqual({ x: cx, z: cz })
  })

  it('allows crossing the lava bridge after tier 2', () => {
    const homeEdge = islandSize(2) / 2
    const [lx] = worldCenter('lava', 2)
    const midX = (homeEdge + (lx - WORLD_ISLAND_SIZE / 2)) / 2
    expect(onLavaBridge(midX, 0, 2)).toBe(true)
    expect(clampToIsland(midX, 0, 2)).toEqual({ x: midX, z: 0 })
  })
})
