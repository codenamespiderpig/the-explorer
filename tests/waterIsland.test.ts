import { describe, expect, it } from 'vitest'
import {
  clampToWalkableRects,
  isPointOnWaterIslandWalkable,
  WATER_ISLAND_RECTS,
  waterIslandWalkRects,
} from '../src/systems/waterIsland'
import { waterBridgeEndpoints, worldCenter } from '../src/systems/worlds'

describe('waterIsland walk rects', () => {
  const [cx, , cz] = worldCenter('water')
  const worldRects = waterIslandWalkRects()

  it('keeps a point on the central islet unchanged', () => {
    expect(clampToWalkableRects(cx, cz, worldRects)).toEqual({ x: cx, z: cz })
  })

  it('clamps open water to the nearest walkable edge', () => {
    const clamped = clampToWalkableRects(cx + 20, cz, worldRects)
    expect(isPointOnWaterIslandWalkable(clamped.x, clamped.z)).toBe(true)
    expect(clamped).not.toEqual({ x: cx + 20, z: cz })
  })

  it('allows the bridge landing on the dock islet', () => {
    const { island } = waterBridgeEndpoints()
    expect(isPointOnWaterIslandWalkable(island[0], island[2])).toBe(true)
    expect(clampToWalkableRects(island[0], island[2], worldRects)).toEqual({
      x: island[0],
      z: island[2],
    })
  })

  it('allows the walkway midpoint between dock and central islets', () => {
    const walk = WATER_ISLAND_RECTS.find((r) => r.id === 'walk-dock-central')!
    const midZ = (walk.zMin + walk.zMax) / 2
    const x = cx
    const z = cz + midZ
    expect(isPointOnWaterIslandWalkable(x, z)).toBe(true)
    expect(clampToWalkableRects(x, z, worldRects)).toEqual({ x, z })
  })
})
