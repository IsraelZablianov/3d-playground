import { useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Experience } from './components/Experience'
import { UI } from './components/UI'
import { HandController } from './components/HandController'

export type ShapeType = 'heart' | 'flower' | 'saturn' | 'buddha' | 'fireworks' | 'solarsystem' | 'realsolar'
export type ViewMode = 'normal' | 'showcase'

function App() {
  const [shape, setShape] = useState<ShapeType>('heart')
  const [color, setColor] = useState('#ff0055')
  const [expansion, setExpansion] = useState(0) // 0 to 1 controlled by hands
  const [rotation, setRotation] = useState(0)
  const [handPosition, setHandPosition] = useState({ x: 0, y: 0 }) // For solar system camera movement
  const [handVelocity, setHandVelocity] = useState({ x: 0, y: 0 }) // For momentum-based movement
  const [isHandActive, setIsHandActive] = useState(false) // Track if hand is detected
  const [viewMode, setViewMode] = useState<ViewMode>('normal') // Toggle between normal and showcase mode
  
  const handleExpansionChange = useCallback((value: number) => {
    setExpansion(value)
  }, [])
  
  const handleHandPosition = useCallback((x: number, y: number) => {
    setHandPosition({ x, y })
  }, [])
  
  const handleHandVelocity = useCallback((vx: number, vy: number) => {
    setHandVelocity({ x: vx, y: vy })
  }, [])
  
  const handleHandActive = useCallback((active: boolean) => {
    setIsHandActive(active)
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
  
  // Keyboard shortcut to toggle showcase mode (M key)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        setViewMode(prev => prev === 'normal' ? 'showcase' : 'normal')
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
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
            handVelocity={handVelocity}
            isHandActive={isHandActive}
            viewMode={viewMode}
          />
        </Canvas>
      </div>
      
      <HandController 
        onExpansionChange={handleExpansionChange} 
        onSwipe={handleSwipe}
        onHandPosition={handleHandPosition}
        onHandVelocity={handleHandVelocity}
        onHandActive={handleHandActive}
      />
      
      <UI 
        currentShape={shape} 
        setShape={setShape} 
        currentColor={color} 
        setColor={setColor}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
    </>
  )
}

export default App

