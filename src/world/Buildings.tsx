import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { useGameStore } from '../stores/gameStore'
import type { BuildingKind } from '../systems/building'
import {
  ADVANCED_CAMPFIRE_LIGHT_RADIUS,
  CAMPFIRE_LIGHT_RADIUS,
} from '../systems/campfireLight'

/** Walk-through rocks and little logs around an advanced campfire (scenery only). */
function AdvancedCampfireScenery() {
  return (
    <group>
      {/* Rocks */}
      <mesh castShadow position={[1.35, 0.12, 0.55]} rotation={[0.2, 0.4, 0.1]}>
        <icosahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial color="#6a6860" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[-1.2, 0.1, 0.85]} rotation={[0.1, -0.6, 0.15]}>
        <icosahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial color="#5c5a52" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0.9, 0.14, -1.4]} rotation={[-0.15, 0.8, 0.05]}>
        <icosahedronGeometry args={[0.26, 0]} />
        <meshStandardMaterial color="#737068" roughness={0.92} />
      </mesh>
      <mesh castShadow position={[-1.45, 0.11, -0.7]} rotation={[0.25, 0.2, -0.1]}>
        <icosahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color="#68655c" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0.15, 0.09, 1.55]} rotation={[0.05, -0.3, 0.2]}>
        <icosahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial color="#5a5850" roughness={0.95} />
      </mesh>
      {/* Little logs on the ground — walk-through, not gatherable */}
      <mesh castShadow position={[1.55, 0.08, -0.35]} rotation={[0, 0.6, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.08, 0.55, 6]} />
        <meshStandardMaterial color="#5c3a1e" />
      </mesh>
      <mesh castShadow position={[-0.65, 0.07, -1.5]} rotation={[0.05, -0.4, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.07, 0.48, 6]} />
        <meshStandardMaterial color="#6a4424" />
      </mesh>
      <mesh castShadow position={[-1.6, 0.075, 0.25]} rotation={[-0.05, 1.1, Math.PI / 2]}>
        <cylinderGeometry args={[0.065, 0.07, 0.5, 6]} />
        <meshStandardMaterial color="#4e3218" />
      </mesh>
      <mesh castShadow position={[0.55, 0.07, 1.35]} rotation={[0.08, -1.2, Math.PI / 2]}>
        <cylinderGeometry args={[0.055, 0.06, 0.42, 6]} />
        <meshStandardMaterial color="#633e20" />
      </mesh>
    </group>
  )
}

/** Lights the area at night; quiet flame during the day. */
function CampfireMesh({
  yaw,
  advanced = false,
}: {
  yaw: number
  advanced?: boolean
}) {
  const phase = useGameStore((s) => s.dayNight.phase)
  const night = phase === 'night'
  const flameIntensity = night ? (advanced ? 1.8 : 1.35) : advanced ? 0.65 : 0.45
  const flameH = advanced ? 1.0 : 0.7
  const flameR = advanced ? 0.38 : 0.28
  const lightIntensity = advanced ? 2.2 : 1.4
  const lightDistance = advanced
    ? ADVANCED_CAMPFIRE_LIGHT_RADIUS
    : CAMPFIRE_LIGHT_RADIUS

  return (
    <group rotation={[0, yaw, 0]}>
      <mesh castShadow position={[0, 0.12, 0]}>
        <cylinderGeometry args={[advanced ? 0.7 : 0.55, advanced ? 0.8 : 0.65, 0.2, 8]} />
        <meshStandardMaterial color="#4a3018" />
      </mesh>
      {/* Log pile under the flame */}
      <mesh castShadow position={[-0.12, 0.22, 0.05]} rotation={[0.15, 0.4, 1.2]}>
        <cylinderGeometry args={[0.08, 0.09, advanced ? 0.85 : 0.7, 6]} />
        <meshStandardMaterial color="#5c3a1e" />
      </mesh>
      <mesh castShadow position={[0.14, 0.2, -0.06]} rotation={[-0.2, -0.5, 1.05]}>
        <cylinderGeometry args={[0.07, 0.08, advanced ? 0.8 : 0.65, 6]} />
        <meshStandardMaterial color="#6a4424" />
      </mesh>
      <mesh castShadow position={[0.02, 0.24, 0.12]} rotation={[0.35, 0.1, 0.95]}>
        <cylinderGeometry args={[0.06, 0.07, advanced ? 0.7 : 0.55, 6]} />
        <meshStandardMaterial color="#4e3218" />
      </mesh>
      <mesh castShadow position={[-0.05, 0.18, -0.16]} rotation={[-0.1, 0.8, 1.35]}>
        <cylinderGeometry args={[0.065, 0.075, advanced ? 0.75 : 0.6, 6]} />
        <meshStandardMaterial color="#633e20" />
      </mesh>
      {advanced ? (
        <mesh castShadow position={[0.08, 0.26, 0.02]} rotation={[0.05, -0.3, 1.15]}>
          <cylinderGeometry args={[0.07, 0.08, 0.72, 6]} />
          <meshStandardMaterial color="#5a381c" />
        </mesh>
      ) : null}
      <mesh position={[0, advanced ? 0.62 : 0.52, 0]}>
        <coneGeometry args={[flameR, flameH, 6]} />
        <meshStandardMaterial
          color={advanced ? '#ff9933' : '#ff7722'}
          emissive="#ff4400"
          emissiveIntensity={flameIntensity}
        />
      </mesh>
      {night ? (
        <pointLight
          position={[0, advanced ? 1.5 : 1.2, 0]}
          intensity={lightIntensity}
          distance={lightDistance}
          color="#ff8844"
          castShadow={false}
        />
      ) : null}
      {advanced ? <AdvancedCampfireScenery /> : null}
    </group>
  )
}

function BuildingMesh({ kind, yaw }: { kind: BuildingKind; yaw: number }) {
  if (kind === 'workbench') {
    return (
      <group rotation={[0, yaw, 0]}>
        <mesh castShadow position={[0, 0.45, 0]}>
          <boxGeometry args={[1.4, 0.15, 0.8]} />
          <meshStandardMaterial color="#8b5a2b" />
        </mesh>
        <mesh castShadow position={[-0.55, 0.22, -0.28]}>
          <boxGeometry args={[0.12, 0.44, 0.12]} />
          <meshStandardMaterial color="#5a3a18" />
        </mesh>
        <mesh castShadow position={[0.55, 0.22, -0.28]}>
          <boxGeometry args={[0.12, 0.44, 0.12]} />
          <meshStandardMaterial color="#5a3a18" />
        </mesh>
        <mesh castShadow position={[-0.55, 0.22, 0.28]}>
          <boxGeometry args={[0.12, 0.44, 0.12]} />
          <meshStandardMaterial color="#5a3a18" />
        </mesh>
        <mesh castShadow position={[0.55, 0.22, 0.28]}>
          <boxGeometry args={[0.12, 0.44, 0.12]} />
          <meshStandardMaterial color="#5a3a18" />
        </mesh>
        {/* Hammer */}
        <group position={[-0.35, 0.58, 0.12]} rotation={[0, 0.4, 0.15]}>
          <mesh castShadow>
            <boxGeometry args={[0.06, 0.06, 0.42]} />
            <meshStandardMaterial color="#6b4420" />
          </mesh>
          <mesh castShadow position={[0, 0, -0.18]}>
            <boxGeometry args={[0.18, 0.12, 0.12]} />
            <meshStandardMaterial color="#8a9098" metalness={0.55} roughness={0.35} />
          </mesh>
        </group>
        {/* Saw */}
        <group position={[0.15, 0.56, -0.18]} rotation={[0.05, -0.55, 0.08]}>
          <mesh castShadow>
            <boxGeometry args={[0.05, 0.05, 0.38]} />
            <meshStandardMaterial color="#5a3a18" />
          </mesh>
          <mesh castShadow position={[0, 0.02, 0.22]}>
            <boxGeometry args={[0.04, 0.1, 0.22]} />
            <meshStandardMaterial color="#b0b6be" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
        {/* Chisel */}
        <group position={[0.48, 0.55, 0.2]} rotation={[0, -0.9, 0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.04, 0.04, 0.28]} />
            <meshStandardMaterial color="#4a3020" />
          </mesh>
          <mesh castShadow position={[0, 0, 0.14]}>
            <boxGeometry args={[0.05, 0.05, 0.08]} />
            <meshStandardMaterial color="#9aa0a8" metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
      </group>
    )
  }
  if (kind === 'furnace') {
    return (
      <group rotation={[0, yaw, 0]}>
        <mesh castShadow position={[0, 0.55, 0]}>
          <boxGeometry args={[1.1, 1.1, 1.1]} />
          <meshStandardMaterial color="#5a5a5a" />
        </mesh>
        <mesh position={[0, 0.45, 0.56]}>
          <boxGeometry args={[0.45, 0.4, 0.08]} />
          <meshStandardMaterial color="#ff6622" emissive="#cc2200" emissiveIntensity={0.55} />
        </mesh>
      </group>
    )
  }
  if (kind === 'campfire') {
    return <CampfireMesh yaw={yaw} />
  }
  if (kind === 'advanced-campfire') {
    return <CampfireMesh yaw={yaw} advanced />
  }
  return (
    <group rotation={[0, yaw, 0]}>
      {/* Short post + thin rail — fits the player scale */}
      <mesh castShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[0.1, 0.7, 0.1]} />
        <meshStandardMaterial color="#8b5a2b" />
      </mesh>
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[0.7, 0.07, 0.07]} />
        <meshStandardMaterial color="#6b4420" />
      </mesh>
      <mesh castShadow position={[0, 0.32, 0]}>
        <boxGeometry args={[0.7, 0.06, 0.06]} />
        <meshStandardMaterial color="#5a3a18" />
      </mesh>
    </group>
  )
}

function BuildingCollider({ kind, yaw }: { kind: BuildingKind; yaw: number }) {
  if (kind === 'campfire') {
    return (
      <RigidBody type="fixed" colliders={false} rotation={[0, yaw, 0]}>
        <CylinderCollider args={[0.35, 0.55]} position={[0, 0.35, 0]} />
      </RigidBody>
    )
  }
  if (kind === 'advanced-campfire') {
    return (
      <RigidBody type="fixed" colliders={false} rotation={[0, yaw, 0]}>
        <CylinderCollider args={[0.45, 0.7]} position={[0, 0.45, 0]} />
      </RigidBody>
    )
  }
  if (kind === 'workbench') {
    return (
      <RigidBody type="fixed" colliders={false} rotation={[0, yaw, 0]}>
        <CuboidCollider args={[0.7, 0.45, 0.4]} position={[0, 0.45, 0]} />
      </RigidBody>
    )
  }
  return null
}

export function Buildings() {
  const buildings = useGameStore((s) => s.buildings)
  return (
    <>
      {buildings.map((b) => (
        <group key={b.id} position={b.position}>
          <BuildingMesh kind={b.kind} yaw={b.yaw} />
          <BuildingCollider kind={b.kind} yaw={b.yaw} />
        </group>
      ))}
    </>
  )
}
