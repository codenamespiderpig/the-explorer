import { describe, expect, it } from 'vitest'
import {
  CASTLE_SPAWN_INTERVAL,
  advanceCastleSpawnTimer,
  castleSpawnPosition,
  createSlimeCastle,
  isCastleSlimeRotten,
  slimeRotPhase,
  SLIME_ROT_DEATH,
  SLIME_ROT_START,
} from '../src/systems/slimeCastle'

describe('slimeCastle', () => {
  it('creates a castle with a spawn timer', () => {
    const castle = createSlimeCastle('c1', [1, 0, 2])
    expect(castle.spawnTimer).toBe(CASTLE_SPAWN_INTERVAL)
    expect(castle.position).toEqual([1, 0, 2])
  })

  it('signals a spawn when the timer expires', () => {
    const castle = createSlimeCastle('c1', [0, 0, 0])
    const mid = advanceCastleSpawnTimer(castle, 5)
    expect(mid.shouldSpawn).toBe(false)
    expect(mid.spawnTimer).toBeCloseTo(CASTLE_SPAWN_INTERVAL - 5)

    const ready = advanceCastleSpawnTimer(mid, CASTLE_SPAWN_INTERVAL)
    expect(ready.shouldSpawn).toBe(true)
    expect(ready.spawnTimer).toBe(CASTLE_SPAWN_INTERVAL)
  })

  it('spawns near the castle', () => {
    const pos = castleSpawnPosition([10, 0, 10], () => 0)
    expect(Math.hypot(pos[0] - 10, pos[2] - 10)).toBeGreaterThan(1.5)
    expect(Math.hypot(pos[0] - 10, pos[2] - 10)).toBeLessThan(5)
  })

  it('marks unkilled castle slimes as rotting then dead', () => {
    expect(slimeRotPhase(0)).toBe('fresh')
    expect(slimeRotPhase(SLIME_ROT_START)).toBe('rotting')
    expect(slimeRotPhase(SLIME_ROT_DEATH)).toBe('dead')
    expect(isCastleSlimeRotten(SLIME_ROT_DEATH - 0.01)).toBe(false)
    expect(isCastleSlimeRotten(SLIME_ROT_DEATH)).toBe(true)
  })
})
