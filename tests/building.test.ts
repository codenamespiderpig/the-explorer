import { describe, expect, it } from 'vitest'
import {
  createBuilding,
  nearestBuildingOfKind,
} from '../src/systems/building'

describe('nearestBuildingOfKind', () => {
  it('finds a workbench within range', () => {
    const buildings = [
      createBuilding('f1', 'fence', [10, 0, 0]),
      createBuilding('w1', 'workbench', [2, 0, 0]),
    ]
    expect(nearestBuildingOfKind(buildings, 'workbench', 0, 0, 2.8)?.id).toBe(
      'w1',
    )
  })

  it('returns null when out of range', () => {
    const buildings = [createBuilding('w1', 'workbench', [10, 0, 0])]
    expect(nearestBuildingOfKind(buildings, 'workbench', 0, 0, 2.8)).toBeNull()
  })
})
