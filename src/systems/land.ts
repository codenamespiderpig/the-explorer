/** Home island never grows — upgrades unlock whole new islands instead. */
export const BASE_ISLAND_SIZE = 36
export const MAX_LAND_TIER = 2
export const LAND_UPGRADE_COSTS = [50, 100] as const

export function islandSize(_landTier = 0): number {
  return BASE_ISLAND_SIZE
}

export function playableHalf(_landTier = 0): number {
  return BASE_ISLAND_SIZE / 2 - 1.5
}

export function landUpgradeCost(landTier: number): number | null {
  if (landTier >= MAX_LAND_TIER) return null
  return LAND_UPGRADE_COSTS[landTier] ?? null
}

export type BuyLandResult =
  | { ok: true; money: number; landTier: number }
  | { ok: false; reason: 'merchant-gone' | 'max-tier' | 'not-enough-money' }

export function buyLandFromMerchant(
  money: number,
  landTier: number,
  merchantPresent: boolean,
): BuyLandResult {
  if (!merchantPresent) return { ok: false, reason: 'merchant-gone' }
  const cost = landUpgradeCost(landTier)
  if (cost === null) return { ok: false, reason: 'max-tier' }
  if (money < cost) return { ok: false, reason: 'not-enough-money' }
  return { ok: true, money: money - cost, landTier: landTier + 1 }
}

export function landUpgradeLabel(landTier: number): string {
  if (landTier >= MAX_LAND_TIER) return 'All islands unlocked'
  if (landTier === 0) return 'Unlock the Water Island (north)'
  return 'Unlock the Lava Island (east)'
}
