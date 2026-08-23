export const ATTACK_RANGE = 2.8
export const SWORD_DAMAGE = 10

export interface AttackTarget {
  id: string
  position: [number, number, number]
}

/** Nearest target within `radius`, or null if none. */
export function nearestTargetInRange(
  targets: readonly AttackTarget[],
  from: readonly [number, number, number],
  radius: number,
): AttackTarget | null {
  let best: AttackTarget | null = null
  let bestDist = radius
  for (const target of targets) {
    const dx = target.position[0] - from[0]
    const dz = target.position[2] - from[2]
    const dist = Math.hypot(dx, dz)
    if (dist <= bestDist) {
      bestDist = dist
      best = target
    }
  }
  return best
}
