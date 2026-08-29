import { describe, expect, it } from 'vitest'
import {
  clampToIsland,
  onLavaBridge,
  onWaterBridge,
  PLAYABLE_HALF,
} from '../src/world/bounds'
import { waterBridgeEndpoints, lavaBridgeEndpoints, worldCenter } from '../src/systems/worlds'

describe('clampToIsland', () => {
  it('leaves in-bounds home positions alone', () => {
    expect(clampToIsland(0, 0)).toEqual({ x: 0, z: 0 })
    expect(clampToIsland(3, -4)).toEqual({ x: 3, z: -4 })
  })

  it('clamps near-home positions at the edge', () => {
    expect(clampToIsland(17, 0)).toEqual({ x: PLAYABLE_HALF, z: 0 })
    expect(clampToIsland(-17, 15)).toEqual({ x: -PLAYABLE_HALF, z: 15 })
  })

  it('allows the long water pier after tier 1', () => {
    const { home, island } = waterBridgeEndpoints()
    const midZ = (home[2] + island[2]) / 2
    expect(onWaterBridge(0, midZ, 1)).toBe(true)
    expect(clampToIsland(0, midZ, 1)).toEqual({ x: 0, z: midZ })
  })

  it('allows standing on the full water island', () => {
    const [cx, , cz] = worldCenter('water')
    expect(clampToIsland(cx, cz, 1)).toEqual({ x: cx, z: cz })
  })

  it('allows the long lava pier after tier 2', () => {
    const { home, island } = lavaBridgeEndpoints()
    const midX = (home[0] + island[0]) / 2
    expect(onLavaBridge(midX, 0, 2)).toBe(true)
    expect(clampToIsland(midX, 0, 2)).toEqual({ x: midX, z: 0 })
  })
})
