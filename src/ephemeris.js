// Vereinfachte Planetenpositionen aus Keplerschen Bahnelementen.
// Quelle: NASA/JPL "Keplerian Elements for Approximate Positions of the Major
// Planets" (E. M. Standish). Gültig mit guter Genauigkeit ca. 1800–2050.
// Werte je Element: [Wert bei J2000, Änderung pro Julianischem Jahrhundert].
// a in AE, Winkel in Grad.

const DEG = Math.PI / 180
const J2000 = 2451545.0

const ELEMENTS = Object.freeze({
  mercury: { a: [0.38709927, 0.00000037], e: [0.20563593, 0.00001906], I: [7.00497902, -0.00594749], L: [252.25032350, 149472.67411175], peri: [77.45779628, 0.16047689], node: [48.33076593, -0.12534081] },
  venus: { a: [0.72333566, 0.00000390], e: [0.00677672, -0.00004107], I: [3.39467605, -0.00078890], L: [181.97909950, 58517.81538729], peri: [131.60246718, 0.00268329], node: [76.67984255, -0.27769418] },
  earth: { a: [1.00000261, 0.00000562], e: [0.01671123, -0.00004392], I: [-0.00001531, -0.01294668], L: [100.46457166, 35999.37244981], peri: [102.93768193, 0.32327364], node: [0.0, 0.0] },
  mars: { a: [1.52371034, 0.00001847], e: [0.09339410, 0.00007882], I: [1.84969142, -0.00813131], L: [-4.55343205, 19140.30268499], peri: [-23.94362959, 0.44441088], node: [49.55953891, -0.29257343] },
  jupiter: { a: [5.20288700, -0.00011607], e: [0.04838624, -0.00013253], I: [1.30439695, -0.00183714], L: [34.39644051, 3034.74612775], peri: [14.72847983, 0.21252668], node: [100.47390909, 0.20469106] },
  saturn: { a: [9.53667594, -0.00125060], e: [0.05386179, -0.00050991], I: [2.48599187, 0.00193609], L: [49.95424423, 1222.49362201], peri: [92.59887831, -0.41897216], node: [113.66242448, -0.28867794] },
  uranus: { a: [19.18916464, -0.00196176], e: [0.04725744, -0.00004397], I: [0.77263783, -0.00242939], L: [313.23810451, 428.48202785], peri: [170.95427630, 0.40805281], node: [74.01692503, 0.04240589] },
  neptune: { a: [30.06992276, 0.00026291], e: [0.00859048, 0.00005105], I: [1.77004347, 0.00035372], L: [-55.12002969, 218.45945325], peri: [44.96476227, -0.32241464], node: [131.78422574, -0.00508664] }
})

export const EPHEMERIS_BODY_IDS = Object.freeze(Object.keys(ELEMENTS))

export function hasEphemeris(bodyId) {
  return Object.prototype.hasOwnProperty.call(ELEMENTS, bodyId)
}

function julianDay(date) {
  return date.getTime() / 86400000 + 2440587.5
}

function normalizeRad(angle) {
  const twoPi = Math.PI * 2
  return ((angle % twoPi) + twoPi) % twoPi
}

function solveKepler(meanAnomaly, eccentricity) {
  let E = meanAnomaly
  for (let i = 0; i < 12; i += 1) {
    const delta = (E - eccentricity * Math.sin(E) - meanAnomaly) / (1 - eccentricity * Math.cos(E))
    E -= delta
    if (Math.abs(delta) < 1e-9) break
  }
  return E
}

/**
 * Heliozentrische ekliptikale Rechteckkoordinaten (in AE) eines Planeten.
 */
export function heliocentricPosition(bodyId, date) {
  const element = ELEMENTS[bodyId]
  if (!element) return null

  const T = (julianDay(date) - J2000) / 36525
  const a = element.a[0] + element.a[1] * T
  const e = element.e[0] + element.e[1] * T
  const I = (element.I[0] + element.I[1] * T) * DEG
  const L = (element.L[0] + element.L[1] * T) * DEG
  const peri = (element.peri[0] + element.peri[1] * T) * DEG
  const node = (element.node[0] + element.node[1] * T) * DEG

  const argPeri = peri - node
  const meanAnomaly = normalizeRad((L - peri) + Math.PI) - Math.PI
  const E = solveKepler(meanAnomaly, e)

  const xOrbit = a * (Math.cos(E) - e)
  const yOrbit = a * Math.sqrt(1 - e * e) * Math.sin(E)

  const cosArg = Math.cos(argPeri)
  const sinArg = Math.sin(argPeri)
  const cosNode = Math.cos(node)
  const sinNode = Math.sin(node)
  const cosI = Math.cos(I)
  const sinI = Math.sin(I)

  const x = (cosArg * cosNode - sinArg * sinNode * cosI) * xOrbit
    + (-sinArg * cosNode - cosArg * sinNode * cosI) * yOrbit
  const y = (cosArg * sinNode + sinArg * cosNode * cosI) * xOrbit
    + (-sinArg * sinNode + cosArg * cosNode * cosI) * yOrbit
  const z = (sinArg * sinI) * xOrbit + (cosArg * sinI) * yOrbit

  return { x, y, z, radius: Math.hypot(x, y, z) }
}

/**
 * Heliozentrische ekliptikale Länge (Bogenmaß, 0..2π) – der Winkel, der die
 * „Stellung" des Planeten relativ zu den anderen beschreibt.
 */
export function heliocentricLongitude(bodyId, date) {
  const position = heliocentricPosition(bodyId, date)
  if (!position) return 0
  return normalizeRad(Math.atan2(position.y, position.x))
}
