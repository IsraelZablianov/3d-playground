import { OrbitControls } from '@react-three/drei'
import { ParticleSystem } from './ParticleSystem'
import { ShapeType } from '../App'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

interface ExperienceProps {
  shape: ShapeType
  color: string
  expansion: number
  rotation: number
  handPosition: { x: number; y: number }
}

export function Experience({ shape, color, expansion, rotation, handPosition }: ExperienceProps) {
  const { camera } = useThree()
  const targetPosition = useRef(new THREE.Vector3(0, 0, 8))
  const isSolarSystem = shape === 'solarsystem'
  
  // Move camera based on hand position for solar system mode
  useFrame(() => {
    if (isSolarSystem) {
      // Map hand position to camera movement
      // X: -1 to 1 -> camera X position -4 to 4
      // Y: -1 to 1 -> camera Y position -3 to 3
      targetPosition.current.set(
        handPosition.x * 4,
        handPosition.y * 3,
        8
      )
      
      // Smooth camera movement
      camera.position.lerp(targetPosition.current, 0.05)
      camera.lookAt(0, 0, 0)
    } else {
      // Reset camera to default position for other shapes
      targetPosition.current.set(0, 0, 8)
      camera.position.lerp(targetPosition.current, 0.05)
      camera.lookAt(0, 0, 0)
    }
  })
  
  return (
    <>
      <OrbitControls makeDefault enableZoom={true} enablePan={false} enableRotate={!isSolarSystem} />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <ParticleSystem 
        shape={shape} 
        color={color} 
        expansion={expansion} 
        rotation={rotation} 
      />
    </>
  )
}



