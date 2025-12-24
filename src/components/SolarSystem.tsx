import { Planet, OrbitingPlanet } from './Planet'
import { SUN_DATA, PLANETS_DATA } from './planetData'
import { Starfield } from './Starfield'

interface SolarSystemProps {
  isHandActive: boolean
}

export function SolarSystem({ isHandActive }: SolarSystemProps) {
  return (
    <>
      {/* Space background with stars */}
      <Starfield isHandActive={isHandActive} />
      
      {/* Enhanced Lighting setup */}
      <ambientLight intensity={0.3} />
      
      {/* Main light source from the Sun */}
      <pointLight
        position={[0, 0, 0]}
        intensity={3}
        distance={200}
        decay={1}
        color="#FFFFFF"
        castShadow
      />
      
      {/* Additional directional light for better visibility */}
      <directionalLight
        position={[10, 10, 10]}
        intensity={0.5}
        color="#FFFFFF"
      />
      
      {/* Hemisphere light for ambient fill */}
      <hemisphereLight
        args={['#ffffff', '#444444', 0.4]}
      />
      
      {/* The Sun at center with enhanced glow */}
      <Planet data={SUN_DATA} isSun={true} isHandActive={isHandActive} />
      
      {/* Larger glow effect for the Sun using additive blending */}
      <mesh>
        <sphereGeometry args={[SUN_DATA.radius * 1.15, 32, 32]} />
        <meshBasicMaterial
          color="#FDB813"
          transparent
          opacity={0.5}
          blending={2} // AdditiveBlending
          depthWrite={false}
        />
      </mesh>
      
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[SUN_DATA.radius * 1.3, 32, 32]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.3}
          blending={2} // AdditiveBlending
          depthWrite={false}
        />
      </mesh>
      
      {/* All 8 planets in their orbits */}
      {PLANETS_DATA.map((planetData) => (
        <OrbitingPlanet key={planetData.name} data={planetData} isHandActive={isHandActive} />
      ))}
    </>
  )
}

