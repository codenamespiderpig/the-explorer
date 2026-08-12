import { describe, expect, it } from 'vitest'
import {
  DAY_LENGTH_SEC,
  NIGHT_LENGTH_SEC,
  advanceTime,
  createDayNightState,
  formatCountdown,
  secondsUntilNight,
} from '../src/systems/dayNight'

describe('dayNight', () => {
  it('starts in daytime', () => {
    const state = createDayNightState()
    expect(state.phase).toBe('day')
    expect(secondsUntilNight(state)).toBe(DAY_LENGTH_SEC)
  })

  it('enters night after the day length elapses', () => {
    let state = createDayNightState()
    state = advanceTime(state, DAY_LENGTH_SEC)
    expect(state.phase).toBe('night')
  })

  it('returns to day after night ends', () => {
    let state = createDayNightState()
    state = advanceTime(state, DAY_LENGTH_SEC + NIGHT_LENGTH_SEC)
    expect(state.phase).toBe('day')
  })

  it('formats the countdown as m:ss', () => {
    expect(formatCountdown(75)).toBe('1:15')
    expect(formatCountdown(9)).toBe('0:09')
  })
})
