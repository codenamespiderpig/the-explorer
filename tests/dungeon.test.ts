import { describe, expect, it } from 'vitest'
import {
  DUNGEON_CHEST_LOOT,
  DUNGEON_ENTRANCE,
  DUNGEON_MIN_LAND_TIER,
  DUNGEON_SPAWN,
  canEnterDungeon,
  dungeonChestReward,
  isNearDungeonChest,
  isNearDungeonEntrance,
  isNearDungeonPortal,
} from '../src/systems/dungeon'

describe('dungeon', () => {
  it('unlocks after the first land purchase', () => {
    expect(canEnterDungeon(0)).toBe(false)
    expect(canEnterDungeon(DUNGEON_MIN_LAND_TIER)).toBe(true)
    expect(DUNGEON_MIN_LAND_TIER).toBe(1)
  })

  it('detects standing at the home entrance stairs', () => {
    const [ex, , ez] = DUNGEON_ENTRANCE
    expect(isNearDungeonEntrance(ex, ez)).toBe(true)
    expect(isNearDungeonEntrance(0, 0)).toBe(false)
  })

  it('places the dungeon spawn away from the overworld', () => {
    expect(DUNGEON_SPAWN[1]).toBeLessThan(-10)
  })

  it('detects chest and portal spots inside the dungeon', () => {
    expect(isNearDungeonChest(0, 0)).toBe(false)
    expect(isNearDungeonChest(0, 28)).toBe(true)
    expect(isNearDungeonPortal(0, 32)).toBe(true)
  })

  it('rewards dungeon relics from the chest', () => {
    expect(dungeonChestReward()).toEqual(DUNGEON_CHEST_LOOT)
    expect(DUNGEON_CHEST_LOOT.item).toBe('dungeon-relic')
    expect(DUNGEON_CHEST_LOOT.amount).toBeGreaterThan(0)
  })
})
