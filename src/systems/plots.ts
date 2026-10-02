/** Land plot unlocks — water, lava, rainforest hubs, then infinite extras. */

import {
  biomeForChain,
  chainForBiome,
  getBiomeLayout,
  hubCenterForChain,
  type BiomeLayout,
  type Cardinal,
  type HubBiome,
} from './worldLayout'

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

function biomeHalf(): number {
  return BIOME_ISLAND_SIZE / 2
}

function layoutOr(layout?: BiomeLayout): BiomeLayout {
  return layout ?? getBiomeLayout()
}

/** Water hub — first unlock; compass slot from biome layout. */
export function waterHubCenter(layout?: BiomeLayout): [number, number, number] {
  return hubCenterForChain(chainForBiome(layoutOr(layout), 'water'))
}

/** Lava hub — second unlock; compass slot from biome layout. */
export function lavaHubCenter(layout?: BiomeLayout): [number, number, number] {
  return hubCenterForChain(chainForBiome(layoutOr(layout), 'lava'))
}

/** Rainforest hub — third unlock; compass slot from biome layout. */
export function rainforestHubCenter(layout?: BiomeLayout): [number, number, number] {
  return hubCenterForChain(chainForBiome(layoutOr(layout), 'rainforest'))
}

function expansionAlongChain(
  chain: Cardinal,
  hub: [number, number, number],
  expansionIndex: number,
  islandSize: number,
): [number, number, number] {
  const [cx, , cz] = hub
  const half = islandSize / 2
  if (chain === 'north') {
    const step = islandSize + OCEAN_GAP
    return [
      cx,
      0,
      cz + biomeHalf() + OCEAN_GAP + half + (expansionIndex - 1) * step,
    ]
  }
  if (chain === 'east') {
    const step = islandSize + OUTPOST_GAP
    const gap = islandSize === BIOME_ISLAND_SIZE ? OCEAN_GAP : OUTPOST_GAP
    const hubHalf = biomeHalf()
    return [
      cx + hubHalf + gap + half + (expansionIndex - 1) * step,
      0,
      cz,
    ]
  }
  const step = islandSize + OUTPOST_GAP
  const gap = islandSize === BIOME_ISLAND_SIZE ? OCEAN_GAP : OUTPOST_GAP
  return [
    cx,
    0,
    cz - (biomeHalf() + gap + half + (expansionIndex - 1) * step),
  ]
}

function waterExpansionCenter(
  expansionIndex: number,
  layout?: BiomeLayout,
): [number, number, number] {
  const L = layoutOr(layout)
  const chain = chainForBiome(L, 'water')
  return expansionAlongChain(
    chain,
    waterHubCenter(L),
    expansionIndex,
    BIOME_ISLAND_SIZE,
  )
}

function lavaExpansionCenter(
  expansionIndex: number,
  layout?: BiomeLayout,
): [number, number, number] {
  const L = layoutOr(layout)
  const chain = chainForBiome(L, 'lava')
  return expansionAlongChain(chain, lavaHubCenter(L), expansionIndex, OUTPOST_SIZE)
}

function rainforestExpansionCenter(
  expansionIndex: number,
  layout?: BiomeLayout,
): [number, number, number] {
  const L = layoutOr(layout)
  const chain = chainForBiome(L, 'rainforest')
  return expansionAlongChain(
    chain,
    rainforestHubCenter(L),
    expansionIndex,
    OUTPOST_SIZE,
  )
}

function hubBiomeUnlocked(biome: HubBiome, landTier: number): boolean {
  if (biome === 'water') return landTier >= WATER_UNLOCK_INDEX
  if (biome === 'lava') return landTier >= LAVA_UNLOCK_INDEX
  return landTier >= RAINFOREST_UNLOCK_INDEX
}

/** Plot unlocked by the purchase that raises land tiers from (index-1) → index. */
export function plotAtIndex(index: number, layout?: BiomeLayout): LandPlot {
  if (index < 1) {
    throw new Error(`plot index must be >= 1, got ${index}`)
  }
  const L = layoutOr(layout)

  if (index === WATER_UNLOCK_INDEX) {
    return {
      index,
      id: 'water-hub',
      label: 'Unlock the Water Island',
      biome: 'water',
      chain: chainForBiome(L, 'water'),
      kind: 'hub',
      size: BIOME_ISLAND_SIZE,
      center: waterHubCenter(L),
    }
  }
  if (index === LAVA_UNLOCK_INDEX) {
    return {
      index,
      id: 'lava-hub',
      label: 'Unlock the Lava Island',
      biome: 'lava',
      chain: chainForBiome(L, 'lava'),
      kind: 'hub',
      size: BIOME_ISLAND_SIZE,
      center: lavaHubCenter(L),
    }
  }
  if (index === RAINFOREST_UNLOCK_INDEX) {
    return {
      index,
      id: 'rainforest-hub',
      label: 'Unlock the Rainforest',
      biome: 'rainforest',
      chain: chainForBiome(L, 'rainforest'),
      kind: 'hub',
      size: BIOME_ISLAND_SIZE,
      center: rainforestHubCenter(L),
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
      chain: chainForBiome(L, 'water'),
      kind: 'outpost',
      size: BIOME_ISLAND_SIZE,
      center: waterExpansionCenter(n, L),
    }
  }
  if (slot === 2) {
    return {
      index,
      id: `lava-crag-${n}`,
      label: `Unlock Lava Crag ${n}`,
      biome: 'lava',
      chain: chainForBiome(L, 'lava'),
      kind: 'outpost',
      size: OUTPOST_SIZE,
      center: lavaExpansionCenter(n, L),
    }
  }
  return {
    index,
    id: `rainforest-grove-${n}`,
    label: `Unlock Rainforest Grove ${n}`,
    biome: 'rainforest',
    chain: chainForBiome(L, 'rainforest'),
    kind: 'outpost',
    size: OUTPOST_SIZE,
    center: rainforestExpansionCenter(n, L),
  }
}

export function unlockedPlots(landTier: number, layout?: BiomeLayout): LandPlot[] {
  const plots: LandPlot[] = []
  for (let i = 1; i <= landTier; i += 1) {
    plots.push(plotAtIndex(i, layout))
  }
  return plots
}

export function nextPlot(landTier: number, layout?: BiomeLayout): LandPlot {
  return plotAtIndex(landTier + 1, layout)
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

export function chainUnlocked(
  chain: Cardinal,
  landTier: number,
  layout?: BiomeLayout,
): boolean {
  const biome = biomeForChain(layoutOr(layout), chain)
  return hubBiomeUnlocked(biome, landTier)
}

export function northChainOpen(landTier: number, layout?: BiomeLayout): boolean {
  return chainUnlocked('north', landTier, layout)
}

export function eastChainOpen(landTier: number, layout?: BiomeLayout): boolean {
  return chainUnlocked('east', landTier, layout)
}

export function southChainOpen(landTier: number, layout?: BiomeLayout): boolean {
  return chainUnlocked('south', landTier, layout)
}

export function plotPlayableHalf(plot: LandPlot): number {
  return plot.size / 2 - 1.5
}

export function isPointOnPlot(x: number, z: number, plot: LandPlot): boolean {
  const [cx, , cz] = plot.center
  const half = plotPlayableHalf(plot)
  return Math.abs(x - cx) <= half + 1 && Math.abs(z - cz) <= half + 1
}