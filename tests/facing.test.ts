import { describe, expect, it } from 'vitest'
import { cameraLook, facingDirection, yawFromForward } from '../src/systems/facing'
import { gatePlacementFromForward } from '../src/systems/gate'

const STILL = {
  forward: false,
  backward: false,
  leftward: false,
  rightward: false,
}

describe('facingDirection', () => {
  it('uses camera look when standing still', () => {
    const look = cameraLook(0)
    expect(facingDirection(0, STILL).x).toBeCloseTo(look.x)
    expect(facingDirection(0, STILL).z).toBeCloseTo(look.z)
  })

  it('faces left of the camera when holding A', () => {
    const dir = facingDirection(0, { ...STILL, leftward: true })
    expect(dir.x).toBeCloseTo(-1)
    expect(dir.z).toBeCloseTo(0)
    expect(yawFromForward(dir)).toBeCloseTo(-Math.PI / 2)
  })

  it('faces right of the camera when holding D', () => {
    const dir = facingDirection(0, { ...STILL, rightward: true })
    expect(dir.x).toBeCloseTo(1)
    expect(dir.z).toBeCloseTo(0)
  })
})

describe('gatePlacementFromForward', () => {
  it('places a gate ahead along -Z and yaws to face that way', () => {
    const result = gatePlacementFromForward({ x: 0, y: 1, z: 0 }, { x: 0, z: -1 }, 2)
    expect(result.position[2]).toBeCloseTo(-2)
    expect(Math.abs(result.yaw)).toBeCloseTo(Math.PI)
  })

  it('places a gate to the east when facing +X', () => {
    const result = gatePlacementFromForward({ x: 0, y: 1, z: 0 }, { x: 1, z: 0 }, 2)
    expect(result.position[0]).toBeCloseTo(2)
    expect(result.position[2]).toBeCloseTo(0)
    expect(result.yaw).toBeCloseTo(Math.PI / 2)
  })
})
