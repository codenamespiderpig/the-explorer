import { describe, expect, it } from 'vitest'
import {
  ENEMY_RADIUS,
  enemyForBiome,
  enemyVisual,
  type EnemyKind,
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
