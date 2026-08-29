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
  setItems: (items: Counts) => void
  setNearby: (nodeId: string | null, resource: ResourceId | null) => void
  setHint: (hint: string | null) => void
  reset: () => void
}

const initialItems: Counts = { wood: 0, stone: 0 }

const DEFAULT_HINT =
  'WASD · look · E gather · R eat fish · Q backpack · M merchant · P crab pot'

export const createInventoryStore = create<InventoryState>((set) => ({
  tools: [...STARTING_TOOLS],
  items: { ...initialItems },
  nearbyNodeId: null,
  nearbyResource: null,
  hint: DEFAULT_HINT,
  addItem: (id, amount) =>
    set((state) => ({
      items: {
        ...state.items,
        [id]: (state.items[id] ?? 0) + amount,
      },
    })),
  setItems: (items) => set({ items: { ...items } }),
  setNearby: (nodeId, resource) =>
    set({ nearbyNodeId: nodeId, nearbyResource: resource }),
  setHint: (hint) => set({ hint }),
  reset: () =>
    set({
      tools: [...STARTING_TOOLS],
      items: { ...initialItems },
      nearbyNodeId: null,
      nearbyResource: null,
      hint: DEFAULT_HINT,
    }),
}))

/** App-wide inventory store (same instance as createInventoryStore). */
export const useInventoryStore = createInventoryStore
