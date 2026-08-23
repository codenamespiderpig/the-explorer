import { describe, expect, it } from 'vitest'
import { nearestTargetInRange } from '../src/systems/combat'

describe('combat', () => {
  it('returns the nearest target within range', () => {
    const targets = [
      { id: 'far', position: [5, 0, 0] as [number, number, number] },
      { id: 'near', position: [1.5, 0, 0] as [number, number, number] },
    ]
    expect(nearestTargetInRange(targets, [0, 0, 0], 3)?.id).toBe('near')
  })

  it('returns null when nothing is in range', () => {
    const targets = [{ id: 'far', position: [8, 0, 0] as [number, number, number] }]
    expect(nearestTargetInRange(targets, [0, 0, 0], 2)).toBeNull()
  })
})
