const EARTH_RADIUS_KM = 6371
const SIZE_RADIUS_UNIT = 1.1

export const SCALE_MODES = Object.freeze({
  cinematic: Object.freeze({
    id: 'cinematic',
    label: 'Cinematic / Hybrid',
    description: 'Cinematic/Hybrid: Größen und Entfernungen sind bewusst visuell optimiert und nicht maßstabsgetreu.',
    camera: Object.freeze({ position: Object.freeze([0, 240, 520]), target: Object.freeze([0, 0, 0]) })
  }),
  size: Object.freeze({
    id: 'size',
    label: 'Größenmaßstab',
    description: 'Größenmaßstab: Die Radien stehen im korrekten Größenverhältnis; die Entfernungen sind stark komprimiert.',
    camera: Object.freeze({ position: Object.freeze([0, 420, 780]), target: Object.freeze([0, 0, 0]) })
  }),
  distance: Object.freeze({
    id: 'distance',
    label: 'Entfernungsmaßstab',
    description: 'Entfernungsmaßstab: Die Sonnenabstände sind relativ korrekt; künstliche Markergrößen halten die Planeten sichtbar.',
    camera: Object.freeze({ position: Object.freeze([0, 500, 1050]), target: Object.freeze([0, 0, 0]) })
  }),
  compare: Object.freeze({
    id: 'compare',
    label: 'Vergleichsmodus',
    description: 'Vergleichsmodus: Sonne und Planeten stehen mit relativ korrekten Radien in einer Reihe; Umlaufentfernungen werden nicht gezeigt.',
    camera: Object.freeze({ position: Object.freeze([0, 190, 440]), target: Object.freeze([0, 0, 0]) })
  })
})

export const SCALE_MODE_IDS = Object.freeze(Object.keys(SCALE_MODES))

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum)
}

export function getScaleMode(modeId) {
  return SCALE_MODES[modeId] || SCALE_MODES.cinematic
}

export function getSceneRadius(body, modeId) {
  const mode = getScaleMode(modeId).id

  if (mode === 'size' || mode === 'compare') {
    return (body.radius_km / EARTH_RADIUS_KM) * SIZE_RADIUS_UNIT
  }

  if (mode === 'distance') {
    if (body.id === 'sun') return 2.5
    return clamp(Math.cbrt(body.radius_km) / 14, 0.8, 3)
  }

  if (body.id === 'sun') return 15
  return clamp(Math.cbrt(body.radius_km) / 7, 1.4, 6.4)
}

export function getOrbitDistance(body, index, modeId, { sunRadius = 0 } = {}) {
  const mode = getScaleMode(modeId).id
  if (!body.mean_distance_million_km) return 0
  if (mode === 'distance') return body.mean_distance_million_km / 10
  if (mode === 'size') return sunRadius + 18 + (index - 1) * 38
  if (mode === 'compare') return 0
  return 35 + Math.log1p(body.mean_distance_million_km / 50) * 50
}

export function createComparisonLayout(entries, gap = 3) {
  const totalWidth = entries.reduce(
    (sum, entry) => sum + entry.sceneRadius * 2,
    Math.max(entries.length - 1, 0) * gap
  )
  const positions = new Map()
  let cursor = -totalWidth / 2

  entries.forEach((entry) => {
    cursor += entry.sceneRadius
    positions.set(entry.body.id, { x: cursor, y: 0, z: 0 })
    cursor += entry.sceneRadius + gap
  })

  return new Map(
    [...positions].map(([id, position]) => [id, position])
  )
}
