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

export interface Slime {
  id: string
  position: [number, number, number]
  hp: number
}

interface GameState {
  dayNight: DayNightState
  health: HealthState
  gates: Gate[]
  slimes: Slime[]
  playerPos: [number, number, number]
  respawnToken: number
  tick: (deltaSec: number) => void
  setPlayerPos: (pos: [number, number, number]) => void
  placeGate: (position: [number, number, number], yaw?: number) => boolean
  damagePlayer: (amount: number) => void
  damageNearestGate: (from: [number, number, number], amount: number) => boolean
  spawnNightSlimes: () => void
  clearSlimes: () => void
  moveSlime: (id: string, position: [number, number, number]) => void
  hurtSlime: (id: string, amount: number) => void
  respawnPlayer: () => void
  phase: () => DayPhase
  nightCountdownLabel: () => string
  healthLabel: () => string
}

let slimeSeq = 0
let gateSeq = 0
let wasNight = false

function edgeSpawn(): [number, number, number] {
  const side = Math.floor(Math.random() * 4)
  const t = (Math.random() - 0.5) * 20
  if (side === 0) return [t, 0.6, -12]
  if (side === 1) return [t, 0.6, 12]
  if (side === 2) return [-12, 0.6, t]
  return [12, 0.6, t]
}

export const useGameStore = create<GameState>((set, get) => ({
  dayNight: createDayNightState(),
  health: createHealthState(),
  gates: [],
  slimes: [],
  playerPos: [0, 1, 0],
  respawnToken: 0,

  tick: (deltaSec) => {
    const prev = get().dayNight
    const next = advanceTime(prev, deltaSec)
    const enteredNight = prev.phase === 'day' && next.phase === 'night'
    const enteredDay = prev.phase === 'night' && next.phase === 'day'
    set({ dayNight: next })
    if (enteredNight || (next.phase === 'night' && !wasNight && get().slimes.length === 0)) {
      get().spawnNightSlimes()
    }
    if (enteredDay) get().clearSlimes()
    wasNight = next.phase === 'night'
  },

  setPlayerPos: (pos) => set({ playerPos: pos }),

  placeGate: (position, yaw = 0) => {
    gateSeq += 1
    const gate = createGate(`gate-${gateSeq}`, position, yaw, 50)
    set((s) => ({ gates: [...s.gates, gate] }))
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
    const pack: Slime[] = Array.from({ length: 4 }, () => {
      slimeSeq += 1
      return { id: `slime-${slimeSeq}`, position: edgeSpawn(), hp: 20 }
    })
    set({ slimes: pack })
  },

  clearSlimes: () => set({ slimes: [] }),

  moveSlime: (id, position) =>
    set((s) => ({
      slimes: s.slimes.map((sl) => (sl.id === id ? { ...sl, position } : sl)),
    })),

  hurtSlime: (id, amount) =>
    set((s) => ({
      slimes: s.slimes
        .map((sl) => (sl.id === id ? { ...sl, hp: sl.hp - amount } : sl))
        .filter((sl) => sl.hp > 0),
    })),

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
