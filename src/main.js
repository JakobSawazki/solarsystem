import * as THREE from 'three'
import { loadSolarSystemData } from './data.js'
import { loadSolarSystemTextures } from './textures.js'
import { getFocusDistance } from './cameraFocus.js'
import { getScaleMode, SCALE_MODE_IDS } from './scaling.js'
import { createSceneRuntime } from './scene.js'
import { createSolarSystem } from './solarSystem.js'
import { createSolarSystemUi } from './ui.js'

const container = document.querySelector('#sceneContainer')
const scaleModeSelect = document.querySelector('#scaleMode')
const resetViewButton = document.querySelector('#resetView')
const timeControl = document.querySelector('#timeControl')

const sceneRuntime = createSceneRuntime(container)
const scene = sceneRuntime?.scene
const camera = sceneRuntime?.camera
const renderer = sceneRuntime?.renderer
const controls = sceneRuntime?.controls
const sunLight = sceneRuntime?.sunLight

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const reducedMotion = typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches

let solarSystem = null
let scaleMode = 'cinematic'
let simTime = 0
let lastFrame = performance.now()
let timeSpeed = reducedMotion ? 0 : 1
let pointerStart = null

const ui = createSolarSystemUi({
  panel: document.querySelector('#infoPanel'),
  name: document.querySelector('#objectName'),
  description: document.querySelector('#objectDescription'),
  facts: document.querySelector('#objectFacts'),
  highlightSection: document.querySelector('#highlightSection'),
  highlights: document.querySelector('#objectHighlights'),
  buttons: document.querySelector('#objectButtons'),
  closeButton: document.querySelector('#closeInfo'),
  scaleHint: document.querySelector('#scaleHint'),
  onSelect: selectBody
})

function configureScaleModeSelect() {
  const options = SCALE_MODE_IDS.map((modeId) => {
    const mode = getScaleMode(modeId)
    const option = document.createElement('option')
    option.value = mode.id
    option.textContent = mode.label
    return option
  })
  scaleModeSelect.replaceChildren(...options)
}

function applyScaleMode(modeId, { rebuild = true } = {}) {
  const mode = getScaleMode(modeId)
  scaleMode = mode.id
  scaleModeSelect.value = mode.id
  ui.setScaleHint(mode.description)
  if (rebuild) {
    solarSystem?.rebuild(mode.id)
    ui.closePanel()
  }
  sceneRuntime.setCameraView(mode.camera)
  ui.clearSelection()
}

function setTimeSpeed(speed) {
  timeSpeed = speed
  if (!timeControl) return
  timeControl.querySelectorAll('button').forEach((button) => {
    button.setAttribute('aria-pressed', String(Number(button.dataset.speed) === speed))
  })
}

function configureTimeControl() {
  if (!timeControl) return
  timeControl.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-speed]')
    if (!button) return
    setTimeSpeed(Number(button.dataset.speed))
  })
  setTimeSpeed(timeSpeed)
}

function createStarTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.65)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function createStarLayer(count, radiusMin, radiusMax, size, opacity, tint, texture) {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const base = new THREE.Color(tint)

  for (let i = 0; i < count; i += 1) {
    const radius = radiusMin + Math.random() * (radiusMax - radiusMin)
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)

    const shade = 0.55 + Math.random() * 0.45
    colors[i * 3] = base.r * shade
    colors[i * 3 + 1] = base.g * shade
    colors[i * 3 + 2] = base.b * shade
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const material = new THREE.PointsMaterial({
    size,
    map: texture,
    vertexColors: true,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  })
  return new THREE.Points(geometry, material)
}

function createStarField() {
  const texture = createStarTexture()
  scene.add(createStarLayer(1600, 2400, 4200, 7, 0.85, '#cfe2ff', texture))
  scene.add(createStarLayer(280, 2200, 3800, 16, 0.95, '#fff4e0', texture))
}

function selectBody(bodyId, { moveCamera = true } = {}) {
  const entry = solarSystem?.bodies.get(bodyId)
  if (!entry) return

  ui.openBody(entry.body)
  if (!moveCamera) return

  sceneRuntime.focusCamera({
    target: entry.group.position.clone(),
    distance: getFocusDistance(entry.sceneRadius)
  })
}

function getPointerPosition(event) {
  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  return pointer
}

function onPointerDown(event) {
  if (event.button !== 0) return
  pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY }
}

function onPointerUp(event) {
  if (!pointerStart || pointerStart.id !== event.pointerId) return
  const distance = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y)
  pointerStart = null
  if (distance > 7) return

  raycaster.setFromCamera(getPointerPosition(event), camera)
  const hits = raycaster.intersectObjects(solarSystem?.selectable || [], false)
  const bodyId = hits[0]?.object?.userData?.bodyId
  if (bodyId) selectBody(bodyId)
}

function animate(now) {
  const delta = Math.min((now - lastFrame) / 1000, 0.1)
  lastFrame = now
  simTime += delta * timeSpeed

  solarSystem?.update(simTime)
  sceneRuntime.updateCameraTransition(now)
  controls.update()
  sceneRuntime.render()
  requestAnimationFrame(animate)
}

async function init() {
  configureScaleModeSelect()
  configureTimeControl()
  createStarField()

  const [solarData, assets] = await Promise.all([
    loadSolarSystemData(),
    loadSolarSystemTextures()
  ])

  solarSystem = createSolarSystem({
    scene,
    sunLight,
    data: solarData,
    mode: scaleMode,
    assets
  })

  ui.setBodies([solarData.sun, ...solarData.planets])
  applyScaleMode(scaleMode, { rebuild: false })
  selectBody('sun', { moveCamera: false })

  renderer.domElement.addEventListener('pointerdown', onPointerDown)
  renderer.domElement.addEventListener('pointerup', onPointerUp)
  renderer.domElement.addEventListener('pointercancel', () => { pointerStart = null })

  scaleModeSelect.addEventListener('change', () => {
    applyScaleMode(scaleModeSelect.value)
  })
  resetViewButton.addEventListener('click', () => {
    applyScaleMode(scaleMode, { rebuild: false })
  })
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') ui.closePanel()
    if (event.key.toLowerCase() === 'r') resetViewButton.click()
  })

  lastFrame = performance.now()
  requestAnimationFrame(animate)
}

if (sceneRuntime) {
  init().catch((error) => {
    console.error(error)
    ui.showError(error)
    scaleModeSelect.disabled = true
    resetViewButton.disabled = true
  })
}
