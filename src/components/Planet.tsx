import { useRef, useMemo, Suspense } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { PlanetData } from './planetData'

interface PlanetProps {
  data: PlanetData
  isSun?: boolean
  isHandActive?: boolean
}

function PlanetMesh({ data, isSun = false, isHandActive = true }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const cloudRef = useRef<THREE.Mesh>(null)
  
  // Load real texture using React Three Fiber's useLoader hook (proper way!)
  // This handles Suspense, caching, and proper texture initialization
  const surfaceTexture = useLoader(THREE.TextureLoader, data.textureUrl)
  
  // Load optional enhancement textures for realism
  const bumpTexture = data.bumpMapUrl ? useLoader(THREE.TextureLoader, data.bumpMapUrl) : null
  const specularTexture = data.specularMapUrl ? useLoader(THREE.TextureLoader, data.specularMapUrl) : null
  const cloudsTexture = data.cloudsMapUrl ? useLoader(THREE.TextureLoader, data.cloudsMapUrl) : null
  
  // Configure texture properties after loading
  useMemo(() => {
    if (surfaceTexture) {
      surfaceTexture.colorSpace = THREE.SRGBColorSpace
      surfaceTexture.anisotropy = 16
      surfaceTexture.wrapS = THREE.RepeatWrapping
      surfaceTexture.wrapT = THREE.RepeatWrapping
      surfaceTexture.needsUpdate = true
    }
    if (bumpTexture) {
      bumpTexture.anisotropy = 16
      bumpTexture.wrapS = THREE.RepeatWrapping
      bumpTexture.wrapT = THREE.RepeatWrapping
    }
    if (specularTexture) {
      specularTexture.anisotropy = 16
      specularTexture.wrapS = THREE.RepeatWrapping
      specularTexture.wrapT = THREE.RepeatWrapping
    }
    if (cloudsTexture) {
      cloudsTexture.anisotropy = 16
      cloudsTexture.wrapS = THREE.RepeatWrapping
      cloudsTexture.wrapT = THREE.RepeatWrapping
    }
  }, [surfaceTexture, bumpTexture, specularTexture, cloudsTexture])
  
  // Animation
  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    // Slower, more realistic rotation speeds
    // When hand is active: 3x speed
    // When hand is not active: slow ambient rotation to feel alive
    const speedMultiplier = isHandActive ? 3 : 0.5
    meshRef.current.rotation.y += data.rotationSpeed * delta * speedMultiplier
    
    // Rotate clouds faster for Earth
    if (cloudRef.current && data.name === 'Earth') {
      cloudRef.current.rotation.y += data.rotationSpeed * delta * (speedMultiplier * 1.2)
    }
    
    // Apply axial tilt to the group (always applied)
    if (groupRef.current && data.tilt) {
      groupRef.current.rotation.z = data.tilt
    }
  })
  
  const isEarth = data.name === 'Earth'
  const isJupiter = data.name === 'Jupiter'
  const isSaturn = data.name === 'Saturn'
  
  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Main planet sphere with REAL texture */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[data.radius, 128, 128]} />
        {isSun ? (
          // Sun - bright self-illuminated
          <meshBasicMaterial
            {...(surfaceTexture && { map: surfaceTexture })}
            color={data.color}
            toneMapped={false}
          />
        ) : (
          // Planets - realistic materials with ALL texture maps for depth and detail
          <meshStandardMaterial
            {...(surfaceTexture && { map: surfaceTexture })}
            {...(bumpTexture && { bumpMap: bumpTexture })}
            {...(bumpTexture && { bumpScale: data.bumpScale || 0.05 })}
            {...(specularTexture && { roughnessMap: specularTexture })}
            roughness={data.roughness || (isJupiter || isSaturn ? 0.7 : isEarth ? 0.6 : 0.85)}
            metalness={data.metalness || 0.0}
            emissive={data.color}
            emissiveIntensity={isEarth ? 0.05 : 0.02}
          />
        )}
      </mesh>
      
      {/* Earth clouds layer - now with real cloud texture if available */}
      {isEarth && cloudsTexture && (
        <mesh ref={cloudRef} scale={[1.01, 1.01, 1.01]}>
          <sphereGeometry args={[data.radius, 64, 64]} />
          <meshStandardMaterial
            map={cloudsTexture}
            color="#ffffff"
            transparent
            opacity={0.6}
            roughness={1}
            metalness={0}
            depthWrite={false}
            alphaTest={0.1}
          />
        </mesh>
      )}
      
      {/* Simplified atmospheric glow - more stable */}
      {!isSun && (
        <>
          {/* Inner atmosphere */}
          <mesh scale={[1.05, 1.05, 1.05]}>
            <sphereGeometry args={[data.radius, 64, 64]} />
            <meshBasicMaterial
              color={data.color}
              transparent
              opacity={isEarth ? 0.15 : 0.1}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          
          {/* Outer atmosphere glow */}
          <mesh scale={[1.12, 1.12, 1.12]}>
            <sphereGeometry args={[data.radius, 32, 32]} />
            <meshBasicMaterial
              color={data.color}
              transparent
              opacity={isEarth ? 0.08 : 0.05}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
      
      {/* Rings for Saturn and Uranus - improved rendering */}
      {data.hasRings && (
        <group rotation={[-Math.PI / 2, 0, 0]}>
          {/* Main ring - solid appearance */}
          <mesh position={[0, 0, 0.001]}>
            <ringGeometry args={[
              data.ringInnerRadius || data.radius * 1.2,
              data.ringOuterRadius || data.radius * 2,
              128
            ]} />
            <meshStandardMaterial
              color={data.ringColor || data.color}
              side={THREE.DoubleSide}
              transparent={true}
              opacity={data.ringOpacity || 0.9}
              roughness={0.8}
              metalness={0.0}
              depthWrite={true}
            />
          </mesh>
          
          {/* Subtle inner shadow for depth */}
          <mesh position={[0, 0, 0]}>
            <ringGeometry args={[
              data.ringInnerRadius || data.radius * 1.2,
              (data.ringInnerRadius || data.radius * 1.2) * 1.05,
              64
            ]} />
            <meshBasicMaterial
              color="#000000"
              side={THREE.DoubleSide}
              transparent={true}
              opacity={0.25}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}
    </group>
  )
}

// Fallback component while textures load
function PlanetFallback({ data }: { data: PlanetData }) {
  return (
    <mesh>
      <sphereGeometry args={[data.radius, 64, 64]} />
      <meshStandardMaterial color={data.color} />
    </mesh>
  )
}

// Export with Suspense wrapper for proper async texture loading
export function Planet(props: PlanetProps) {
  return (
    <Suspense fallback={<PlanetFallback data={props.data} />}>
      <PlanetMesh {...props} />
    </Suspense>
  )
}

// Orbital container for planets
interface OrbitingPlanetProps {
  data: PlanetData
  isHandActive: boolean
}

export function OrbitingPlanet({ data, isHandActive }: OrbitingPlanetProps) {
  const orbitRef = useRef<THREE.Group>(null)
  const angleRef = useRef(Math.random() * Math.PI * 2) // Random starting position
  
  useFrame((state, delta) => {
    if (!orbitRef.current) return
    
    // Slower, more realistic orbital speeds
    // When hand is active: 3x speed
    // When hand is not active: very slow ambient movement
    const speedMultiplier = isHandActive ? 3 : 0.3
    angleRef.current += data.orbitSpeed * delta * speedMultiplier
    
    const x = data.orbitRadius * Math.cos(angleRef.current)
    const z = data.orbitRadius * Math.sin(angleRef.current)
    
    orbitRef.current.position.set(x, 0, z)
  })
  
  return (
    <group ref={orbitRef}>
      <Planet data={data} isHandActive={isHandActive} />
      
      {/* Subtle orbit trail */}
      <OrbitTrail radius={data.orbitRadius} />
    </group>
  )
}

// Orbit trail visualization
function OrbitTrail({ radius }: { radius: number }) {
  const points = useMemo(() => {
    const curve = new THREE.EllipseCurve(
      0, 0, // Center
      radius, radius, // xRadius, yRadius
      0, 2 * Math.PI, // Start angle, end angle
      false, // Clockwise
      0 // Rotation
    )
    const curvePoints = curve.getPoints(100)
    return curvePoints.map(p => new THREE.Vector3(p.x, 0, p.y))
  }, [radius])
  
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#666666" opacity={0.3} transparent />
    </line>
  )
}

