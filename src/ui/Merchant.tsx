import { useEffect } from 'react'
import { ITEMS, type ItemId } from '../data/items'
import {
  COMMON_MERCHANT_PRICE,
  RARE_MERCHANT_PRICE,
  isMerchantSellable,
  merchantPrice,
  sellToMerchant,
} from '../systems/economy'
import { landUpgradeCost, MAX_LAND_TIER } from '../systems/land'
import { useInventoryStore } from '../stores/inventoryStore'
import { useGameStore } from '../stores/gameStore'
import { useUiStore } from '../stores/uiStore'

function SellRow({ item, count }: { item: ItemId; count: number }) {
  const items = useInventoryStore((s) => s.items)
  const setItems = useInventoryStore((s) => s.setItems)
  const setHint = useInventoryStore((s) => s.setHint)
  const money = useGameStore((s) => s.money)
  const setMoney = (next: number) => useGameStore.setState({ money: next })
  const merchantPresent = useGameStore((s) => s.merchantPresent())

  const price = merchantPrice(item) ?? 0
  const sell = (qty: number) => {
    const result = sellToMerchant(items, money, item, qty, merchantPresent)
    if (!result.ok) {
      setHint(
        result.reason === 'merchant-gone'
          ? 'The merchant left at nightfall'
          : 'Cannot sell that',
      )
      return
    }
    setItems(result.items)
    setMoney(result.money)
    setHint(`Sold ${qty} ${ITEMS[item].name} for ${result.moneyGained} money`)
  }

  return (
    <li className="bp-row">
      <div>
        <div className="bp-row-name">
          {ITEMS[item].name} ×{count}
        </div>
        <div className="bp-row-meta">{price} money each</div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button type="button" className="bp-btn" onClick={() => sell(1)}>
          Sell 1
        </button>
        <button type="button" className="bp-btn" onClick={() => sell(count)}>
          All
        </button>
      </div>
    </li>
  )
}

export function Merchant() {
  const open = useUiStore((s) => s.merchantOpen)
  const setOpen = useUiStore((s) => s.setMerchantOpen)
  const items = useInventoryStore((s) => s.items)
  const setHint = useInventoryStore((s) => s.setHint)
  const money = useGameStore((s) => s.money)
  const landTier = useGameStore((s) => s.landTier)
  const merchantPresent = useGameStore((s) => s.merchantPresent())
  const merchantCountdown = useGameStore((s) => s.merchantCountdownLabel())
  const buyLand = useGameStore((s) => s.buyLand)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  if (!open) return null

  const sellable = (Object.entries(items) as [ItemId, number][])
    .filter(([id, n]) => n > 0 && isMerchantSellable(id))
    .sort(([a], [b]) => a.localeCompare(b))

  const nextLandCost = landUpgradeCost(landTier)
  const atMaxLand = landTier >= MAX_LAND_TIER

  const tryBuyLand = () => {
    if (!merchantPresent) {
      setHint('The merchant only sells land during the day')
      return
    }
    if (buyLand()) {
      const next = landTier + 1
      setHint(
        next === 1
          ? 'Water world unlocked — walk north through the blue arch'
          : next === 2
            ? 'Lava world unlocked — walk east through the orange arch'
            : `Bought land — island expanded (tier ${next})`,
      )
    } else if (atMaxLand) {
      setHint('No more land to buy here')
    } else {
      setHint(`Need ${nextLandCost} money for the next land upgrade`)
    }
  }

  return (
    <div className="bp-overlay" onClick={() => setOpen(false)}>
      <div className="bp-panel" onClick={(e) => e.stopPropagation()}>
        <div className="bp-header">
          <h2>Traveling Merchant</h2>
          <button type="button" className="bp-close" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>

        <div className="bp-section">
          <div className="bp-row-meta">
            Your money: <strong>{money}</strong>
            {merchantPresent
              ? ` · Merchant leaving in ${merchantCountdown}`
              : ' · Merchant has left'}
          </div>
          <div className="bp-row-meta" style={{ marginTop: 6 }}>
            Wood & stone: {COMMON_MERCHANT_PRICE} money · Rarer items: {RARE_MERCHANT_PRICE}{' '}
            money
          </div>
        </div>

        <div className="bp-section">
          <div className="bp-section-title">Buy land</div>
          <div className="bp-row">
            <div>
              <div className="bp-row-name">Expand island</div>
              <div className="bp-row-meta">
                {atMaxLand
                  ? 'Island fully expanded'
                  : landTier === 0
                    ? `Cost: ${nextLandCost} money · Unlocks water world`
                    : landTier === 1
                      ? `Cost: ${nextLandCost} money · Unlocks lava world`
                      : `Cost: ${nextLandCost} money · Expands home island`}
              </div>
            </div>
            <button
              type="button"
              className="bp-btn"
              disabled={!merchantPresent || atMaxLand || money < (nextLandCost ?? Infinity)}
              onClick={tryBuyLand}
            >
              Buy land
            </button>
          </div>
        </div>

        <div className="bp-section">
          <div className="bp-section-title">Sell items</div>
          {sellable.length === 0 ? (
            <div className="bp-row-meta">Nothing to sell — gather wood or stone first</div>
          ) : (
            <ul className="bp-list">
              {sellable.map(([id, n]) => (
                <SellRow key={id} item={id} count={n} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
