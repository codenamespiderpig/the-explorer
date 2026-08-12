import { useEffect, useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Ecctrl, type EcctrlHandle } from 'ecctrl'
import { EcctrlCameraControls } from 'ecctrl/camera'
import type { EcctrlCameraControls as EcctrlCameraControlsHandle } from 'ecctrl/camera'
import { canGather, gatherYield } from '../systems/gather'
import { useInventoryStore } from '../stores/inventoryStore'

function CharacterModel() {
  return (
    <group>
      <mesh castShadow position={[0, 0.35, 0]}>
        <capsuleGeometry args={[0.28, 0.5, 4, 8]} />
        <meshStandardMaterial color="#3d7ea6" />
      </mesh>
      <mesh castShadow position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#f0c7a0" />
      </mesh>
    </group>
  )
}

function FollowCamera({ ecctrl }: { ecctrl: RefObject<EcctrlHandle | null> }) {
  const cameraControls = useRef<EcctrlCameraControlsHandle>(null)
  const initialized = useRef(false)

  useFrame(() => {
    if (!ecctrl.current || !cameraControls.current) return
    const pos = ecctrl.current.currPos
    if (!initialized.current) {
      cameraControls.current.setLookAt(
        pos.x,
        pos.y + 4,
        pos.z + 8,
        pos.x,
        pos.y + 1.2,
        pos.z,
        false,
      )
      initialized.current = true
    }
    cameraControls.current.moveTo(pos.x, pos.y + 1.2, pos.z, true)
  })

  return (
    <EcctrlCameraControls
      ref={cameraControls}
      makeDefault
      smoothTime={0.15}
      maxDistance={12}
      minDistance={3}
      maxPolarAngle={Math.PI * 0.48}
    />
  )
}

function useGatherInput() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'KeyE' || event.repeat) return
      const state = useInventoryStore.getState()
      const { nearbyNodeId, nearbyResource, tools } = state
      if (!nearbyNodeId || !nearbyResource) {
        state.setHint('Walk closer to a tree or rock, then press E')
        return
      }
      if (!canGather(nearbyResource, tools)) {
        state.setHint(
          nearbyResource === 'wood'
            ? 'You need an axe to chop wood'
            : 'You need a pickaxe to mine stone',
        )
        return
      }
      const { item, amount } = gatherYield(nearbyResource)
      state.addItem(item, amount)
      window.dispatchEvent(
        new CustomEvent('explorer:harvest', { detail: { nodeId: nearbyNodeId } }),
      )
      state.setHint(`Gathered ${amount} ${item}`)
      state.setNearby(null, null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}

export function Player() {
  const ecctrl = useRef<EcctrlHandle>(null)
  useGatherInput()

  return (
    <>
      <Ecctrl
        ref={ecctrl}
        position={[0, 3, 0]}
        maxWalkVel={4}
        maxRunVel={7}
        jumpVel={5}
        floatHeight={0.2}
        capsuleHalfHeight={0.4}
        capsuleRadius={0.3}
      >
        <CharacterModel />
      </Ecctrl>
      <FollowCamera ecctrl={ecctrl} />
    </>
  )
}
