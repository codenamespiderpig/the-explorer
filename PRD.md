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

1. Player begins on a **medium-sized home island** with **basic tools**: a **wooden sword**, a **pickaxe**, and an **axe**.
2. Gather basic resources with the right tool: **pickaxe → stone**, **axe → wood**.
3. Choose what to do with resources:
   - **Sell** them to the traveling merchant for **money**, or
   - **Keep** them to **craft** items.
4. When the player has enough money, they can **upgrade / expand their island**.

### Tools (starting kit)

| Tool | Use |
|------|-----|
| Wooden sword | Fight mobs in dungeons |
| Pickaxe | Mine stone nodes |
| Axe | Chop trees for wood |

Better tool tiers (crafted or dungeon loot) are a natural upgrade path; only the wooden starting kit is required for MVP.

### Selling & the traveling merchant

- The world runs on a **day/night cycle**.
- **Before nightfall**, a **traveling merchant** arrives on the home island.
- While the merchant is present, the player can **sell anything** from their inventory.
- **Better items sell for more money** — dungeon loot and crafted items outvalue raw stone/wood.
- When night falls, the merchant leaves until the next day.

### Expansion & discovery

- Expanding unlocks **more islands / land**.
- Exploring more land reveals **unique places** and biomes (example: a **lava world**).
- Progression is exploration-driven: more land → more unique locations → more content.

### Dungeons

- On expanded islands, the player may find **steps leading down into a dungeon**.
- Inside, the player must **fight mobs** (wooden sword melee) and **jump onto blocks** (light platforming) to progress.
- At the end sits a **reward chest** containing items to **craft with or sell**.
- After opening the chest, a **portal teleports the player back home**.

### Economy (v1 intent)

| Action | Result |
|--------|--------|
| Gather stone / wood (pickaxe / axe) | Add to inventory |
| Sell to traveling merchant (daytime) | Gain money, scaled by item value |
| Craft items | Spend kept resources and dungeon loot |
| Upgrade island | Spend money; unlock more land / islands |
| Dungeon reward chest | Gain higher-value items for crafting or selling |

### Systems implied by mechanics

| System | Role |
|--------|------|
| Inventory & tools | Hold stone, wood, crafted items, loot; starting sword/pickaxe/axe |
| Day/night cycle | Drives merchant arrival/departure |
| Traveling merchant | Daytime vendor; converts any item → money by value |
| Crafting | Convert resources + loot → items |
| Island upgrades | Money sink; unlock expansion |
| Multi-island world | Separate areas unlocked over time |
| Biomes / unique places | Content variety as the map grows |
| Dungeons | Mob combat + block platforming → reward chest → portal home |
| Combat & health | Sword melee vs dungeon mobs; player health |

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
- As a player, I start with a wooden sword, a pickaxe, and an axe.
- As a player, I can move my character around the home island in third person, with the camera following me.
- As a player, I can mine rocks with my pickaxe and chop trees with my axe.
- As a player, I can open an inventory and see my tools, resources, and loot.
- As a player, I can sell items to the traveling merchant during the day, and better items earn more money.
- As a player, I can craft items from resources and dungeon loot I've kept.

### Expansion
- As a player, I can see how much an island upgrade costs and buy it when I have enough money.
- As a player, when I upgrade, new land/islands become reachable.
- As a player, exploring new land reveals unique places (biomes) that look and feel different.

### Dungeons
- As a player, I can find steps leading down to a dungeon on expanded land.
- As a player, I fight mobs with my sword and jump across blocks to reach the dungeon's end.
- As a player, I open a reward chest at the end and receive items for crafting or selling.
- As a player, after opening the chest, a portal returns me to my home island.
- As a player, if I die in a dungeon, I respawn at home with my inventory intact and the dungeon resets.

### Persistence
- As a player, my progress (inventory, money, unlocks) survives a page reload.

## MVP feature list

**In (v1):**
1. Third-person character controller + follow camera (ecctrl), including jumping
2. Starting tools: wooden sword, pickaxe, axe (tool-gated gathering)
3. Home island with gatherable stone + wood nodes (respawning)
4. Inventory UI (React overlay) with tools, resources, loot
5. Day/night cycle + traveling merchant (sell anything; value-scaled prices) + money HUD
6. Crafting with a small starter recipe list (anywhere, from inventory)
7. One island upgrade tier that unlocks a second area
8. One dungeon: stairs → mob combat + block platforming → reward chest → portal home
9. Light combat: sword swing, 2–3 simple melee mobs, player health hearts
10. One unique biome as the second area (lava world candidate)
11. Local save/load via `localStorage`
12. Minimal onboarding copy (contextual hints, no tutorial flow)

**Out (backlog):**
- Ranged combat, bosses, complex mob AI
- Tool tiers beyond the wooden starting kit
- Multiple upgrade tiers / many islands
- Skill trees, tech unlocks
- Placeable buildings
- Overworld night threats (night is cosmetic in v1)
- Audio (music/SFX)
- Mobile/touch controls, gamepad
- Multiplayer, cloud saves

## Target experience (v1 sketch)

1. Spawn on the medium home island in third person with sword, pickaxe, and axe.
2. Mine stone and chop wood from nodes on the island.
3. Sell to the traveling merchant before nightfall and/or craft basic items.
4. Spend money to upgrade the island and unlock additional land/islands.
5. Explore newly unlocked areas and discover at least one unique place (e.g. lava world).
6. Find dungeon entrance steps, fight mobs, platform across blocks, open the reward chest, and portal home.

Exact recipes, prices, upgrade costs, dungeon layouts, and biome list will be defined in `data/` as content firms up.

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

## Design decisions (user-specified + defaults)

| Question | Decision | Source |
|----------|----------|--------|
| Combat in dungeons | Yes — light melee with wooden sword vs simple mobs | User |
| Selling | Traveling merchant visits home island before nightfall; sells anything, value-scaled | User |
| Dungeon reward | Chest at the end with items for crafting or selling | User |
| Dungeon traversal | Mob fights + jumping onto blocks (light platforming) | User |
| Starting kit | Wooden sword, pickaxe, axe | User |
| Island upgrade tier | Each tier unlocks one new adjacent area/island | Default |
| Crafting location | Anywhere, from inventory (stations deferred) | Default |
| Dungeon failure | Death respawns player at home, inventory intact, dungeon resets | Default |
| Day/night | Fixed-length cycle; drives merchant only, night is cosmetic in v1 | Default |
| Art direction | Low-poly flat stylized (Forager-adjacent, cheap to author) | Default |
| Audio | Out of v1 | Default |
| Mobile/touch | Out of v1; desktop keyboard + mouse | Default |

## Milestones

| # | Milestone | Proves |
|---|-----------|--------|
| M0 | Scaffold: Vite + React 19 + fiber v9 + drei v10 + rapier v2 + ecctrl + Zustand v5, blank island plane | Stack installs and renders |
| M1 | Third-person movement, jumping + follow camera on home island | Core feel |
| M2 | Tool-gated gathering (pickaxe/axe) → inventory UI | First interaction loop |
| M3 | Day/night cycle + traveling merchant selling + money + craft starter recipes | Economy loop closes |
| M4 | Island upgrade unlocks second area | Expansion works |
| M5 | Dungeon: stairs → mobs + sword combat + block platforming → reward chest → portal home | Dungeon loop closes |
| M6 | Lava-world biome dressing + local saves + onboarding hints | MVP complete |

## Next steps

1. Scaffold the project (M0) with the pinned dependency majors above.
2. Build milestones in order, TDD-ing the systems layer (economy, merchant pricing, crafting, unlocks, dungeon flow).
3. Define starter content in `data/`: recipes, item values, upgrade cost, mob stats.
