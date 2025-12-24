import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const STAR_COUNT = 10000 // More stars for realism

interface StarfieldProps {
  isHandActive: boolean
}

export function Starfield({ isHandActive }: StarfieldProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const twinkleTimeRef = useRef(0)
  
  // Create star texture once and memoize it
  const starTexture = useMemo(() => createStarTexture(), [])
  
  // Generate random star positions with realistic distribution
  const { positions, colors, sizes, baseOpacity } = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3)
    const colors = new Float32Array(STAR_COUNT * 3)
    const sizes = new Float32Array(STAR_COUNT)
    const baseOpacity = new Float32Array(STAR_COUNT)
    
    for (let i = 0; i < STAR_COUNT; i++) {
      // Random position in a large sphere with varying distances
      const radius = 80 + Math.random() * 150 // Varying depth
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos((Math.random() * 2) - 1)
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
      
      // Realistic star colors based on temperature
      const starType = Math.random()
      
      if (starType < 0.60) {
        // White/yellow stars (like our Sun) - most common
        colors[i * 3] = 1
        colors[i * 3 + 1] = 0.95 + Math.random() * 0.05
        colors[i * 3 + 2] = 0.85 + Math.random() * 0.15
      } else if (starType < 0.75) {
        // Blue-white stars (hot) - bright
        colors[i * 3] = 0.7 + Math.random() * 0.3
        colors[i * 3 + 1] = 0.8 + Math.random() * 0.2
        colors[i * 3 + 2] = 1
      } else if (starType < 0.85) {
        // Red/orange stars (cool) - dimmer
        colors[i * 3] = 1
        colors[i * 3 + 1] = 0.5 + Math.random() * 0.3
        colors[i * 3 + 2] = 0.3 + Math.random() * 0.2
      } else if (starType < 0.95) {
        // Pure white (very hot)
        colors[i * 3] = 1
        colors[i * 3 + 1] = 1
        colors[i * 3 + 2] = 1
      } else {
        // Rare blue giants
        colors[i * 3] = 0.6
        colors[i * 3 + 1] = 0.7
        colors[i * 3 + 2] = 1
      }
      
      // Realistic size distribution (most stars small, few large)
      const sizeRandom = Math.random()
      if (sizeRandom < 0.7) {
        // Small distant stars
        sizes[i] = 0.5 + Math.random() * 1
        baseOpacity[i] = 0.4 + Math.random() * 0.3
      } else if (sizeRandom < 0.9) {
        // Medium stars
        sizes[i] = 1.5 + Math.random() * 2
        baseOpacity[i] = 0.6 + Math.random() * 0.3
      } else if (sizeRandom < 0.97) {
        // Bright stars
        sizes[i] = 3 + Math.random() * 2
        baseOpacity[i] = 0.8 + Math.random() * 0.2
      } else {
        // Very bright stars (rare)
        sizes[i] = 5 + Math.random() * 3
        baseOpacity[i] = 0.9 + Math.random() * 0.1
      }
    }
    
    return { positions, colors, sizes, baseOpacity }
  }, [])
  
  // Twinkling animation
  useFrame((state, delta) => {
    if (!pointsRef.current) return
    
    twinkleTimeRef.current += delta
    
    // Always rotate, but at different speeds
    // When hand is active: full speed
    // When hand is not active: slow ambient rotation (20% speed) to feel alive
    const speedMultiplier = isHandActive ? 1 : 0.2
    pointsRef.current.rotation.y += delta * 0.0005 * speedMultiplier
    pointsRef.current.rotation.x += delta * 0.0003 * speedMultiplier
    
    // Update opacity for twinkling effect (always twinkle)
    const geometry = pointsRef.current.geometry
    const opacityAttribute = geometry.getAttribute('opacity') as THREE.BufferAttribute
    
    if (opacityAttribute) {
      for (let i = 0; i < STAR_COUNT; i++) {
        // Each star twinkles at its own rate
        const twinkle = Math.sin(twinkleTimeRef.current * (0.5 + i * 0.0001)) * 0.15
        opacityAttribute.array[i] = Math.max(0.2, baseOpacity[i] + twinkle)
      }
      opacityAttribute.needsUpdate = true
    }
  })
  
  return (
    <>
      {/* Deep space background with subtle gradient */}
      <color attach="background" args={['#000308']} />
      
      {/* Ambient space fog for depth */}
      <fog attach="fog" args={['#000510', 100, 300]} />
      
      {/* Main starfield */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={sizes.length}
            array={sizes}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-opacity"
            count={baseOpacity.length}
            array={baseOpacity}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.3}
          sizeAttenuation={true}
          vertexColors={true}
          transparent={true}
          opacity={1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          map={starTexture}
        />
      </points>
    </>
  )
}

// Create a circular gradient texture for stars (makes them look like actual stars)
function createStarTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')!
  
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)')
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.4)')
  gradient.addColorStop(0.7, 'rgba(255,255,255,0.1)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 32, 32)
  
  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

