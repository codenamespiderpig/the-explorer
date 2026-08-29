import { onWaterBridge } from '../world/bounds'
import { biomeHalf, worldCenter } from './worlds'

export const CRAB_POT_CATCH_INTERVAL = 45
export const CRAB_POT_MAX_FISH = 2
export const CRAB_POT_WATER_RADIUS = 8

export interface CrabPot {
  id: string
  position: [number, number, number]
  storedFish: number
  /** Seconds until the next fish is caught. */
  catchTimer: number
}

export function createCrabPot(
  id: string,
  position: [number, number, number],
): CrabPot {
  return {
    id,
    position,
    storedFish: 0,
    catchTimer: CRAB_POT_CATCH_INTERVAL,
  }
}

/** True when the spot is on the water island, pier, or close to the water biome. */
export function isNearWater(x: number, z: number, landTier: number): boolean {
  if (landTier < 1) return false
  if (onWaterBridge(x, z, landTier)) return true
  const [cx, , cz] = worldCenter('water')
  const half = biomeHalf()
  return Math.abs(x - cx) <= half + CRAB_POT_WATER_RADIUS && Math.abs(z - cz) <= half + CRAB_POT_WATER_RADIUS
}

export function advanceCrabPotCatch(
  pot: CrabPot,
  deltaSec: number,
): CrabPot {
  if (pot.storedFish >= CRAB_POT_MAX_FISH) {
    return { ...pot, catchTimer: CRAB_POT_CATCH_INTERVAL }
  }
  let timer = pot.catchTimer - deltaSec
  let stored = pot.storedFish
  while (timer <= 0 && stored < CRAB_POT_MAX_FISH) {
    stored += 1
    timer += CRAB_POT_CATCH_INTERVAL
  }
  if (stored >= CRAB_POT_MAX_FISH) timer = CRAB_POT_CATCH_INTERVAL
  return { ...pot, storedFish: stored, catchTimer: timer }
}

export function collectFishFromPot(pot: CrabPot, amount = 1): { pot: CrabPot; collected: number } {
  const collected = Math.min(amount, pot.storedFish)
  return {
    pot: { ...pot, storedFish: pot.storedFish - collected },
    collected,
  }
}

export function nearestPotWithFish(
  pots: readonly CrabPot[],
  from: readonly [number, number, number],
  radius: number,
): CrabPot | null {
  let best: CrabPot | null = null
  let bestDist = radius
  for (const pot of pots) {
    if (pot.storedFish <= 0) continue
    const dist = Math.hypot(pot.position[0] - from[0], pot.position[2] - from[2])
    if (dist <= bestDist) {
      bestDist = dist
      best = pot
    }
  }
  return best
}

export function nearestPot(
  pots: readonly CrabPot[],
  from: readonly [number, number, number],
  radius: number,
): CrabPot | null {
  let best: CrabPot | null = null
  let bestDist = radius
  for (const pot of pots) {
    const dist = Math.hypot(pot.position[0] - from[0], pot.position[2] - from[2])
    if (dist <= bestDist) {
      bestDist = dist
      best = pot
    }
  }
  return best
}
