import { create } from 'zustand'
import type { ToolId } from '../data/items'
import { isSwinging } from '../systems/toolSwing'

interface ToolActionState {
  swinging: ToolId | null
  swingStart: number
  beginSwing: (tool: ToolId, atTime: number) => void
  endSwing: () => void
  updateSwing: (clockTime: number) => void
}

export const useToolActionStore = create<ToolActionState>((set, get) => ({
  swinging: null,
  swingStart: 0,

  beginSwing: (tool, atTime) => set({ swinging: tool, swingStart: atTime }),

  endSwing: () => set({ swinging: null, swingStart: 0 }),

  updateSwing: (clockTime) => {
    const { swinging, swingStart } = get()
    if (!swinging) return
    if (!isSwinging(clockTime - swingStart)) get().endSwing()
  },
}))
