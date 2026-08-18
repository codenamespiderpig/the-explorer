import { describe, expect, it } from 'vitest'
import {
  damageGate,
  createGate,
  isGateDestroyed,
  gatePlacementFromLookYaw,
} from '../src/systems/gate'

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

describe('gatePlacementFromLookYaw', () => {
  it('places ahead of the player when the camera is behind them (look yaw 0)', () => {
    const result = gatePlacementFromLookYaw({ x: 0, y: 1, z: 0 }, 0, 2)
    expect(result.position[0]).toBeCloseTo(0)
    expect(result.position[2]).toBeCloseTo(-2)
    expect(Math.abs(result.yaw)).toBeCloseTo(Math.PI)
  })

  it('places and faces west when looking left (camera on the +X side)', () => {
    const result = gatePlacementFromLookYaw({ x: 0, y: 1, z: 0 }, Math.PI / 2, 2)
    expect(result.position[0]).toBeCloseTo(-2)
    expect(result.position[2]).toBeCloseTo(0)
    expect(result.yaw).toBeCloseTo(-Math.PI / 2)
  })

  it('places and faces south when the camera is in front (look yaw π)', () => {
    const result = gatePlacementFromLookYaw({ x: 0, y: 1, z: 0 }, Math.PI, 2)
    expect(result.position[0]).toBeCloseTo(0)
    expect(result.position[2]).toBeCloseTo(2)
    expect(result.yaw).toBeCloseTo(0)
  })
})
