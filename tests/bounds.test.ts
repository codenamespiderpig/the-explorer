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

  it('clamps open water on Water Island to nearest islet', () => {
    const [cx, , cz] = worldCenter('water')
    const clamped = clampToIsland(cx + 20, cz, 1)
    expect(clamped).not.toEqual({ x: cx + 20, z: cz })
  })

  it('allows the long lava pier after tier 2', () => {
    const { home, island } = lavaBridgeEndpoints()
    const midX = (home[0] + island[0]) / 2
    expect(onLavaBridge(midX, 0, 2)).toBe(true)
    expect(clampToIsland(midX, 0, 2)).toEqual({ x: midX, z: 0 })
  })

  it('allows off-center water gate entry without snapping back', () => {
    expect(onWaterBridge(2.6, 17, 1)).toBe(true)
    expect(clampToIsland(2.6, 17, 1)).toEqual({ x: 2.6, z: 17 })
  })

  it('allows north dock approach before the pier', () => {
    expect(clampToIsland(0, 16.8, 1)).toEqual({ x: 0, z: 16.8 })
  })

  it('allows walking through the full north gate depth', () => {
    expect(clampToIsland(0, 17.8, 1)).toEqual({ x: 0, z: 17.8 })
  })

  it('allows off-center lava gate entry without snapping back', () => {
    expect(onLavaBridge(17, 2.6, 2)).toBe(true)
    expect(clampToIsland(17, 2.6, 2)).toEqual({ x: 17, z: 2.6 })
  })

  it('allows east dock approach before the lava pier', () => {
    expect(clampToIsland(16.8, 0, 2)).toEqual({ x: 16.8, z: 0 })
  })
})
