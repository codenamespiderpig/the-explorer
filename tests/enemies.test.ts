import { describe, expect, it } from 'vitest'
import {
  advancePendingRespawns,
  canSpawnPendingRespawn,
  clearNightPendingRespawns,
  ENEMY_RADIUS,
  enemyForBiome,
  enemyVisual,
  NIGHT_SLIME_COUNT,
  OVERWORLD_RESPAWN_SEC,
  scheduleOverworldRespawn,
  type EnemyKind,
  type PendingEnemyRespawn,
} from '../src/systems/enemies'

describe('enemies', () => {
  it('keeps enemies a bit shorter than the player', () => {
    // Player visual top ≈ 1.17; body sphere diameter should stay under that.
    expect(ENEMY_RADIUS).toBeLessThan(0.5)
    expect(ENEMY_RADIUS).toBeGreaterThan(0.35)
    expect(ENEMY_RADIUS * 2).toBeLessThan(1.1)
  })

  it('maps each land biome to a distinct enemy kind', () => {
    expect(enemyForBiome('home')).toBe('slime')
    expect(enemyForBiome('water')).toBe('tide')
    expect(enemyForBiome('lava')).toBe('ember')
    expect(enemyForBiome('rainforest')).toBe('leaf')
  })

  it('gives each kind a different look', () => {
    const kinds: EnemyKind[] = ['slime', 'tide', 'ember', 'leaf']
    const colors = kinds.map((k) => enemyVisual(k).color)
    expect(new Set(colors).size).toBe(kinds.length)
  })
})

describe('overworld enemy respawn', () => {
  it('schedules night and biome kills, not castle or dungeon', () => {
    expect(
      scheduleOverworldRespawn({
        source: 'night',
        kind: 'slime',
        position: [1, 0.45, 2],
      }),
    ).toMatchObject({
      source: 'night',
      kind: 'slime',
      remainingSec: OVERWORLD_RESPAWN_SEC,
    })
    expect(
      scheduleOverworldRespawn({
        source: 'biome',
        kind: 'ember',
        position: [10, 0.45, 0],
      })?.source,
    ).toBe('biome')
    expect(
      scheduleOverworldRespawn({
        source: 'castle',
        kind: 'slime',
        position: [0, 0.45, 0],
      }),
    ).toBeNull()
    expect(
      scheduleOverworldRespawn({
        source: 'dungeon',
        kind: 'slime',
        position: [0, 0.45, 0],
      }),
    ).toBeNull()
  })

  it('releases a ready spawn after OVERWORLD_RESPAWN_SEC', () => {
    const queued = scheduleOverworldRespawn({
      source: 'night',
      kind: 'slime',
      position: [0, 0.45, 5],
    })!
    const mid = advancePendingRespawns([queued], OVERWORLD_RESPAWN_SEC / 2)
    expect(mid.ready).toHaveLength(0)
    expect(mid.pending).toHaveLength(1)

    const done = advancePendingRespawns(mid.pending, OVERWORLD_RESPAWN_SEC)
    expect(done.ready).toHaveLength(1)
    expect(done.pending).toHaveLength(0)
    expect(done.ready[0]!.source).toBe('night')
  })

  it('clears night pending on day without touching biome', () => {
    const pending: PendingEnemyRespawn[] = [
      {
        source: 'night',
        kind: 'slime',
        position: [0, 0.45, 0],
        remainingSec: 5,
      },
      {
        source: 'biome',
        kind: 'ember',
        position: [8, 0.45, 0],
        remainingSec: 5,
      },
    ]
    expect(clearNightPendingRespawns(pending)).toEqual([pending[1]])
  })

  it('respects night and biome caps', () => {
    const nightEntry: PendingEnemyRespawn = {
      source: 'night',
      kind: 'slime',
      position: [0, 0.45, 0],
      remainingSec: 0,
    }
    const fullNight = Array.from({ length: NIGHT_SLIME_COUNT }, () => ({
      source: 'night' as const,
      kind: 'slime' as const,
    }))
    expect(canSpawnPendingRespawn(nightEntry, fullNight)).toBe(false)
    expect(canSpawnPendingRespawn(nightEntry, fullNight.slice(0, 2))).toBe(true)

    const biomeEntry: PendingEnemyRespawn = {
      source: 'biome',
      kind: 'ember',
      position: [1, 0.45, 1],
      remainingSec: 0,
    }
    expect(
      canSpawnPendingRespawn(biomeEntry, [
        { source: 'biome', kind: 'ember' },
        { source: 'biome', kind: 'ember' },
        { source: 'biome', kind: 'ember' },
      ]),
    ).toBe(false)
  })
})
