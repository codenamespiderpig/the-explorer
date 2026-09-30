# Action list

## Done

- [x] Decide tech stack (Vite + TS + React + R3F + Rapier + Zustand + drei)
- [x] Create `PRD.md` with concept, stack, constraints, and open questions
- [x] Document core game mechanics (gather/sell/craft, island upgrades, multi-island, dungeons, biomes)
- [x] Verify stack versions against current docs (React 19 / fiber 9 / drei 10 / rapier 2 / zustand 5; ecctrl for controller)
- [x] Build out `PRD.md`: user stories, MVP feature list, architecture, testing approach, milestones (M0–M6)
- [x] Add combat, tools, dungeon chest, and traveling-merchant mechanics; resolve all open questions with defaults
- [x] M0: Scaffold Vite + React 19 + fiber v9 + drei v10 + rapier v2 + ecctrl + Zustand v5; island slab renders, Vitest wired with first economy test
- [x] M1/M2: Third-person player + follow camera; trees/rocks to forage with E; inventory HUD
- [x] Backpack (Q) with Craft + Learn above inventory; craft recipes and learn skills (hunt/build)
- [x] Day/night cycle + night countdown HUD; night slimes; wooden gates; health/respawn; furnace recipe
- [x] Invisible island barrier: thick Rapier walls + player position clamp so you cannot fall off
- [x] Wider gates that face walk direction or camera look, with rotation baked into the mesh
- [x] Character backpack visual with sword, axe, and pickaxe sticking out
- [x] Show attack key (F) in the health HUD panel
- [x] Tool use animation: tool leaves backpack briefly with a swish on E gather and F attack
- [x] Slime goop drops; hard slime-castle craft (Build); place with C; farm slimes that rot if left unkilled
- [x] Traveling merchant at morning: M to trade; wood/stone 5 money, rare items 15; buy land upgrades
- [x] Merchant stays 90s at a hidden spot; water world (tier 1) and lava world (tier 2)
- [x] Fix land-upgrade fall-through (rebuild floor collider) and open wall gaps for biome bridges
- [x] Land upgrades unlock full distant islands (water north, lava east) instead of shrinking home growth
- [x] Crab pots craft/place near water; catch fish; eat fish (R) to heal wounds
- [x] Crab pots: red top/bottom, cage bars, clearer fish when catch is ready
- [x] Fix north pier gate bounce — align clamp corridor with wall opening and add home docks
- [x] Fix north gate entry physics — flush walkway colliders match home floor height
- [x] Water Island archipelago — land islets, plank paths, deep water between
- [x] Fix bridge exit clamp + bigger blue landing dock on Water Island
- [x] Unified G key to place gates, slime castles, and crab pots
- [x] Fix lava pier exit — prefer lava island clamp over bridge corridor
- [x] Fix lava→home exit; infinite land: water→lava first, then reef/crag extras
- [x] Place crafted buildings (workbench/furnace/campfire/fence) with G
- [x] Campfire shows a log pile; workbench has little tools on top
- [x] Campfire lights the nearby area at night
- [x] Advanced campfire (workbench craft) — wider night light
- [x] Advanced campfire has walk-through rocks and little logs; campfires + workbench block walking
- [x] Night slimes avoid campfire light
- [x] Smaller fences; G prefers workbench / last-crafted placeable (click inventory to pick)

- [x] Top-right minimap — click to open full world overview
- [x] Workbench unlocks advanced crafts (furnace, advanced campfire, slime castle)
- [x] HUD + craft panel explain: place workbench with G to unlock advanced crafts
- [x] Press E beside a placed workbench to open the craft panel
- [x] Home grassland ponds — place crab pots on the banks
- [x] Rainforest land south of home (3rd unlock)
- [x] Different enemies per land; enemies a bit shorter than the player
- [x] Slime faces turn toward their chase target
- [x] First dungeon: home stairs → flat fight hall (5 mobs) → chest → portal home
- [x] Dungeon vanishes after you clear it (chest + leave)
- [x] Dungeon relics spend with T for permanent armour / max HP
- [x] Dungeon end: claim 2 beacon coins beside chest (+20 money each), then E opens the chest
- [x] Lava Island patches burn on step (6 HP, i-frames rate-limit)
- [x] Night/biome enemies respawn ~18s after kill
- [x] Tide blobs leashed to water hub; biome respawns on hub (not grassland)
- [x] Water hub + water unlocks are full-size islands (still buy from merchant)
- [x] Water→home pier exit works; tide leash uses hub center; dungeon mobs take 3 hits

## Now

- [ ] M6 remainder: local saves + onboarding hints

## Next

- [ ] M4: Island upgrade unlocks second area
- [ ] M5 remainder: more dungeon variety / biomes
- [ ] M6: Lava biome + local saves + onboarding hints
- [ ] Armour system to raise max HP toward 145
