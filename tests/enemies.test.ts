import { describe, expect, it } from 'vitest'
import {
  advancePendingRespawns,
  BIOME_LEASH_RADIUS,
  canSpawnPendingRespawn,
  clearNightPendingRespawns,
  clampToBiomeLeash,
  ENEMY_RADIUS,
  enemyForBiome,
  enemyVisual,
  facingYaw,
  hubCenterForEnemyKind,
  isOutsideBiomeLeash,
  NIGHT_SLIME_COUNT,
  OVERWORLD_RESPAWN_SEC,
  scheduleOverworldRespawn,
  type EnemyKind,
  type PendingEnemyRespawn,
} from '../src/systems/enemies'
import { BIOME_ISLAND_SIZE, plotAtIndex, waterHubCenter } from '../src/systems/plots'

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

  it('respawns tide blobs on the water hub, not grassland death coords', () => {
    const [wx, , wz] = waterHubCenter()
    const scheduled = scheduleOverworldRespawn({
      source: 'biome',
      kind: 'tide',
      position: [0, 0.45, 0],
    })!
    expect(scheduled.position[0]).not.toBe(0)
    expect(Math.hypot(scheduled.position[0] - wx, scheduled.position[2] - wz)).toBeLessThan(
      BIOME_LEASH_RADIUS,
    )
    expect(hubCenterForEnemyKind('tide')).toEqual(waterHubCenter())
  })

  it('leashes biome movement to the hub radius', () => {
    const [hx, , hz] = waterHubCenter()
    const far = clampToBiomeLeash(hx + 100, hz, hx, hz)
    expect(Math.hypot(far.x - hx, far.z - hz)).toBeCloseTo(BIOME_LEASH_RADIUS, 5)
    expect(BIOME_LEASH_RADIUS).toBe(BIOME_ISLAND_SIZE / 2 - 2)
  })

  it('keeps tide blobs off the water pier toward grassland', () => {
    const [hx, , hz] = waterHubCenter()
    // Pier mid-path south of the hub — must be outside hub leash.
    const pierZ = hz - BIOME_LEASH_RADIUS - 5
    expect(isOutsideBiomeLeash(0, pierZ, hx, hz)).toBe(true)
    const clamped = clampToBiomeLeash(0, pierZ, hx, hz)
    expect(Math.hypot(clamped.x - hx, clamped.z - hz)).toBeCloseTo(BIOME_LEASH_RADIUS, 5)
  })

  it('faces local +Z toward a chase target', () => {
    // Target due +Z → yaw 0; due +X → yaw π/2
    expect(facingYaw(0, 0, 0, 5)).toBeCloseTo(0, 5)
    expect(facingYaw(0, 0, 5, 0)).toBeCloseTo(Math.PI / 2, 5)
    expect(facingYaw(0, 0, 0, -5)).toBeCloseTo(Math.PI, 5)
  })
})

describe('water reef unlocks', () => {
  it('makes purchased water islands full biome size', () => {
    // First water expansion is plot index 4 (after water/lava/rainforest hubs).
    const reef = plotAtIndex(4)
    expect(reef.biome).toBe('water')
    expect(reef.size).toBe(BIOME_ISLAND_SIZE)
    expect(reef.label).toContain('Water Island')
  })
})
