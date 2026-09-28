import { useEffect } from 'react'
import { ITEMS, type ItemId } from '../data/items'
import {
  COMMON_MERCHANT_PRICE,
  RARE_MERCHANT_PRICE,
  isMerchantSellable,
  merchantPrice,
  sellToMerchant,
} from '../systems/economy'
import { landUpgradeCost, landUpgradeLabel } from '../systems/land'
import { nextPlot } from '../systems/plots'
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

  const tryBuyLand = () => {
    if (!merchantPresent) {
      setHint('The merchant only sells land during the day')
      return
    }
    if (buyLand()) {
      setHint(`${nextPlot(landTier).label.replace('Unlock', 'Unlocked')}!`)
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
              <div className="bp-row-name">New island</div>
              <div className="bp-row-meta">
                {`${landUpgradeLabel(landTier)} · ${nextLandCost} money`}
              </div>
            </div>
            <button
              type="button"
              className="bp-btn"
              disabled={!merchantPresent || money < nextLandCost}
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
