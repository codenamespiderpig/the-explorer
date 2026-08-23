import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import type { ToolId } from '../data/items'
import { useToolActionStore } from '../stores/toolActionStore'
import { swingPhase, swingRotationX, swingRotationZ } from '../systems/toolSwing'

function SwordMesh() {
  return (
    <group rotation={[0, 0, -0.15]}>
      <mesh castShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[0.06, 0.52, 0.04]} />
        <meshStandardMaterial color="#c8c8c8" metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh castShadow position={[0, -0.08, 0]}>
        <boxGeometry args={[0.18, 0.04, 0.06]} />
        <meshStandardMaterial color="#d8d8d8" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[0, -0.16, 0]}>
        <boxGeometry args={[0.05, 0.12, 0.05]} />
        <meshStandardMaterial color="#4a3018" />
      </mesh>
    </group>
  )
}

function AxeMesh() {
  return (
    <group rotation={[0, 0, 0.2]}>
      <mesh castShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.035, 0.04, 0.62, 6]} />
        <meshStandardMaterial color="#4a3018" />
      </mesh>
      <mesh castShadow position={[0.1, 0.46, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.18, 0.26, 0.06]} />
        <meshStandardMaterial color="#a8adb5" metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  )
}

function PickaxeMesh() {
  return (
    <group rotation={[0, 0, -0.2]}>
      <mesh castShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.035, 0.04, 0.62, 6]} />
        <meshStandardMaterial color="#4a3018" />
      </mesh>
      <mesh castShadow position={[0, 0.46, 0]}>
        <boxGeometry args={[0.34, 0.08, 0.06]} />
        <meshStandardMaterial color="#959aa3" metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  )
}

function ToolMesh({ tool }: { tool: ToolId }) {
  if (tool === 'wooden-sword') return <SwordMesh />
  if (tool === 'wooden-axe') return <AxeMesh />
  return <PickaxeMesh />
}

/** Active tool held out in front of the player during a swing. */
export function ToolSwing() {
  const groupRef = useRef<Group>(null)
  const swinging = useToolActionStore((s) => s.swinging)
  const swingStart = useToolActionStore((s) => s.swingStart)
  const activeTool = swinging ?? 'wooden-sword'

  useFrame((state) => {
    const group = groupRef.current
    if (!group) return

    const store = useToolActionStore.getState()
    store.updateSwing(state.clock.elapsedTime)

    const active = store.swinging
    if (!active) {
      group.visible = false
      return
    }

    const elapsed = state.clock.elapsedTime - swingStart
    const phase = swingPhase(elapsed)
    group.visible = true
    group.position.set(
      0.34,
      0.5 + Math.sin(phase * Math.PI) * 0.1,
      0.42 + Math.sin(phase * Math.PI) * 0.12,
    )
    group.rotation.set(swingRotationX(phase), 0.15, swingRotationZ(phase))
  })

  return (
    <group ref={groupRef} visible={false}>
      <ToolMesh tool={activeTool} />
      <mesh rotation={[0.2, 0, 0.4]} position={[0, 0.08, -0.08]}>
        <torusGeometry args={[0.42, 0.018, 6, 16, Math.PI * 0.55]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.28}
          emissive="#ffffff"
          emissiveIntensity={0.35}
        />
      </mesh>
    </group>
  )
}
