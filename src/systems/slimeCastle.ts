export const CASTLE_SPAWN_INTERVAL = 18
export const CASTLE_MAX_SLIMES = 4
/** Seconds after spawn before a castle slime starts rotting (visual/soft). */
export const SLIME_ROT_START = 35
/** Seconds after spawn when an unkilled castle slime dies of rot. */
export const SLIME_ROT_DEATH = 55

export interface SlimeCastle {
  id: string
  position: [number, number, number]
  /** Seconds until next slime spawn. */
  spawnTimer: number
}

export function createSlimeCastle(
  id: string,
  position: [number, number, number],
): Omit<SlimeCastle, never> {
  return {
    id,
    position,
    spawnTimer: CASTLE_SPAWN_INTERVAL,
  }
}

export function advanceCastleSpawnTimer(
  castle: Omit<SlimeCastle, never>,
  deltaSec: number,
): Omit<SlimeCastle, never> & { shouldSpawn: boolean } {
  const next = castle.spawnTimer - deltaSec
  if (next <= 0) {
    return { ...castle, spawnTimer: CASTLE_SPAWN_INTERVAL, shouldSpawn: true }
  }
  return { ...castle, spawnTimer: next, shouldSpawn: false }
}

export function castleSpawnPosition(
  castlePos: readonly [number, number, number],
  rng: () => number = Math.random,
): [number, number, number] {
  const angle = rng() * Math.PI * 2
  const dist = 2.2 + rng() * 1.6
  return [
    castlePos[0] + Math.cos(angle) * dist,
    0.6,
    castlePos[2] + Math.sin(angle) * dist,
  ]
}

export function slimeRotPhase(ageSec: number): 'fresh' | 'rotting' | 'dead' {
  if (ageSec >= SLIME_ROT_DEATH) return 'dead'
  if (ageSec >= SLIME_ROT_START) return 'rotting'
  return 'fresh'
}

export function isCastleSlimeRotten(ageSec: number): boolean {
  return slimeRotPhase(ageSec) === 'dead'
}
