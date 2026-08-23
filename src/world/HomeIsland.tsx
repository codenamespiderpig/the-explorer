import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useGameStore } from '../stores/gameStore'
import { Gatherable } from './Gatherable'
import { islandSize } from './bounds'

const ISLAND_THICKNESS = 2
const WALL_HEIGHT = 12
const WALL_THICKNESS = 2
const WALL_Y = WALL_HEIGHT / 2 - 0.5

const TREES: Array<{ id: string; position: [number, number, number] }> = [
  { id: 'tree-1', position: [-6, 0, -5] },
  { id: 'tree-2', position: [-4, 0, 6] },
  { id: 'tree-3', position: [7, 0, -3] },
  { id: 'tree-4', position: [5, 0, 7] },
  { id: 'tree-5', position: [-10, 0, -8] },
  { id: 'tree-6', position: [-12, 0, 4] },
  { id: 'tree-7', position: [-9, 0, 10] },
  { id: 'tree-8', position: [10, 0, -8] },
  { id: 'tree-9', position: [12, 0, 2] },
  { id: 'tree-10', position: [9, 0, 11] },
  { id: 'tree-11', position: [-2, 0, -11] },
  { id: 'tree-12', position: [2, 0, 12] },
  { id: 'tree-13', position: [-14, 0, -2] },
  { id: 'tree-14', position: [14, 0, -4] },
  { id: 'tree-15', position: [-7, 0, 0] },
  { id: 'tree-16', position: [6, 0, 3] },
]

const ROCKS: Array<{ id: string; position: [number, number, number] }> = [
  { id: 'rock-1', position: [4, 0, -7] },
  { id: 'rock-2', position: [-8, 0, 2] },
  { id: 'rock-3', position: [8, 0, 4] },
  { id: 'rock-4', position: [-11, 0, -6] },
  { id: 'rock-5', position: [-5, 0, -10] },
  { id: 'rock-6', position: [11, 0, -5] },
  { id: 'rock-7', position: [3, 0, 10] },
  { id: 'rock-8', position: [-13, 0, 7] },
  { id: 'rock-9', position: [13, 0, 8] },
  { id: 'rock-10', position: [0, 0, -13] },
  { id: 'rock-11', position: [-3, 0, 9] },
  { id: 'rock-12', position: [7, 0, -11] },
]

function InvisibleWalls({ size }: { size: number }) {
  const hx = WALL_THICKNESS / 2
  const hy = WALL_HEIGHT / 2
  const half = size / 2
  const hz = size / 2 + hx
  const inset = half - hx

  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[hz, hy, hx]} position={[0, WALL_Y, inset]} />
      <CuboidCollider args={[hz, hy, hx]} position={[0, WALL_Y, -inset]} />
      <CuboidCollider args={[hx, hy, hz]} position={[inset, WALL_Y, 0]} />
      <CuboidCollider args={[hx, hy, hz]} position={[-inset, WALL_Y, 0]} />
    </RigidBody>
  )
}

/** Home island slab plus forageable trees and rocks. */
export function HomeIsland() {
  const landTier = useGameStore((s) => s.landTier)
  const size = islandSize(landTier)

  return (
    <group>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow position={[0, -ISLAND_THICKNESS / 2, 0]}>
          <boxGeometry args={[size, ISLAND_THICKNESS, size]} />
          <meshStandardMaterial color="#6abe30" />
        </mesh>
      </RigidBody>
      <InvisibleWalls size={size} />

      {TREES.map((tree) => (
        <Gatherable key={tree.id} id={tree.id} resource="wood" position={tree.position} />
      ))}
      {ROCKS.map((rock) => (
        <Gatherable key={rock.id} id={rock.id} resource="stone" position={rock.position} />
      ))}
    </group>
  )
}
