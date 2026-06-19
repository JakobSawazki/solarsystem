import * as THREE from 'three'
import WebGL from 'three/addons/capabilities/WebGL.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
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
  scene.background = new THREE.Color(0x05060f)

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
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
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

  // Dezentes Grundlicht, damit Nachtseiten nicht völlig schwarz sind, aber die
  // von der Sonne beleuchtete Tag/Nacht-Grenze klar sichtbar bleibt.
  const ambientLight = new THREE.AmbientLight(0x5a6a85, 0.45)
  scene.add(ambientLight)

  // decay = 0: didaktisch komprimierte Distanzen sollen alle Planeten gleich gut
  // ausleuchten, statt äußere Planeten künstlich abzudunkeln.
  const sunLight = new THREE.PointLight(0xfff3d0, 2.4, 0, 0)
  scene.add(sunLight)

  // Postprocessing: weiches Bloom für Sonne und helle Kanten.
  let composer = null
  let bloomPass = null
  try {
    composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.62, 0.5, 0.82)
    composer.addPass(bloomPass)
    composer.addPass(new OutputPass())
  } catch (error) {
    console.warn('Bloom-Postprocessing nicht verfügbar, einfacher Renderpfad aktiv.', error)
    composer = null
  }

  function resize() {
    const width = Math.max(container.clientWidth, 1)
    const height = Math.max(container.clientHeight, 1)
    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO)

    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()

    if (composer) {
      composer.setPixelRatio(pixelRatio)
      composer.setSize(width, height)
    }
  }

  function render() {
    if (composer) composer.render()
    else renderer.render(scene, camera)
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
    composer?.dispose()
    renderer.dispose()
  }

  resize()

  return {
    scene,
    camera,
    renderer,
    controls,
    sunLight,
    render,
    resetCamera,
    setCameraView,
    focusCamera: cameraFocus.focus,
    updateCameraTransition: cameraFocus.update,
    resize,
    dispose
  }
}
