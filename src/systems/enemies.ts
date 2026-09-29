/** Biome enemy kinds and shared combat visuals. */

export type EnemyBiome = 'home' | 'water' | 'lava' | 'rainforest'
export type EnemyKind = 'slime' | 'tide' | 'ember' | 'leaf'

/** Body sphere radius — a bit shorter than the player (~1.17 tall). */
export const ENEMY_RADIUS = 0.45
export const ENEMY_BODY_Y = 0.45

export interface EnemyVisual {
  color: string
  emissive: string
  intensity: number
  label: string
}

export function enemyForBiome(biome: EnemyBiome): EnemyKind {
  if (biome === 'water') return 'tide'
  if (biome === 'lava') return 'ember'
  if (biome === 'rainforest') return 'leaf'
  return 'slime'
}

export function enemyVisual(kind: EnemyKind): EnemyVisual {
  if (kind === 'tide') {
    return {
      color: '#3ec4e8',
      emissive: '#116a88',
      intensity: 0.4,
      label: 'Tide Blob',
    }
  }
  if (kind === 'ember') {
    return {
      color: '#ff6a2a',
      emissive: '#cc2200',
      intensity: 0.55,
      label: 'Ember Blob',
    }
  }
  if (kind === 'leaf') {
    return {
      color: '#2d9a4a',
      emissive: '#145828',
      intensity: 0.35,
      label: 'Leaf Mite',
    }
  }
  return {
    color: '#6adf4a',
    emissive: '#1f5a10',
    intensity: 0.35,
    label: 'Slime',
  }
}

export const BIOME_ENEMY_COUNT = 3
export const BIOME_ENEMY_HP = 24

/** Night pack size — matches spawnNightSlimes. */
export const NIGHT_SLIME_COUNT = 4
export const NIGHT_SLIME_HP = 20

/** Seconds after a night/biome kill before that enemy returns. */
export const OVERWORLD_RESPAWN_SEC = 18

export type OverworldEnemySource = 'night' | 'biome'

export interface PendingEnemyRespawn {
  source: OverworldEnemySource
  kind: EnemyKind
  position: [number, number, number]
  remainingSec: number
}

export function scheduleOverworldRespawn(killed: {
  source: string
  kind: EnemyKind
  position: readonly [number, number, number]
}): PendingEnemyRespawn | null {
  if (killed.source !== 'night' && killed.source !== 'biome') return null
  return {
    source: killed.source,
    kind: killed.kind,
    position: [killed.position[0], killed.position[1], killed.position[2]],
    remainingSec: OVERWORLD_RESPAWN_SEC,
  }
}

export function advancePendingRespawns(
  pending: readonly PendingEnemyRespawn[],
  deltaSec: number,
): { pending: PendingEnemyRespawn[]; ready: PendingEnemyRespawn[] } {
  const next: PendingEnemyRespawn[] = []
  const ready: PendingEnemyRespawn[] = []
  for (const entry of pending) {
    const remainingSec = entry.remainingSec - deltaSec
    if (remainingSec <= 0) {
      ready.push({ ...entry, remainingSec: 0 })
    } else {
      next.push({ ...entry, remainingSec })
    }
  }
  return { pending: next, ready }
}

export function clearNightPendingRespawns(
  pending: readonly PendingEnemyRespawn[],
): PendingEnemyRespawn[] {
  return pending.filter((p) => p.source !== 'night')
}

export function canSpawnPendingRespawn(
  entry: PendingEnemyRespawn,
  slimes: readonly { source: string; kind: EnemyKind }[],
): boolean {
  if (entry.source === 'night') {
    return slimes.filter((s) => s.source === 'night').length < NIGHT_SLIME_COUNT
  }
  return (
    slimes.filter((s) => s.source === 'biome' && s.kind === entry.kind).length <
    BIOME_ENEMY_COUNT
  )
}

/** Scatter a few spawn points around a hub center. */
export function biomeEnemyPositions(
  center: readonly [number, number, number],
  count = BIOME_ENEMY_COUNT,
): Array<[number, number, number]> {
  const [cx, , cz] = center
  const ring = 8
  const out: Array<[number, number, number]> = []
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * Math.PI * 2 + 0.4
    out.push([cx + Math.cos(a) * ring, ENEMY_BODY_Y, cz + Math.sin(a) * ring])
  }
  return out
}
