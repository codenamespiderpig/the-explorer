import { useEffect, useState } from 'react'
import { BallCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import type { ResourceId } from '../data/items'
import { registerGatherable, unregisterGatherable } from './gatherableRegistry'

const RESPAWN_MS = 2500

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

  useEffect(() => {
    if (!available) {
      unregisterGatherable(id)
      return
    }
    registerGatherable({ id, resource, position })
    return () => unregisterGatherable(id)
  }, [id, resource, position, available])

  useEffect(() => {
    const onHarvest = (event: Event) => {
      const detail = (event as CustomEvent<{ nodeId: string }>).detail
      if (detail.nodeId !== id) return
      setAvailable(false)
      unregisterGatherable(id)
      window.setTimeout(() => setAvailable(true), RESPAWN_MS)
    }
    window.addEventListener('explorer:harvest', onHarvest)
    return () => window.removeEventListener('explorer:harvest', onHarvest)
  }, [id])

  if (!available) return null

  if (resource === 'wood') {
    return (
      <RigidBody type="fixed" position={position} colliders={false}>
        <CylinderCollider args={[0.7, 0.4]} position={[0, 0.7, 0]} />
        <TreeVisual />
      </RigidBody>
    )
  }

  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <BallCollider args={[0.65]} position={[0, 0.4, 0]} />
      <RockVisual />
    </RigidBody>
  )
}
