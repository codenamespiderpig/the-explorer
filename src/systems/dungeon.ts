/** First dungeon — stairs on home land, fight + coin minigame, chest, portal home. */

import type { ItemId } from '../data/items'

export const DUNGEON_MIN_LAND_TIER = 0

/** Glowing stairs on the home grassland (south-east clearing). */
export const DUNGEON_ENTRANCE: [number, number, number] = [11, 0, -6]

/** Player spawn inside the dungeon (above the entry floor so you don't fall through). */
export const DUNGEON_SPAWN: [number, number, number] = [0, -42.5, 0]

export const DUNGEON_HOME_SPAWN: [number, number, number] = [0, 3, 0]

export const DUNGEON_FALL_Y = -58

export const DUNGEON_INTERACT_RADIUS = 4.5

export const DUNGEON_COIN_PICKUP_RADIUS = 2.2

export const DUNGEON_COINS_REQUIRED = 2

/** Gold coins to claim at the end before the chest unlocks. */
export const DUNGEON_COIN_POSITIONS: Array<[number, number, number]> = [
  [-2.4, -42.2, 26.5],
  [2.4, -42.2, 29.2],
]

/** Chest sits on the end platform. */
export const DUNGEON_CHEST: [number, number, number] = [0, -42.5, 28]

/** Portal appears beside the chest after it is opened. */
export const DUNGEON_PORTAL: [number, number, number] = [3.5, -42.5, 31]

export const DUNGEON_CHEST_LOOT: { item: ItemId; amount: number } = {
  item: 'dungeon-relic',
  amount: 3,
}

/** Little dungeon mobs along the run. */
export const DUNGEON_MOB_POSITIONS: Array<[number, number, number]> = [
  [-1.2, -42.9, 8],
  [1.5, -42.9, 13],
  [0, -42.9, 18],
  [2, -42.9, 22],
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

export function isNearDungeonCoin(x: number, z: number, coinIndex: number): boolean {
  const coin = DUNGEON_COIN_POSITIONS[coinIndex]
  if (!coin) return false
  return Math.hypot(x - coin[0], z - coin[2]) <= DUNGEON_COIN_PICKUP_RADIUS
}

export function nearestDungeonCoinIndex(
  x: number,
  z: number,
  alreadyCollected: readonly number[],
): number | null {
  let best: number | null = null
  let bestDist = DUNGEON_COIN_PICKUP_RADIUS
  for (let i = 0; i < DUNGEON_COIN_POSITIONS.length; i += 1) {
    if (alreadyCollected.includes(i)) continue
    const coin = DUNGEON_COIN_POSITIONS[i]!
    const dist = Math.hypot(x - coin[0], z - coin[2])
    if (dist <= bestDist) {
      bestDist = dist
      best = i
    }
  }
  return best
}

export function canUnlockDungeonChest(coinsCollected: number): boolean {
  return coinsCollected >= DUNGEON_COINS_REQUIRED
}

export function canOpenDungeonChest(unlocked: boolean, alreadyOpened: boolean): boolean {
  return unlocked && !alreadyOpened
}

export type CollectCoinResult =
  | { ok: true; collected: number[]; unlocked: boolean }
  | { ok: false; reason: 'already-collected' | 'invalid-coin' }

export function collectDungeonCoin(
  alreadyCollected: readonly number[],
  coinIndex: number,
): CollectCoinResult {
  if (coinIndex < 0 || coinIndex >= DUNGEON_COIN_POSITIONS.length) {
    return { ok: false, reason: 'invalid-coin' }
  }
  if (alreadyCollected.includes(coinIndex)) {
    return { ok: false, reason: 'already-collected' }
  }
  const collected = [...alreadyCollected, coinIndex]
  return {
    ok: true,
    collected,
    unlocked: canUnlockDungeonChest(collected.length),
  }
}

export function dungeonChestReward(): { item: ItemId; amount: number } {
  return { ...DUNGEON_CHEST_LOOT }
}
