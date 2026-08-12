export interface Gate {
  id: string
  position: [number, number, number]
  hp: number
  maxHp: number
}

export function createGate(
  id: string,
  position: [number, number, number],
  maxHp = 50,
): Gate {
  return { id, position, hp: maxHp, maxHp }
}

export function damageGate(gate: Gate, amount: number): Gate {
  return { ...gate, hp: Math.max(0, gate.hp - amount) }
}

export function isGateDestroyed(gate: Gate): boolean {
  return gate.hp <= 0
}
