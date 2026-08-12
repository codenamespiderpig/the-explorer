import { useInventoryStore } from '../stores/inventoryStore'
import { Backpack } from './Backpack'

export function Hud() {
  const wood = useInventoryStore((s) => s.items.wood ?? 0)
  const stone = useInventoryStore((s) => s.items.stone ?? 0)
  const hint = useInventoryStore((s) => s.hint)

  return (
    <div id="hud">
      <div className="hud-panel">
        <div className="hud-title">Resources</div>
        <div>Wood: {wood}</div>
        <div>Stone: {stone}</div>
        <div className="hud-tools">Press Q for backpack</div>
      </div>
      {hint ? <div className="hud-hint">{hint}</div> : null}
      <Backpack />
    </div>
  )
}
