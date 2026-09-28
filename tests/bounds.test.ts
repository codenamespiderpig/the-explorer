import { describe, expect, it } from 'vitest'
import {
  clampToIsland,
  onLavaBridge,
  onRainforestBridge,
  onWaterBridge,
  PLAYABLE_HALF,
} from '../src/world/bounds'
import {
  lavaBridgeEndpoints,
  rainforestBridgeEndpoints,
  waterBridgeEndpoints,
  worldCenter,
} from '../src/systems/worlds'
import {
  LAVA_UNLOCK_INDEX,
  RAINFOREST_UNLOCK_INDEX,
  WATER_UNLOCK_INDEX,
} from '../src/systems/plots'

describe('clampToIsland', () => {
  it('leaves in-bounds home positions alone', () => {
    expect(clampToIsland(0, 0)).toEqual({ x: 0, z: 0 })
    expect(clampToIsland(3, -4)).toEqual({ x: 3, z: -4 })
  })

  it('clamps near-home positions at the edge', () => {
    expect(clampToIsland(17, 0)).toEqual({ x: PLAYABLE_HALF, z: 0 })
    expect(clampToIsland(-17, 15)).toEqual({ x: -PLAYABLE_HALF, z: 15 })
  })

  it('allows the long water pier after water unlock', () => {
    const { home, island } = waterBridgeEndpoints()
    const midZ = (home[2] + island[2]) / 2
    expect(onWaterBridge(0, midZ, WATER_UNLOCK_INDEX)).toBe(true)
    expect(clampToIsland(0, midZ, WATER_UNLOCK_INDEX)).toEqual({ x: 0, z: midZ })
  })

  it('allows standing on the water island after water unlock', () => {
    const [cx, , cz] = worldCenter('water')
    expect(clampToIsland(cx, cz, WATER_UNLOCK_INDEX)).toEqual({ x: cx, z: cz })
  })

  it('clamps open water on Water Island to nearest islet', () => {
    const [cx, , cz] = worldCenter('water')
    const clamped = clampToIsland(cx + 20, cz, WATER_UNLOCK_INDEX)
    expect(clamped).not.toEqual({ x: cx + 20, z: cz })
  })

  it('allows the long lava pier after lava unlock', () => {
    const { home, island } = lavaBridgeEndpoints()
    const midX = (home[0] + island[0]) / 2
    expect(onLavaBridge(midX, 0, LAVA_UNLOCK_INDEX)).toBe(true)
    expect(clampToIsland(midX, 0, LAVA_UNLOCK_INDEX)).toEqual({ x: midX, z: 0 })
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

  it('allows stepping off the pier onto the wide water landing', () => {
    const { island } = waterBridgeEndpoints()
    expect(clampToIsland(3.5, island[2], WATER_UNLOCK_INDEX)).toEqual({
      x: 3.5,
      z: island[2],
    })
  })

  it('prefers home north dock over pier clamp near the gate', () => {
    expect(clampToIsland(0, 17.8, 1)).toEqual({ x: 0, z: 17.8 })
  })

  it('still allows mid-pier travel on the north chain', () => {
    expect(clampToIsland(0, 40, 1)).toEqual({ x: 0, z: 40 })
  })

  it('allows stepping off the lava pier onto the lava island', () => {
    const [cx, , cz] = worldCenter('lava')
    expect(clampToIsland(cx - 10, cz + 5, LAVA_UNLOCK_INDEX)).toEqual({
      x: cx - 10,
      z: cz + 5,
    })
  })

  it('prefers home east dock over lava pier clamp near the gate', () => {
    expect(clampToIsland(17.8, 0, 2)).toEqual({ x: 17.8, z: 0 })
  })

  it('still allows mid lava pier travel', () => {
    expect(clampToIsland(40, 0, 2)).toEqual({ x: 40, z: 0 })
  })

  it('allows walking from the lava pier onto home island', () => {
    expect(clampToIsland(15, 0, LAVA_UNLOCK_INDEX)).toEqual({ x: 15, z: 0 })
    expect(onLavaBridge(15, 0, LAVA_UNLOCK_INDEX)).toBe(false)
  })

  it('allows the rainforest pier after rainforest unlock', () => {
    const { home, island } = rainforestBridgeEndpoints()
    const midZ = (home[2] + island[2]) / 2
    expect(onRainforestBridge(0, midZ, RAINFOREST_UNLOCK_INDEX)).toBe(true)
    expect(clampToIsland(0, midZ, RAINFOREST_UNLOCK_INDEX)).toEqual({ x: 0, z: midZ })
  })

  it('allows standing on the rainforest after unlock', () => {
    const [cx, , cz] = worldCenter('rainforest')
    expect(clampToIsland(cx, cz, RAINFOREST_UNLOCK_INDEX)).toEqual({ x: cx, z: cz })
  })
})
