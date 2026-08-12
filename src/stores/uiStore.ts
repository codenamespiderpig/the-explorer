import { create } from 'zustand'
import type { SkillId } from '../data/skills'

type Tab = 'craft' | 'learn'

interface UiState {
  backpackOpen: boolean
  backpackTab: Tab
  toggleBackpack: () => void
  setBackpackOpen: (open: boolean) => void
  setBackpackTab: (tab: Tab) => void
}

export const useUiStore = create<UiState>((set) => ({
  backpackOpen: false,
  backpackTab: 'craft',
  toggleBackpack: () => set((s) => ({ backpackOpen: !s.backpackOpen })),
  setBackpackOpen: (open) => set({ backpackOpen: open }),
  setBackpackTab: (tab) => set({ backpackTab: tab }),
}))

interface ProgressState {
  learned: SkillId[]
  learnSkill: (id: SkillId) => void
  hasSkill: (id: SkillId) => boolean
  reset: () => void
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  learned: [],
  learnSkill: (id) =>
    set((s) => (s.learned.includes(id) ? s : { learned: [...s.learned, id] })),
  hasSkill: (id) => get().learned.includes(id),
  reset: () => set({ learned: [] }),
}))
