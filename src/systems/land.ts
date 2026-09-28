/** Home island never grows — upgrades unlock whole new islands instead. */
import { nextPlot } from './plots'

export const BASE_ISLAND_SIZE = 36
/** @deprecated infinite land — kept for older imports; always treat as unbounded. */
export const MAX_LAND_TIER = Number.POSITIVE_INFINITY
export const LAND_UPGRADE_BASE_COST = 50
export const LAND_UPGRADE_COST_STEP = 50

export function islandSize(_landTier = 0): number {
  return BASE_ISLAND_SIZE
}

export function playableHalf(_landTier = 0): number {
  return BASE_ISLAND_SIZE / 2 - 1.5
}

/** Cost to buy the next plot when you already own `landTier` plots. Always available. */
export function landUpgradeCost(landTier: number): number {
  return LAND_UPGRADE_BASE_COST + landTier * LAND_UPGRADE_COST_STEP
}

export type BuyLandResult =
  | { ok: true; money: number; landTier: number }
  | { ok: false; reason: 'merchant-gone' | 'not-enough-money' }

export function buyLandFromMerchant(
  money: number,
  landTier: number,
  merchantPresent: boolean,
): BuyLandResult {
  if (!merchantPresent) return { ok: false, reason: 'merchant-gone' }
  const cost = landUpgradeCost(landTier)
  if (money < cost) return { ok: false, reason: 'not-enough-money' }
  return { ok: true, money: money - cost, landTier: landTier + 1 }
}

export function landUpgradeLabel(landTier: number): string {
  return nextPlot(landTier).label
}
