import { useFrame } from '@react-three/fiber'
import { useGameStore } from '../stores/gameStore'

/** Advances the day/night clock every frame. */
export function DayNightClock() {
  useFrame((_, delta) => {
    useGameStore.getState().tick(delta)
  })
  return null
}
