export interface Gate {
  id: string
  position: [number, number, number]
  /** Y-axis rotation in radians; 0 faces +Z. */
  yaw: number
  hp: number
  maxHp: number
}

export function createGate(
  id: string,
  position: [number, number, number],
  yaw = 0,
  maxHp = 50,
): Gate {
  return { id, position, yaw, hp: maxHp, maxHp }
}

export function damageGate(gate: Gate, amount: number): Gate {
  return { ...gate, hp: Math.max(0, gate.hp - amount) }
}

export function isGateDestroyed(gate: Gate): boolean {
  return gate.hp <= 0
}

export interface Vec3 {
  x: number
  y: number
  z: number
}

/**
 * Place a gate in front of the player using the follow-camera orbit yaw.
 * Camera sits at player + (sin(lookYaw), cos(lookYaw)), so look direction is the opposite.
 */
export function gatePlacementFromLookYaw(
  player: Vec3,
  lookYaw: number,
  distance = 2.8,
): { position: [number, number, number]; yaw: number } {
  const lx = -Math.sin(lookYaw)
  const lz = -Math.cos(lookYaw)
  return {
    position: [player.x + lx * distance, 0, player.z + lz * distance],
    yaw: Math.atan2(lx, lz),
  }
}
