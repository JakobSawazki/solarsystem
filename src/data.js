const DATA_PATH = 'data/solar-system.json'

export class SolarSystemDataError extends Error {
  constructor(message, issues = [], options = {}) {
    super(message, options)
    this.name = 'SolarSystemDataError'
    this.issues = issues
  }
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPositiveNumber(value) {
  return Number.isFinite(value) && value > 0
}

function bodyLabel(body, fallback) {
  if (!isRecord(body)) return fallback
  return body.name_de || body.id || fallback
}

function validateBody(body, label, issues, seenIds, requiresDistance) {
  if (!isRecord(body)) {
    issues.push(`${label} fehlt oder ist kein gültiges Objekt.`)
    return
  }

  if (typeof body.id !== 'string' || body.id.trim() === '') {
    issues.push(`${label}: id fehlt.`)
  } else if (seenIds.has(body.id)) {
    issues.push(`${label}: id "${body.id}" ist doppelt vorhanden.`)
  } else {
    seenIds.add(body.id)
  }

  if (typeof body.name_de !== 'string' || body.name_de.trim() === '') {
    issues.push(`${label}: name_de fehlt.`)
  }

  if (!isPositiveNumber(body.radius_km)) {
    issues.push(`${label}: radius_km muss eine positive Zahl sein.`)
  }

  if (!isPositiveNumber(body.diameter_km)) {
    issues.push(`${label}: diameter_km muss eine positive Zahl sein.`)
  }

  if (requiresDistance && !isPositiveNumber(body.mean_distance_million_km)) {
    issues.push(`${label}: mean_distance_million_km muss eine positive Zahl sein.`)
  }
}

export function validateSolarSystemData(data) {
  const issues = []
  const seenIds = new Set()

  if (!isRecord(data)) {
    throw new SolarSystemDataError('Die Sonnensystem-Daten haben kein gültiges Grundformat.', [
      'Das Wurzelelement muss ein Objekt sein.'
    ])
  }

  if (!isRecord(data.sun)) {
    issues.push('Sonne fehlt.')
  } else {
    if (data.sun.id !== 'sun') issues.push('Die Sonne muss die id "sun" besitzen.')
    validateBody(data.sun, bodyLabel(data.sun, 'Sonne'), issues, seenIds, false)
  }

  if (!Array.isArray(data.planets)) {
    issues.push('planets muss ein Array sein.')
  } else {
    if (data.planets.length !== 8) {
      issues.push('Es müssen genau acht Planeten enthalten sein.')
    }

    data.planets.forEach((planet, index) => {
      validateBody(
        planet,
        bodyLabel(planet, `Planet ${index + 1}`),
        issues,
        seenIds,
        true
      )
    })
  }

  if (issues.length > 0) {
    const details = issues.slice(0, 3).join(' ')
    const more = issues.length > 3 ? ` Weitere Fehler: ${issues.length - 3}.` : ''
    throw new SolarSystemDataError(
      `Die Sonnensystem-Daten sind unvollständig oder fehlerhaft. ${details}${more}`,
      issues
    )
  }

  return data
}

function createDataUrl(baseUrl) {
  const normalizedBase = typeof baseUrl === 'string' && baseUrl.length > 0
    ? baseUrl
    : '/'
  const separator = normalizedBase.endsWith('/') ? '' : '/'
  return `${normalizedBase}${separator}${DATA_PATH}`
}

export async function loadSolarSystemData({
  baseUrl = import.meta.env.BASE_URL,
  fetchImpl = globalThis.fetch,
  signal
} = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new SolarSystemDataError('Die Sonnensystem-Daten können in diesem Browser nicht geladen werden.')
  }

  const dataUrl = createDataUrl(baseUrl)
  let response

  try {
    response = await fetchImpl(dataUrl, {
      headers: { Accept: 'application/json' },
      signal
    })
  } catch (cause) {
    throw new SolarSystemDataError(
      'Die Sonnensystem-Daten konnten nicht geladen werden. Bitte prüfe die Verbindung und lade die Seite neu.',
      [],
      { cause }
    )
  }

  if (!response.ok) {
    throw new SolarSystemDataError(
      `Die Sonnensystem-Daten konnten nicht geladen werden (HTTP ${response.status || 'unbekannt'}).`
    )
  }

  let data
  try {
    data = await response.json()
  } catch (cause) {
    throw new SolarSystemDataError(
      'Die geladene Sonnensystem-Datei enthält kein gültiges JSON.',
      [],
      { cause }
    )
  }

  return validateSolarSystemData(data)
}
