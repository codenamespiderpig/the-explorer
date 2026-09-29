import { describe, expect, it } from 'vitest'
import {
  DUNGEON_CHEST_LOOT,
  DUNGEON_COIN_MONEY,
  DUNGEON_COINS_REQUIRED,
  DUNGEON_COIN_POSITIONS,
  DUNGEON_ENTRANCE,
  DUNGEON_MIN_LAND_TIER,
  DUNGEON_MOB_POSITIONS,
  DUNGEON_SPAWN,
  canEnterDungeon,
  canOpenDungeonChest,
  canUnlockDungeonChest,
  collectDungeonCoin,
  completeDungeonOnExit,
  dungeonChestReward,
  isNearDungeonChest,
  isNearDungeonCoin,
  isNearDungeonEntrance,
  isNearDungeonPortal,
  shouldHideDungeonEntrance,
} from '../src/systems/dungeon'

describe('dungeon', () => {
  it('is open from the start of the game', () => {
    expect(canEnterDungeon(0)).toBe(true)
    expect(canEnterDungeon(DUNGEON_MIN_LAND_TIER)).toBe(true)
    expect(DUNGEON_MIN_LAND_TIER).toBe(0)
  })

  it('disappears after completion — cannot re-enter', () => {
    expect(canEnterDungeon(0, false)).toBe(true)
    expect(canEnterDungeon(0, true)).toBe(false)
    expect(shouldHideDungeonEntrance(true)).toBe(true)
    expect(shouldHideDungeonEntrance(false)).toBe(false)
    expect(completeDungeonOnExit(true)).toBe(true)
    expect(completeDungeonOnExit(false)).toBe(false)
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
    expect(isNearDungeonChest(0, 30)).toBe(true)
    expect(isNearDungeonPortal(0, 34)).toBe(true)
  })

  it('rewards dungeon relics from the chest', () => {
    expect(dungeonChestReward()).toEqual(DUNGEON_CHEST_LOOT)
    expect(DUNGEON_CHEST_LOOT.item).toBe('dungeon-relic')
    expect(DUNGEON_CHEST_LOOT.amount).toBeGreaterThan(0)
  })

  it('requires two coins before the chest unlocks', () => {
    expect(DUNGEON_COINS_REQUIRED).toBe(2)
    expect(DUNGEON_COIN_MONEY).toBe(20)
    expect(DUNGEON_COIN_POSITIONS).toHaveLength(2)
    expect(canUnlockDungeonChest(0)).toBe(false)
    expect(canUnlockDungeonChest(1)).toBe(false)
    expect(canUnlockDungeonChest(2)).toBe(true)
  })

  it('spawns five dungeon mobs along the hall', () => {
    expect(DUNGEON_MOB_POSITIONS).toHaveLength(5)
  })

  it('collects each coin once and unlocks at two', () => {
    let collected: number[] = []
    const first = collectDungeonCoin(collected, 0)
    expect(first.ok).toBe(true)
    if (!first.ok) return
    collected = first.collected
    expect(collected).toEqual([0])
    expect(first.unlocked).toBe(false)

    const again = collectDungeonCoin(collected, 0)
    expect(again.ok).toBe(false)

    const second = collectDungeonCoin(collected, 1)
    expect(second.ok).toBe(true)
    if (!second.ok) return
    expect(second.collected).toEqual([0, 1])
    expect(second.unlocked).toBe(true)
  })

  it('only opens the chest after coins unlock it', () => {
    expect(canOpenDungeonChest(false, false)).toBe(false)
    expect(canOpenDungeonChest(true, false)).toBe(true)
    expect(canOpenDungeonChest(true, true)).toBe(false)
  })

  it('detects coin pickup spots', () => {
    const [cx, , cz] = DUNGEON_COIN_POSITIONS[0]!
    expect(isNearDungeonCoin(cx, cz, 0)).toBe(true)
    expect(isNearDungeonCoin(0, 0, 0)).toBe(false)
  })
})
