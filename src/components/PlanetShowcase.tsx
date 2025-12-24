import { Text } from '@react-three/drei'
import { Planet } from './Planet'
import { SUN_DATA, PLANETS_DATA } from './planetData'
import { Starfield } from './Starfield'
import * as THREE from 'three'

export function PlanetShowcase() {
  // Arrange planets in a line with spacing
  const spacing = 10
  const startX = -40
  
  return (
    <>
      {/* Space background */}
      <Starfield isHandActive={false} />
      
      {/* Enhanced lighting for showcase */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} />
      <directionalLight position={[-10, 10, -10]} intensity={0.8} />
      <pointLight position={[0, 5, 0]} intensity={1} />
      
      {/* Display the Sun with enhanced glow */}
      <group position={[startX, 0, 0]}>
        <Planet data={SUN_DATA} isSun={true} isHandActive={false} />
        
        {/* Sun glow effect */}
        <mesh>
          <sphereGeometry args={[SUN_DATA.radius * 1.15, 32, 32]} />
          <meshBasicMaterial
            color="#FDB813"
            transparent
            opacity={0.5}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        
        <mesh>
          <sphereGeometry args={[SUN_DATA.radius * 1.3, 32, 32]} />
          <meshBasicMaterial
            color="#FFD700"
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        
        <Text
          position={[0, -5, 0]}
          fontSize={0.8}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {SUN_DATA.name}
        </Text>
      </group>
      
      {/* Display all planets */}
      {PLANETS_DATA.map((planet, index) => {
        const x = startX + (index + 1) * spacing
        return (
          <group key={planet.name} position={[x, 0, 0]}>
            <Planet data={planet} isHandActive={false} />
            <Text
              position={[0, -3, 0]}
              fontSize={0.6}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {planet.name}
            </Text>
          </group>
        )
      })}
      
      {/* Instructions */}
      <Text
        position={[0, 10, 0]}
        fontSize={1.2}
        color="yellow"
        anchorX="center"
        anchorY="middle"
      >
        PLANET SHOWCASE MODE
      </Text>
      
      <Text
        position={[0, 8.5, 0]}
        fontSize={0.7}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Press 'M' to return to Solar System Mode
      </Text>
    </>
  )
}

