// Planet configuration with semi-realistic orbital parameters
// Distances and sizes are scaled for visibility while maintaining proportions
// Updated: Fixed texture paths to use /3d-playground/ base
// Note: Mars uses moon.jpg temporarily (mars.jpg is placeholder)

export interface PlanetData {
  name: string
  radius: number // Scaled for visibility
  orbitRadius: number // Distance from sun (compressed)
  orbitSpeed: number // Orbital period (semi-realistic ratios)
  rotationSpeed: number // Self-rotation speed
  color: string // Planet color (fallback)
  textureUrl?: string // Real planet image
  bumpMapUrl?: string // Bump/normal map for surface detail
  specularMapUrl?: string // Specular/roughness map for realistic reflections
  cloudsMapUrl?: string // Cloud layer texture (for Earth)
  emissive?: string // Emissive color (for Sun)
  hasRings?: boolean
  ringColor?: string
  ringInnerRadius?: number
  ringOuterRadius?: number
  ringOpacity?: number // Ring opacity (0-1), default 0.9
  tilt?: number // Axial tilt in radians
  roughness?: number // Material roughness (0=smooth, 1=rough)
  metalness?: number // Material metalness (0=non-metal, 1=metal)
  bumpScale?: number // Strength of bump map effect
}

export const SUN_DATA: PlanetData = {
  name: 'Sun',
  radius: 3.0,
  orbitRadius: 0,
  orbitSpeed: 0,
  rotationSpeed: 0.001,
  color: '#FDB813',
  emissive: '#FDB813',
  textureUrl: '/3d-playground/textures/sun.jpg',
  roughness: 1.0,
  metalness: 0.0
}

export const PLANETS_DATA: PlanetData[] = [
  {
    name: 'Mercury',
    radius: 0.38,
    orbitRadius: 5,
    orbitSpeed: 0.04,
    rotationSpeed: 0.004,
    color: '#8C7853',
    textureUrl: '/3d-playground/textures/mercury.jpg',
    tilt: 0.034,
    roughness: 0.95, // Very rough, cratered surface
    metalness: 0.0,
    bumpScale: 0.02
  },
  {
    name: 'Venus',
    radius: 0.95,
    orbitRadius: 7.2,
    orbitSpeed: 0.015,
    rotationSpeed: -0.002,
    color: '#FFC649',
    textureUrl: '/3d-playground/textures/venus.jpg',
    tilt: 3.09,
    roughness: 0.7, // Thick atmosphere, somewhat smooth appearance
    metalness: 0.0,
    bumpScale: 0.01
  },
  {
    name: 'Earth',
    radius: 1.0,
    orbitRadius: 10,
    orbitSpeed: 0.01,
    rotationSpeed: 0.02,
    color: '#4169E1',
    textureUrl: '/3d-playground/textures/earth.jpg',
    tilt: 0.41,
    roughness: 0.5, // Mix of water (smooth) and land (rough)
    metalness: 0.1, // Slight metalness for water reflections
    bumpScale: 0.015
  },
  {
    name: 'Mars',
    radius: 0.53,
    orbitRadius: 15.2,
    orbitSpeed: 0.0053,
    rotationSpeed: 0.018,
    color: '#CD5C5C',
    textureUrl: '/3d-playground/textures/moon.jpg', // Using moon as fallback until mars.jpg is downloaded
    tilt: 0.44,
    roughness: 0.95, // Very rough, dusty surface
    metalness: 0.0,
    bumpScale: 0.025
  },
  {
    name: 'Jupiter',
    radius: 2.5,
    orbitRadius: 25,
    orbitSpeed: 0.00084,
    rotationSpeed: 0.04,
    color: '#DAA520',
    textureUrl: '/3d-playground/textures/jupiter.jpg',
    tilt: 0.055,
    roughness: 0.6, // Gas giant - smooth with cloud bands
    metalness: 0.0,
    bumpScale: 0.005
  },
  {
    name: 'Saturn',
    radius: 2.1,
    orbitRadius: 35,
    orbitSpeed: 0.00034,
    rotationSpeed: 0.038,
    color: '#FAD5A5',
    textureUrl: '/3d-playground/textures/saturn.jpg',
    hasRings: true,
    ringColor: '#D4C5A0', // More realistic brownish-gold ring color
    ringInnerRadius: 2.5,
    ringOuterRadius: 4.5,
    ringOpacity: 0.95, // Saturn's rings are very prominent
    tilt: 0.47,
    roughness: 0.65, // Gas giant - smooth appearance
    metalness: 0.0,
    bumpScale: 0.003
  },
  {
    name: 'Uranus',
    radius: 1.6,
    orbitRadius: 45,
    orbitSpeed: 0.00012,
    rotationSpeed: -0.03,
    color: '#4FD0E0',
    textureUrl: '/3d-playground/textures/uranus.jpg',
    hasRings: true,
    ringColor: '#6BE0E8', // Lighter cyan for Uranus's faint rings
    ringInnerRadius: 2.0,
    ringOuterRadius: 2.6, // Made rings smaller and closer to planet
    ringOpacity: 0.6, // Uranus's rings are much fainter
    tilt: 1.71,
    roughness: 0.5, // Ice giant - very smooth
    metalness: 0.0,
    bumpScale: 0.002
  },
  {
    name: 'Neptune',
    radius: 1.55,
    orbitRadius: 55,
    orbitSpeed: 0.00006,
    rotationSpeed: 0.032,
    color: '#4169E1',
    textureUrl: '/3d-playground/textures/neptune.jpg',
    tilt: 0.49,
    roughness: 0.5, // Ice giant - very smooth
    metalness: 0.0,
    bumpScale: 0.002
  }
]

// Calculate real-time orbital positions based on elapsed time
export function calculateOrbitalPosition(
  planet: PlanetData,
  elapsedTime: number
): { x: number; z: number; angle: number } {
  const angle = elapsedTime * planet.orbitSpeed
  const x = planet.orbitRadius * Math.cos(angle)
  const z = planet.orbitRadius * Math.sin(angle)
  return { x, z, angle }
}

