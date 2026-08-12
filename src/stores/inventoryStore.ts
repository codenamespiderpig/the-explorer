import { create } from 'zustand'
import {
  STARTING_TOOLS,
  type ItemId,
  type ResourceId,
  type ToolId,
} from '../data/items'

type Counts = Partial<Record<ItemId, number>>

interface InventoryState {
  tools: ToolId[]
  items: Counts
  nearbyNodeId: string | null
  nearbyResource: ResourceId | null
  hint: string | null
  addItem: (id: ItemId, amount: number) => void
  setNearby: (nodeId: string | null, resource: ResourceId | null) => void
  setHint: (hint: string | null) => void
  reset: () => void
}

const initialItems: Counts = { wood: 0, stone: 0 }

export const createInventoryStore = create<InventoryState>((set) => ({
  tools: [...STARTING_TOOLS],
  items: { ...initialItems },
  nearbyNodeId: null,
  nearbyResource: null,
  hint: 'WASD move · Hold left mouse to look · Walk to a tree or rock and press E',
  addItem: (id, amount) =>
    set((state) => ({
      items: {
        ...state.items,
        [id]: (state.items[id] ?? 0) + amount,
      },
    })),
  setNearby: (nodeId, resource) =>
    set({ nearbyNodeId: nodeId, nearbyResource: resource }),
  setHint: (hint) => set({ hint }),
  reset: () =>
    set({
      tools: [...STARTING_TOOLS],
      items: { ...initialItems },
      nearbyNodeId: null,
      nearbyResource: null,
      hint: 'WASD move · Hold left mouse to look · Walk to a tree or rock and press E',
    }),
}))

/** App-wide inventory store (same instance as createInventoryStore). */
export const useInventoryStore = createInventoryStore
