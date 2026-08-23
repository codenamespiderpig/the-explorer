import type { ResourceId, ToolId } from '../data/items'

export const SWING_DURATION = 0.55

const GATHER_TOOL: Record<ResourceId, ToolId> = {
  wood: 'wooden-axe',
  stone: 'wooden-pickaxe',
}

/** Normalized swing progress from 0 (start) to 1 (finished). */
export function swingPhase(elapsedSec: number): number {
  return Math.min(1, Math.max(0, elapsedSec / SWING_DURATION))
}

/** Whether a swing animation should still be playing. */
export function isSwinging(elapsedSec: number): boolean {
  return elapsedSec < SWING_DURATION
}

/** X-axis rotation for a forward swoosh arc. */
export function swingRotationX(phase: number): number {
  return Math.sin(phase * Math.PI) * 1.55 - 0.35
}

/** Side tilt that sells the swish motion. */
export function swingRotationZ(phase: number): number {
  return Math.sin(phase * Math.PI) * 0.45
}

export function toolForGather(resource: ResourceId): ToolId {
  return GATHER_TOOL[resource]
}
