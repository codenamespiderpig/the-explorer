import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { useGameStore } from '../stores/gameStore'
import {
  canEnterDungeon,
  DUNGEON_CHEST,
  DUNGEON_COIN_POSITIONS,
  DUNGEON_ENTRANCE,
  DUNGEON_PORTAL,
  DUNGEON_SPAWN,
  shouldHideDungeonEntrance,
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

/** Overworld entrance — glowing stairs; vanishes after the dungeon is cleared. */
function DungeonEntrance() {
  const landTier = useGameStore((s) => s.landTier)
  const completed = useGameStore((s) => s.dungeonCompleted)
  if (shouldHideDungeonEntrance(completed)) return null

  const open = canEnterDungeon(landTier, completed)
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

function DungeonCoin({
  position,
  collected,
  label,
}: {
  position: [number, number, number]
  collected: boolean
  label: string
}) {
  if (collected) return null
  return (
    <group position={position}>
      {/* Tall beacon so you can see coins from down the hall */}
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 4, 8]} />
        <meshStandardMaterial color="#ffe08a" emissive="#ffcc33" emissiveIntensity={0.85} />
      </mesh>
      <mesh position={[0, 4.4, 0]}>
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshStandardMaterial color="#fff3a0" emissive="#ffee66" emissiveIntensity={1.2} />
      </mesh>
      <mesh castShadow position={[0, 0.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.12, 24]} />
        <meshStandardMaterial color="#f0c040" emissive="#ffcc33" emissiveIntensity={0.95} metalness={0.65} />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 1.15, 24]} />
        <meshStandardMaterial color="#ffcc55" emissive="#ffaa22" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

function DungeonInterior() {
  const chestOpened = useGameStore((s) => s.dungeonChestOpened)
  const chestUnlocked = useGameStore((s) => s.dungeonChestUnlocked)
  const coinsCollected = useGameStore((s) => s.dungeonCoinsCollected)
  const [sx, sy, sz] = DUNGEON_SPAWN
  const [cx, cy, cz] = DUNGEON_CHEST
  const [px, py, pz] = DUNGEON_PORTAL

  return (
    <group>
      <ambientLight intensity={0.45} />
      <pointLight position={[sx, sy + 6, sz + 10]} intensity={1.5} distance={50} color="#ffd8a0" />
      <pointLight position={[0, sy + 5, 28]} intensity={1.8} distance={28} color="#ffe8a0" />

      {/* One continuous flat hallway — walk and fight, no jumping required */}
      <Platform position={[0, sy - 1.2, 16]} size={[14, 2.4, 40]} color="#2e2a24" />
      {/* Slight path markings toward the chest */}
      <mesh position={[0, sy + 0.02, 16]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 36]} />
        <meshStandardMaterial color="#4a4035" />
      </mesh>

      {DUNGEON_COIN_POSITIONS.map((pos, i) => (
        <DungeonCoin
          key={i}
          position={pos}
          collected={coinsCollected.includes(i)}
          label={`Coin ${i + 1}`}
        />
      ))}

      {/* Chest — locked until 2 coins are claimed */}
      <group position={[cx, cy, cz]}>
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[0.7, 0.55, 0.5]} position={[0, 0.55, 0]} />
          <mesh castShadow position={[0, 0.45, 0]}>
            <boxGeometry args={[1.2, 0.7, 0.85]} />
            <meshStandardMaterial
              color={chestOpened ? '#5a4030' : chestUnlocked ? '#8a5a20' : '#4a4038'}
            />
          </mesh>
          <mesh castShadow position={[0, 0.85, 0]}>
            <boxGeometry args={[1.25, 0.25, 0.9]} />
            <meshStandardMaterial
              color={chestOpened ? '#3a2a18' : chestUnlocked ? '#c9a227' : '#5a5040'}
              emissive={chestOpened ? '#000' : chestUnlocked ? '#aa7700' : '#221800'}
              emissiveIntensity={chestOpened ? 0 : chestUnlocked ? 0.65 : 0.1}
            />
          </mesh>
          {chestUnlocked && !chestOpened ? (
            <mesh position={[0, 1.6, 0]}>
              <sphereGeometry args={[0.2, 10, 10]} />
              <meshStandardMaterial color="#ffe08a" emissive="#ffcc55" emissiveIntensity={0.9} />
            </mesh>
          ) : null}
          {!chestUnlocked ? (
            <mesh position={[0, 1.35, 0]}>
              <boxGeometry args={[0.35, 0.45, 0.12]} />
              <meshStandardMaterial color="#888" metalness={0.5} />
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
