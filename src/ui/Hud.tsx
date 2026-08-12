import { useInventoryStore } from '../stores/inventoryStore'

export function Hud() {
  const wood = useInventoryStore((s) => s.items.wood ?? 0)
  const stone = useInventoryStore((s) => s.items.stone ?? 0)
  const tools = useInventoryStore((s) => s.tools)
  const hint = useInventoryStore((s) => s.hint)

  return (
    <div id="hud">
      <div className="hud-panel">
        <div className="hud-title">Inventory</div>
        <div>Wood: {wood}</div>
        <div>Stone: {stone}</div>
        <div className="hud-tools">Tools: {tools.map((t) => t.replace('wooden-', '')).join(', ')}</div>
      </div>
      {hint ? <div className="hud-hint">{hint}</div> : null}
    </div>
  )
}
