import { readFile } from 'node:fs/promises'
import {
  loadSolarSystemData,
  SolarSystemDataError,
  validateSolarSystemData
} from '../src/data.js'

const raw = await readFile(new URL('../public/data/solar-system.json', import.meta.url), 'utf8')
const data = JSON.parse(raw)

function assert(condition, message) {
  if (!condition) {
    console.error(`Datenfehler: ${message}`)
    process.exitCode = 1
  }
}

function expectInvalid(name, mutate, expectedMessage) {
  const invalidData = structuredClone(data)
  mutate(invalidData)

  try {
    validateSolarSystemData(invalidData)
    assert(false, `${name}: ungültige Daten wurden akzeptiert`)
  } catch (error) {
    assert(error instanceof SolarSystemDataError, `${name}: unerwarteter Fehlertyp`)
    assert(error.message.includes(expectedMessage), `${name}: unverständliche Fehlermeldung`)
  }
}

try {
  validateSolarSystemData(data)
} catch (error) {
  assert(false, error.message)
}

let requestedUrl = ''
const loadedData = await loadSolarSystemData({
  baseUrl: '/sonnensystem/',
  fetchImpl: async (url) => {
    requestedUrl = url
    return {
      ok: true,
      json: async () => structuredClone(data)
    }
  }
})

assert(requestedUrl === '/sonnensystem/data/solar-system.json', 'BASE_URL wird beim Laden nicht korrekt berücksichtigt')
assert(loadedData.planets.length === 8, 'Loader liefert nicht alle acht Planeten')

expectInvalid('fehlende Sonne', (invalidData) => {
  delete invalidData.sun
}, 'Sonne fehlt')

expectInvalid('falsche Planetenanzahl', (invalidData) => {
  invalidData.planets.pop()
}, 'genau acht Planeten')

expectInvalid('ungültiger Radius', (invalidData) => {
  invalidData.planets[2].radius_km = '6371'
}, 'radius_km')

expectInvalid('ungültige Entfernung', (invalidData) => {
  invalidData.planets[2].mean_distance_million_km = null
}, 'mean_distance_million_km')

if (!process.exitCode) {
  console.log('Datenprüfung erfolgreich: Sonne, acht Planeten, BASE_URL und Fehlerfälle validiert.')
}
