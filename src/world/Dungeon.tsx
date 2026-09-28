import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useGameStore } from '../stores/gameStore'
import {
  canEnterDungeon,
  DUNGEON_CHEST,
  DUNGEON_ENTRANCE,
  DUNGEON_PORTAL,
  DUNGEON_SPAWN,
} from '../systems/dungeon'

function StairStep({
  position,
  size,
}: {
  position: [number, number, number]
  size: [number, number, number]
}) {
  return (
    <mesh castShadow receiveShadow position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#5a5348" />
    </mesh>
  )
}

/** Overworld entrance — glowing stairs after first land unlock. */
function DungeonEntrance() {
  const landTier = useGameStore((s) => s.landTier)
  const open = canEnterDungeon(landTier)
  const [ex, , ez] = DUNGEON_ENTRANCE

  return (
    <group position={[ex, 0, ez]}>
      {/* Visual only — no solid collider so you can walk up and press E */}
      <StairStep position={[0, 0.15, 0.7]} size={[2.6, 0.3, 0.7]} />
      <StairStep position={[0, 0.4, 0.1]} size={[2.4, 0.3, 0.7]} />
      <StairStep position={[0, 0.65, -0.5]} size={[2.2, 0.3, 0.7]} />
      <mesh position={[0, 1.1, -0.9]}>
        <boxGeometry args={[2.4, 1.6, 0.35]} />
        <meshStandardMaterial
          color={open ? '#2a2018' : '#3a3a3a'}
          emissive={open ? '#886622' : '#111'}
          emissiveIntensity={open ? 0.45 : 0.05}
        />
      </mesh>
      <mesh position={[0, 1.9, -0.7]}>
        <boxGeometry args={[1.4, 0.25, 0.2]} />
        <meshStandardMaterial
          color={open ? '#ffcc66' : '#666'}
          emissive={open ? '#ffaa33' : '#000'}
          emissiveIntensity={open ? 0.7 : 0}
        />
      </mesh>
      {open ? (
        <mesh position={[0, 0.05, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.6, 2.1, 24]} />
          <meshStandardMaterial
            color="#ffcc66"
            emissive="#ffaa33"
            emissiveIntensity={0.55}
            transparent
            opacity={0.65}
          />
        </mesh>
      ) : null}
    </group>
  )
}

function Platform({
  position,
  size,
  color = '#3a342c',
}: {
  position: [number, number, number]
  size: [number, number, number]
  color?: string
}) {
  const [sx, sy, sz] = size
  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <CuboidCollider args={[sx / 2, sy / 2, sz / 2]} />
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  )
}

function DungeonInterior() {
  const chestOpened = useGameStore((s) => s.dungeonChestOpened)
  const [sx, sy, sz] = DUNGEON_SPAWN
  const [cx, cy, cz] = DUNGEON_CHEST
  const [px, py, pz] = DUNGEON_PORTAL

  return (
    <group>
      <ambientLight intensity={0.35} />
      <pointLight position={[sx, sy + 6, sz + 14]} intensity={1.4} distance={40} color="#ffd8a0" />

      {/* Entry floor — thick so you don't fall through on spawn */}
      <Platform position={[sx, sy - 1.2, sz]} size={[12, 2.4, 12]} color="#2e2a24" />
      {/* Wider stepping stones — easier jumps */}
      <Platform position={[0, sy - 0.4, 8]} size={[4.5, 0.8, 4]} />
      <Platform position={[1.2, sy + 0.1, 13.5]} size={[4, 0.8, 3.5]} color="#4a4035" />
      <Platform position={[-0.8, sy + 0.35, 18.5]} size={[4, 0.8, 3.5]} color="#4a4035" />
      <Platform position={[0, sy - 0.4, 24]} size={[10, 0.8, 8]} color="#2e2a24" />
      <Platform position={[0, sy - 0.4, 31]} size={[10, 0.8, 8]} color="#2e2a24" />

      {/* Chest — sits on the end platform */}
      <group position={[cx, cy, cz]}>
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[0.7, 0.55, 0.5]} position={[0, 0.55, 0]} />
          <mesh castShadow position={[0, 0.45, 0]}>
            <boxGeometry args={[1.2, 0.7, 0.85]} />
            <meshStandardMaterial color={chestOpened ? '#5a4030' : '#8a5a20'} />
          </mesh>
          <mesh castShadow position={[0, 0.85, 0]}>
            <boxGeometry args={[1.25, 0.25, 0.9]} />
            <meshStandardMaterial
              color={chestOpened ? '#3a2a18' : '#c9a227'}
              emissive={chestOpened ? '#000' : '#aa7700'}
              emissiveIntensity={chestOpened ? 0 : 0.55}
            />
          </mesh>
          {!chestOpened ? (
            <mesh position={[0, 1.6, 0]}>
              <sphereGeometry args={[0.2, 10, 10]} />
              <meshStandardMaterial color="#ffe08a" emissive="#ffcc55" emissiveIntensity={0.9} />
            </mesh>
          ) : null}
        </RigidBody>
      </group>

      {chestOpened ? (
        <group position={[px, py, pz]}>
          <mesh position={[0, 1.4, 0]}>
            <torusGeometry args={[1.1, 0.12, 12, 24]} />
            <meshStandardMaterial color="#88ddff" emissive="#44aaff" emissiveIntensity={0.85} />
          </mesh>
          <mesh position={[0, 1.4, 0]}>
            <circleGeometry args={[1, 24]} />
            <meshStandardMaterial
              color="#a8e8ff"
              emissive="#66ccff"
              emissiveIntensity={0.55}
              transparent
              opacity={0.55}
            />
          </mesh>
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.9, 1.4, 24]} />
            <meshStandardMaterial color="#88ddff" emissive="#44aaff" emissiveIntensity={0.7} />
          </mesh>
        </group>
      ) : null}
    </group>
  )
}

export function Dungeon() {
  const inDungeon = useGameStore((s) => s.inDungeon)
  return (
    <group>
      <DungeonEntrance />
      {inDungeon ? <DungeonInterior /> : null}
    </group>
  )
}
