import { create } from 'zustand'
import {
  advanceTime,
  createDayNightState,
  formatCountdown,
  secondsUntilDay,
  secondsUntilNight,
  type DayNightState,
  type DayPhase,
} from '../systems/dayNight'
import {
  createHealthState,
  effectiveMaxHealth,
  respawnHealth,
  takeDamage,
  type HealthState,
} from '../systems/health'
import {
  createGate,
  damageGate,
  isGateDestroyed,
  type Gate,
} from '../systems/gate'
import {
  CASTLE_MAX_SLIMES,
  advanceCastleSpawnTimer,
  castleSpawnPosition,
  createSlimeCastle,
  isCastleSlimeRotten,
  type SlimeCastle,
} from '../systems/slimeCastle'
import { rollSlimeDrop, type SlimeDrop } from '../systems/slimeLoot'
import { buyLandFromMerchant } from '../systems/land'

export type SlimeSource = 'night' | 'castle'

export interface Slime {
  id: string
  position: [number, number, number]
  hp: number
  source: SlimeSource
  /** Age in seconds — castle slimes rot when left unkilled. */
  ageSec: number
}

interface GameState {
  dayNight: DayNightState
  health: HealthState
  money: number
  landTier: number
  gates: Gate[]
  castles: SlimeCastle[]
  slimes: Slime[]
  playerPos: [number, number, number]
  respawnToken: number
  tick: (deltaSec: number) => void
  setPlayerPos: (pos: [number, number, number]) => void
  placeGate: (position: [number, number, number], yaw?: number) => boolean
  placeSlimeCastle: (position: [number, number, number]) => boolean
  damagePlayer: (amount: number) => void
  damageNearestGate: (from: [number, number, number], amount: number) => boolean
  spawnNightSlimes: () => void
  clearNightSlimes: () => void
  moveSlime: (id: string, position: [number, number, number]) => void
  hurtSlime: (id: string, amount: number) => SlimeDrop | null
  buyLand: () => boolean
  merchantPresent: () => boolean
  respawnPlayer: () => void
  phase: () => DayPhase
  nightCountdownLabel: () => string
  healthLabel: () => string
}

let slimeSeq = 0
let gateSeq = 0
let castleSeq = 0
let wasNight = false

function edgeSpawn(landTier: number): [number, number, number] {
  const half = 12 + landTier * 4
  const side = Math.floor(Math.random() * 4)
  const t = (Math.random() - 0.5) * (half * 1.6)
  if (side === 0) return [t, 0.6, -half]
  if (side === 1) return [t, 0.6, half]
  if (side === 2) return [-half, 0.6, t]
  return [half, 0.6, t]
}

function countCastleSlimesNear(
  slimes: readonly Slime[],
  castlePos: readonly [number, number, number],
): number {
  return slimes.filter(
    (sl) =>
      sl.source === 'castle' &&
      Math.hypot(sl.position[0] - castlePos[0], sl.position[2] - castlePos[2]) < 8,
  ).length
}

export const useGameStore = create<GameState>((set, get) => ({
  dayNight: createDayNightState(),
  health: createHealthState(),
  money: 0,
  landTier: 0,
  gates: [],
  castles: [],
  slimes: [],
  playerPos: [0, 1, 0],
  respawnToken: 0,

  tick: (deltaSec) => {
    const prev = get().dayNight
    const next = advanceTime(prev, deltaSec)
    const enteredNight = prev.phase === 'day' && next.phase === 'night'
    const enteredDay = prev.phase === 'night' && next.phase === 'day'
    set({ dayNight: next })
    if (
      enteredNight ||
      (next.phase === 'night' &&
        !wasNight &&
        get().slimes.filter((s) => s.source === 'night').length === 0)
    ) {
      get().spawnNightSlimes()
    }
    if (enteredDay) get().clearNightSlimes()
    wasNight = next.phase === 'night'

    set((s) => {
      let slimes = s.slimes
        .map((sl) =>
          sl.source === 'castle' ? { ...sl, ageSec: sl.ageSec + deltaSec } : sl,
        )
        .filter((sl) => !(sl.source === 'castle' && isCastleSlimeRotten(sl.ageSec)))

      const castles: SlimeCastle[] = []
      for (const castle of s.castles) {
        const advanced = advanceCastleSpawnTimer(castle, deltaSec)
        castles.push({
          id: advanced.id,
          position: advanced.position,
          spawnTimer: advanced.spawnTimer,
        })
        if (!advanced.shouldSpawn) continue
        if (countCastleSlimesNear(slimes, castle.position) >= CASTLE_MAX_SLIMES) continue
        slimeSeq += 1
        slimes = [
          ...slimes,
          {
            id: `slime-${slimeSeq}`,
            position: castleSpawnPosition(castle.position),
            hp: 20,
            source: 'castle' as const,
            ageSec: 0,
          },
        ]
      }

      return { castles, slimes }
    })
  },

  setPlayerPos: (pos) => set({ playerPos: pos }),

  placeGate: (position, yaw = 0) => {
    gateSeq += 1
    const gate = createGate(`gate-${gateSeq}`, position, yaw, 50)
    set((s) => ({ gates: [...s.gates, gate] }))
    return true
  },

  placeSlimeCastle: (position) => {
    castleSeq += 1
    const castle = createSlimeCastle(`castle-${castleSeq}`, position)
    set((s) => ({ castles: [...s.castles, castle] }))
    return true
  },

  damagePlayer: (amount) => {
    const health = takeDamage(get().health, amount)
    set({ health })
    if (health.dead) get().respawnPlayer()
  },

  damageNearestGate: (from, amount) => {
    const gates = get().gates.filter((g) => !isGateDestroyed(g))
    if (gates.length === 0) return false
    let best = gates[0]
    let bestD = Infinity
    for (const g of gates) {
      const dx = g.position[0] - from[0]
      const dz = g.position[2] - from[2]
      const d = dx * dx + dz * dz
      if (d < bestD) {
        bestD = d
        best = g
      }
    }
    if (bestD > 3.6 * 3.6) return false
    const updated = damageGate(best, amount)
    set((s) => ({
      gates: isGateDestroyed(updated)
        ? s.gates.filter((g) => g.id !== updated.id)
        : s.gates.map((g) => (g.id === updated.id ? updated : g)),
    }))
    return true
  },

  spawnNightSlimes: () => {
    const tier = get().landTier
    const pack: Slime[] = Array.from({ length: 4 }, () => {
      slimeSeq += 1
      return {
        id: `slime-${slimeSeq}`,
        position: edgeSpawn(tier),
        hp: 20,
        source: 'night' as const,
        ageSec: 0,
      }
    })
    set((s) => ({
      slimes: [...s.slimes.filter((sl) => sl.source !== 'night'), ...pack],
    }))
  },

  clearNightSlimes: () =>
    set((s) => ({ slimes: s.slimes.filter((sl) => sl.source !== 'night') })),

  moveSlime: (id, position) =>
    set((s) => ({
      slimes: s.slimes.map((sl) => (sl.id === id ? { ...sl, position } : sl)),
    })),

  hurtSlime: (id, amount) => {
    const target = get().slimes.find((sl) => sl.id === id)
    if (!target) return null
    const hp = target.hp - amount
    if (hp > 0) {
      set((s) => ({
        slimes: s.slimes.map((sl) => (sl.id === id ? { ...sl, hp } : sl)),
      }))
      return null
    }
    set((s) => ({ slimes: s.slimes.filter((sl) => sl.id !== id) }))
    return rollSlimeDrop()
  },

  buyLand: () => {
    const { money, landTier, dayNight } = get()
    const result = buyLandFromMerchant(money, landTier, dayNight.phase === 'day')
    if (!result.ok) return false
    set({ money: result.money, landTier: result.landTier })
    return true
  },

  merchantPresent: () => get().dayNight.phase === 'day',

  respawnPlayer: () => {
    set((s) => ({
      health: respawnHealth(s.health),
      playerPos: [0, 3, 0],
      respawnToken: s.respawnToken + 1,
    }))
  },

  phase: () => get().dayNight.phase,

  nightCountdownLabel: () => {
    const state = get().dayNight
    if (state.phase === 'day') {
      return `Night in ${formatCountdown(secondsUntilNight(state))}`
    }
    return `Day in ${formatCountdown(secondsUntilDay(state))}`
  },

  healthLabel: () => {
    const h = get().health
    return `${Math.ceil(h.current)} / ${effectiveMaxHealth(h)}`
  },
}))
