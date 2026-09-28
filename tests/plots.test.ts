import { describe, expect, it } from 'vitest'
import {
  LAVA_UNLOCK_INDEX,
  WATER_UNLOCK_INDEX,
  nextPlot,
  plotAtIndex,
  unlockedPlots,
} from '../src/systems/plots'

describe('infinite land plots', () => {
  it('starts with meadows before water and lava hubs', () => {
    expect(plotAtIndex(1).id).toBe('grass-north')
    expect(plotAtIndex(2).id).toBe('grass-east')
    expect(plotAtIndex(WATER_UNLOCK_INDEX).biome).toBe('water')
    expect(plotAtIndex(LAVA_UNLOCK_INDEX).biome).toBe('lava')
  })

  it('keeps offering expansions forever', () => {
    expect(nextPlot(20).index).toBe(21)
    expect(unlockedPlots(8).length).toBe(8)
  })
})
