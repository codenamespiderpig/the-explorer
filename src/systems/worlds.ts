export const MERCHANT_VISIT_SEC = 90

export type WorldId = 'home' | 'water' | 'lava'

export interface MerchantSpawn {
  world: WorldId
  position: [number, number, number]
}

/** Full-size biome islands — same scale as home, not tiny add-ons. */
export const BIOME_ISLAND_SIZE = 44
/** Open ocean between home edge and the next island. */
export const OCEAN_GAP = 48
export const HOME_ISLAND_SIZE = 36

export function homeHalf(): number {
  return HOME_ISLAND_SIZE / 2
}

export function biomeHalf(): number {
  return BIOME_ISLAND_SIZE / 2
}

/** Worlds unlocked at each land tier (tier 1 = water, tier 2 = lava). */
export function unlockedWorlds(landTier: number): WorldId[] {
  const worlds: WorldId[] = ['home']
  if (landTier >= 1) worlds.push('water')
  if (landTier >= 2) worlds.push('lava')
  return worlds
}

export function worldCenter(world: WorldId, _landTier = 0): [number, number, number] {
  const h = homeHalf()
  const b = biomeHalf()
  if (world === 'water') return [0, 0, h + OCEAN_GAP + b]
  if (world === 'lava') return [h + OCEAN_GAP + b, 0, 0]
  return [0, 0, 0]
}

/** Bridge endpoints: home dock → remote island dock. */
export function waterBridgeEndpoints(): {
  home: [number, number, number]
  island: [number, number, number]
} {
  const [, , wz] = worldCenter('water')
  return {
    home: [0, 0, homeHalf() - 0.5],
    island: [0, 0, wz - biomeHalf() + 0.5],
  }
}

export function lavaBridgeEndpoints(): {
  home: [number, number, number]
  island: [number, number, number]
} {
  const [lx] = worldCenter('lava')
  return {
    home: [homeHalf() - 0.5, 0, 0],
    island: [lx - biomeHalf() + 0.5, 0, 0],
  }
}

export function worldPlayableHalf(_world: WorldId): number {
  return biomeHalf() - 1.5
}

/** Pick a far edge spot so the merchant is hard to stumble onto. */
export function merchantSpawnPosition(
  landTier: number,
  rng: () => number = Math.random,
): MerchantSpawn {
  const worlds = unlockedWorlds(landTier)
  const world = worlds[Math.floor(rng() * worlds.length)] ?? 'home'
  const [cx, , cz] = worldCenter(world)
  const half = world === 'home' ? homeHalf() - 2 : worldPlayableHalf(world)
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

/** @deprecated use BIOME_ISLAND_SIZE */
export const WORLD_ISLAND_SIZE = BIOME_ISLAND_SIZE
