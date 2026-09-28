import { describe, expect, it } from 'vitest'
import {
  LAVA_UNLOCK_INDEX,
  RAINFOREST_UNLOCK_INDEX,
  WATER_UNLOCK_INDEX,
  nextPlot,
  plotAtIndex,
  unlockedPlots,
} from '../src/systems/plots'

describe('infinite land plots', () => {
  it('unlocks water, lava, then rainforest hubs', () => {
    expect(plotAtIndex(WATER_UNLOCK_INDEX).id).toBe('water-hub')
    expect(plotAtIndex(LAVA_UNLOCK_INDEX).id).toBe('lava-hub')
    expect(plotAtIndex(RAINFOREST_UNLOCK_INDEX).id).toBe('rainforest-hub')
    expect(plotAtIndex(RAINFOREST_UNLOCK_INDEX).biome).toBe('rainforest')
    expect(plotAtIndex(RAINFOREST_UNLOCK_INDEX).chain).toBe('south')
  })

  it('keeps offering expansions forever after the hubs', () => {
    expect(nextPlot(3).kind).toBe('outpost')
    expect(nextPlot(20).index).toBe(21)
    expect(unlockedPlots(8).length).toBe(8)
  })
})
