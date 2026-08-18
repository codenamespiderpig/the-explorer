import { cameraLook, type Vec2 } from './facing'

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

/** Place a gate in front of the player along a ground forward vector. */
export function gatePlacementFromForward(
  player: Vec3,
  forward: Vec2,
  distance = 2.8,
): { position: [number, number, number]; yaw: number } {
  const len = Math.hypot(forward.x, forward.z) || 1
  const lx = forward.x / len
  const lz = forward.z / len
  return {
    position: [player.x + lx * distance, 0, player.z + lz * distance],
    yaw: Math.atan2(lx, lz),
  }
}

export function gatePlacementFromLookYaw(
  player: Vec3,
  lookYaw: number,
  distance = 2.8,
): { position: [number, number, number]; yaw: number } {
  return gatePlacementFromForward(player, cameraLook(lookYaw), distance)
}
