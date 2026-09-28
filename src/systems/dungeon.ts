/** First dungeon — stairs on home land, fight + short platforming, chest, portal home. */

import type { ItemId } from '../data/items'

export const DUNGEON_MIN_LAND_TIER = 1

/** Glowing stairs on the home grassland (south-east clearing). */
export const DUNGEON_ENTRANCE: [number, number, number] = [11, 0, -6]

/** Player spawn inside the dungeon. */
export const DUNGEON_SPAWN: [number, number, number] = [0, -44, 0]

export const DUNGEON_HOME_SPAWN: [number, number, number] = [0, 3, 0]

export const DUNGEON_FALL_Y = -58

export const DUNGEON_INTERACT_RADIUS = 2.6

/** Chest sits near the end of the platform run. */
export const DUNGEON_CHEST: [number, number, number] = [0, -44, 28]

/** Portal appears beside the chest after it is opened. */
export const DUNGEON_PORTAL: [number, number, number] = [0, -44, 32]

export const DUNGEON_CHEST_LOOT: { item: ItemId; amount: number } = {
  item: 'dungeon-relic',
  amount: 2,
}

export const DUNGEON_MOB_POSITIONS: Array<[number, number, number]> = [
  [0, -43.55, 10],
  [2.2, -43.55, 18],
  [-2.2, -43.55, 22],
]

export function canEnterDungeon(landTier: number): boolean {
  return landTier >= DUNGEON_MIN_LAND_TIER
}

export function isNearDungeonEntrance(x: number, z: number): boolean {
  return Math.hypot(x - DUNGEON_ENTRANCE[0], z - DUNGEON_ENTRANCE[2]) <= DUNGEON_INTERACT_RADIUS
}

export function isNearDungeonChest(x: number, z: number): boolean {
  return Math.hypot(x - DUNGEON_CHEST[0], z - DUNGEON_CHEST[2]) <= DUNGEON_INTERACT_RADIUS
}

export function isNearDungeonPortal(x: number, z: number): boolean {
  return Math.hypot(x - DUNGEON_PORTAL[0], z - DUNGEON_PORTAL[2]) <= DUNGEON_INTERACT_RADIUS
}

export function dungeonChestReward(): { item: ItemId; amount: number } {
  return { ...DUNGEON_CHEST_LOOT }
}
