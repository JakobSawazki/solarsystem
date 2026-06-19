import { readFile } from 'node:fs/promises'
import * as THREE from 'three'
import { validateSolarSystemData } from '../src/data.js'
import { getScaleMode, SCALE_MODE_IDS } from '../src/scaling.js'
import { createSolarSystem } from '../src/solarSystem.js'

const raw = await readFile(new URL('../public/data/solar-system.json', import.meta.url), 'utf8')
const data = validateSolarSystemData(JSON.parse(raw))
const scene = new THREE.Scene()
const sunLight = new THREE.PointLight(0xffffff, 1)
scene.add(sunLight)

const solarSystem = createSolarSystem({ scene, sunLight, data })
const expectedIds = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']

function assert(condition, message) {
  if (!condition) {
    console.error(`Renderingfehler: ${message}`)
    process.exitCode = 1
  }
}

assert(solarSystem.bodies.size === 9, 'Sonne und acht Planeten wurden nicht vollständig erzeugt')
assert(solarSystem.selectable.length === 9, 'Nicht alle Himmelskörper sind auswählbar')

expectedIds.forEach((id) => {
  assert(solarSystem.bodies.has(id), `${id} fehlt in der Szene`)
})

const sun = solarSystem.bodies.get('sun')
assert(sun.mesh.material instanceof THREE.MeshBasicMaterial, 'Sonne verwendet kein selbstleuchtendes Material')

for (const planet of data.planets) {
  const entry = solarSystem.bodies.get(planet.id)
  assert(entry.mesh.material instanceof THREE.MeshStandardMaterial, `${planet.id} verwendet kein beleuchtetes Material`)
  assert(entry.orbit instanceof THREE.LineLoop, `${planet.id} besitzt keine Orbitlinie`)
  assert(entry.orbit.material.opacity <= 0.25, `${planet.id}: Orbitlinie ist zu dominant`)
  assert(entry.group.position.length() > sun.sceneRadius + entry.sceneRadius, `${planet.id} überlappt die Sonne`)
}

const saturnRings = solarSystem.bodies.get('saturn').group.getObjectByName('saturn-rings')
assert(saturnRings?.children.length === 2, 'Saturn besitzt kein eindeutig getrenntes Ringsystem')

const initialPositions = new Set(
  data.planets.map((planet) => solarSystem.bodies.get(planet.id).group.position.toArray().map((value) => value.toFixed(3)).join(','))
)
assert(initialPositions.size === 8, 'Planeten starten übereinander statt verteilt auf ihren Bahnen')

SCALE_MODE_IDS.forEach((modeId) => {
  solarSystem.rebuild(modeId)
  const mode = getScaleMode(modeId)
  const camera = new THREE.PerspectiveCamera(55, 16 / 9, 0.1, 10000)
  camera.position.fromArray(mode.camera.position)
  camera.lookAt(...mode.camera.target)
  camera.updateProjectionMatrix()
  camera.updateMatrixWorld(true)
  scene.updateMatrixWorld(true)

  expectedIds.forEach((id) => {
    const projectedCenter = solarSystem.bodies
      .get(id)
      .group
      .getWorldPosition(new THREE.Vector3())
      .project(camera)
    const isInsideFrustum = Math.abs(projectedCenter.x) <= 1
      && Math.abs(projectedCenter.y) <= 1
      && projectedCenter.z >= -1
      && projectedCenter.z <= 1
    assert(isInsideFrustum, `${modeId}: ${id} liegt außerhalb der Desktop-Startansicht`)
  })
})

solarSystem.rebuild('cinematic')
const earthBefore = solarSystem.bodies.get('earth').group.position.clone()
solarSystem.update(5)
assert(earthBefore.distanceTo(solarSystem.bodies.get('earth').group.position) > 0, 'Planetenpositionen werden nicht aktualisiert')

solarSystem.dispose()
assert(solarSystem.root.parent === null, 'Sonnensystem wird nicht sauber aus der Szene entfernt')

if (!process.exitCode) {
  console.log('Renderingprüfung erfolgreich: Sonne, acht Planeten, Orbits und Saturnringe vorhanden.')
}
