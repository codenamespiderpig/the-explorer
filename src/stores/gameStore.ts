import { create } from 'zustand'
import {
  advanceTime,
  createDayNightState,
  formatCountdown,
  secondsUntilDay,
  secondsUntilNight,
  type DayNightState,
  type DayPhase,
} from '../systems/dayNight'
import {
  createHealthState,
  effectiveMaxHealth,
  respawnHealth,
  takeDamage,
  type HealthState,
} from '../systems/health'
import {
  createGate,
  damageGate,
  isGateDestroyed,
  type Gate,
} from '../systems/gate'
import {
  CASTLE_MAX_SLIMES,
  advanceCastleSpawnTimer,
  castleSpawnPosition,
  createSlimeCastle,
  isCastleSlimeRotten,
  type SlimeCastle,
} from '../systems/slimeCastle'
import { rollSlimeDrop, type SlimeDrop } from '../systems/slimeLoot'
import { buyLandFromMerchant } from '../systems/land'
import type { ItemId } from '../data/items'
import {
  BIOME_ENEMY_HP,
  biomeEnemyPositions,
  enemyForBiome,
  type EnemyKind,
} from '../systems/enemies'
import {
  canEnterDungeon,
  canOpenDungeonChest,
  canUnlockDungeonChest,
  collectDungeonCoin,
  DUNGEON_HOME_SPAWN,
  DUNGEON_MOB_POSITIONS,
  DUNGEON_SPAWN,
  dungeonChestReward,
} from '../systems/dungeon'
import { applyRelicArmour } from '../systems/relic'
import {
  lavaUnlocked,
  rainforestUnlocked,
  waterUnlocked,
  lavaHubCenter,
  rainforestHubCenter,
  waterHubCenter,
} from '../systems/plots'
import { advanceCrabPotCatch,
  collectFishFromPot,
  createCrabPot,
  type CrabPot,
} from '../systems/crabPot'
import {
  createBuilding,
  type BuildingKind,
  type PlacedBuilding,
} from '../systems/building'
import { heal as applyHeal } from '../systems/heal'
import {
  MERCHANT_VISIT_SEC,
  advanceMerchantTimer,
  isMerchantVisiting,
  merchantSpawnPosition,
} from '../systems/merchant'
import type { WorldId } from '../systems/worlds'

export type SlimeSource = 'night' | 'castle' | 'biome' | 'dungeon'

export interface Slime {
  id: string
  position: [number, number, number]
  hp: number
  source: SlimeSource
  kind: EnemyKind
  /** Age in seconds — castle slimes rot when left unkilled. */
  ageSec: number
}

interface GameState {
  dayNight: DayNightState
  health: HealthState
  money: number
  landTier: number
  merchantTimeLeft: number
  merchantPosition: [number, number, number]
  merchantWorld: WorldId
  gates: Gate[]
  buildings: PlacedBuilding[]
  castles: SlimeCastle[]
  crabPots: CrabPot[]
  slimes: Slime[]
  playerPos: [number, number, number]
  playerSpawn: [number, number, number]
  respawnToken: number
  inDungeon: boolean
  dungeonChestOpened: boolean
  dungeonChestUnlocked: boolean
  dungeonCoinsCollected: number[]
  /** Timestamp (ms) until which the player ignores damage. */
  invulnerableUntil: number
  tick: (deltaSec: number) => void
  setPlayerPos: (pos: [number, number, number]) => void
  placeGate: (position: [number, number, number], yaw?: number) => boolean
  placeBuilding: (
    kind: BuildingKind,
    position: [number, number, number],
    yaw?: number,
  ) => boolean
  placeSlimeCastle: (position: [number, number, number]) => boolean
  placeCrabPot: (position: [number, number, number]) => boolean
  collectFromCrabPot: (potId: string) => number
  healPlayer: (amount: number) => boolean
  damagePlayer: (amount: number) => void
  damageNearestGate: (from: [number, number, number], amount: number) => boolean
  spawnNightSlimes: () => void
  clearNightSlimes: () => void
  syncBiomeEnemies: () => void
  enterDungeon: () => boolean
  exitDungeon: () => void
  collectDungeonCoinAt: (coinIndex: number) => boolean
  openDungeonChest: () => { item: ItemId; amount: number } | null
  useRelic: (relicsOwned: number) =>
    | { ok: true; relicsSpent: number; maxHealth: number }
    | { ok: false; reason: 'no-relic' | 'armour-capped' }
  moveSlime: (id: string, position: [number, number, number]) => void
  hurtSlime: (id: string, amount: number) => SlimeDrop | null
  buyLand: () => boolean
  merchantPresent: () => boolean
  merchantCountdownLabel: () => string
  respawnPlayer: () => void
  phase: () => DayPhase
  nightCountdownLabel: () => string
  healthLabel: () => string
}

let slimeSeq = 0
let gateSeq = 0
let buildingSeq = 0
let castleSeq = 0
let crabPotSeq = 0
let wasNight = false

function edgeSpawn(landTier: number): [number, number, number] {
  const half = 12 + (landTier >= 1 ? 4 : 0)
  const side = Math.floor(Math.random() * 4)
  const t = (Math.random() - 0.5) * (half * 1.6)
  if (side === 0) return [t, 0.45, -half]
  if (side === 1) return [t, 0.45, half]
  if (side === 2) return [-half, 0.45, t]
  return [half, 0.45, t]
}

function makeBiomePack(
  kind: EnemyKind,
  center: [number, number, number],
): Slime[] {
  return biomeEnemyPositions(center).map((position) => {
    slimeSeq += 1
    return {
      id: `slime-${slimeSeq}`,
      position,
      hp: BIOME_ENEMY_HP,
      source: 'biome' as const,
      kind,
      ageSec: 0,
    }
  })
}

function countCastleSlimesNear(
  slimes: readonly Slime[],
  castlePos: readonly [number, number, number],
): number {
  return slimes.filter(
    (sl) =>
      sl.source === 'castle' &&
      Math.hypot(sl.position[0] - castlePos[0], sl.position[2] - castlePos[2]) < 8,
  ).length
}

export const useGameStore = create<GameState>((set, get) => ({
  dayNight: createDayNightState(),
  health: createHealthState(),
  money: 0,
  landTier: 0,
  merchantTimeLeft: MERCHANT_VISIT_SEC,
  merchantPosition: merchantSpawnPosition(0).position,
  merchantWorld: 'home',
  gates: [],
  buildings: [],
  castles: [],
  crabPots: [],
  slimes: [],
  playerPos: [0, 1, 0],
  playerSpawn: [0, 3, 0],
  respawnToken: 0,
  inDungeon: false,
  dungeonChestOpened: false,
  dungeonChestUnlocked: false,
  dungeonCoinsCollected: [],
  invulnerableUntil: 0,

  tick: (deltaSec) => {
    const prev = get().dayNight
    const next = advanceTime(prev, deltaSec)
    const enteredNight = prev.phase === 'day' && next.phase === 'night'
    const enteredDay = prev.phase === 'night' && next.phase === 'day'
    set({ dayNight: next })
    if (
      enteredNight ||
      (next.phase === 'night' &&
        !wasNight &&
        get().slimes.filter((s) => s.source === 'night').length === 0)
    ) {
      get().spawnNightSlimes()
    }
    if (enteredDay) {
      get().clearNightSlimes()
      const spawn = merchantSpawnPosition(get().landTier)
      set({
        merchantTimeLeft: MERCHANT_VISIT_SEC,
        merchantPosition: spawn.position,
        merchantWorld: spawn.world,
      })
    }
    wasNight = next.phase === 'night'

    if (isMerchantVisiting(get().merchantTimeLeft)) {
      const left = advanceMerchantTimer(get().merchantTimeLeft, deltaSec)
      if (left !== get().merchantTimeLeft) set({ merchantTimeLeft: left })
    }

    set((s) => {
      let slimes = s.slimes
        .map((sl) =>
          sl.source === 'castle' ? { ...sl, ageSec: sl.ageSec + deltaSec } : sl,
        )
        .filter((sl) => !(sl.source === 'castle' && isCastleSlimeRotten(sl.ageSec)))

      const castles: SlimeCastle[] = []
      for (const castle of s.castles) {
        const advanced = advanceCastleSpawnTimer(castle, deltaSec)
        castles.push({
          id: advanced.id,
          position: advanced.position,
          spawnTimer: advanced.spawnTimer,
        })
        if (!advanced.shouldSpawn) continue
        if (countCastleSlimesNear(slimes, castle.position) >= CASTLE_MAX_SLIMES) continue
        slimeSeq += 1
        slimes = [
          ...slimes,
          {
            id: `slime-${slimeSeq}`,
            position: castleSpawnPosition(castle.position),
            hp: 20,
            source: 'castle' as const,
            kind: 'slime' as const,
            ageSec: 0,
          },
        ]
      }

      return { castles, slimes }
    })

    set((s) => ({
      crabPots: s.crabPots.map((pot) => advanceCrabPotCatch(pot, deltaSec)),
    }))
  },

  setPlayerPos: (pos) => set({ playerPos: pos }),

  placeGate: (position, yaw = 0) => {
    gateSeq += 1
    const gate = createGate(`gate-${gateSeq}`, position, yaw, 50)
    set((s) => ({ gates: [...s.gates, gate] }))
    return true
  },

  placeBuilding: (kind, position, yaw = 0) => {
    buildingSeq += 1
    const building = createBuilding(`building-${buildingSeq}`, kind, position, yaw)
    set((s) => ({ buildings: [...s.buildings, building] }))
    return true
  },

  placeSlimeCastle: (position) => {
    castleSeq += 1
    const castle = createSlimeCastle(`castle-${castleSeq}`, position)
    set((s) => ({ castles: [...s.castles, castle] }))
    return true
  },

  placeCrabPot: (position) => {
    crabPotSeq += 1
    const pot = createCrabPot(`crab-pot-${crabPotSeq}`, position)
    set((s) => ({ crabPots: [...s.crabPots, pot] }))
    return true
  },

  collectFromCrabPot: (potId) => {
    const pot = get().crabPots.find((p) => p.id === potId)
    if (!pot) return 0
    const { pot: next, collected } = collectFishFromPot(pot)
    if (collected <= 0) return 0
    set((s) => ({
      crabPots: s.crabPots.map((p) => (p.id === potId ? next : p)),
    }))
    return collected
  },

  healPlayer: (amount) => {
    const health = get().health
    const next = applyHeal(health, amount)
    if (next.current === health.current) return false
    set({ health: next })
    return true
  },

  damagePlayer: (amount) => {
    if (performance.now() < get().invulnerableUntil) return
    const health = takeDamage(get().health, amount)
    set({
      health,
      invulnerableUntil: performance.now() + 800,
    })
    if (health.dead) get().respawnPlayer()
  },

  damageNearestGate: (from, amount) => {
    const gates = get().gates.filter((g) => !isGateDestroyed(g))
    if (gates.length === 0) return false
    let best = gates[0]
    let bestD = Infinity
    for (const g of gates) {
      const dx = g.position[0] - from[0]
      const dz = g.position[2] - from[2]
      const d = dx * dx + dz * dz
      if (d < bestD) {
        bestD = d
        best = g
      }
    }
    if (bestD > 3.6 * 3.6) return false
    const updated = damageGate(best, amount)
    set((s) => ({
      gates: isGateDestroyed(updated)
        ? s.gates.filter((g) => g.id !== updated.id)
        : s.gates.map((g) => (g.id === updated.id ? updated : g)),
    }))
    return true
  },

  spawnNightSlimes: () => {
    const tier = get().landTier
    const pack: Slime[] = Array.from({ length: 4 }, () => {
      slimeSeq += 1
      return {
        id: `slime-${slimeSeq}`,
        position: edgeSpawn(tier),
        hp: 20,
        source: 'night' as const,
        kind: 'slime' as const,
        ageSec: 0,
      }
    })
    set((s) => ({
      slimes: [...s.slimes.filter((sl) => sl.source !== 'night'), ...pack],
    }))
  },

  clearNightSlimes: () =>
    set((s) => ({ slimes: s.slimes.filter((sl) => sl.source !== 'night') })),

  syncBiomeEnemies: () => {
    const tier = get().landTier
    set((s) => {
      let slimes = s.slimes.filter((sl) => sl.source !== 'biome')
      if (waterUnlocked(tier)) {
        slimes = [...slimes, ...makeBiomePack(enemyForBiome('water'), waterHubCenter())]
      }
      if (lavaUnlocked(tier)) {
        slimes = [...slimes, ...makeBiomePack(enemyForBiome('lava'), lavaHubCenter())]
      }
      if (rainforestUnlocked(tier)) {
        slimes = [
          ...slimes,
          ...makeBiomePack(enemyForBiome('rainforest'), rainforestHubCenter()),
        ]
      }
      return { slimes }
    })
  },

  enterDungeon: () => {
    if (!canEnterDungeon(get().landTier)) return false
    const dungeonMobs = DUNGEON_MOB_POSITIONS.map((position) => {
      slimeSeq += 1
      return {
        id: `slime-${slimeSeq}`,
        position,
        hp: 14,
        source: 'dungeon' as const,
        kind: 'slime' as const,
        ageSec: 0,
      }
    })
    set((s) => ({
      inDungeon: true,
      dungeonChestOpened: false,
      dungeonChestUnlocked: false,
      dungeonCoinsCollected: [],
      health: respawnHealth(s.health),
      invulnerableUntil: performance.now() + 2000,
      playerSpawn: [...DUNGEON_SPAWN] as [number, number, number],
      playerPos: [...DUNGEON_SPAWN] as [number, number, number],
      respawnToken: s.respawnToken + 1,
      slimes: [
        ...s.slimes.filter((sl) => sl.source !== 'dungeon' && sl.source !== 'night'),
        ...dungeonMobs,
      ],
    }))
    return true
  },

  exitDungeon: () => {
    set((s) => ({
      inDungeon: false,
      dungeonChestOpened: false,
      dungeonChestUnlocked: false,
      dungeonCoinsCollected: [],
      playerSpawn: [...DUNGEON_HOME_SPAWN] as [number, number, number],
      playerPos: [...DUNGEON_HOME_SPAWN] as [number, number, number],
      respawnToken: s.respawnToken + 1,
      slimes: s.slimes.filter((sl) => sl.source !== 'dungeon'),
    }))
  },

  collectDungeonCoinAt: (coinIndex) => {
    if (!get().inDungeon) return false
    const result = collectDungeonCoin(get().dungeonCoinsCollected, coinIndex)
    if (!result.ok) return false
    set({
      dungeonCoinsCollected: result.collected,
      dungeonChestUnlocked: result.unlocked || canUnlockDungeonChest(result.collected.length),
    })
    return true
  },

  openDungeonChest: () => {
    const s = get()
    if (!s.inDungeon) return null
    if (!canOpenDungeonChest(s.dungeonChestUnlocked, s.dungeonChestOpened)) return null
    const reward = dungeonChestReward()
    set({ dungeonChestOpened: true })
    return reward
  },

  useRelic: (relicsOwned) => {
    const result = applyRelicArmour(get().health, relicsOwned)
    if (!result.ok) return result
    set({ health: result.health })
    return {
      ok: true,
      relicsSpent: result.relicsSpent,
      maxHealth: effectiveMaxHealth(result.health),
    }
  },

  moveSlime: (id, position) =>
    set((s) => ({
      slimes: s.slimes.map((sl) => (sl.id === id ? { ...sl, position } : sl)),
    })),

  hurtSlime: (id, amount) => {
    const target = get().slimes.find((sl) => sl.id === id)
    if (!target) return null
    const hp = target.hp - amount
    if (hp > 0) {
      set((s) => ({
        slimes: s.slimes.map((sl) => (sl.id === id ? { ...sl, hp } : sl)),
      }))
      return null
    }
    set((s) => ({ slimes: s.slimes.filter((sl) => sl.id !== id) }))
    return rollSlimeDrop()
  },

  buyLand: () => {
    const { money, landTier, merchantTimeLeft } = get()
    const result = buyLandFromMerchant(money, landTier, isMerchantVisiting(merchantTimeLeft))
    if (!result.ok) return false
    set({ money: result.money, landTier: result.landTier })
    get().syncBiomeEnemies()
    return true
  },

  merchantPresent: () => isMerchantVisiting(get().merchantTimeLeft),

  merchantCountdownLabel: () => {
    const left = get().merchantTimeLeft
    if (!isMerchantVisiting(left)) return 'Merchant gone'
    const s = Math.max(0, Math.ceil(left))
    const m = Math.floor(s / 60)
    const r = s % 60
    return `${m}:${r.toString().padStart(2, '0')} left`
  },

  respawnPlayer: () => {
    const wasDungeon = get().inDungeon
    set((s) => ({
      health: respawnHealth(s.health),
      inDungeon: false,
      dungeonChestOpened: false,
      dungeonChestUnlocked: false,
      dungeonCoinsCollected: [],
      playerSpawn: [...DUNGEON_HOME_SPAWN] as [number, number, number],
      playerPos: [...DUNGEON_HOME_SPAWN] as [number, number, number],
      respawnToken: s.respawnToken + 1,
      slimes: wasDungeon
        ? s.slimes.filter((sl) => sl.source !== 'dungeon')
        : s.slimes,
    }))
  },

  phase: () => get().dayNight.phase,

  nightCountdownLabel: () => {
    const state = get().dayNight
    if (state.phase === 'day') {
      return `Night in ${formatCountdown(secondsUntilNight(state))}`
    }
    return `Day in ${formatCountdown(secondsUntilDay(state))}`
  },

  healthLabel: () => {
    const h = get().health
    return `${Math.ceil(h.current)} / ${effectiveMaxHealth(h)}`
  },
}))
