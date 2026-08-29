import { useEffect, useRef } from 'react'
import { useInventoryStore } from '../stores/inventoryStore'
import { useGameStore } from '../stores/gameStore'
import { effectiveMaxHealth } from '../systems/health'
import { isMerchantVisiting } from '../systems/merchant'
import { Backpack } from './Backpack'
import { Merchant } from './Merchant'
import { useUiStore } from '../stores/uiStore'

const WORLD_HINT: Record<string, string> = {
  home: 'somewhere on the home island',
  water: 'somewhere in the water world',
  lava: 'somewhere in the lava world',
}

export function Hud() {
  const wood = useInventoryStore((s) => s.items.wood ?? 0)
  const stone = useInventoryStore((s) => s.items.stone ?? 0)
  const goop = useInventoryStore((s) => s.items['slime-goop'] ?? 0)
  const hint = useInventoryStore((s) => s.hint)
  const setHint = useInventoryStore((s) => s.setHint)
  const phase = useGameStore((s) => s.dayNight.phase)
  const elapsed = useGameStore((s) => s.dayNight.elapsed)
  const money = useGameStore((s) => s.money)
  const landTier = useGameStore((s) => s.landTier)
  const health = useGameStore((s) => s.health)
  const merchantTimeLeft = useGameStore((s) => s.merchantTimeLeft)
  const merchantWorld = useGameStore((s) => s.merchantWorld)
  const merchantCountdown = useGameStore((s) => s.merchantCountdownLabel())
  const countdown = useGameStore((s) => s.nightCountdownLabel())
  const toggleMerchant = useUiStore((s) => s.toggleMerchant)
  const setMerchantOpen = useUiStore((s) => s.setMerchantOpen)
  const prevPhase = useRef(phase)
  const prevMerchantLeft = useRef(merchantTimeLeft)
  void elapsed

  const merchantHere = isMerchantVisiting(merchantTimeLeft)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'KeyM' || e.repeat) return
      if (!isMerchantVisiting(useGameStore.getState().merchantTimeLeft)) {
        setHint('The merchant only stays 90 seconds at dawn — find them next morning')
        return
      }
      toggleMerchant()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleMerchant, setHint])

  useEffect(() => {
    if (prevPhase.current === 'night' && phase === 'day') {
      const world = useGameStore.getState().merchantWorld
      setHint(
        `Merchant is hiding ${WORLD_HINT[world] ?? 'nearby'} — 1:30 to trade (M)`,
      )
    }
    if (prevPhase.current === 'day' && phase === 'night') {
      setMerchantOpen(false)
      setHint('Merchant left — slimes are hunting')
    }
    prevPhase.current = phase
  }, [phase, setHint, setMerchantOpen])

  useEffect(() => {
    if (
      prevMerchantLeft.current > 0 &&
      merchantTimeLeft <= 0 &&
      phase === 'day'
    ) {
      setMerchantOpen(false)
      setHint('The merchant packed up — come back tomorrow at dawn')
    }
    prevMerchantLeft.current = merchantTimeLeft
  }, [merchantTimeLeft, phase, setHint, setMerchantOpen])

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
          Q backpack · M merchant · G gate · C castle
        </div>
      </div>

      <div className="hud-panel hud-time">
        <div className="hud-title">{phase === 'day' ? 'Daytime' : 'Night'}</div>
        <div className={phase === 'night' ? 'hud-danger' : ''}>{countdown}</div>
        {merchantHere ? (
          <div className="hud-tools">
            Merchant nearby? {merchantCountdown} · check {WORLD_HINT[merchantWorld]}
          </div>
        ) : phase === 'day' ? (
          <div className="hud-tools">Merchant already left today</div>
        ) : (
          <div className="hud-tools">Slimes are hunting you</div>
        )}
        {landTier >= 1 ? (
          <div className="hud-tools">Water Island: long blue pier north</div>
        ) : (
          <div className="hud-tools">Buy land to unlock the distant Water Island</div>
        )}
        {landTier >= 2 ? (
          <div className="hud-tools">Lava Island: long orange pier east</div>
        ) : landTier >= 1 ? (
          <div className="hud-tools">Buy land again to unlock the Lava Island</div>
        ) : null}
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
