# PRD: The Explorer

## Overview

**The Explorer** is a browser-based, third-person 3D sandbox inspired by *Forager*. Players explore a small map, gather resources, craft items, and expand their world through simple building and progression systems.

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
| Map size | Relatively small |
| Graphics | Simple / stylized |
| Physics | Simple (collisions, character movement, interact volumes) |

### Core player fantasy

A compact world you can master: walk a third-person avatar across a small island-like space, harvest materials, open crafting/inventory UI, and unlock or place simple structures that expand what you can do.

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

1. Load into a small 3D map.
2. Move in third person with a follow camera.
3. Interact with gatherable nodes (e.g. trees, rocks, bushes).
4. Store resources in an inventory UI.
5. Craft basic items from recipes.
6. Place or unlock at least one simple build/upgrade that changes the map or player capabilities.

Exact content lists (resources, recipes, buildings) will be defined in follow-up PRD sections as design firms up.

## Platform & constraints

- **Primary target:** modern desktop browsers (Chrome/Firefox/Safari/Edge).
- **Input:** keyboard + mouse (controller/mobile TBD).
- **Performance budget:** stable framerate on a small scene with modest entity counts.
- **Delivery:** static or simply hosted web app.

## Success criteria (initial)

- Player can move around the map in third person without broken camera/collision.
- At least one full gather → inventory → craft loop works end-to-end.
- Session is understandable without a long tutorial (short onboarding copy/UI is enough).
- Codebase remains approachable: clear separation of world (R3F), systems (Zustand/domain), and UI (React).

## Open questions

- Combat: none / light / required for v1?
- Building depth: placeables vs unlock-only structures?
- Save system: local save only for v1?
- Progression: skill tree, tech unlocks, or recipe gating only?
- Art direction: low-poly realistic, voxel-ish, or flat stylized?
- Audio: music/SFX scope for v1?
- Mobile / touch support: in or out of v1?

## Next steps

1. Lock open questions needed for MVP scope.
2. Expand this PRD with user stories, MVP feature list, and out-of-scope backlog.
3. Scaffold the Vite + React + R3F project from the agreed stack.
