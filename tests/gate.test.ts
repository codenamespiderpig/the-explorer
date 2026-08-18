import { describe, expect, it } from 'vitest'
import { damageGate, createGate, isGateDestroyed, gatePlacement } from '../src/systems/gate'

describe('gate', () => {
  it('takes damage until destroyed', () => {
    let gate = createGate('gate-1', [0, 0, 2], 0, 50)
    gate = damageGate(gate, 20)
    expect(gate.hp).toBe(30)
    expect(isGateDestroyed(gate)).toBe(false)
    gate = damageGate(gate, 40)
    expect(gate.hp).toBe(0)
    expect(isGateDestroyed(gate)).toBe(true)
  })

  it('stores yaw so the gate can face any direction', () => {
    const gate = createGate('gate-2', [1, 0, 2], Math.PI / 2)
    expect(gate.yaw).toBeCloseTo(Math.PI / 2)
  })
})

describe('gatePlacement', () => {
  it('places in front of the player along the camera look on the ground', () => {
    // Camera south of player, looking north through them
    const result = gatePlacement({ x: 0, y: 1, z: 0 }, { x: 0, y: 4, z: 8 }, 2)
    expect(result.position[0]).toBeCloseTo(0)
    expect(result.position[2]).toBeCloseTo(-2)
    expect(result.yaw).toBeCloseTo(Math.PI)
  })

  it('places to the east when looking east', () => {
    const result = gatePlacement({ x: 0, y: 1, z: 0 }, { x: -8, y: 4, z: 0 }, 2)
    expect(result.position[0]).toBeCloseTo(2)
    expect(result.position[2]).toBeCloseTo(0)
    expect(result.yaw).toBeCloseTo(Math.PI / 2)
  })
})
