import { RigidBody } from '@react-three/rapier'
import { Gatherable } from './Gatherable'

const ISLAND_SIZE = 28
const ISLAND_THICKNESS = 2

const TREES: Array<{ id: string; position: [number, number, number] }> = [
  { id: 'tree-1', position: [-6, 0, -5] },
  { id: 'tree-2', position: [-4, 0, 6] },
  { id: 'tree-3', position: [7, 0, -3] },
  { id: 'tree-4', position: [5, 0, 7] },
]

const ROCKS: Array<{ id: string; position: [number, number, number] }> = [
  { id: 'rock-1', position: [4, 0, -7] },
  { id: 'rock-2', position: [-8, 0, 2] },
  { id: 'rock-3', position: [8, 0, 4] },
]

/** Home island slab plus forageable trees and rocks. */
export function HomeIsland() {
  return (
    <group>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -ISLAND_THICKNESS / 2, 0]}>
          <boxGeometry args={[ISLAND_SIZE, ISLAND_THICKNESS, ISLAND_SIZE]} />
          <meshStandardMaterial color="#6abe30" />
        </mesh>
      </RigidBody>

      {TREES.map((tree) => (
        <Gatherable key={tree.id} id={tree.id} resource="wood" position={tree.position} />
      ))}
      {ROCKS.map((rock) => (
        <Gatherable key={rock.id} id={rock.id} resource="stone" position={rock.position} />
      ))}
    </group>
  )
}
