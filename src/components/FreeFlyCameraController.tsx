import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface FreeFlyCameraControllerProps {
  handPosition: { x: number; y: number }
  handVelocity?: { x: number; y: number }
  expansion: number // 0-1 from hand distance for forward/backward
  enabled: boolean
}

export function FreeFlyCameraController({
  handPosition,
  handVelocity,
  expansion,
  enabled
}: FreeFlyCameraControllerProps) {
  const { camera } = useThree()
  const velocity = useRef(new THREE.Vector3(0, 0, 0))
  const targetLookAt = useRef(new THREE.Vector3(0, 0, -1))
  
  // Flight parameters
  const LATERAL_SPEED = 25 // Left/Right/Up/Down speed
  const FORWARD_SPEED = 40 // Forward/Backward speed based on expansion
  const DRAG = 0.92 // Slow down over time (momentum)
  const SMOOTHING = 0.15
  const CAMERA_ROTATION_SPEED = 0.05
  
  useFrame((state, delta) => {
    if (!enabled) return
    
    // Calculate flight direction based on hand position
    // Hand position controls X (left/right) and Y (up/down)
    const targetVelocityX = handPosition.x * LATERAL_SPEED
    const targetVelocityY = handPosition.y * LATERAL_SPEED
    
    // Expansion controls Z (forward/backward)
    // 0 = backward, 0.5 = no movement, 1 = forward
    const forwardInput = (expansion - 0.5) * 2 // Map 0-1 to -1 to 1
    const targetVelocityZ = -forwardInput * FORWARD_SPEED // Negative Z is forward
    
    // Smooth velocity changes with interpolation
    velocity.current.x += (targetVelocityX - velocity.current.x) * SMOOTHING
    velocity.current.y += (targetVelocityY - velocity.current.y) * SMOOTHING
    velocity.current.z += (targetVelocityZ - velocity.current.z) * SMOOTHING
    
    // Apply drag/momentum
    velocity.current.multiplyScalar(DRAG)
    
    // Update camera position based on velocity
    camera.position.x += velocity.current.x * delta
    camera.position.y += velocity.current.y * delta
    camera.position.z += velocity.current.z * delta
    
    // Calculate look-at point based on flight direction
    if (velocity.current.length() > 0.1) {
      // Create a point ahead in the direction we're flying
      const flightDirection = velocity.current.clone().normalize()
      targetLookAt.current.copy(camera.position).add(flightDirection.multiplyScalar(20))
    } else {
      // When not moving, look ahead in camera's forward direction
      const forward = new THREE.Vector3(0, 0, -1)
      forward.applyQuaternion(camera.quaternion)
      targetLookAt.current.copy(camera.position).add(forward.multiplyScalar(20))
    }
    
    // Smoothly rotate camera to look at target
    const currentLookAt = new THREE.Vector3(0, 0, -1)
    currentLookAt.applyQuaternion(camera.quaternion)
    currentLookAt.add(camera.position)
    
    currentLookAt.lerp(targetLookAt.current, CAMERA_ROTATION_SPEED)
    camera.lookAt(currentLookAt)
    
    // Optional: Prevent camera from going too far from origin (safety bounds)
    const distanceFromOrigin = camera.position.length()
    const MAX_DISTANCE = 500
    if (distanceFromOrigin > MAX_DISTANCE) {
      camera.position.multiplyScalar(MAX_DISTANCE / distanceFromOrigin)
    }
  })
  
  return null
}

// Hook version for easier integration
export function useFreeFlyCamera(
  handPosition: { x: number; y: number },
  handVelocity: { x: number; y: number },
  enabled: boolean
) {
  const { camera } = useThree()
  const targetPosition = useRef(new THREE.Vector3(0, 0, 40))
  
  useFrame(() => {
    if (!enabled) return
    
    const MOVEMENT_SPEED = 15
    const SMOOTHING = 0.1
    const VELOCITY_BOOST = 2
    
    // Calculate target with velocity
    targetPosition.current.x = handPosition.x * MOVEMENT_SPEED + handVelocity.x * VELOCITY_BOOST
    targetPosition.current.y = handPosition.y * MOVEMENT_SPEED + handVelocity.y * VELOCITY_BOOST
    
    // Smooth interpolation
    camera.position.lerp(targetPosition.current, SMOOTHING)
    
    // Look at center
    camera.lookAt(0, 0, 0)
  })
}

