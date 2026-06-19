import * as THREE from 'three'
import WebGL from 'three/addons/capabilities/WebGL.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { createCameraFocusController } from './cameraFocus.js'

const MAX_PIXEL_RATIO = 2
const DEFAULT_CAMERA_POSITION = new THREE.Vector3(0, 240, 520)

function showWebGLFallback(container) {
  const fallback = document.createElement('div')
  fallback.className = 'webgl-fallback'
  fallback.setAttribute('role', 'alert')

  const title = document.createElement('h2')
  title.textContent = '3D-Ansicht nicht verfügbar'

  const message = document.createElement('p')
  message.textContent = 'Dieser Browser oder dieses Gerät unterstützt WebGL 2 nicht. Bitte aktiviere die Hardwarebeschleunigung oder verwende einen aktuellen Browser.'

  fallback.append(title, message)
  container.replaceChildren(fallback)
}

export function createSceneRuntime(container) {
  if (!(container instanceof HTMLElement)) {
    throw new TypeError('Der Container für die 3D-Szene fehlt.')
  }

  if (!WebGL.isWebGL2Available()) {
    showWebGLFallback(container)
    return null
  }

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x020617)

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 10000)
  camera.position.copy(DEFAULT_CAMERA_POSITION)

  let renderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  } catch (error) {
    console.error('WebGL-Renderer konnte nicht initialisiert werden.', error)
    showWebGLFallback(container)
    return null
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.domElement.setAttribute('aria-label', 'Interaktive 3D-Darstellung des Sonnensystems')
  container.replaceChildren(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.enablePan = true
  controls.screenSpacePanning = true
  controls.minDistance = 20
  controls.maxDistance = 5000
  const cameraFocus = createCameraFocusController({ camera, controls })
  controls.addEventListener('start', cameraFocus.cancel)

  const ambientLight = new THREE.AmbientLight(0x6688aa, 0.55)
  scene.add(ambientLight)

  const sunLight = new THREE.PointLight(0xfff3bf, 4, 5000, 1.5)
  scene.add(sunLight)

  function resize() {
    const width = Math.max(container.clientWidth, 1)
    const height = Math.max(container.clientHeight, 1)

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO))
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  const resizeObserver = typeof ResizeObserver === 'undefined'
    ? null
    : new ResizeObserver(resize)

  if (resizeObserver) resizeObserver.observe(container)
  else window.addEventListener('resize', resize)

  function resetCamera() {
    cameraFocus.cancel()
    controls.target.set(0, 0, 0)
    camera.position.copy(DEFAULT_CAMERA_POSITION)
    controls.update()
  }

  function setCameraView({ position, target = [0, 0, 0] }) {
    cameraFocus.cancel()
    camera.position.fromArray(position)
    controls.target.fromArray(target)
    controls.update()
  }

  function dispose() {
    resizeObserver?.disconnect()
    if (!resizeObserver) window.removeEventListener('resize', resize)
    controls.removeEventListener('start', cameraFocus.cancel)
    controls.dispose()
    renderer.dispose()
  }

  resize()

  return {
    scene,
    camera,
    renderer,
    controls,
    sunLight,
    resetCamera,
    setCameraView,
    focusCamera: cameraFocus.focus,
    updateCameraTransition: cameraFocus.update,
    resize,
    dispose
  }
}
