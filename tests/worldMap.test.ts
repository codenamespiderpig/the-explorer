import { describe, expect, it } from 'vitest'
import {
  mapFeatures,
  worldBounds,
  worldToMap,
} from '../src/systems/worldMap'
import {
  BIOME_ISLAND_SIZE,
  HOME_ISLAND_SIZE,
  LAVA_UNLOCK_INDEX,
  RAINFOREST_UNLOCK_INDEX,
  WATER_UNLOCK_INDEX,
  lavaHubCenter,
  rainforestHubCenter,
  waterHubCenter,
} from '../src/systems/plots'

describe('worldMap', () => {
  it('bounds always include home and preview locked biome hubs', () => {
    const b = worldBounds(0)
    const half = HOME_ISLAND_SIZE / 2
    expect(b.minX).toBeLessThanOrEqual(-half)
    expect(b.maxZ).toBeGreaterThan(waterHubCenter()[2])
    expect(b.maxX).toBeGreaterThan(lavaHubCenter()[0])
    expect(b.minZ).toBeLessThan(rainforestHubCenter()[2])
  })

  it('bounds grow to include water, lava, and rainforest hubs', () => {
    const water = worldBounds(WATER_UNLOCK_INDEX)
    const [, , wz] = waterHubCenter()
    expect(water.maxZ).toBeGreaterThanOrEqual(wz + BIOME_ISLAND_SIZE / 2)

    const lava = worldBounds(LAVA_UNLOCK_INDEX)
    const [lx] = lavaHubCenter()
    expect(lava.maxX).toBeGreaterThanOrEqual(lx + BIOME_ISLAND_SIZE / 2)

    const rain = worldBounds(RAINFOREST_UNLOCK_INDEX)
    const [, , rz] = rainforestHubCenter()
    expect(rain.minZ).toBeLessThanOrEqual(rz - BIOME_ISLAND_SIZE / 2)
  })

  it('maps world X/Z to north-up screen coords', () => {
    const bounds = worldBounds(RAINFOREST_UNLOCK_INDEX)
    const home = worldToMap(0, 0, bounds, 200)
    const water = worldToMap(0, waterHubCenter()[2], bounds, 200)
    const lava = worldToMap(lavaHubCenter()[0], 0, bounds, 200)
    const rain = worldToMap(0, rainforestHubCenter()[2], bounds, 200)

    expect(home.x).toBeGreaterThan(0)
    expect(home.y).toBeGreaterThan(0)
    expect(water.y).toBeLessThan(home.y)
    expect(lava.x).toBeGreaterThan(home.x)
    expect(rain.y).toBeGreaterThan(home.y)
  })

  it('lists home plus unlocked plots as features', () => {
    const locked = mapFeatures(0)
    expect(locked.islands.some((i) => i.id === 'home')).toBe(true)
    expect(locked.islands.filter((i) => i.locked).length).toBe(3)

    const open = mapFeatures(RAINFOREST_UNLOCK_INDEX)
    expect(open.islands.some((i) => i.id === 'water-hub' && !i.locked)).toBe(true)
    expect(open.islands.some((i) => i.id === 'lava-hub' && !i.locked)).toBe(true)
    expect(open.islands.some((i) => i.id === 'rainforest-hub' && !i.locked)).toBe(true)
    expect(open.bridges.length).toBe(3)
  })
})
