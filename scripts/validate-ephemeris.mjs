import {
  EPHEMERIS_BODY_IDS,
  heliocentricLongitude,
  heliocentricPosition
} from '../src/ephemeris.js'

function assert(condition, message) {
  if (!condition) {
    console.error(`Ephemeridenfehler: ${message}`)
    process.exitCode = 1
  }
}

const toDeg = (rad) => (rad * 180) / Math.PI
const refDate = new Date('2026-06-19T00:00:00Z')

assert(EPHEMERIS_BODY_IDS.length === 8, 'Es müssen genau acht Planeten mit Bahnelementen vorhanden sein.')

const longitudes = new Map()
for (const id of EPHEMERIS_BODY_IDS) {
  const lon = heliocentricLongitude(id, refDate)
  longitudes.set(id, lon)
  assert(Number.isFinite(lon), `${id}: Länge ist nicht endlich.`)
  assert(lon >= 0 && lon < Math.PI * 2, `${id}: Länge liegt außerhalb von [0, 2π).`)
}

// Plausibilität gegen die Realität: Am 19.06.2026 steht die Sonne geozentrisch
// nahe der Sommersonnenwende (~88°), die Erde also heliozentrisch bei ~268°.
const earthDeg = toDeg(longitudes.get('earth'))
assert(earthDeg > 250 && earthDeg < 285, `Erd-Länge am Referenzdatum unrealistisch (${earthDeg.toFixed(1)}°).`)

// Radien müssen ungefähr den großen Halbachsen entsprechen.
const radiusRanges = {
  earth: [0.97, 1.03],
  jupiter: [4.9, 5.5],
  neptune: [29.5, 30.5]
}
for (const [id, [min, max]] of Object.entries(radiusRanges)) {
  const r = heliocentricPosition(id, refDate).radius
  assert(r > min && r < max, `${id}: Bahnradius ${r.toFixed(3)} AE außerhalb [${min}, ${max}].`)
}

// Determinismus: gleiche Eingabe -> gleiches Ergebnis.
assert(
  heliocentricLongitude('earth', refDate) === longitudes.get('earth'),
  'Berechnung ist nicht deterministisch.'
)

// Konstellation: nicht alle Planeten stehen im selben Winkel.
const distinct = new Set([...longitudes.values()].map((lon) => lon.toFixed(4)))
assert(distinct.size === 8, 'Planeten stehen unrealistisch alle im selben Winkel.')

// Periodizität: nach einem Erdjahr steht die Erde wieder nahezu gleich.
const oneYearLater = new Date(refDate.getTime() + 365.256 * 86400000)
const earthDelta = Math.abs(toDeg(heliocentricLongitude('earth', oneYearLater)) - earthDeg)
const wrappedDelta = Math.min(earthDelta, 360 - earthDelta)
assert(wrappedDelta < 3, `Erd-Länge nach einem Jahr weicht zu stark ab (${wrappedDelta.toFixed(2)}°).`)

if (!process.exitCode) {
  console.log('Ephemeridenprüfung erfolgreich: acht Planeten, realistische Erdposition und stabile Periodik.')
}
