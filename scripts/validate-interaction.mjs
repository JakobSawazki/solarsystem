import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import * as THREE from 'three'
import {
  createCameraFocusController,
  getFocusDistance
} from '../src/cameraFocus.js'
import { getBodyButtonModel, getBodyFacts } from '../src/ui.js'

const dataUrl = new URL('../public/data/solar-system.json', import.meta.url)
const data = JSON.parse(await readFile(dataUrl, 'utf8'))
const bodies = [data.sun, ...data.planets]

assert.equal(bodies.length, 9, 'Sonne und acht Planeten müssen auswählbar sein.')

for (const body of bodies) {
  const button = getBodyButtonModel(body)
  assert.equal(button.id, body.id, `${body.id}: Button-ID stammt aus den Quelldaten.`)
  assert.equal(button.label, body.name_de, `${body.id}: Buttonname stammt aus den Quelldaten.`)

  const facts = Object.fromEntries(getBodyFacts(body))
  assert.equal(facts.Typ, body.type_de, `${body.id}: Typ fehlt im Infopanel.`)
  assert.match(facts.Durchmesser, /km$/, `${body.id}: Durchmesser fehlt im Infopanel.`)
  assert.match(facts.Radius, /km$/, `${body.id}: Radius fehlt im Infopanel.`)
}

const camera = new THREE.PerspectiveCamera()
camera.position.set(0, 100, 240)
const controls = { target: new THREE.Vector3(0, 0, 0) }
const focus = createCameraFocusController({ camera, controls })
const destination = new THREE.Vector3(120, 0, -80)
const distance = getFocusDistance(4)
const startPosition = camera.position.clone()

focus.focus({ target: destination, distance, duration: 1000, startTime: 0 })
focus.update(500)
assert.notDeepEqual(camera.position.toArray(), startPosition.toArray(), 'Kamera muss sich während des Fokus bewegen.')
assert.notDeepEqual(controls.target.toArray(), destination.toArray(), 'Fokus darf nicht auf halber Strecke springen.')

focus.update(1000)
assert.ok(controls.target.distanceTo(destination) < 1e-9, 'Kameraziel muss am gewählten Objekt enden.')
assert.ok(Math.abs(camera.position.distanceTo(destination) - distance) < 1e-9, 'Fokusabstand muss eingehalten werden.')
assert.equal(focus.active, false, 'Kamerafahrt muss sauber enden.')

console.log('Interaktionsprüfung erfolgreich: 9 Auswahlen, Infodaten und sanfter Kamerafokus validiert.')
