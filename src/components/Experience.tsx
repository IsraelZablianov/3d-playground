import { OrbitControls } from '@react-three/drei'
import { ParticleSystem } from './ParticleSystem'
import { SolarSystem } from './SolarSystem'
import { PlanetShowcase } from './PlanetShowcase'
import { FreeFlyCameraController } from './FreeFlyCameraController'
import { ShapeType, ViewMode } from '../App'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

interface ExperienceProps {
  shape: ShapeType
  color: string
  expansion: number
  rotation: number
  handPosition: { x: number; y: number }
  handVelocity: { x: number; y: number }
  isHandActive: boolean
  viewMode: ViewMode
}

export function Experience({ shape, color, expansion, rotation, handPosition, handVelocity, isHandActive, viewMode }: ExperienceProps) {
  const { camera } = useThree()
  const targetPosition = useRef(new THREE.Vector3(0, 0, 8))
  const isRealSolar = shape === 'realsolar'
  const isSolarSystem = shape === 'solarsystem'
  const isShowcaseMode = viewMode === 'showcase' && isRealSolar
  
  // Move camera based on hand position for particle solar system mode
  useFrame(() => {
    if (isShowcaseMode) {
      // Fixed camera position for showcase mode
      targetPosition.current.set(0, 5, 30)
      camera.position.lerp(targetPosition.current, 0.1)
      camera.lookAt(0, 0, 0)
    } else if (isSolarSystem) {
      // Map hand position to camera movement
      targetPosition.current.set(
        handPosition.x * 4,
        handPosition.y * 3,
        8
      )
      
      // Smooth camera movement
      camera.position.lerp(targetPosition.current, 0.05)
      camera.lookAt(0, 0, 0)
    } else if (!isRealSolar) {
      // Reset camera to default position for other shapes
      targetPosition.current.set(0, 0, 8)
      camera.position.lerp(targetPosition.current, 0.05)
      camera.lookAt(0, 0, 0)
    }
  })
  
  return (
    <>
      {/* Orbit controls disabled for real solar system (free fly) and particle solar system */}
      <OrbitControls makeDefault enableZoom={true} enablePan={false} enableRotate={!isSolarSystem && !isRealSolar} />
      
      {/* Free fly camera for realistic solar system (disabled in showcase mode) */}
      {isRealSolar && !isShowcaseMode && (
        <FreeFlyCameraController
          handPosition={handPosition}
          handVelocity={handVelocity}
          expansion={expansion}
          enabled={true}
        />
      )}
      
      {/* Conditional rendering based on mode */}
      {isShowcaseMode ? (
        // Showcase mode - all planets lined up with labels
        <PlanetShowcase />
      ) : isRealSolar ? (
        // Realistic 3D Solar System
        <SolarSystem isHandActive={isHandActive} />
      ) : (
        // Particle systems for other modes
        <>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          <ParticleSystem 
            shape={shape} 
            color={color} 
            expansion={expansion} 
            rotation={rotation} 
          />
        </>
      )}
    </>
  )
}



