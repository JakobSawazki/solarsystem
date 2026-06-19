import * as THREE from 'three'

const TEXTURE_DIR = 'textures'

// Farbkanal-Texturen (map/emissiveMap) müssen im sRGB-Farbraum interpretiert
// werden; Daten-Texturen (Höhen-/Glanz-/Alphakanäle) bleiben linear.
const BODY_TEXTURES = Object.freeze({
  sun: { map: 'sun.jpg' },
  mercury: { map: 'mercury.jpg', bumpMap: 'mercury-bump.jpg' },
  venus: { map: 'venus.jpg', bumpMap: 'venus-bump.jpg' },
  earth: { map: 'earth.jpg', bumpMap: 'earth-bump.jpg', metalnessMap: 'earth-specular.jpg' },
  mars: { map: 'mars.jpg', bumpMap: 'mars-bump.jpg' },
  jupiter: { map: 'jupiter.jpg' },
  saturn: { map: 'saturn.jpg' },
  uranus: { map: 'uranus.jpg' },
  neptune: { map: 'neptune.jpg' }
})

const EXTRA_TEXTURES = Object.freeze({
  earthClouds: 'earth-clouds.jpg',
  earthCloudsAlpha: 'earth-clouds-alpha.jpg',
  saturnRing: 'saturn-ring.png'
})

const COLOR_MAP_KEYS = new Set(['map', 'emissiveMap', 'earthClouds', 'saturnRing'])

function buildUrl(baseUrl, file) {
  const normalizedBase = typeof baseUrl === 'string' && baseUrl.length > 0 ? baseUrl : '/'
  const separator = normalizedBase.endsWith('/') ? '' : '/'
  return `${normalizedBase}${separator}${TEXTURE_DIR}/${file}`
}

function loadOne(loader, url, { color, anisotropy }) {
  return new Promise((resolve) => {
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace
        texture.anisotropy = anisotropy
        texture.wrapS = THREE.RepeatWrapping
        resolve(texture)
      },
      undefined,
      () => {
        // Fehlende Texturen sollen die App nicht blockieren – es greift die Farbe.
        console.warn(`Textur konnte nicht geladen werden: ${url}`)
        resolve(null)
      }
    )
  })
}

/**
 * Lädt alle Planetentexturen im Browser und liefert ein Asset-Bündel, das an
 * createSolarSystem übergeben wird. In Node (Tests/Build-Validierung) ohne DOM
 * wird null zurückgegeben, sodass die Szene rein farbbasiert aufgebaut wird.
 */
export async function loadSolarSystemTextures({
  baseUrl = import.meta.env.BASE_URL,
  anisotropy = 8
} = {}) {
  if (typeof document === 'undefined') return null

  const loader = new THREE.TextureLoader()
  const pending = []
  const bodies = {}

  for (const [bodyId, maps] of Object.entries(BODY_TEXTURES)) {
    bodies[bodyId] = {}
    for (const [key, file] of Object.entries(maps)) {
      const color = COLOR_MAP_KEYS.has(key)
      pending.push(
        loadOne(loader, buildUrl(baseUrl, file), { color, anisotropy }).then((texture) => {
          bodies[bodyId][key] = texture
        })
      )
    }
  }

  const extras = {}
  for (const [key, file] of Object.entries(EXTRA_TEXTURES)) {
    const color = COLOR_MAP_KEYS.has(key)
    pending.push(
      loadOne(loader, buildUrl(baseUrl, file), { color, anisotropy }).then((texture) => {
        extras[key] = texture
      })
    )
  }

  await Promise.all(pending)
  return { bodies, ...extras }
}
