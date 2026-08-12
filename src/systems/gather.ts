import type { ResourceId, ToolId } from '../data/items'

const REQUIRED_TOOL: Record<ResourceId, ToolId> = {
  wood: 'wooden-axe',
  stone: 'wooden-pickaxe',
}

/** Whether the player has the tool needed to harvest this resource. */
export function canGather(resource: ResourceId, tools: readonly ToolId[]): boolean {
  return tools.includes(REQUIRED_TOOL[resource])
}

/** Amount of resource gained from harvesting one node. */
export function gatherYield(resource: ResourceId): { item: ResourceId; amount: number } {
  return { item: resource, amount: 1 }
}
