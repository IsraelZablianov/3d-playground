import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface AtmosphereShaderProps {
  radius: number
  color: THREE.Color | string
  planetName: string
}

/**
 * Realistic atmospheric scattering shader based on research from SolarSys and other implementations
 * Creates a glow effect that's brighter on the side facing the sun
 */
export function AtmosphereShader({ radius, color, planetName }: AtmosphereShaderProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const atmosphereColor = useMemo(() => {
    if (typeof color === 'string') {
      return new THREE.Color(color)
    }
    return color
  }, [color])
  
  // Enhanced atmosphere shader with proper scattering
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        atmosphereColor: { value: atmosphereColor },
        sunPosition: { value: new THREE.Vector3(0, 0, 0) },
        intensity: { value: planetName === 'Earth' ? 1.2 : 0.8 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 atmosphereColor;
        uniform vec3 sunPosition;
        uniform float intensity;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          // Calculate view direction
          vec3 viewDir = normalize(-vPosition);
          
          // Calculate sun direction (sun is at origin)
          vec3 sunDir = normalize(sunPosition - vPosition);
          
          // Fresnel effect - atmosphere glows at edges
          float fresnel = pow(1.0 - dot(vNormal, viewDir), 3.0);
          
          // Sun-facing brightness
          float sunAlignment = max(0.0, dot(vNormal, sunDir));
          
          // Combine effects
          float glow = fresnel * (0.5 + 0.5 * sunAlignment) * intensity;
          
          // Output color with alpha based on glow
          gl_FragColor = vec4(atmosphereColor, glow);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  }, [atmosphereColor, planetName])
  
  // Update sun position in shader
  useFrame((state) => {
    if (meshRef.current && shaderMaterial.uniforms.sunPosition) {
      // Sun is at world origin
      const sunPos = new THREE.Vector3(0, 0, 0)
      shaderMaterial.uniforms.sunPosition.value = sunPos
    }
  })
  
  return (
    <>
      {/* Inner atmosphere layer */}
      <mesh ref={meshRef} scale={[1.05, 1.05, 1.05]}>
        <sphereGeometry args={[radius, 64, 64]} />
        <primitive object={shaderMaterial} attach="material" />
      </mesh>
      
      {/* Outer atmosphere glow */}
      <mesh scale={[1.12, 1.12, 1.12]}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial
          color={atmosphereColor}
          transparent
          opacity={planetName === 'Earth' ? 0.1 : 0.06}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  )
}

