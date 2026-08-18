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

/** Place a gate in front of the player, facing the camera look direction. */
export function gatePlacement(
  player: Vec3,
  camera: Vec3,
  distance = 2.8,
): { position: [number, number, number]; yaw: number } {
  let lx = player.x - camera.x
  let lz = player.z - camera.z
  const len = Math.hypot(lx, lz)
  if (len < 0.001) {
    lx = 0
    lz = 1
  } else {
    lx /= len
    lz /= len
  }
  return {
    position: [player.x + lx * distance, 0, player.z + lz * distance],
    yaw: Math.atan2(lx, lz),
  }
}
