import { useEffect, useRef } from 'react'
import { useInventoryStore } from '../stores/inventoryStore'
import { useGameStore } from '../stores/gameStore'
import { effectiveMaxHealth } from '../systems/health'
import { FISH_HEAL_AMOUNT } from '../systems/heal'
import { isMerchantVisiting } from '../systems/merchant'
import { lavaUnlocked, nextPlot, rainforestUnlocked, waterUnlocked } from '../systems/plots'
import { DUNGEON_COINS_REQUIRED } from '../systems/dungeon'
import { RELIC_ARMOUR_BONUS } from '../systems/relic'
import { Backpack } from './Backpack'
import { Merchant } from './Merchant'
import { Minimap } from './Minimap'
import { useUiStore } from '../stores/uiStore'

const WORLD_HINT: Record<string, string> = {
  home: 'somewhere on the home island',
  water: 'somewhere in the water world',
  lava: 'somewhere in the lava world',
  rainforest: 'somewhere in the rainforest',
}

export function Hud() {
  const wood = useInventoryStore((s) => s.items.wood ?? 0)
  const stone = useInventoryStore((s) => s.items.stone ?? 0)
  const goop = useInventoryStore((s) => s.items['slime-goop'] ?? 0)
  const fish = useInventoryStore((s) => s.items.fish ?? 0)
  const relics = useInventoryStore((s) => s.items['dungeon-relic'] ?? 0)
  const hint = useInventoryStore((s) => s.hint)
  const setHint = useInventoryStore((s) => s.setHint)
  const phase = useGameStore((s) => s.dayNight.phase)
  const elapsed = useGameStore((s) => s.dayNight.elapsed)
  const money = useGameStore((s) => s.money)
  const landTier = useGameStore((s) => s.landTier)
  const health = useGameStore((s) => s.health)
  const inDungeon = useGameStore((s) => s.inDungeon)
  const dungeonCoins = useGameStore((s) => s.dungeonCoinsCollected)
  const dungeonChestUnlocked = useGameStore((s) => s.dungeonChestUnlocked)
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
        <div>Fish: {fish}</div>
        <div>Dungeon Relics: {relics}</div>
        {relics > 0 ? (
          <div className="hud-tools">Press T — spend relic (+{RELIC_ARMOUR_BONUS} max HP)</div>
        ) : null}
        <div className="hud-tools">
          Q backpack · M merchant · G place · R eat fish · T relic · click map · E dungeon
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
        {waterUnlocked(landTier) ? (
          <div className="hud-tools">Water Island unlocked — follow the north path</div>
        ) : (
          <div className="hud-tools">Next land: {nextPlot(landTier).label}</div>
        )}
        {lavaUnlocked(landTier) ? (
          <div className="hud-tools">Lava Island unlocked — follow the east path</div>
        ) : waterUnlocked(landTier) ? (
          <div className="hud-tools">Keep buying land to reach the Lava Island</div>
        ) : null}
        {rainforestUnlocked(landTier) ? (
          <div className="hud-tools">Rainforest unlocked — follow the south path</div>
        ) : lavaUnlocked(landTier) ? (
          <div className="hud-tools">Keep buying land to reach the Rainforest</div>
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
        <div className="hud-tools">F attack · R eat fish (+{FISH_HEAL_AMOUNT} HP)</div>
      </div>

      {inDungeon ? (
        <div className="hud-dungeon-controls" aria-live="polite">
          <div className="hud-dungeon-controls-title">Dungeon</div>
          <div className="hud-dungeon-row">
            <kbd className="hud-key">F</kbd>
            <span>Fight 5 mobs</span>
          </div>
          <div className="hud-dungeon-row">
            <kbd className="hud-key">E</kbd>
            <span>
              Claim gold coins {dungeonCoins.length}/{DUNGEON_COINS_REQUIRED}
              {dungeonChestUnlocked ? ' · then open chest' : ' (by the chest)'}
            </span>
          </div>
        </div>
      ) : null}

      {hint ? <div className="hud-hint">{hint}</div> : null}
      <Minimap />
      <Backpack />
      <Merchant />
    </div>
  )
}
