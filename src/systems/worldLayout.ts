/** Per-run biome → compass assignment (north / east / south only). */

export type Cardinal = 'north' | 'east' | 'south'
export type HubBiome = 'water' | 'lava' | 'rainforest'

export interface BiomeLayout {
  water: Cardinal
  lava: Cardinal
  rainforest: Cardinal
}

/** Classic layout used by tests and as the shuffle baseline. */
export const DEFAULT_BIOME_LAYOUT: BiomeLayout = {
  water: 'north',
  lava: 'east',
  rainforest: 'south',
}

const CARDINALS: Cardinal[] = ['north', 'east', 'south']

/** Match plots.ts footprint without importing it (avoid cycles). */
const HOME_HALF = 18
const BIOME_HALF = 22
const OCEAN_GAP = 48

let currentLayout: BiomeLayout = { ...DEFAULT_BIOME_LAYOUT }

export function getBiomeLayout(): BiomeLayout {
  return currentLayout
}

export function setBiomeLayout(layout: BiomeLayout): void {
  currentLayout = layout
}

export function shuffleBiomeLayout(rng: () => number = Math.random): BiomeLayout {
  const dirs = [...CARDINALS]
  for (let i = dirs.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1))
    const tmp = dirs[i]!
    dirs[i] = dirs[j]!
    dirs[j] = tmp
  }
  return {
    water: dirs[0]!,
    lava: dirs[1]!,
    rainforest: dirs[2]!,
  }
}

export function isValidBiomeLayout(layout: BiomeLayout): boolean {
  const set = new Set([layout.water, layout.lava, layout.rainforest])
  return set.size === 3 && CARDINALS.every((c) => set.has(c))
}

export function chainForBiome(layout: BiomeLayout, biome: HubBiome): Cardinal {
  return layout[biome]
}

export function biomeForChain(layout: BiomeLayout, chain: Cardinal): HubBiome {
  if (layout.water === chain) return 'water'
  if (layout.lava === chain) return 'lava'
  return 'rainforest'
}

/** Hub center for a compass chain (distance matches classic N/E/S hubs). */
export function hubCenterForChain(chain: Cardinal): [number, number, number] {
  const dist = HOME_HALF + OCEAN_GAP + BIOME_HALF
  if (chain === 'north') return [0, 0, dist]
  if (chain === 'east') return [dist, 0, 0]
  return [0, 0, -dist]
}

/** Island wall face that opens toward home. */
export function homewardOpenFace(chain: Cardinal): 'north' | 'south' | 'west' {
  if (chain === 'north') return 'south'
  if (chain === 'east') return 'west'
  return 'north'
}

export function bridgeEndpointsForChain(chain: Cardinal): {
  home: [number, number, number]
  island: [number, number, number]
} {
  const [cx, , cz] = hubCenterForChain(chain)
  if (chain === 'north') {
    return {
      home: [0, 0, HOME_HALF - 1],
      island: [0, 0, cz - BIOME_HALF + 0.5],
    }
  }
  if (chain === 'east') {
    return {
      home: [HOME_HALF - 1, 0, 0],
      island: [cx - BIOME_HALF + 0.5, 0, 0],
    }
  }
  return {
    home: [0, 0, -(HOME_HALF - 1)],
    island: [0, 0, cz + BIOME_HALF - 0.5],
  }
}

export function cardinalLabel(chain: Cardinal): string {
  return chain
}

/** Biome dock color for home pier stubs. */
export function biomeDockColor(biome: HubBiome): string {
  if (biome === 'water') return '#6ec4ff'
  if (biome === 'lava') return '#aa5533'
  return '#5a8a3a'
}
