import { useEffect, useMemo } from 'react'
import { useGameStore } from '../stores/gameStore'
import { useUiStore } from '../stores/uiStore'
import { mapFeatures, worldToMap } from '../systems/worldMap'

const BIOME_FILL: Record<string, string> = {
  grass: '#6faf4a',
  water: '#3aa0d8',
  lava: '#c45a28',
}

const BIOME_LOCKED: Record<string, string> = {
  grass: '#9ab889',
  water: '#8bb8d0',
  lava: '#c49a88',
}

function MapSchematic({
  size,
  showLabels,
}: {
  size: number
  showLabels: boolean
}) {
  const landTier = useGameStore((s) => s.landTier)
  const playerPos = useGameStore((s) => s.playerPos)
  const features = useMemo(() => mapFeatures(landTier), [landTier])
  const { bounds } = features
  const span = Math.max(bounds.maxX - bounds.minX, bounds.maxZ - bounds.minZ, 1)

  const player = worldToMap(playerPos[0], playerPos[2], bounds, size)

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="world-map-svg"
      aria-hidden={!showLabels}
    >
      <rect width={size} height={size} className="world-map-ocean" />
      {features.bridges.map((bridge) => {
        const a = worldToMap(bridge.from[0], bridge.from[2], bounds, size)
        const b = worldToMap(bridge.to[0], bridge.to[2], bounds, size)
        return (
          <line
            key={bridge.id}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            className={
              bridge.biome === 'water' ? 'world-map-bridge-water' : 'world-map-bridge-lava'
            }
          />
        )
      })}
      {features.islands.map((island) => {
        const c = worldToMap(island.center[0], island.center[2], bounds, size)
        const half = (island.size / span) * (size * 0.88) * 0.5
        const fill = island.locked
          ? BIOME_LOCKED[island.biome]
          : BIOME_FILL[island.biome]
        return (
          <g key={island.id}>
            <rect
              x={c.x - half}
              y={c.y - half}
              width={half * 2}
              height={half * 2}
              rx={Math.max(2, half * 0.12)}
              fill={fill}
              opacity={island.locked ? 0.35 : 0.92}
              stroke={island.locked ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.35)'}
              strokeWidth={1}
              strokeDasharray={island.locked ? '4 3' : undefined}
            />
            {showLabels ? (
              <text
                x={c.x}
                y={c.y + 4}
                textAnchor="middle"
                className="world-map-label"
                opacity={island.locked ? 0.55 : 0.95}
              >
                {island.locked ? `? ${island.label}` : island.label}
              </text>
            ) : null}
          </g>
        )
      })}
      <circle cx={player.x} cy={player.y} r={showLabels ? 6 : 4} className="world-map-player" />
      {showLabels ? (
        <text x={player.x} y={player.y - 10} textAnchor="middle" className="world-map-you">
          You
        </text>
      ) : null}
    </svg>
  )
}

export function Minimap() {
  const open = useUiStore((s) => s.mapOpen)
  const setOpen = useUiStore((s) => s.setMapOpen)
  const toggleMap = useUiStore((s) => s.toggleMap)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  return (
    <>
      <button
        type="button"
        className="hud-minimap"
        onClick={toggleMap}
        aria-label="Open world map"
        title="World map"
      >
        <MapSchematic size={132} showLabels={false} />
        <span className="hud-minimap-caption">Map</span>
      </button>

      {open ? (
        <div className="bp-overlay" role="dialog" aria-modal="true" aria-label="World map">
          <div className="bp-panel world-map-panel">
            <div className="bp-header">
              <h2>World map</h2>
              <button type="button" className="bp-close" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <p className="world-map-help">
              Your islands and paths. Unlocked land grows north (water) and east (lava).
            </p>
            <div className="world-map-frame">
              <MapSchematic size={420} showLabels />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
