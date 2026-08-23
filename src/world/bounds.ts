import {
  unlockedWorlds,
  worldCenter,
  worldPlayableHalf,
  WORLD_ISLAND_SIZE,
  type WorldId,
} from '../systems/worlds'
import { islandSize, playableHalf } from '../systems/land'

export {
  unlockedWorlds,
  worldCenter,
  worldPlayableHalf,
  type WorldId,
} from '../systems/worlds'
export { BASE_ISLAND_SIZE, islandSize, playableHalf } from '../systems/land'

/** @deprecated Use islandSize(landTier). */
export const ISLAND_SIZE = 36
export const ISLAND_HALF = 18
/** @deprecated Use playableHalf(landTier). */
export const PLAYABLE_HALF = playableHalf(0)

export const FALL_Y = -2
/** Half-width of the bridge corridor used by clamps and wall gaps. */
export const BRIDGE_HALF_WIDTH = 2.2

function homeClamp(x: number, z: number, landTier: number) {
  const half = playableHalf(landTier)
  return {
    x: Math.min(half, Math.max(-half, x)),
    z: Math.min(half, Math.max(-half, z)),
  }
}

function biomeClamp(
  x: number,
  z: number,
  world: WorldId,
  landTier: number,
): { x: number; z: number } {
  const [cx, , cz] = worldCenter(world, landTier)
  const half = worldPlayableHalf(world)
  const lx = x - cx
  const lz = z - cz
  return {
    x: cx + Math.min(half, Math.max(-half, lx)),
    z: cz + Math.min(half, Math.max(-half, lz)),
  }
}

/** True when standing on the north bridge toward the water world. */
export function onWaterBridge(x: number, z: number, landTier: number): boolean {
  if (landTier < 1) return false
  const homeEdge = islandSize(landTier) / 2
  const [, , wz] = worldCenter('water', landTier)
  const waterEdge = wz - WORLD_ISLAND_SIZE / 2
  return Math.abs(x) <= BRIDGE_HALF_WIDTH && z >= homeEdge - 1.5 && z <= waterEdge + 1.5
}

/** True when standing on the east bridge toward the lava world. */
export function onLavaBridge(x: number, z: number, landTier: number): boolean {
  if (landTier < 2) return false
  const homeEdge = islandSize(landTier) / 2
  const [lx] = worldCenter('lava', landTier)
  const lavaEdge = lx - WORLD_ISLAND_SIZE / 2
  return Math.abs(z) <= BRIDGE_HALF_WIDTH && x >= homeEdge - 1.5 && x <= lavaEdge + 1.5
}

function bridgeClamp(
  x: number,
  z: number,
  landTier: number,
): { x: number; z: number } | null {
  if (onWaterBridge(x, z, landTier)) {
    return { x: Math.min(BRIDGE_HALF_WIDTH, Math.max(-BRIDGE_HALF_WIDTH, x)), z }
  }
  if (onLavaBridge(x, z, landTier)) {
    return { x, z: Math.min(BRIDGE_HALF_WIDTH, Math.max(-BRIDGE_HALF_WIDTH, z)) }
  }
  return null
}

/** Clamp onto home, a bridge, or an unlocked biome. */
export function clampToIsland(
  x: number,
  z: number,
  landTier = 0,
): { x: number; z: number } {
  const bridge = bridgeClamp(x, z, landTier)
  if (bridge) return bridge

  const worlds = unlockedWorlds(landTier)
  for (const world of worlds) {
    if (world === 'home') continue
    const [cx, , cz] = worldCenter(world, landTier)
    const half = worldPlayableHalf(world)
    if (Math.abs(x - cx) <= half + 0.75 && Math.abs(z - cz) <= half + 0.75) {
      return biomeClamp(x, z, world, landTier)
    }
  }
  return homeClamp(x, z, landTier)
}
