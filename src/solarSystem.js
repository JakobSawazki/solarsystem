import * as THREE from 'three'
import {
  createComparisonLayout,
  getOrbitDistance,
  getSceneRadius
} from './scaling.js'

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const ORBIT_POINT_COUNT = 256

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

function createSaturnRings(sceneRadius) {
  const rings = new THREE.Group()
  rings.name = 'saturn-rings'
  rings.userData.kind = 'saturn-rings'
  rings.rotation.x = Math.PI / 2
  rings.rotation.z = THREE.MathUtils.degToRad(26.7)

  const bands = [
    { inner: 1.34, outer: 1.68, color: 0xe7d9ad, opacity: 0.82 },
    { inner: 1.78, outer: 2.34, color: 0xb9a679, opacity: 0.58 }
  ]

  bands.forEach((band, index) => {
    const geometry = new THREE.RingGeometry(
      sceneRadius * band.inner,
      sceneRadius * band.outer,
      128
    )
    const material = new THREE.MeshStandardMaterial({
      color: band.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: band.opacity,
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

function disposeObject(object) {
  object.traverse((child) => {
    child.geometry?.dispose()
    if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose())
    else child.material?.dispose()
  })
}

export function createSolarSystem({ scene, sunLight, data, mode = 'cinematic' }) {
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

    const sceneRadius = getSceneRadius(body, activeMode)
    const geometry = new THREE.SphereGeometry(sceneRadius, 48, 32)
    const color = new THREE.Color(body.color || '#ffffff')
    const material = body.id === 'sun'
      ? new THREE.MeshBasicMaterial({ color, toneMapped: false })
      : new THREE.MeshStandardMaterial({
          color,
          emissive: color.clone().multiplyScalar(0.06),
          roughness: 0.8,
          metalness: 0.01
        })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = `mesh-${body.id}`
    mesh.userData.bodyId = body.id
    mesh.userData.kind = body.id === 'sun' ? 'sun' : 'planet'
    group.add(mesh)

    if (body.id === 'saturn') group.add(createSaturnRings(sceneRadius))

    root.add(group)
    selectable.push(mesh)

    const entry = {
      body,
      group,
      mesh,
      index,
      sceneRadius,
      orbit: null,
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
    if (activeMode === 'compare') return

    data.planets.forEach((planet) => {
      const entry = bodies.get(planet.id)
      if (!entry) return

      const distance = getOrbitDistance(
        planet,
        entry.index,
        activeMode,
        { sunRadius: bodies.get('sun').sceneRadius }
      )
      const period = planet.orbital_period_days || 365
      const orbitAngle = entry.phase + (elapsedSeconds * 0.18 / period) * Math.PI * 2 * 365
      entry.group.position.set(
        Math.cos(orbitAngle) * distance,
        0,
        Math.sin(orbitAngle) * distance
      )

      const rotationDirection = Math.sign(planet.rotation_period_hours || 1)
      entry.mesh.rotation.y = elapsedSeconds * 0.08 * rotationDirection
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
