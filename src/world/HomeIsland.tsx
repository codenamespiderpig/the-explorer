import { RigidBody } from '@react-three/rapier'

const ISLAND_SIZE = 24
const ISLAND_THICKNESS = 2

/** Blank home island: a fixed physics slab the player will walk on (M0). */
export function HomeIsland() {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh receiveShadow position={[0, -ISLAND_THICKNESS / 2, 0]}>
        <boxGeometry args={[ISLAND_SIZE, ISLAND_THICKNESS, ISLAND_SIZE]} />
        <meshStandardMaterial color="#6abe30" />
      </mesh>
    </RigidBody>
  )
}
