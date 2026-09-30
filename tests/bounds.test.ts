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
  worldPlayableHalf,
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

  it('clamps past the water hub edge onto the solid island', () => {
    const [cx, , cz] = worldCenter('water')
    // Just inside the detection ring (half+1) but outside the playable half.
    const clamped = clampToIsland(cx + 21, cz, WATER_UNLOCK_INDEX)
    expect(clamped).not.toEqual({ x: cx + 21, z: cz })
    expect(Math.abs(clamped.x - cx)).toBeLessThanOrEqual(20.5 + 0.01)
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
    const [, , cz] = worldCenter('water')
    const half = worldPlayableHalf('water')
    // Off-center on the dock (outside the gate corridor) snaps onto the island rim.
    const clamped = clampToIsland(3.5, island[2], WATER_UNLOCK_INDEX)
    expect(clamped.x).toBe(3.5)
    expect(clamped.z).toBeCloseTo(cz - half, 5)
  })

  it('allows walking from the pier onto the water island through the gate', () => {
    const { island } = waterBridgeEndpoints()
    const [, , cz] = worldCenter('water')
    const half = worldPlayableHalf('water')
    const southEdge = cz - half
    // Mid junction: pier dock → a step onto the island floor.
    const atDock = clampToIsland(0, island[2], WATER_UNLOCK_INDEX)
    expect(atDock.x).toBe(0)
    expect(atDock.z).toBeCloseTo(island[2], 5)
    const ontoIsland = clampToIsland(0, southEdge + 1.5, WATER_UNLOCK_INDEX)
    expect(ontoIsland.x).toBe(0)
    expect(ontoIsland.z).toBeCloseTo(southEdge + 1.5, 5)
  })

  it('allows leaving the water hub onto the pier', () => {
    const [, , cz] = worldCenter('water')
    const half = worldPlayableHalf('water')
    const southEdge = cz - half
    const clamped = clampToIsland(0, southEdge, WATER_UNLOCK_INDEX)
    expect(clamped.x).toBe(0)
    // Still free to move south toward the pier from the rim.
    const ontoPier = clampToIsland(0, southEdge - 1, WATER_UNLOCK_INDEX)
    expect(ontoPier.z).toBeLessThan(southEdge)
  })

  it('allows walking from the water pier onto home island', () => {
    expect(clampToIsland(0, 15, WATER_UNLOCK_INDEX)).toEqual({ x: 0, z: 15 })
    expect(onWaterBridge(0, 15, WATER_UNLOCK_INDEX)).toBe(false)
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

  it('allows leaving the lava hub onto the pier', () => {
    const [cx] = worldCenter('lava')
    const half = worldPlayableHalf('lava')
    const westEdge = cx - half
    const clamped = clampToIsland(westEdge, 0, LAVA_UNLOCK_INDEX)
    expect(clamped.z).toBe(0)
    // Still free to move west toward the pier from the rim.
    const ontoPier = clampToIsland(westEdge - 1, 0, LAVA_UNLOCK_INDEX)
    expect(ontoPier.x).toBeLessThan(westEdge)
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
