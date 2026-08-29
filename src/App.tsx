import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { HomeIsland } from './world/HomeIsland'
import { WaterWorld, LavaWorld, LockedIslandHints } from './world/BiomeWorlds'
import { Player } from './player/Player'
import { Hud } from './ui/Hud'
import { DayNightClock } from './world/DayNightClock'
import { DayNightAtmosphere } from './world/DayNightAtmosphere'
import { Gates } from './world/Gates'
import { NightSlimes } from './world/NightSlimes'
import { SlimeCastles } from './world/SlimeCastles'
import { TravelingMerchant } from './world/TravelingMerchant'

export default function App() {
  return (
    <div id="game-root">
      <Canvas shadows camera={{ position: [0, 6, 12], fov: 50 }}>
        <DayNightAtmosphere />
        <Suspense fallback={null}>
          <Physics>
            <DayNightClock />
            <HomeIsland />
            <LockedIslandHints />
            <WaterWorld />
            <LavaWorld />
            <Gates />
            <SlimeCastles />
            <TravelingMerchant />
            <NightSlimes />
            <Player />
          </Physics>
        </Suspense>
      </Canvas>
      <Hud />
    </div>
  )
}
