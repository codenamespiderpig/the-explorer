import { useMemo } from 'react'
import { Sky } from '@react-three/drei'
import { useGameStore } from '../stores/gameStore'
import { DAY_LENGTH_SEC, CYCLE_LENGTH_SEC } from '../systems/dayNight'

/** Lighting + sky driven by the day/night clock. */
export function DayNightAtmosphere() {
  const elapsed = useGameStore((s) => s.dayNight.elapsed)
  const phase = useGameStore((s) => s.dayNight.phase)

  const sunPosition = useMemo((): [number, number, number] => {
    const t = ((elapsed % CYCLE_LENGTH_SEC) + CYCLE_LENGTH_SEC) % CYCLE_LENGTH_SEC
    // 0 at sunrise, 0.5 at sunset within daytime
    const dayT = Math.min(t / DAY_LENGTH_SEC, 1)
    const angle = phase === 'day' ? Math.PI * dayT : Math.PI + 0.2
    return [Math.cos(angle) * 80, Math.sin(angle) * 60 + (phase === 'night' ? -20 : 10), 40]
  }, [elapsed, phase])

  const ambient = phase === 'day' ? 0.55 : 0.12
  const dirIntensity = phase === 'day' ? 1.2 : 0.15

  return (
    <>
      <Sky sunPosition={sunPosition} mieCoefficient={phase === 'night' ? 0.001 : 0.005} />
      <ambientLight intensity={ambient} />
      <directionalLight
        castShadow
        position={sunPosition}
        intensity={dirIntensity}
        shadow-mapSize={[1024, 1024]}
      />
      {phase === 'night' ? (
        <fog attach="fog" args={['#0a1220', 12, 45]} />
      ) : null}
    </>
  )
}
