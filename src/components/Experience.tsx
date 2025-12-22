import { OrbitControls } from '@react-three/drei'
import { ParticleSystem } from './ParticleSystem'
import { ShapeType } from '../App'

interface ExperienceProps {
  shape: ShapeType
  color: string
  expansion: number
  rotation: number
}

export function Experience({ shape, color, expansion, rotation }: ExperienceProps) {
  return (
    <>
      <OrbitControls makeDefault enableZoom={true} enablePan={false} enableRotate={true} />
      
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



