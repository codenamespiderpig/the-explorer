import { describe, expect, it, beforeEach } from 'vitest'
import { createInventoryStore } from '../src/stores/inventoryStore'

describe('inventoryStore', () => {
  beforeEach(() => {
    createInventoryStore.getState().reset()
  })

  it('starts with the wooden tool kit and empty resources', () => {
    const state = createInventoryStore.getState()
    expect(state.tools).toEqual(['wooden-sword', 'wooden-pickaxe', 'wooden-axe'])
    expect(state.items.wood).toBe(0)
    expect(state.items.stone).toBe(0)
  })

  it('adds gathered resources', () => {
    createInventoryStore.getState().addItem('wood', 2)
    createInventoryStore.getState().addItem('stone', 1)
    expect(createInventoryStore.getState().items.wood).toBe(2)
    expect(createInventoryStore.getState().items.stone).toBe(1)
  })
})
