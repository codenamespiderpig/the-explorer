import { describe, expect, it } from 'vitest'
import {
  isOnLavaPatch,
  LAVA_BURN_DAMAGE,
  LAVA_PATCH_HALF,
  LAVA_PATCH_OFFSETS,
  lavaPatchWorldPositions,
} from '../src/systems/lavaHazards'
import { LAVA_UNLOCK_INDEX } from '../src/systems/plots'
import { worldCenter } from '../src/systems/worlds'

describe('lavaHazards', () => {
  it('defines five patches and burn damage', () => {
    expect(LAVA_PATCH_OFFSETS).toHaveLength(5)
    expect(LAVA_PATCH_HALF).toBe(0.7)
    expect(LAVA_BURN_DAMAGE).toBe(6)
  })

  it('burns at patch centers when lava is unlocked', () => {
    const [cx, , cz] = worldCenter('lava')
    const [px, pz] = lavaPatchWorldPositions(cx, cz)[0]!
    expect(isOnLavaPatch(px, pz, LAVA_UNLOCK_INDEX)).toBe(true)
    expect(isOnLavaPatch(px + 0.5, pz - 0.5, LAVA_UNLOCK_INDEX)).toBe(true)
  })

  it('does not burn off-patch or before lava unlock', () => {
    const [cx, , cz] = worldCenter('lava')
    expect(isOnLavaPatch(cx + 12, cz + 12, LAVA_UNLOCK_INDEX)).toBe(false)
    expect(isOnLavaPatch(cx, cz, LAVA_UNLOCK_INDEX - 1)).toBe(false)
  })
})
