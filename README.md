# The Explorer

A browser-based, third-person 3D sandbox inspired by *Forager*: gather, craft, sell to the traveling merchant, expand your island, and raid dungeons for loot.

See [`PRD.md`](PRD.md) for the full product spec and [`ACTION_LIST.md`](ACTION_LIST.md) for current status.

## Stack

- [Vite](https://vite.dev) + TypeScript + React 19
- [@react-three/fiber](https://r3f.docs.pmnd.rs) v9 (three.js renderer)
- [@react-three/drei](https://github.com/pmndrs/drei) v10 (helpers)
- [@react-three/rapier](https://github.com/pmndrs/react-three-rapier) v2 (physics)
- [ecctrl](https://github.com/pmndrs/ecctrl) (third-person character controller)
- [Zustand](https://github.com/pmndrs/zustand) v5 (game state)
- [Vitest](https://vitest.dev) (unit tests, in `tests/`)

## Development

```bash
npm install
npm run dev        # start dev server
npm test           # run unit tests once
npm run test:watch # run tests in watch mode
npm run build      # type-check + production build
npm run lint       # oxlint
```

## Project layout

```
src/
  App.tsx     # Canvas + physics app shell
  world/      # R3F scene components (islands, biomes, dungeons)
  player/     # Character controller, follow camera
  systems/    # Domain logic (economy, crafting, unlocks) — React-free
  stores/     # Zustand stores
  ui/         # React HUD overlays
  data/       # Static content: items, recipes, prices
tests/        # Vitest unit tests for systems and stores
```
