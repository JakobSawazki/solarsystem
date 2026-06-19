import * as THREE from 'three'
import {
  createComparisonLayout,
  getOrbitDistance,
  getSceneRadius
} from './scaling.js'

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const ORBIT_POINT_COUNT = 256

// Atmosphären-Glow nur für Körper mit nennenswerter Lufthülle.
const ATMOSPHERES = Object.freeze({
  earth: { color: '#5aa9ff', intensity: 1.15, power: 3.1, scale: 1.035 },
  venus: { color: '#f4d9a6', intensity: 0.95, power: 3.4, scale: 1.045 }
})

function createOrbit(radius, bodyId) {
  const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2)
  const points = curve.getPoints(ORBIT_POINT_COUNT)
  const geometry = new THREE.BufferGeometry().setFromPoints(
    points.map((point) => new THREE.Vector3(point.x, 0, point.y))
  )
  const material = new THREE.LineBasicMaterial({
    color: 0x6ba8d9,
    transparent: true,
    opacity: 0.2,
    depthWrite: false
  })
  const orbit = new THREE.LineLoop(geometry, material)
  orbit.name = `orbit-${bodyId}`
  orbit.userData.kind = 'orbit'
  orbit.userData.bodyId = bodyId
  orbit.renderOrder = -1
  return orbit
}

function applyRadialRingUVs(geometry, sceneRadius, spanInner, spanOuter) {
  const position = geometry.attributes.position
  const uv = geometry.attributes.uv
  const vertex = new THREE.Vector3()
  for (let i = 0; i < position.count; i += 1) {
    vertex.fromBufferAttribute(position, i)
    const radius = vertex.length() / sceneRadius
    const u = THREE.MathUtils.clamp((radius - spanInner) / (spanOuter - spanInner), 0, 1)
    uv.setXY(i, u, 0.5)
  }
  uv.needsUpdate = true
}

function createSaturnRings(sceneRadius, ringTexture) {
  const rings = new THREE.Group()
  rings.name = 'saturn-rings'
  rings.userData.kind = 'saturn-rings'
  rings.rotation.x = Math.PI / 2

  const bands = [
    { inner: 1.34, outer: 1.68, color: 0xe7d9ad, opacity: 0.9 },
    { inner: 1.78, outer: 2.34, color: 0xb9a679, opacity: 0.72 }
  ]
  const spanInner = bands[0].inner
  const spanOuter = bands[bands.length - 1].outer

  bands.forEach((band, index) => {
    const geometry = new THREE.RingGeometry(
      sceneRadius * band.inner,
      sceneRadius * band.outer,
      128
    )
    if (ringTexture) applyRadialRingUVs(geometry, sceneRadius, spanInner, spanOuter)

    const material = new THREE.MeshStandardMaterial({
      color: ringTexture ? 0xffffff : band.color,
      map: ringTexture || null,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: ringTexture ? 1 : band.opacity,
      roughness: 0.92,
      metalness: 0,
      depthWrite: false
    })
    const ring = new THREE.Mesh(geometry, material)
    ring.name = `saturn-ring-${index + 1}`
    ring.userData.kind = 'saturn-ring'
    rings.add(ring)
  })

  return rings
}

function createGlowSprite(innerColor, outerColor, scale) {
  if (typeof document === 'undefined') return null
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, innerColor)
  gradient.addColorStop(0.4, outerColor)
  gradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const material = new THREE.SpriteMaterial({
    map: texture,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
  })
  const sprite = new THREE.Sprite(material)
  sprite.scale.setScalar(scale)
  sprite.userData.kind = 'glow'
  return sprite
}

function createAtmosphere(sceneRadius, config) {
  const geometry = new THREE.SphereGeometry(sceneRadius * config.scale, 48, 32)
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(config.color) },
      uPower: { value: config.power },
      uIntensity: { value: config.intensity }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vView = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      uniform vec3 uColor;
      uniform float uPower;
      uniform float uIntensity;
      void main() {
        float fresnel = pow(1.0 - abs(dot(vNormal, vView)), uPower);
        gl_FragColor = vec4(uColor * fresnel * uIntensity, fresnel);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.userData.kind = 'atmosphere'
  return mesh
}

function createSunMaterial(body, textures) {
  const map = textures?.map || null
  const color = map
    ? new THREE.Color(0xffffff).multiplyScalar(1.7)
    : new THREE.Color(body.color || '#ffd166').multiplyScalar(1.35)
  return new THREE.MeshBasicMaterial({ color, map, toneMapped: false })
}

function createPlanetMaterial(body, textures) {
  const map = textures?.map || null
  const baseColor = new THREE.Color(body.color || '#ffffff')
  const material = new THREE.MeshStandardMaterial({
    color: map ? 0xffffff : baseColor,
    map,
    emissive: baseColor.clone().multiplyScalar(map ? 0.015 : 0.06),
    roughness: 0.86,
    metalness: 0.02
  })
  if (textures?.bumpMap) {
    material.bumpMap = textures.bumpMap
    material.bumpScale = body.id === 'earth' || body.id === 'mars' ? 0.04 : 0.02
  }
  if (textures?.metalnessMap) {
    // Erd-Specular: Ozeane werden leicht spiegelnd und fangen einen Sonnenglanz ein.
    material.metalnessMap = textures.metalnessMap
    material.metalness = 0.35
    material.roughness = 0.72
  }
  return material
}

function disposeMaterial(material) {
  // Geteilte Bild-Texturen stammen aus dem Asset-Bündel und bleiben erhalten;
  // nur selbst erzeugte Canvas-Texturen werden hier freigegeben.
  if (material.map && material.map.isCanvasTexture) material.map.dispose()
  material.dispose()
}

function disposeObject(object) {
  object.traverse((child) => {
    child.geometry?.dispose()
    if (Array.isArray(child.material)) child.material.forEach(disposeMaterial)
    else if (child.material) disposeMaterial(child.material)
  })
}

export function createSolarSystem({ scene, sunLight, data, mode = 'cinematic', assets = null }) {
  const root = new THREE.Group()
  root.name = 'solar-system'
  scene.add(root)

  const bodies = new Map()
  const selectable = []
  let activeMode = mode

  function clear() {
    const children = [...root.children]
    root.remove(...children)
    children.forEach(disposeObject)
    bodies.clear()
    selectable.length = 0
  }

  function createBody(body, index) {
    const group = new THREE.Group()
    group.name = `body-${body.id}`
    group.userData.bodyId = body.id

    // Eigene Achsneigung: kippt die Rotationsachse (z. B. Uranus „liegt").
    const axisGroup = new THREE.Group()
    axisGroup.name = `axis-${body.id}`
    axisGroup.rotation.z = THREE.MathUtils.degToRad(body.axial_tilt_deg || 0)
    group.add(axisGroup)

    const sceneRadius = getSceneRadius(body, activeMode)
    const geometry = new THREE.SphereGeometry(sceneRadius, 64, 48)
    const textures = assets?.bodies?.[body.id]
    const material = body.id === 'sun'
      ? createSunMaterial(body, textures)
      : createPlanetMaterial(body, textures)

    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = `mesh-${body.id}`
    mesh.userData.bodyId = body.id
    mesh.userData.kind = body.id === 'sun' ? 'sun' : 'planet'
    axisGroup.add(mesh)

    let clouds = null
    if (assets) {
      if (body.id === 'saturn') axisGroup.add(createSaturnRings(sceneRadius, assets.saturnRing))

      if (body.id === 'sun') {
        const corona = createGlowSprite(
          'rgba(255,246,214,0.95)',
          'rgba(255,196,92,0.45)',
          sceneRadius * 4.2
        )
        if (corona) group.add(corona)
      }

      if (body.id === 'earth' && assets.earthClouds) {
        const cloudGeometry = new THREE.SphereGeometry(sceneRadius * 1.012, 64, 48)
        const cloudMaterial = new THREE.MeshStandardMaterial({
          map: assets.earthClouds,
          alphaMap: assets.earthCloudsAlpha || null,
          transparent: true,
          depthWrite: false,
          roughness: 1,
          metalness: 0
        })
        clouds = new THREE.Mesh(cloudGeometry, cloudMaterial)
        clouds.userData.kind = 'clouds'
        axisGroup.add(clouds)
      }

      const atmosphere = ATMOSPHERES[body.id]
      if (atmosphere) group.add(createAtmosphere(sceneRadius, atmosphere))
    } else if (body.id === 'saturn') {
      axisGroup.add(createSaturnRings(sceneRadius, null))
    }

    root.add(group)
    selectable.push(mesh)

    const entry = {
      body,
      group,
      axisGroup,
      mesh,
      clouds,
      index,
      sceneRadius,
      orbit: null,
      orbitDistance: 0,
      phase: index * GOLDEN_ANGLE + 0.35
    }
    bodies.set(body.id, entry)
    return entry
  }

  function rebuild(nextMode = activeMode) {
    clear()
    activeMode = nextMode

    const sunEntry = createBody(data.sun, 0)
    sunEntry.group.position.set(0, 0, 0)
    const planetEntries = data.planets.map((planet, planetIndex) => {
      const index = planetIndex + 1
      return createBody(planet, index)
    })

    if (activeMode === 'compare') {
      const allEntries = [sunEntry, ...planetEntries]
      const layout = createComparisonLayout(allEntries)
      allEntries.forEach((entry) => {
        entry.group.position.copy(layout.get(entry.body.id))
      })
      sunLight.position.copy(sunEntry.group.position)
      return
    }

    sunLight.position.copy(sunEntry.group.position)
    planetEntries.forEach((entry) => {
      const distance = getOrbitDistance(
        entry.body,
        entry.index,
        activeMode,
        { sunRadius: sunEntry.sceneRadius }
      )
      entry.orbitDistance = distance

      entry.group.position.set(
        Math.cos(entry.phase) * distance,
        0,
        Math.sin(entry.phase) * distance
      )
      entry.orbit = createOrbit(distance, entry.body.id)
      root.add(entry.orbit)
    })
  }

  function update(elapsedSeconds) {
    const sunEntry = bodies.get('sun')
    if (sunEntry) sunEntry.mesh.rotation.y = elapsedSeconds * 0.02

    if (activeMode === 'compare') return

    data.planets.forEach((planet) => {
      const entry = bodies.get(planet.id)
      if (!entry) return

      const period = planet.orbital_period_days || 365
      const orbitAngle = entry.phase + (elapsedSeconds * 0.18 / period) * Math.PI * 2 * 365
      entry.group.position.set(
        Math.cos(orbitAngle) * entry.orbitDistance,
        0,
        Math.sin(orbitAngle) * entry.orbitDistance
      )

      const rotationDirection = Math.sign(planet.rotation_period_hours || 1)
      entry.mesh.rotation.y = elapsedSeconds * 0.08 * rotationDirection
      if (entry.clouds) entry.clouds.rotation.y = elapsedSeconds * 0.1
    })
  }

  function dispose() {
    clear()
    scene.remove(root)
  }

  rebuild(activeMode)

  return {
    root,
    bodies,
    selectable,
    rebuild,
    update,
    dispose,
    get mode() {
      return activeMode
    }
  }
}
