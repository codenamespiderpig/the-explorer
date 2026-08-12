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

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Bundler / app shell | **Vite** | Fast local iteration for a web game |
| Language | **TypeScript** | Safer game systems and UI code |
| UI framework | **React** | Forager-style inventory, crafting, and menus are UI-heavy |
| 3D rendering | **React Three Fiber** (three.js) | Stylized 3D scenes with a strong web ecosystem |
| 3D helpers | **@react-three/drei** | Cameras, loaders, common scene utilities |
| Physics | **Rapier** (`@react-three/rapier`) | Colliders, simple character controller, pickups |
| Client state | **Zustand** | Inventory, recipes, world flags without heavy boilerplate |

### Stack notes

- WebGL is used underneath via three.js; we will **not** write raw WebGL for gameplay features.
- Prefer low-poly GLTF assets and simple materials over custom shaders unless needed.
- Prefer trigger volumes and capsule collision over complex physics behaviors.

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
- Save system: local save only for v1?
- How many islands/biomes for MVP vs later (lava world in MVP)?
- Dungeon failure: death / retreat / lose loot rules?
- Art direction: low-poly realistic, voxel-ish, or flat stylized?
- Audio: music/SFX scope for v1?
- Mobile / touch support: in or out of v1?

## Next steps

1. Lock open questions needed for MVP scope.
2. Expand this PRD with user stories, MVP feature list, and out-of-scope backlog.
3. Scaffold the Vite + React + R3F project from the agreed stack.
