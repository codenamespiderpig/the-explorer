/** Land plot unlocks — water, lava, rainforest hubs, then infinite extras. */

export type PlotBiome = 'grass' | 'water' | 'lava' | 'rainforest'
export type PlotChain = 'north' | 'east' | 'south'

export interface LandPlot {
  /** 1-based purchase index (buying when landTier === index-1 unlocks this). */
  index: number
  id: string
  label: string
  biome: PlotBiome
  chain: PlotChain
  /** Hub plots are the main biome islands; others are outposts. */
  kind: 'hub' | 'outpost'
  size: number
  center: [number, number, number]
}

export const HOME_ISLAND_SIZE = 36
export const BIOME_ISLAND_SIZE = 44
export const OCEAN_GAP = 48
export const OUTPOST_SIZE = 28
export const OUTPOST_GAP = 22
export const WATER_UNLOCK_INDEX = 1
export const LAVA_UNLOCK_INDEX = 2
export const RAINFOREST_UNLOCK_INDEX = 3

function homeHalf(): number {
  return HOME_ISLAND_SIZE / 2
}

function biomeHalf(): number {
  return BIOME_ISLAND_SIZE / 2
}

function outpostHalf(): number {
  return OUTPOST_SIZE / 2
}

/** Water hub — first unlock, directly north of home. */
export function waterHubCenter(): [number, number, number] {
  return [0, 0, homeHalf() + OCEAN_GAP + biomeHalf()]
}

/** Lava hub — second unlock, directly east of home. */
export function lavaHubCenter(): [number, number, number] {
  return [homeHalf() + OCEAN_GAP + biomeHalf(), 0, 0]
}

/** Rainforest hub — third unlock, directly south of home. */
export function rainforestHubCenter(): [number, number, number] {
  return [0, 0, -(homeHalf() + OCEAN_GAP + biomeHalf())]
}

function waterExpansionCenter(expansionIndex: number): [number, number, number] {
  const [cx, , cz] = waterHubCenter()
  const step = BIOME_ISLAND_SIZE + OCEAN_GAP
  return [cx, 0, cz + biomeHalf() + OCEAN_GAP + biomeHalf() + (expansionIndex - 1) * step]
}

function lavaExpansionCenter(expansionIndex: number): [number, number, number] {
  const [cx, , cz] = lavaHubCenter()
  const step = OUTPOST_SIZE + OUTPOST_GAP
  return [cx + biomeHalf() + OUTPOST_GAP + outpostHalf() + (expansionIndex - 1) * step, 0, cz]
}

function rainforestExpansionCenter(expansionIndex: number): [number, number, number] {
  const [cx, , cz] = rainforestHubCenter()
  const step = OUTPOST_SIZE + OUTPOST_GAP
  return [cx, 0, cz - (biomeHalf() + OUTPOST_GAP + outpostHalf() + (expansionIndex - 1) * step)]
}

/** Plot unlocked by the purchase that raises land tiers from (index-1) → index. */
export function plotAtIndex(index: number): LandPlot {
  if (index < 1) {
    throw new Error(`plot index must be >= 1, got ${index}`)
  }

  if (index === WATER_UNLOCK_INDEX) {
    return {
      index,
      id: 'water-hub',
      label: 'Unlock the Water Island',
      biome: 'water',
      chain: 'north',
      kind: 'hub',
      size: BIOME_ISLAND_SIZE,
      center: waterHubCenter(),
    }
  }
  if (index === LAVA_UNLOCK_INDEX) {
    return {
      index,
      id: 'lava-hub',
      label: 'Unlock the Lava Island',
      biome: 'lava',
      chain: 'east',
      kind: 'hub',
      size: BIOME_ISLAND_SIZE,
      center: lavaHubCenter(),
    }
  }
  if (index === RAINFOREST_UNLOCK_INDEX) {
    return {
      index,
      id: 'rainforest-hub',
      label: 'Unlock the Rainforest',
      biome: 'rainforest',
      chain: 'south',
      kind: 'hub',
      size: BIOME_ISLAND_SIZE,
      center: rainforestHubCenter(),
    }
  }

  // Infinite extras after hubs: cycle water reef / lava crag / rainforest grove.
  const after = index - RAINFOREST_UNLOCK_INDEX
  const n = Math.ceil(after / 3)
  const slot = after % 3
  if (slot === 1) {
    return {
      index,
      id: `water-reef-${n}`,
      label: `Unlock Water Island ${n}`,
      biome: 'water',
      chain: 'north',
      kind: 'outpost',
      size: BIOME_ISLAND_SIZE,
      center: waterExpansionCenter(n),
    }
  }
  if (slot === 2) {
    return {
      index,
      id: `lava-crag-${n}`,
      label: `Unlock Lava Crag ${n}`,
      biome: 'lava',
      chain: 'east',
      kind: 'outpost',
      size: OUTPOST_SIZE,
      center: lavaExpansionCenter(n),
    }
  }
  return {
    index,
    id: `rainforest-grove-${n}`,
    label: `Unlock Rainforest Grove ${n}`,
    biome: 'rainforest',
    chain: 'south',
    kind: 'outpost',
    size: OUTPOST_SIZE,
    center: rainforestExpansionCenter(n),
  }
}

export function unlockedPlots(landTier: number): LandPlot[] {
  const plots: LandPlot[] = []
  for (let i = 1; i <= landTier; i += 1) {
    plots.push(plotAtIndex(i))
  }
  return plots
}

export function nextPlot(landTier: number): LandPlot {
  return plotAtIndex(landTier + 1)
}

export function waterUnlocked(landTier: number): boolean {
  return landTier >= WATER_UNLOCK_INDEX
}

export function lavaUnlocked(landTier: number): boolean {
  return landTier >= LAVA_UNLOCK_INDEX
}

export function rainforestUnlocked(landTier: number): boolean {
  return landTier >= RAINFOREST_UNLOCK_INDEX
}

export function northChainOpen(landTier: number): boolean {
  return waterUnlocked(landTier)
}

export function eastChainOpen(landTier: number): boolean {
  return lavaUnlocked(landTier)
}

export function southChainOpen(landTier: number): boolean {
  return rainforestUnlocked(landTier)
}

export function plotPlayableHalf(plot: LandPlot): number {
  return plot.size / 2 - 1.5
}

export function isPointOnPlot(x: number, z: number, plot: LandPlot): boolean {
  const [cx, , cz] = plot.center
  const half = plotPlayableHalf(plot)
  return Math.abs(x - cx) <= half + 1 && Math.abs(z - cz) <= half + 1
}
