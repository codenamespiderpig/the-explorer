import type { GatherableNode } from '../systems/proximity'

const nodes = new Map<string, GatherableNode>()

export function registerGatherable(node: GatherableNode): void {
  nodes.set(node.id, node)
}

export function unregisterGatherable(id: string): void {
  nodes.delete(id)
}

export function listGatherables(): GatherableNode[] {
  return [...nodes.values()]
}
