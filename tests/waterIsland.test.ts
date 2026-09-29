import { describe, expect, it } from 'vitest'
import {
  clampToWalkableRects,
  isPointOnWaterIslandWalkable,
} from '../src/systems/waterIsland'
import { BIOME_ISLAND_SIZE } from '../src/systems/plots'
import { waterBridgeEndpoints, worldCenter, worldPlayableHalf } from '../src/systems/worlds'

describe('waterIsland solid hub', () => {
  const [cx, , cz] = worldCenter('water')
  const half = worldPlayableHalf('water')

  it('treats the hub center as walkable', () => {
    expect(isPointOnWaterIslandWalkable(cx, cz)).toBe(true)
    expect(clampToWalkableRects(cx, cz, [])).toEqual({ x: cx, z: cz })
  })

  it('clamps points past the playable edge onto the solid island', () => {
    const clamped = clampToWalkableRects(cx + 40, cz, [])
    expect(isPointOnWaterIslandWalkable(clamped.x, clamped.z)).toBe(true)
    expect(Math.abs(clamped.x - cx)).toBeLessThanOrEqual(half + 0.01)
  })

  it('allows the bridge landing on the south edge of the solid hub', () => {
    const { island } = waterBridgeEndpoints()
    expect(isPointOnWaterIslandWalkable(island[0], island[2])).toBe(true)
  })

  it('matches other biome island size', () => {
    expect(BIOME_ISLAND_SIZE).toBe(44)
    expect(half).toBe(BIOME_ISLAND_SIZE / 2 - 1.5)
  })
})
