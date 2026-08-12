import { describe, expect, it } from 'vitest'
import { findNearestGatherable, type GatherableNode } from '../src/systems/proximity'

const nodes: GatherableNode[] = [
  { id: 'tree-1', resource: 'wood', position: [5, 0, 0] },
  { id: 'rock-1', resource: 'stone', position: [-5, 0, 0] },
  { id: 'tree-2', resource: 'wood', position: [0, 0, 8] },
]

describe('findNearestGatherable', () => {
  it('returns null when nothing is in range', () => {
    expect(findNearestGatherable(nodes, [0, 0, 0], 2)).toBeNull()
  })

  it('returns the closest node within range', () => {
    expect(findNearestGatherable(nodes, [4.5, 0, 0], 2)?.id).toBe('tree-1')
    expect(findNearestGatherable(nodes, [-4.2, 0, 0.1], 2)?.id).toBe('rock-1')
  })

  it('ignores farther nodes when a nearer one exists', () => {
    expect(findNearestGatherable(nodes, [0, 0, 7], 3)?.id).toBe('tree-2')
  })
})
