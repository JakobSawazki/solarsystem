import * as THREE from 'three'

const MIN_FOCUS_DISTANCE = 42
const MAX_FOCUS_DISTANCE = 320

export function getFocusDistance(sceneRadius) {
  const radius = Number.isFinite(sceneRadius) ? Math.max(sceneRadius, 0) : 0
  return THREE.MathUtils.clamp(radius * 10 + 28, MIN_FOCUS_DISTANCE, MAX_FOCUS_DISTANCE)
}

export function easeInOutCubic(progress) {
  const value = THREE.MathUtils.clamp(progress, 0, 1)
  return value < 0.5
    ? 4 * value ** 3
    : 1 - ((-2 * value + 2) ** 3) / 2
}

export function createCameraFocusController({ camera, controls }) {
  let transition = null

  function cancel() {
    transition = null
  }

  function focus({ target, distance, duration = 1000, startTime = performance.now() }) {
    const destinationTarget = target.clone()
    const viewDirection = camera.position.clone().sub(controls.target)

    if (viewDirection.lengthSq() < 0.0001) viewDirection.set(0, 0.35, 1)
    viewDirection.normalize()
    if (viewDirection.y < 0.16) {
      viewDirection.y = 0.16
      viewDirection.normalize()
    }

    transition = {
      startTime,
      duration: Math.max(duration, 1),
      startPosition: camera.position.clone(),
      startTarget: controls.target.clone(),
      destinationTarget,
      destinationPosition: destinationTarget.clone().addScaledVector(viewDirection, distance)
    }
  }

  function update(now = performance.now()) {
    if (!transition) return false

    const progress = THREE.MathUtils.clamp(
      (now - transition.startTime) / transition.duration,
      0,
      1
    )
    const eased = easeInOutCubic(progress)

    camera.position.lerpVectors(
      transition.startPosition,
      transition.destinationPosition,
      eased
    )
    controls.target.lerpVectors(
      transition.startTarget,
      transition.destinationTarget,
      eased
    )

    if (progress >= 1) transition = null
    return true
  }

  return {
    focus,
    update,
    cancel,
    get active() {
      return transition !== null
    }
  }
}
