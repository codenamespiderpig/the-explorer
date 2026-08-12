import { useEffect } from 'react'
import { ITEMS, type ItemId } from '../data/items'
import { RECIPE_LIST, type Recipe } from '../data/recipes'
import { SKILL_LIST, type Skill } from '../data/skills'
import { canCraft, craft } from '../systems/craft'
import { canLearn, learn } from '../systems/learn'
import { useInventoryStore } from '../stores/inventoryStore'
import { useProgressStore, useUiStore } from '../stores/uiStore'

function formatCost(cost: Partial<Record<ItemId, number>>): string {
  return Object.entries(cost)
    .map(([id, n]) => `${n} ${ITEMS[id as ItemId]?.name ?? id}`)
    .join(', ')
}

function CraftPanel() {
  const items = useInventoryStore((s) => s.items)
  const setItems = useInventoryStore((s) => s.setItems)
  const setHint = useInventoryStore((s) => s.setHint)
  const learned = useProgressStore((s) => s.learned)
  const learnedSet = new Set(learned)

  const tryCraft = (recipe: Recipe) => {
    if (!canCraft(recipe, items, learnedSet)) {
      setHint(
        recipe.requiresSkill && !learnedSet.has(recipe.requiresSkill)
          ? `Learn ${recipe.requiresSkill} first`
          : 'Not enough materials',
      )
      return
    }
    const result = craft(recipe, items)
    if (!result.ok) return
    setItems(result.remaining)
    setHint(`Crafted ${ITEMS[result.item].name}`)
  }

  return (
    <div className="bp-section">
      <div className="bp-section-title">Build & craft</div>
      <ul className="bp-list">
        {RECIPE_LIST.map((recipe) => {
          const locked =
            !!recipe.requiresSkill && !learnedSet.has(recipe.requiresSkill)
          const affordable = canCraft(recipe, items, learnedSet)
          return (
            <li key={recipe.id} className="bp-row">
              <div>
                <div className="bp-row-name">{recipe.name}</div>
                <div className="bp-row-meta">
                  {recipe.description} · Cost: {formatCost(recipe.cost)}
                  {recipe.requiresSkill
                    ? ` · Needs: ${recipe.requiresSkill}`
                    : ''}
                </div>
              </div>
              <button
                type="button"
                className="bp-btn"
                disabled={!affordable}
                onClick={() => tryCraft(recipe)}
              >
                {locked ? 'Locked' : 'Craft'}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function LearnPanel() {
  const items = useInventoryStore((s) => s.items)
  const setItems = useInventoryStore((s) => s.setItems)
  const setHint = useInventoryStore((s) => s.setHint)
  const learned = useProgressStore((s) => s.learned)
  const learnSkill = useProgressStore((s) => s.learnSkill)
  const learnedSet = new Set(learned)

  const tryLearn = (skill: Skill) => {
    const result = learn(skill, items, learnedSet)
    if (!result.ok) {
      setHint(
        result.reason === 'already-learned'
          ? 'Already learned'
          : 'Not enough materials',
      )
      return
    }
    setItems(result.remaining)
    learnSkill(result.skillId)
    setHint(`Learned ${skill.name}`)
  }

  return (
    <div className="bp-section">
      <div className="bp-section-title">Learn skills</div>
      <ul className="bp-list">
        {SKILL_LIST.map((skill) => {
          const known = learnedSet.has(skill.id)
          const affordable = canLearn(skill, items, learnedSet)
          return (
            <li key={skill.id} className="bp-row">
              <div>
                <div className="bp-row-name">{skill.name}</div>
                <div className="bp-row-meta">
                  {skill.description} · Cost: {formatCost(skill.cost)}
                </div>
              </div>
              <button
                type="button"
                className="bp-btn"
                disabled={!affordable}
                onClick={() => tryLearn(skill)}
              >
                {known ? 'Learned' : 'Learn'}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function InventoryPanel() {
  const items = useInventoryStore((s) => s.items)
  const tools = useInventoryStore((s) => s.tools)
  const learned = useProgressStore((s) => s.learned)

  const entries = Object.entries(items).filter(([, n]) => (n ?? 0) > 0)

  return (
    <div className="bp-section bp-inventory">
      <div className="bp-section-title">Inventory</div>
      <div className="bp-inv-grid">
        {tools.map((tool) => (
          <div key={tool} className="bp-inv-slot">
            {ITEMS[tool].name}
          </div>
        ))}
        {entries.map(([id, n]) => (
          <div key={id} className="bp-inv-slot">
            {ITEMS[id as ItemId]?.name ?? id} ×{n}
          </div>
        ))}
        {entries.length === 0 ? (
          <div className="bp-row-meta">Empty — gather wood and stone</div>
        ) : null}
      </div>
      {learned.length > 0 ? (
        <div className="bp-row-meta">Skills: {learned.join(', ')}</div>
      ) : null}
    </div>
  )
}

export function Backpack() {
  const open = useUiStore((s) => s.backpackOpen)
  const tab = useUiStore((s) => s.backpackTab)
  const toggle = useUiStore((s) => s.toggleBackpack)
  const setTab = useUiStore((s) => s.setBackpackTab)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'KeyQ' || e.repeat) return
      // Don't steal Q while typing in inputs (none yet, but safe)
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      e.preventDefault()
      toggle()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle])

  if (!open) return null

  return (
    <div className="bp-overlay" role="dialog" aria-label="Backpack">
      <div className="bp-panel">
        <div className="bp-header">
          <h2>Backpack</h2>
          <button type="button" className="bp-close" onClick={toggle}>
            Close (Q)
          </button>
        </div>

        <div className="bp-tabs">
          <button
            type="button"
            className={tab === 'craft' ? 'bp-tab active' : 'bp-tab'}
            onClick={() => setTab('craft')}
          >
            Craft
          </button>
          <button
            type="button"
            className={tab === 'learn' ? 'bp-tab active' : 'bp-tab'}
            onClick={() => setTab('learn')}
          >
            Learn
          </button>
        </div>

        {tab === 'craft' ? <CraftPanel /> : <LearnPanel />}
        <InventoryPanel />
      </div>
    </div>
  )
}
