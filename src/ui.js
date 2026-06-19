const formatter = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 })

function hasValue(value) {
  return value !== null && value !== undefined && value !== ''
}

function formatNumber(value, suffix) {
  return hasValue(value) ? `${formatter.format(value)} ${suffix}` : '—'
}

export function getBodyFacts(body) {
  return [
    ['Typ', body.type_de || '—'],
    ['Durchmesser', formatNumber(body.diameter_km, 'km')],
    ['Radius', formatNumber(body.radius_km, 'km')],
    ['Entfernung', formatNumber(body.mean_distance_million_km, 'Mio. km')],
    ['Umlaufzeit', formatNumber(body.orbital_period_days, 'Tage')],
    ['Rotation', formatNumber(body.rotation_period_hours, 'h')]
  ]
}

export function getBodyButtonModel(body) {
  return {
    id: body.id,
    label: body.name_de,
    color: body.color || '#ffffff'
  }
}

export function createSolarSystemUi({
  panel,
  name,
  description,
  facts,
  highlightSection,
  highlights,
  buttons,
  closeButton,
  scaleHint,
  onSelect
}) {
  const buttonById = new Map()

  function setBodies(bodies) {
    buttonById.clear()
    const elements = bodies.map((body) => {
      const model = getBodyButtonModel(body)
      const button = document.createElement('button')
      const dot = document.createElement('span')
      const label = document.createElement('span')

      button.type = 'button'
      button.dataset.bodyId = model.id
      button.setAttribute('aria-controls', panel.id)
      button.setAttribute('aria-pressed', 'false')
      button.style.setProperty('--body-color', model.color)
      dot.className = 'body-dot'
      dot.setAttribute('aria-hidden', 'true')
      label.textContent = model.label
      button.append(dot, label)
      button.addEventListener('click', () => onSelect(model.id))
      buttonById.set(model.id, button)
      return button
    })
    buttons.replaceChildren(...elements)
  }

  function setSelected(bodyId) {
    buttonById.forEach((button, id) => {
      button.setAttribute('aria-pressed', String(id === bodyId))
    })
  }

  function renderFacts(body) {
    const elements = getBodyFacts(body).flatMap(([label, value]) => {
      const term = document.createElement('dt')
      const detail = document.createElement('dd')
      term.textContent = label
      detail.textContent = value
      return [term, detail]
    })
    facts.replaceChildren(...elements)
  }

  function renderHighlights(body) {
    const items = Array.isArray(body.facts_de) ? body.facts_de : []
    highlightSection.hidden = items.length === 0
    highlights.replaceChildren(...items.map((fact) => {
      const item = document.createElement('li')
      item.textContent = fact
      return item
    }))
  }

  function openBody(body) {
    panel.hidden = false
    panel.removeAttribute('aria-hidden')
    panel.dataset.state = 'ready'
    panel.removeAttribute('role')
    name.textContent = body.name_de
    description.textContent = body.short_description_de || ''
    renderFacts(body)
    renderHighlights(body)
    setSelected(body.id)
  }

  function clearSelection() {
    setSelected(null)
  }

  function closePanel() {
    panel.hidden = true
    panel.setAttribute('aria-hidden', 'true')
    clearSelection()
  }

  function showError(error) {
    const message = error instanceof Error
      ? error.message
      : 'Die Sonnensystem-Daten konnten nicht verarbeitet werden.'

    panel.hidden = false
    panel.dataset.state = 'error'
    panel.setAttribute('role', 'alert')
    name.textContent = 'Datenfehler'
    description.textContent = message
    facts.replaceChildren()
    highlights.replaceChildren()
    highlightSection.hidden = true
    buttons.replaceChildren()
    scaleHint.textContent = 'Bitte lade die Seite neu. Bleibt der Fehler bestehen, muss die Datendatei geprüft werden.'
  }

  closeButton.addEventListener('click', closePanel)

  return {
    setBodies,
    openBody,
    closePanel,
    clearSelection,
    showError,
    setScaleHint(value) {
      scaleHint.textContent = value
    }
  }
}
