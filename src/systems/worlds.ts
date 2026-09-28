import { randomPointInRect, waterIslandIsletRects } from './waterIsland'
import {
  BIOME_ISLAND_SIZE,
  HOME_ISLAND_SIZE,
  OCEAN_GAP,
  lavaHubCenter,
  lavaUnlocked,
  rainforestHubCenter,
  rainforestUnlocked,
  unlockedPlots,
  waterHubCenter,
  waterUnlocked,
} from './plots'

export { BIOME_ISLAND_SIZE, HOME_ISLAND_SIZE, OCEAN_GAP }

export const MERCHANT_VISIT_SEC = 90

export type WorldId = 'home' | 'water' | 'lava' | 'rainforest'

export interface MerchantSpawn {
  world: WorldId
  position: [number, number, number]
}

export function homeHalf(): number {
  return HOME_ISLAND_SIZE / 2
}

export function biomeHalf(): number {
  return BIOME_ISLAND_SIZE / 2
}

/** Worlds unlocked at each land tier. */
export function unlockedWorlds(landTier: number): WorldId[] {
  const worlds: WorldId[] = ['home']
  if (waterUnlocked(landTier)) worlds.push('water')
  if (lavaUnlocked(landTier)) worlds.push('lava')
  if (rainforestUnlocked(landTier)) worlds.push('rainforest')
  return worlds
}

export function worldCenter(world: WorldId, _landTier = 0): [number, number, number] {
  if (world === 'water') return waterHubCenter()
  if (world === 'lava') return lavaHubCenter()
  if (world === 'rainforest') return rainforestHubCenter()
  return [0, 0, 0]
}

/** Bridge endpoints: home dock → remote island dock. */
export function waterBridgeEndpoints(): {
  home: [number, number, number]
  island: [number, number, number]
} {
  const [, , wz] = worldCenter('water')
  return {
    home: [0, 0, homeHalf() - 1],
    island: [0, 0, wz - biomeHalf() + 0.5],
  }
}

export function lavaBridgeEndpoints(): {
  home: [number, number, number]
  island: [number, number, number]
} {
  const [lx] = worldCenter('lava')
  return {
    home: [homeHalf() - 1, 0, 0],
    island: [lx - biomeHalf() + 0.5, 0, 0],
  }
}

export function rainforestBridgeEndpoints(): {
  home: [number, number, number]
  island: [number, number, number]
} {
  const [, , rz] = worldCenter('rainforest')
  return {
    home: [0, 0, -(homeHalf() - 1)],
    island: [0, 0, rz + biomeHalf() - 0.5],
  }
}

export function worldPlayableHalf(_world: WorldId): number {
  return biomeHalf() - 1.5
}

function worldFromPlotBiome(
  biome: 'grass' | 'water' | 'lava' | 'rainforest',
): WorldId {
  if (biome === 'lava') return 'lava'
  if (biome === 'water') return 'water'
  if (biome === 'rainforest') return 'rainforest'
  return 'home'
}

/** Pick a far edge spot so the merchant is hard to stumble onto. */
export function merchantSpawnPosition(
  landTier: number,
  rng: () => number = Math.random,
): MerchantSpawn {
  const worlds = unlockedWorlds(landTier)
  const world = worlds[Math.floor(rng() * worlds.length)] ?? 'home'

  if (world === 'water') {
    const islets = waterIslandIsletRects()
    const rect = islets[Math.floor(rng() * islets.length)] ?? islets[0]
    if (rect) {
      const point = randomPointInRect(rect, rng)
      return { world, position: [point.x, 0, point.z] }
    }
  }

  const plots = unlockedPlots(landTier).filter((p) => p.kind === 'outpost')
  if (plots.length > 0 && rng() > 0.35) {
    const plot = plots[Math.floor(rng() * plots.length)]!
    const [cx, , cz] = plot.center
    const half = plot.size / 2 - 2
    const angle = rng() * Math.PI * 2
    const dist = half * (0.5 + rng() * 0.4)
    return {
      world: worldFromPlotBiome(plot.biome),
      position: [cx + Math.cos(angle) * dist, 0, cz + Math.sin(angle) * dist],
    }
  }

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
