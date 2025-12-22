import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ShapeType } from '../App'

interface ParticleSystemProps {
  shape: ShapeType
  color: string
  expansion: number
  rotation: number
}

const COUNT = 8000

// Helper to generate points on a sphere
const getSpherePoint = () => {
  const theta = Math.random() * Math.PI * 2
  const phi = Math.acos((Math.random() * 2) - 1)
  const r = 1.5 // Radius
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  )
}

// Heart Shape
const getHeartPoint = () => {
  // 3D Heart approximation using parametric equation
  const t = Math.random() * Math.PI * 2
  const hx = 16 * Math.pow(Math.sin(t), 3)
  const hy = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)
  const hz = (Math.random() * 2 - 1) * 4 // Thickness
  
  // Scale down
  return new THREE.Vector3(hx * 0.1, hy * 0.1, hz * 0.5)
}

// Flower (Rose)
const getFlowerPoint = () => {
    // Rose curve: r = cos(k * theta)
    const k = 4 
    const theta = Math.random() * Math.PI * 2
    const phi = (Math.random() - 0.5) * Math.PI // Slight 3D depth
    const r = Math.cos(k * theta) + 1.5 // Base radius
    
    // Convert to cartesian
    const scale = 1.5
    return new THREE.Vector3(
        scale * r * Math.cos(theta) * Math.cos(phi),
        scale * r * Math.sin(theta) * Math.cos(phi),
        scale * r * Math.sin(phi) // Thickness
    )
}

// Saturn
const getSaturnPoint = (i: number) => {
    // 60% sphere, 40% ring
    if (i < COUNT * 0.4) {
        // Planet
        const p = getSpherePoint()
        return p.multiplyScalar(0.8)
    } else {
        // Ring
        const theta = Math.random() * Math.PI * 2
        const r = 2.0 + Math.random() * 1.5 // Inner to Outer radius
        return new THREE.Vector3(
            r * Math.cos(theta),
            0.1 * (Math.random() - 0.5), // Thin flatness
            r * Math.sin(theta)
        )
    }
}

// Buddha (Sitting Figure Approximation)
const getBuddhaPoint = () => {
    const r = Math.random()
    // Head (Sphere)
    if (r < 0.15) {
        const p = getSpherePoint().multiplyScalar(0.4)
        p.y += 1.2
        return p
    }
    // Body (Sphere/Capsule)
    if (r < 0.5) {
        const p = getSpherePoint().multiplyScalar(0.7)
        return p
    }
    // Legs (Ellipsoid flattened)
    const t = Math.random() * Math.PI * 2
    const rad = 1.2 * Math.sqrt(Math.random())
    return new THREE.Vector3(
        rad * Math.cos(t),
        -0.8 + (Math.random() * 0.4),
        rad * Math.sin(t) * 0.6 // Compressed depth
    )
}

// Fireworks
const getFireworksPoint = () => {
    // Random direction * Random radius (mostly outer)
    const p = getSpherePoint()
    return p.multiplyScalar(Math.random() * 2 + 0.5)
}

// Solar System (Galaxy)
const getSolarSystemPoint = (i: number) => {
    const totalParticles = COUNT
    
    // Sun (center bright star) - 1%
    if (i < totalParticles * 0.01) {
        const p = getSpherePoint()
        return p.multiplyScalar(Math.random() * 0.3)
    }
    
    // Planets (8 orbital rings) - 10%
    if (i < totalParticles * 0.11) {
        const planetIndex = Math.floor((i - totalParticles * 0.01) / (totalParticles * 0.01))
        const orbitRadius = 0.5 + planetIndex * 0.4
        const theta = Math.random() * Math.PI * 2
        const phi = (Math.random() - 0.5) * 0.2 // Slight thickness
        
        return new THREE.Vector3(
            orbitRadius * Math.cos(theta),
            phi,
            orbitRadius * Math.sin(theta)
        )
    }
    
    // Asteroid belt - 15%
    if (i < totalParticles * 0.26) {
        const theta = Math.random() * Math.PI * 2
        const r = 3.5 + Math.random() * 0.8
        const y = (Math.random() - 0.5) * 0.4
        
        return new THREE.Vector3(
            r * Math.cos(theta),
            y,
            r * Math.sin(theta)
        )
    }
    
    // Spiral galaxy arms - 74%
    // Using logarithmic spiral: r = a * e^(b*theta)
    const arm = Math.floor(Math.random() * 3) // 3 spiral arms
    const t = Math.random() * Math.PI * 4 // Multiple rotations
    const theta = t + (arm * Math.PI * 2 / 3) // Offset each arm by 120 degrees
    
    const a = 0.5
    const b = 0.3
    const r = a * Math.exp(b * t) + Math.random() * 0.5 // Add some noise
    
    const y = (Math.random() - 0.5) * 0.3 * (1 - t / (Math.PI * 4)) // Thinner towards edges
    
    return new THREE.Vector3(
        r * Math.cos(theta),
        y,
        r * Math.sin(theta)
    )
}


export function ParticleSystem({ shape, color, expansion, rotation }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null)
  
    // Arrays to hold current and target positions
  // We don't use state for positions to avoid re-renders, use Refs or Memo
  
  // Debug ref to track frames
  const frameCount = useRef(0)

  const { positions, randoms } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const rnd = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      // Initialize with non-zero values to avoid any 0/0 divisions or stuck states
      pos[i * 3] = (Math.random() - 0.5) * 10 || 0.1
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10 || 0.1
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 || 0.1
      rnd[i] = Math.random()
    }
    return { positions: pos, randoms: rnd }
  }, [])

  // Target positions cache - using useRef instead of Memo to ensure it persists correctly if not purely dependent
  const targetPositionsRef = useRef(new Float32Array(COUNT * 3))
  const targetPositions = targetPositionsRef.current
  
  // Calculate target positions based on shape
  useMemo(() => {
    for (let i = 0; i < COUNT; i++) {
      let p = new THREE.Vector3()
      
      switch (shape) {
        case 'heart': p = getHeartPoint(); break;
        case 'flower': p = getFlowerPoint(); break;
        case 'saturn': p = getSaturnPoint(i); break;
        case 'buddha': p = getBuddhaPoint(); break;
        case 'fireworks': p = getFireworksPoint(); break;
        case 'solarsystem': p = getSolarSystemPoint(i); break;
        default: p = getSpherePoint(); break;
      }
      
      targetPositions[i * 3] = p.x
      targetPositions[i * 3 + 1] = p.y
      targetPositions[i * 3 + 2] = p.z
    }
  }, [shape])

  useFrame((state, delta) => {
    if (!pointsRef.current) return
    
    // Debug heartbeat
    frameCount.current++
    if (frameCount.current % 100 === 0) {
        console.log(`Frame ${frameCount.current}, Delta: ${delta}, Current Rotation: ${pointsRef.current.rotation.y.toFixed(3)}, Target Rotation: ${rotation.toFixed(3)}`)
    }
    
    // Animation logic
    // Interpolate current positions towards target positions
    const positionsAttribute = pointsRef.current.geometry.attributes.position
    const currentPositions = positionsAttribute.array as Float32Array
    
    // Smooth rotation
    const targetRotation = rotation
    pointsRef.current.rotation.y = THREE.MathUtils.lerp(pointsRef.current.rotation.y, targetRotation, delta * 2)

    // Expansion factor (0 = normal, 1 = exploded/expanded)
    // We modify the target slightly based on expansion
    
    // Speed of transition
    // Fixed: Ensure speed isn't 0 and cap it to avoid instability
    // HARD FIX: Never allow lerp factor > 0.1 per frame. This forces smooth movement even if laggy.
    const lerpSpeed = Math.min(3 * delta, 0.1)

    // Ensure we have a valid delta, otherwise skip frame to avoid NaNs
    if (isNaN(delta) || delta > 1) return
    
    for (let i = 0; i < COUNT; i++) {
        const ix = i * 3
        const iy = i * 3 + 1
        const iz = i * 3 + 2
        
        let tx = targetPositions[ix]
        let ty = targetPositions[iy]
        let tz = targetPositions[iz]
        
        // Apply expansion: move away from center based on expansion value
        // Or specific behavior for fireworks
        if (shape === 'fireworks') {
            // Fireworks loop animation?
            // Or just static exploded state that reacts to expansion
            // Let's make expansion scale the whole thing
             tx *= (1 + expansion * 2)
             ty *= (1 + expansion * 2)
             tz *= (1 + expansion * 2)
        } else {
             // General expansion/breathing
             // Tension (0..1). 0 = Closed/Small, 1 = Open/Big?
             // Prompt: "Control the scaling and expansion... by detecting the tension"
             // Let's say expansion adds a multiplier
             const scale = 1 + expansion * 1.5 // 1x to 2.5x
             tx *= scale
             ty *= scale
             tz *= scale
             
             // Add some noise movement
             // FIXED: Remove duplicate declaration
             // Use a smaller scale factor or damp it
             // const scale = 1 + expansion * 1.5 // (Removed duplicate)
             
             // Add some noise movement
             const noiseX = Math.sin(state.clock.elapsedTime + randoms[i] * 10) * 0.05
             const noiseY = Math.cos(state.clock.elapsedTime + randoms[i] * 10) * 0.05
             
             tx += noiseX
             ty += noiseY
        }

        // Use a simpler lerp to ensure convergence
        // DEBUGGING: Log if positions explode
        if (i === 0 && Math.abs(currentPositions[ix]) > 20) {
            // console.warn("Particle explosion detected!", currentPositions[ix])
            // Cap it?
        }

        currentPositions[ix] += (tx - currentPositions[ix]) * lerpSpeed
        currentPositions[iy] += (ty - currentPositions[iy]) * lerpSpeed
        currentPositions[iz] += (tz - currentPositions[iz]) * lerpSpeed
    }
    
    positionsAttribute.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={color}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        transparent={true}
        opacity={0.8}
      />
    </points>
  )
}



