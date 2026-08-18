export interface Vec2 {
  x: number
  z: number
}

export interface MoveInput {
  forward: boolean
  backward: boolean
  leftward: boolean
  rightward: boolean
}

/** Camera look on the ground: camera sits at (sin(yaw), cos(yaw)) from the player. */
export function cameraLook(lookYaw: number): Vec2 {
  return { x: -Math.sin(lookYaw), z: -Math.cos(lookYaw) }
}

/**
 * Direction the player is facing: walk input relative to the camera, or camera look if still.
 */
export function facingDirection(lookYaw: number, input: MoveInput): Vec2 {
  const look = cameraLook(lookYaw)
  const right = { x: Math.cos(lookYaw), z: -Math.sin(lookYaw) }
  let x = 0
  let z = 0
  if (input.forward) {
    x += look.x
    z += look.z
  }
  if (input.backward) {
    x -= look.x
    z -= look.z
  }
  if (input.rightward) {
    x += right.x
    z += right.z
  }
  if (input.leftward) {
    x -= right.x
    z -= right.z
  }
  const len = Math.hypot(x, z)
  if (len < 0.001) return look
  return { x: x / len, z: z / len }
}

export function yawFromForward(forward: Vec2): number {
  return Math.atan2(forward.x, forward.z)
}
