import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { Experience } from './components/Experience'
import { UI } from './components/UI'
import { HandController } from './components/HandController'

export type ShapeType = 'heart' | 'flower' | 'saturn' | 'buddha' | 'fireworks' | 'solarsystem'

function App() {
  const [shape, setShape] = useState<ShapeType>('heart')
  const [color, setColor] = useState('#ff0055')
  const [expansion, setExpansion] = useState(0) // 0 to 1 controlled by hands
  const [rotation, setRotation] = useState(0)
  const [handPosition, setHandPosition] = useState({ x: 0, y: 0 }) // For solar system camera movement
  
  const handleExpansionChange = useCallback((value: number) => {
    setExpansion(value)
  }, [])
  
  const handleHandPosition = useCallback((x: number, y: number) => {
    setHandPosition({ x, y })
  }, [])
  
  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    console.log('Swipe detected:', direction)
    // Rotate 90 degrees (PI/2) on swipe
    // Swipe Left (direction='left') -> Rotate Object Left (+Y)
    // Swipe Right (direction='right') -> Rotate Object Right (-Y)
    setRotation(prev => {
      const newRotation = prev + (direction === 'left' ? Math.PI / 2 : -Math.PI / 2)
      console.log('Rotation changing from', prev, 'to', newRotation)
      return newRotation
    })
  }, [])

  return (
    <>
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <color attach="background" args={['#050505']} />
          <Experience 
            shape={shape} 
            color={color} 
            expansion={expansion} 
            rotation={rotation}
            handPosition={handPosition}
          />
        </Canvas>
      </div>
      
      <HandController 
        onExpansionChange={handleExpansionChange} 
        onSwipe={handleSwipe}
        onHandPosition={handleHandPosition}
      />
      
      <UI 
        currentShape={shape} 
        setShape={setShape} 
        currentColor={color} 
        setColor={setColor} 
      />
    </>
  )
}

export default App

