/** First dungeon — stairs on home land, fight + short platforming, chest, portal home. */

import type { ItemId } from '../data/items'

export const DUNGEON_MIN_LAND_TIER = 0

/** Glowing stairs on the home grassland (south-east clearing). */
export const DUNGEON_ENTRANCE: [number, number, number] = [11, 0, -6]

/** Player spawn inside the dungeon (above the entry floor so you don't fall through). */
export const DUNGEON_SPAWN: [number, number, number] = [0, -42.5, 0]

export const DUNGEON_HOME_SPAWN: [number, number, number] = [0, 3, 0]

export const DUNGEON_FALL_Y = -58

export const DUNGEON_INTERACT_RADIUS = 4.5

/** Chest sits on the end platform. */
export const DUNGEON_CHEST: [number, number, number] = [0, -42.5, 28]

/** Portal appears beside the chest after it is opened. */
export const DUNGEON_PORTAL: [number, number, number] = [3.5, -42.5, 31]

export const DUNGEON_CHEST_LOOT: { item: ItemId; amount: number } = {
  item: 'dungeon-relic',
  amount: 3,
}

export const DUNGEON_MOB_POSITIONS: Array<[number, number, number]> = [
  [0, -42.9, 16],
  [1.5, -42.9, 24],
]

/** Damage dealt by dungeon enemies (lighter than night slimes). */
export const DUNGEON_ENEMY_DAMAGE = 4
export const DUNGEON_ENEMY_COOLDOWN = 1.5
export const DUNGEON_ENEMY_SPEED = 1.45

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
