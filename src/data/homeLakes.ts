/** Small ponds on the home grassland — crab pots can be placed on the banks. */

export interface HomeLake {
  id: string
  position: [number, number, number]
  /** Visual water radius. */
  radius: number
}

export const HOME_LAKES: readonly HomeLake[] = [
  { id: 'home-pond-1', position: [-2.5, 0, -4.2], radius: 2.4 },
  { id: 'home-pond-2', position: [2.2, 0, 3.8], radius: 2.1 },
  { id: 'home-pond-3', position: [-13.5, 0, 11], radius: 2.3 },
]

/** Extra bank margin so crab pots sit beside the water, not only in the middle. */
export const HOME_LAKE_BANK_MARGIN = 1.6

export function isNearHomeLake(x: number, z: number): boolean {
  for (const lake of HOME_LAKES) {
    const dist = Math.hypot(x - lake.position[0], z - lake.position[2])
    if (dist <= lake.radius + HOME_LAKE_BANK_MARGIN) return true
  }
  return false
}
