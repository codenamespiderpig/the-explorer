# PRD: The Explorer

## Overview

**The Explorer** is a browser-based, third-person 3D sandbox inspired by *Forager*. Players start on a medium island, gather and sell or craft resources, spend money to expand their land, explore new islands and biomes, and run dungeons for loot.

The product is a **web application** (not a native install), with simple stylized graphics and lightweight physics.

## Goals

- Deliver a playable 3D Forager-like loop in the browser: explore → gather → craft → build → progress.
- Keep scope tight: small map, simple art, simple physics.
- Prefer a maintainable web-native stack over a full game-engine export.

## Non-goals (initial release)

- Photorealistic graphics or complex rendering pipelines
- Large open-world streaming / seamless mega-maps
- Complex ragdoll or high-fidelity physics simulation
- Native desktop/mobile store builds (web-first)
- Multiplayer (deferred unless explicitly prioritized later)

## Product concept

| Attribute | Decision |
|-----------|----------|
| Genre | 3D sandbox / crafting / light platformer exploration |
| Perspective | Third-person |
| Inspiration | *Forager* (3D reinterpretation) |
| Map size | Medium home island; expands via upgrades into more islands / biomes |
| Graphics | Simple / stylized |
| Physics | Simple (collisions, character movement, interact volumes) |

### Core player fantasy

Start on a medium island, gather stone and wood, sell or craft, earn money to expand your land, then push outward into new islands, dungeons, and unique biomes (e.g. a lava world).

## Game mechanics

### Starting loop

1. Player begins on a **medium-sized home island**.
2. Gather basic resources: **stone** and **wood**.
3. Choose what to do with resources:
   - **Sell** them for **money**, or
   - **Keep** them to **craft** items.
4. When the player has enough money, they can **upgrade / expand their island**.

### Expansion & discovery

- Expanding unlocks **more islands / land**.
- Exploring more land reveals **unique places** and biomes (example: a **lava world**).
- Progression is exploration-driven: more land → more unique locations → more content.

### Dungeons

- On expanded islands, the player may find **steps leading down into a dungeon**.
- Completing a dungeon (reaching the end) awards **loot**.
- After completion, a **portal teleports the player back home**.

### Economy (v1 intent)

| Action | Result |
|--------|--------|
| Gather stone / wood | Add to inventory |
| Sell resources | Gain money |
| Craft items | Spend kept resources (recipes TBD) |
| Upgrade island | Spend money; unlock more land / islands |

### Systems implied by mechanics

| System | Role |
|--------|------|
| Inventory | Hold stone, wood, crafted items, loot |
| Selling | Convert resources → money |
| Crafting | Convert resources → items |
| Island upgrades | Money sink; unlock expansion |
| Multi-island world | Separate areas unlocked over time |
| Biomes / unique places | Content variety as the map grows |
| Dungeons | Risk/reward instances with loot + return portal |
| Home teleport | Portal returns player to home island after dungeon |

## Technical stack (agreed)

| Layer | Choice | Version | Rationale |
|-------|--------|---------|-----------|
| Bundler / app shell | **Vite** | latest | Fast local iteration for a web game |
| Language | **TypeScript** | latest | Safer game systems and UI code |
| UI framework | **React** | **19.x** | Forager-style inventory, crafting, and menus are UI-heavy |
| 3D rendering | **@react-three/fiber** (three.js) | **9.x** | Stylized 3D scenes; v9 is the React 19 compatibility line |
| 3D helpers | **@react-three/drei** | **10.x** | Cameras, loaders, common scene utilities; v10 targets React 19 / fiber v9 |
| Physics | **@react-three/rapier** | **2.x** | Rapier WASM physics; v2 supports fiber v9 / React 19 |
| Character controller | **ecctrl** (pmndrs) | latest | Physics-driven third-person controller built on Rapier + fiber |
| Client state | **Zustand** | **5.x** | Inventory, recipes, world flags without heavy boilerplate |

Version pairing verified against library docs (Aug 2026): fiber v9 requires React 19; drei v10 and rapier v2 require fiber v9. If React 18 were ever required, the whole set would drop to fiber v8 / drei v9 / rapier v1 — we are **not** doing that.

### Stack notes

- WebGL is used underneath via three.js; we will **not** write raw WebGL for gameplay features.
- three.js version follows drei's peer range (`>= 0.159`); install whatever the fiber v9 line pins.
- Physics scenes must be wrapped in rapier's `<Physics>` provider; bodies use `<RigidBody>` + capsule/cuboid colliders and sensor colliders for triggers (gather nodes, dungeon stairs, portals).
- Start from ecctrl for the third-person controller instead of hand-rolling capsule movement; drop to a custom `RigidBody` controller only if ecctrl fights our camera or platforming feel.
- Prefer low-poly GLTF assets (`useGLTF` from drei) and simple materials over custom shaders unless needed.
- Zustand stores hold game state (inventory, money, unlocks); R3F components subscribe via selectors to avoid re-render storms. Never store per-frame data (positions) in React state — use refs and `useFrame`.

## Architecture

### Module layout (planned)

```
src/
  main.tsx            # App entry, React root
  App.tsx             # App shell: Canvas + HUD overlay
  world/              # R3F scene components (islands, biomes, dungeon scenes)
  player/             # Character controller, follow camera
  systems/            # Domain logic: economy, crafting, unlocks, dungeon flow
  stores/             # Zustand stores (inventory, money, world state, settings)
  ui/                 # React HUD: inventory, shop, crafting, upgrade menus
  data/               # Static content: recipes, prices, upgrade tiers, biome defs
tests/                # Vitest unit tests for systems and stores
```

### Key decisions

- **World structure:** each island/biome/dungeon is a scene subtree; unlocked areas mount into the one Canvas. Small map means no streaming — mount/unmount whole areas on unlock/enter.
- **Interactions:** sensor colliders + a single "interact" input (e.g. `E`) drive gathering, shop, dungeon entry, and portals.
- **Game state vs render state:** systems and stores are plain TypeScript (unit-testable without WebGL); R3F components are a thin view layer over them.
- **Saves:** serialize Zustand stores to `localStorage` (v1).

## Testing

- **Vitest** for unit tests, grouped under `tests/` (TDD for systems: economy, crafting, upgrade gating, dungeon completion).
- Domain logic is deliberately React-free so tests need no canvas/WebGL mocking.
- Manual playtesting checklist for camera, collision, and feel (not unit-testable).

## User stories

### Core loop
- As a player, I can move my character around the home island in third person, with the camera following me.
- As a player, I can gather stone and wood by interacting with rocks and trees.
- As a player, I can open an inventory and see what I'm carrying.
- As a player, I can sell resources for money.
- As a player, I can craft items from resources I've kept.

### Expansion
- As a player, I can see how much an island upgrade costs and buy it when I have enough money.
- As a player, when I upgrade, new land/islands become reachable.
- As a player, exploring new land reveals unique places (biomes) that look and feel different.

### Dungeons
- As a player, I can find steps leading down to a dungeon on expanded land.
- As a player, I can traverse a dungeon to its end and receive loot.
- As a player, after finishing a dungeon, a portal returns me to my home island.

### Persistence
- As a player, my progress (inventory, money, unlocks) survives a page reload.

## MVP feature list

**In (v1):**
1. Third-person character controller + follow camera (ecctrl)
2. Home island with gatherable stone + wood nodes (respawning)
3. Inventory UI (React overlay)
4. Sell-for-money mechanic + money HUD
5. Crafting with a small starter recipe list
6. One island upgrade tier that unlocks a second area
7. One dungeon: entrance stairs → linear path → loot chest → portal home
8. One unique biome as the second area (lava world candidate)
9. Local save/load via `localStorage`
10. Minimal onboarding copy (contextual hints, no tutorial flow)

**Out (backlog):**
- Combat, enemies, health
- Multiple upgrade tiers / many islands
- Skill trees, tech unlocks
- Placeable buildings
- Audio (music/SFX)
- Mobile/touch controls, gamepad
- Multiplayer, cloud saves

## Target experience (v1 sketch)

1. Spawn on the medium home island in third person.
2. Gather stone and wood from nodes on the island.
3. Sell resources for money and/or craft basic items.
4. Spend money to upgrade the island and unlock additional land/islands.
5. Explore newly unlocked areas and discover at least one unique place (e.g. lava world).
6. Find dungeon entrance steps, complete a dungeon for loot, and portal home.

Exact recipes, upgrade costs, dungeon layouts, and biome list will be defined as design firms up.

## Platform & constraints

- **Primary target:** modern desktop browsers (Chrome/Firefox/Safari/Edge).
- **Input:** keyboard + mouse (controller/mobile TBD).
- **Performance budget:** stable framerate on a small scene with modest entity counts.
- **Delivery:** static or simply hosted web app.

## Success criteria (initial)

- Player can move around the home island in third person without broken camera/collision.
- Gather → sell and/or craft → earn money → island upgrade works end-to-end.
- At least one additional island/area can be unlocked and visited.
- At least one dungeon run awards loot and returns the player home via portal.
- Session is understandable without a long tutorial (short onboarding copy/UI is enough).
- Codebase remains approachable: clear separation of world (R3F), systems (Zustand/domain), and UI (React).

## Open questions

- Combat in dungeons: none / light / required for v1?
- Island upgrades: what exactly unlocks per tier (land size, new island, buildings)?
- Selling: who/where do you sell (NPC shop, sell chest, UI button)?
- Crafting: station-based vs anywhere from inventory?
- Dungeon failure: death / retreat / lose loot rules?
- Art direction: low-poly realistic, voxel-ish, or flat stylized?
- Audio: music/SFX scope for v1?
- Mobile / touch support: in or out of v1?

## Milestones

| # | Milestone | Proves |
|---|-----------|--------|
| M0 | Scaffold: Vite + React 19 + fiber v9 + drei v10 + rapier v2 + ecctrl + Zustand v5, blank island plane | Stack installs and renders |
| M1 | Third-person movement + follow camera on home island | Core feel |
| M2 | Gather stone/wood → inventory UI | First interaction loop |
| M3 | Sell + money + craft starter recipes | Economy loop closes |
| M4 | Island upgrade unlocks second area | Expansion works |
| M5 | Dungeon: stairs → path → loot → portal home | Dungeon loop closes |
| M6 | Lava-world biome dressing + local saves + onboarding hints | MVP complete |

## Next steps

1. Lock remaining open questions (combat, selling flow, crafting stations, dungeon failure rules, art direction).
2. Scaffold the project (M0) with the pinned dependency majors above.
3. Build milestones in order, TDD-ing the systems layer (economy, crafting, unlocks).
