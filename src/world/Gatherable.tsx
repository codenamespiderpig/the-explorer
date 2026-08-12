import { useEffect, useState } from 'react'
import { RigidBody } from '@react-three/rapier'
import type { ResourceId } from '../data/items'
import { useInventoryStore } from '../stores/inventoryStore'

const RESPAWN_MS = 8000

interface GatherableProps {
  id: string
  resource: ResourceId
  position: [number, number, number]
}

function TreeVisual() {
  return (
    <group>
      <mesh castShadow position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.18, 0.25, 1.2, 8]} />
        <meshStandardMaterial color="#8b5a2b" />
      </mesh>
      <mesh castShadow position={[0, 1.6, 0]}>
        <coneGeometry args={[0.9, 1.6, 8]} />
        <meshStandardMaterial color="#2f8f2f" />
      </mesh>
    </group>
  )
}

function RockVisual() {
  return (
    <mesh castShadow position={[0, 0.35, 0]} scale={[1, 0.7, 1.1]}>
      <dodecahedronGeometry args={[0.55, 0]} />
      <meshStandardMaterial color="#8a8f98" flatShading />
    </mesh>
  )
}

export function Gatherable({ id, resource, position }: GatherableProps) {
  const [available, setAvailable] = useState(true)
  const setNearby = useInventoryStore((s) => s.setNearby)
  const setHint = useInventoryStore((s) => s.setHint)

  useEffect(() => {
    const onHarvest = (event: Event) => {
      const detail = (event as CustomEvent<{ nodeId: string }>).detail
      if (detail.nodeId !== id) return
      setAvailable(false)
      setNearby(null, null)
      window.setTimeout(() => setAvailable(true), RESPAWN_MS)
    }
    window.addEventListener('explorer:harvest', onHarvest)
    return () => window.removeEventListener('explorer:harvest', onHarvest)
  }, [id, setNearby])

  if (!available) return null

  return (
    <group position={position}>
      {resource === 'wood' ? <TreeVisual /> : <RockVisual />}
      <RigidBody
        type="fixed"
        colliders="ball"
        sensor
        position={[0, 1, 0]}
        onIntersectionEnter={() => {
          setNearby(id, resource)
          setHint(`Press E to gather ${resource}`)
        }}
        onIntersectionExit={() => {
          const state = useInventoryStore.getState()
          if (state.nearbyNodeId === id) {
            setNearby(null, null)
            setHint(
              'WASD move · Hold left mouse to look · Walk to a tree or rock and press E',
            )
          }
        }}
      >
        <mesh visible={false}>
          <sphereGeometry args={[1.4, 8, 8]} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.4, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[0.6, 0.8, 0.6]} />
        </mesh>
      </RigidBody>
    </group>
  )
}
