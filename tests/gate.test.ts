import { describe, expect, it } from 'vitest'
import { damageGate, createGate, isGateDestroyed } from '../src/systems/gate'

describe('gate', () => {
  it('takes damage until destroyed', () => {
    let gate = createGate('gate-1', [0, 0, 2], 50)
    gate = damageGate(gate, 20)
    expect(gate.hp).toBe(30)
    expect(isGateDestroyed(gate)).toBe(false)
    gate = damageGate(gate, 40)
    expect(gate.hp).toBe(0)
    expect(isGateDestroyed(gate)).toBe(true)
  })
})
