import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { HomeIsland } from './world/HomeIsland'

export default function App() {
  return (
    <div id="game-root">
      <Canvas shadows camera={{ position: [10, 10, 10], fov: 50 }}>
        <Sky sunPosition={[100, 60, 100]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          position={[50, 50, 25]}
          intensity={1.2}
          shadow-mapSize={[1024, 1024]}
        />
        <Suspense fallback={null}>
          <Physics>
            <HomeIsland />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  )
}
