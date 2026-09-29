/** Gameplay light radii for placed campfires (match Buildings pointLight.distance). */

import type { BuildingKind, PlacedBuilding } from './building'

export const CAMPFIRE_LIGHT_RADIUS = 10
export const ADVANCED_CAMPFIRE_LIGHT_RADIUS = 18

export function lightRadiusForBuilding(kind: BuildingKind): number {
  if (kind === 'campfire') return CAMPFIRE_LIGHT_RADIUS
  if (kind === 'advanced-campfire') return ADVANCED_CAMPFIRE_LIGHT_RADIUS
  return 0
}

export function isInCampfireLight(
  x: number,
  z: number,
  buildings: readonly PlacedBuilding[],
): boolean {
  for (const b of buildings) {
    const r = lightRadiusForBuilding(b.kind)
    if (r <= 0) continue
    const dx = x - b.position[0]
    const dz = z - b.position[2]
    if (Math.hypot(dx, dz) < r) return true
  }
  return false
}

/** If the proposed step sits inside a campfire glow, push it to the rim. */
export function steerAwayFromCampfireLight(
  _x: number,
  _z: number,
  proposedX: number,
  proposedZ: number,
  buildings: readonly PlacedBuilding[],
): { x: number; z: number } {
  let px = proposedX
  let pz = proposedZ
  for (const b of buildings) {
    const r = lightRadiusForBuilding(b.kind)
    if (r <= 0) continue
    const lx = b.position[0]
    const lz = b.position[2]
    const dx = px - lx
    const dz = pz - lz
    const d = Math.hypot(dx, dz)
    if (d < r) {
      if (d <= 1e-6) {
        px = lx + r
        pz = lz
      } else {
        const scale = r / d
        px = lx + dx * scale
        pz = lz + dz * scale
      }
    }
  }
  return { x: px, z: pz }
}
