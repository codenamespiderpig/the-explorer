import type { ResourceId } from '../data/items'

export interface GatherableNode {
  id: string
  resource: ResourceId
  position: readonly [number, number, number]
}

/** Nearest gatherable within `radius`, or null if none. */
export function findNearestGatherable(
  nodes: readonly GatherableNode[],
  player: readonly [number, number, number],
  radius: number,
): GatherableNode | null {
  let best: GatherableNode | null = null
  let bestDistSq = radius * radius

  for (const node of nodes) {
    const dx = node.position[0] - player[0]
    const dz = node.position[2] - player[2]
    const distSq = dx * dx + dz * dz
    if (distSq <= bestDistSq) {
      bestDistSq = distSq
      best = node
    }
  }

  return best
}
