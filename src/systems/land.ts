export const BASE_ISLAND_SIZE = 36
export const ISLAND_GROWTH_PER_TIER = 8
export const MAX_LAND_TIER = 3
export const LAND_UPGRADE_COSTS = [50, 100, 150] as const

export function islandSize(landTier: number): number {
  return BASE_ISLAND_SIZE + landTier * ISLAND_GROWTH_PER_TIER
}

export function playableHalf(landTier: number): number {
  return islandSize(landTier) / 2 - 1.5
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
