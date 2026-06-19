import * as THREE from 'three'
import { loadSolarSystemData } from './data.js'
import { getFocusDistance } from './cameraFocus.js'
import { getScaleMode, SCALE_MODE_IDS } from './scaling.js'
import { createSceneRuntime } from './scene.js'
import { createSolarSystem } from './solarSystem.js'
import { createSolarSystemUi } from './ui.js'

const container = document.querySelector('#sceneContainer')
const scaleModeSelect = document.querySelector('#scaleMode')
const resetViewButton = document.querySelector('#resetView')

const sceneRuntime = createSceneRuntime(container)
const scene = sceneRuntime?.scene
const camera = sceneRuntime?.camera
const renderer = sceneRuntime?.renderer
const controls = sceneRuntime?.controls
const sunLight = sceneRuntime?.sunLight

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
let solarData = null
let solarSystem = null
let scaleMode = 'cinematic'
let animationStart = performance.now()
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

function createStarField() {
  const geometry = new THREE.BufferGeometry()
  const count = 1200
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count; i += 1) {
    const radius = 2500 + Math.random() * 2500
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: true })
  scene.add(new THREE.Points(geometry, material))
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
  const elapsedSeconds = (now - animationStart) / 1000
  solarSystem?.update(elapsedSeconds)
  sceneRuntime.updateCameraTransition(now)
  controls.update()
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

async function init() {
  configureScaleModeSelect()
  createStarField()
  solarData = await loadSolarSystemData()
  solarSystem = createSolarSystem({
    scene,
    sunLight,
    data: solarData,
    mode: scaleMode
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
