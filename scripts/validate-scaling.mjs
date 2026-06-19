import { readFile } from 'node:fs/promises'
import { validateSolarSystemData } from '../src/data.js'
import {
  createComparisonLayout,
  getOrbitDistance,
  getScaleMode,
  getSceneRadius,
  SCALE_MODE_IDS
} from '../src/scaling.js'

const raw = await readFile(new URL('../public/data/solar-system.json', import.meta.url), 'utf8')
const data = validateSolarSystemData(JSON.parse(raw))

function assert(condition, message) {
  if (!condition) {
    console.error(`Skalierungsfehler: ${message}`)
    process.exitCode = 1
  }
}

function approximatelyEqual(left, right, tolerance = 1e-10) {
  return Math.abs(left - right) <= tolerance
}

assert(SCALE_MODE_IDS.join(',') === 'cinematic,size,distance,compare', 'Es müssen genau vier definierte Maßstabsmodi existieren')
assert(getScaleMode('cinematic').description.includes('nicht maßstabsgetreu'), 'Cinematic-Modus verschweigt die visuelle Optimierung')
assert(getScaleMode('size').description.includes('Radien') && getScaleMode('size').description.includes('komprimiert'), 'Größenmodus erklärt sein Größen- und Distanzverhältnis nicht')
assert(getScaleMode('distance').description.includes('relativ korrekt') && getScaleMode('distance').description.includes('Markergrößen'), 'Entfernungsmodus erklärt seine Markergrößen nicht')
assert(getScaleMode('compare').description.includes('Umlaufentfernungen werden nicht gezeigt'), 'Vergleichsmodus erklärt die fehlenden Entfernungen nicht')

const earth = data.planets.find((planet) => planet.id === 'earth')
const jupiter = data.planets.find((planet) => planet.id === 'jupiter')
const neptune = data.planets.find((planet) => planet.id === 'neptune')

const sizeRadiusRatio = getSceneRadius(jupiter, 'size') / getSceneRadius(earth, 'size')
assert(approximatelyEqual(sizeRadiusRatio, jupiter.radius_km / earth.radius_km), 'Größenmodus erhält das reale Radiusverhältnis nicht')

const distanceRatio = getOrbitDistance(neptune, 8, 'distance') / getOrbitDistance(earth, 3, 'distance')
assert(approximatelyEqual(distanceRatio, neptune.mean_distance_million_km / earth.mean_distance_million_km), 'Entfernungsmodus erhält das reale Distanzverhältnis nicht')

const comparisonEntries = [data.sun, ...data.planets].map((body) => ({
  body,
  sceneRadius: getSceneRadius(body, 'compare')
}))
const comparisonLayout = createComparisonLayout(comparisonEntries)

for (let index = 1; index < comparisonEntries.length; index += 1) {
  const previous = comparisonEntries[index - 1]
  const current = comparisonEntries[index]
  const centerDistance = comparisonLayout.get(current.body.id).x - comparisonLayout.get(previous.body.id).x
  assert(centerDistance > previous.sceneRadius + current.sceneRadius, `${current.body.id} überlappt im Vergleichsmodus den Vorgänger`)
}

SCALE_MODE_IDS.forEach((modeId) => {
  const camera = getScaleMode(modeId).camera
  assert(camera.position.length === 3 && camera.target.length === 3, `${modeId}: Kameravorgabe fehlt`)
})

if (!process.exitCode) {
  console.log('Skalierungsprüfung erfolgreich: vier Modi sind ehrlich beschriftet und verhältnistreu umgesetzt.')
}
