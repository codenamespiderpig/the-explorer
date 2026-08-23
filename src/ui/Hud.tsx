import { useInventoryStore } from '../stores/inventoryStore'
import { useGameStore } from '../stores/gameStore'
import { effectiveMaxHealth } from '../systems/health'
import { Backpack } from './Backpack'

export function Hud() {
  const wood = useInventoryStore((s) => s.items.wood ?? 0)
  const stone = useInventoryStore((s) => s.items.stone ?? 0)
  const hint = useInventoryStore((s) => s.hint)
  const phase = useGameStore((s) => s.dayNight.phase)
  const elapsed = useGameStore((s) => s.dayNight.elapsed)
  const health = useGameStore((s) => s.health)
  const countdown = useGameStore((s) => s.nightCountdownLabel())
  // re-subscribe when elapsed changes so countdown text updates
  void elapsed

  const max = effectiveMaxHealth(health)
  const hpPct = Math.max(0, (health.current / max) * 100)

  return (
    <div id="hud">
      <div className="hud-panel">
        <div className="hud-title">Resources</div>
        <div>Wood: {wood}</div>
        <div>Stone: {stone}</div>
        <div className="hud-tools">Q backpack · G place gate</div>
      </div>

      <div className="hud-panel hud-time">
        <div className="hud-title">{phase === 'day' ? 'Daytime' : 'Night'}</div>
        <div className={phase === 'night' ? 'hud-danger' : ''}>{countdown}</div>
        {phase === 'night' ? <div className="hud-tools">Slimes are hunting you</div> : null}
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
    </div>
  )
}
