import { describe, expect, it } from 'vitest'
import { createBuilding } from '../src/systems/building'
import {
  ADVANCED_CAMPFIRE_LIGHT_RADIUS,
  CAMPFIRE_LIGHT_RADIUS,
  isInCampfireLight,
  lightRadiusForBuilding,
  steerAwayFromCampfireLight,
} from '../src/systems/campfireLight'

describe('campfireLight', () => {
  it('uses larger radius for advanced campfires', () => {
    expect(lightRadiusForBuilding('campfire')).toBe(CAMPFIRE_LIGHT_RADIUS)
    expect(lightRadiusForBuilding('advanced-campfire')).toBe(
      ADVANCED_CAMPFIRE_LIGHT_RADIUS,
    )
    expect(lightRadiusForBuilding('fence')).toBe(0)
  })

  it('detects positions inside normal vs advanced rings', () => {
    const normal = [createBuilding('c1', 'campfire', [0, 0, 0])]
    const advanced = [createBuilding('a1', 'advanced-campfire', [0, 0, 0])]

    expect(isInCampfireLight(5, 0, normal)).toBe(true)
    expect(isInCampfireLight(12, 0, normal)).toBe(false)
    expect(isInCampfireLight(12, 0, advanced)).toBe(true)
    expect(isInCampfireLight(19, 0, advanced)).toBe(false)
  })

  it('pushes a proposed step out to the light rim', () => {
    const buildings = [createBuilding('c1', 'campfire', [0, 0, 0])]
    const steered = steerAwayFromCampfireLight(12, 0, 3, 0, buildings)
    expect(steered.x).toBeCloseTo(CAMPFIRE_LIGHT_RADIUS, 5)
    expect(steered.z).toBeCloseTo(0, 5)
  })
})
