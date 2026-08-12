export const DAY_LENGTH_SEC = 90
export const NIGHT_LENGTH_SEC = 45
export const CYCLE_LENGTH_SEC = DAY_LENGTH_SEC + NIGHT_LENGTH_SEC

export type DayPhase = 'day' | 'night'

export interface DayNightState {
  /** Seconds into the full day+night cycle. */
  elapsed: number
  phase: DayPhase
}

export function createDayNightState(elapsed = 0): DayNightState {
  return { elapsed, phase: phaseAt(elapsed) }
}

function phaseAt(elapsed: number): DayPhase {
  const t = ((elapsed % CYCLE_LENGTH_SEC) + CYCLE_LENGTH_SEC) % CYCLE_LENGTH_SEC
  return t < DAY_LENGTH_SEC ? 'day' : 'night'
}

export function advanceTime(state: DayNightState, deltaSec: number): DayNightState {
  const elapsed = state.elapsed + deltaSec
  return { elapsed, phase: phaseAt(elapsed) }
}

export function secondsUntilNight(state: DayNightState): number {
  const t = ((state.elapsed % CYCLE_LENGTH_SEC) + CYCLE_LENGTH_SEC) % CYCLE_LENGTH_SEC
  if (t < DAY_LENGTH_SEC) return Math.ceil(DAY_LENGTH_SEC - t)
  return 0
}

export function secondsUntilDay(state: DayNightState): number {
  const t = ((state.elapsed % CYCLE_LENGTH_SEC) + CYCLE_LENGTH_SEC) % CYCLE_LENGTH_SEC
  if (t < DAY_LENGTH_SEC) return 0
  return Math.ceil(CYCLE_LENGTH_SEC - t)
}

export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}
