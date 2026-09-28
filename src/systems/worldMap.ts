import {
  BIOME_ISLAND_SIZE,
  HOME_ISLAND_SIZE,
  lavaHubCenter,
  lavaUnlocked,
  type LandPlot,
  unlockedPlots,
  waterHubCenter,
  waterUnlocked,
} from './plots'
import { lavaBridgeEndpoints, waterBridgeEndpoints } from './worlds'

export interface WorldBounds {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export interface MapIsland {
  id: string
  label: string
  biome: 'grass' | 'water' | 'lava'
  center: [number, number, number]
  size: number
  locked: boolean
}

export interface MapBridge {
  id: string
  from: [number, number, number]
  to: [number, number, number]
  biome: 'water' | 'lava'
}

export interface MapFeatures {
  islands: MapIsland[]
  bridges: MapBridge[]
  bounds: WorldBounds
}

const PAD = 8

function expand(bounds: WorldBounds, x: number, z: number, half: number): void {
  bounds.minX = Math.min(bounds.minX, x - half)
  bounds.maxX = Math.max(bounds.maxX, x + half)
  bounds.minZ = Math.min(bounds.minZ, z - half)
  bounds.maxZ = Math.max(bounds.maxZ, z + half)
}

/** Axis-aligned world AABB for everything visible on the map at this land tier. */
export function worldBounds(landTier: number): WorldBounds {
  const homeHalf = HOME_ISLAND_SIZE / 2
  const bounds: WorldBounds = {
    minX: -homeHalf,
    maxX: homeHalf,
    minZ: -homeHalf,
    maxZ: homeHalf,
  }

  for (const plot of unlockedPlots(landTier)) {
    expand(bounds, plot.center[0], plot.center[2], plot.size / 2)
  }

  // Always reserve room for locked biome hubs so the map previews where they sit.
  if (!waterUnlocked(landTier)) {
    const [cx, , cz] = waterHubCenter()
    expand(bounds, cx, cz, BIOME_ISLAND_SIZE / 2)
  }
  if (!lavaUnlocked(landTier)) {
    const [cx, , cz] = lavaHubCenter()
    expand(bounds, cx, cz, BIOME_ISLAND_SIZE / 2)
  }

  bounds.minX -= PAD
  bounds.maxX += PAD
  bounds.minZ -= PAD
  bounds.maxZ += PAD
  return bounds
}

/** Convert world X/Z to north-up map pixels inside a square of `size`. */
export function worldToMap(
  x: number,
  z: number,
  bounds: WorldBounds,
  size: number,
): { x: number; y: number } {
  const spanX = Math.max(1, bounds.maxX - bounds.minX)
  const spanZ = Math.max(1, bounds.maxZ - bounds.minZ)
  const span = Math.max(spanX, spanZ)
  const midX = (bounds.minX + bounds.maxX) / 2
  const midZ = (bounds.minZ + bounds.maxZ) / 2
  const inset = size * 0.06
  const usable = size - inset * 2
  return {
    x: inset + ((x - midX) / span + 0.5) * usable,
    y: inset + ((midZ - z) / span + 0.5) * usable,
  }
}

function plotToIsland(plot: LandPlot, locked = false): MapIsland {
  return {
    id: plot.id,
    label: plot.label.replace(/^Unlock\s+/i, ''),
    biome: plot.biome,
    center: plot.center,
    size: plot.size,
    locked,
  }
}

/** Islands + bridges for the schematic map. */
export function mapFeatures(landTier: number): MapFeatures {
  const islands: MapIsland[] = [
    {
      id: 'home',
      label: 'Home',
      biome: 'grass',
      center: [0, 0, 0],
      size: HOME_ISLAND_SIZE,
      locked: false,
    },
  ]

  for (const plot of unlockedPlots(landTier)) {
    islands.push(plotToIsland(plot))
  }

  if (!waterUnlocked(landTier)) {
    islands.push({
      id: 'water-hub',
      label: 'Water Island',
      biome: 'water',
      center: waterHubCenter(),
      size: BIOME_ISLAND_SIZE,
      locked: true,
    })
  }
  if (!lavaUnlocked(landTier)) {
    islands.push({
      id: 'lava-hub',
      label: 'Lava Island',
      biome: 'lava',
      center: lavaHubCenter(),
      size: BIOME_ISLAND_SIZE,
      locked: true,
    })
  }

  const bridges: MapBridge[] = []
  if (waterUnlocked(landTier)) {
    const { home, island } = waterBridgeEndpoints()
    bridges.push({ id: 'water-bridge', from: home, to: island, biome: 'water' })
  }
  if (lavaUnlocked(landTier)) {
    const { home, island } = lavaBridgeEndpoints()
    bridges.push({ id: 'lava-bridge', from: home, to: island, biome: 'lava' })
  }

  return { islands, bridges, bounds: worldBounds(landTier) }
}
