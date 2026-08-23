export const MERCHANT_VISIT_SEC = 90

export type WorldId = 'home' | 'water' | 'lava'

export interface MerchantSpawn {
  world: WorldId
  position: [number, number, number]
}

const WORLD_ISLAND_SIZE = 28

/** Worlds unlocked at each land tier (tier 1 = water, tier 2 = lava). */
export function unlockedWorlds(landTier: number): WorldId[] {
  const worlds: WorldId[] = ['home']
  if (landTier >= 1) worlds.push('water')
  if (landTier >= 2) worlds.push('lava')
  return worlds
}

export function worldCenter(
  world: WorldId,
  landTier: number,
): [number, number, number] {
  const homeHalf = (36 + landTier * 8) / 2
  const gap = 6
  if (world === 'water') return [0, 0, homeHalf + gap + WORLD_ISLAND_SIZE / 2]
  if (world === 'lava') return [homeHalf + gap + WORLD_ISLAND_SIZE / 2, 0, 0]
  return [0, 0, 0]
}

export function worldPlayableHalf(_world: WorldId): number {
  return WORLD_ISLAND_SIZE / 2 - 1.5
}

/** Pick a far edge spot so the merchant is hard to stumble onto. */
export function merchantSpawnPosition(
  landTier: number,
  rng: () => number = Math.random,
): MerchantSpawn {
  const worlds = unlockedWorlds(landTier)
  const world = worlds[Math.floor(rng() * worlds.length)] ?? 'home'
  const [cx, , cz] = worldCenter(world, landTier)
  const half = worldPlayableHalf(world)
  const angle = rng() * Math.PI * 2
  const dist = half * (0.78 + rng() * 0.2)
  return {
    world,
    position: [cx + Math.cos(angle) * dist, 0, cz + Math.sin(angle) * dist],
  }
}

export function advanceMerchantTimer(timeLeft: number, deltaSec: number): number {
  return Math.max(0, timeLeft - deltaSec)
}

export function isMerchantVisiting(timeLeft: number): boolean {
  return timeLeft > 0
}

export function formatMerchantCountdown(timeLeft: number): string {
  const s = Math.max(0, Math.ceil(timeLeft))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

export { WORLD_ISLAND_SIZE }
