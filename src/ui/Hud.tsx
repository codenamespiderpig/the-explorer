import { useEffect, useRef } from 'react'
import { useInventoryStore } from '../stores/inventoryStore'
import { useGameStore } from '../stores/gameStore'
import { effectiveMaxHealth } from '../systems/health'
import { Backpack } from './Backpack'
import { Merchant } from './Merchant'
import { useUiStore } from '../stores/uiStore'

export function Hud() {
  const wood = useInventoryStore((s) => s.items.wood ?? 0)
  const stone = useInventoryStore((s) => s.items.stone ?? 0)
  const goop = useInventoryStore((s) => s.items['slime-goop'] ?? 0)
  const hint = useInventoryStore((s) => s.hint)
  const setHint = useInventoryStore((s) => s.setHint)
  const phase = useGameStore((s) => s.dayNight.phase)
  const elapsed = useGameStore((s) => s.dayNight.elapsed)
  const money = useGameStore((s) => s.money)
  const health = useGameStore((s) => s.health)
  const countdown = useGameStore((s) => s.nightCountdownLabel())
  const toggleMerchant = useUiStore((s) => s.toggleMerchant)
  const setMerchantOpen = useUiStore((s) => s.setMerchantOpen)
  const prevPhase = useRef(phase)
  // re-subscribe when elapsed changes so countdown text updates
  void elapsed

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'KeyM' || e.repeat) return
      if (useGameStore.getState().dayNight.phase !== 'day') {
        setHint('The traveling merchant only visits during the day')
        return
      }
      toggleMerchant()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleMerchant, setHint])

  useEffect(() => {
    if (prevPhase.current === 'night' && phase === 'day') {
      setHint('Traveling merchant arrived — press M to trade')
    }
    if (prevPhase.current === 'day' && phase === 'night') {
      setMerchantOpen(false)
      setHint('Merchant left — slimes are hunting')
    }
    prevPhase.current = phase
  }, [phase, setHint, setMerchantOpen])

  const max = effectiveMaxHealth(health)
  const hpPct = Math.max(0, (health.current / max) * 100)

  return (
    <div id="hud">
      <div className="hud-panel">
        <div className="hud-title">Resources</div>
        <div>Money: {money}</div>
        <div>Wood: {wood}</div>
        <div>Stone: {stone}</div>
        <div>Slime Goop: {goop}</div>
        <div className="hud-tools">
          Q backpack · M merchant (day) · G gate · C slime castle
        </div>
      </div>

      <div className="hud-panel hud-time">
        <div className="hud-title">{phase === 'day' ? 'Daytime' : 'Night'}</div>
        <div className={phase === 'night' ? 'hud-danger' : ''}>{countdown}</div>
        {phase === 'day' ? (
          <div className="hud-tools">Traveling merchant is here</div>
        ) : (
          <div className="hud-tools">Slimes are hunting you</div>
        )}
      </div>

      <div className="hud-panel hud-health">
        <div className="hud-title">Health</div>
        <div className="hp-bar">
          <div className="hp-fill" style={{ width: `${hpPct}%` }} />
        </div>
        <div>
          {Math.ceil(health.current)} / {max}
        </div>
        <div className="hud-tools">F attack</div>
      </div>

      {hint ? <div className="hud-hint">{hint}</div> : null}
      <Backpack />
      <Merchant />
    </div>
  )
}
