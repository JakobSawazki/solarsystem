# Simuliertes Sonnensystem – interaktive GitHub-Pages-Homepage

Dieses Repository enthält eine interaktive 3D-Homepage über unser Sonnensystem mit Sonne, acht Planeten, vier transparent erklärten Maßstabsmodi, Infopanel sowie Zoom-, Dreh- und Fokussteuerung.

**Live-Demo:** https://jakobsawazki.github.io/solarsystem/

## Zielbild

Die fertige Anwendung soll wie eine moderne wissenschaftlich-edukative Web-Erfahrung wirken:

- 3D-Ansicht mit Sonne und acht Planeten.
- Drehen, Zoomen, Schwenken per Maus/Touch.
- Infopanel pro Himmelskörper mit Daten und verständlicher Erklärung.
- Umschaltbare Darstellungsmodi:
  - **Cinematic Mode**: optisch schön, für Startansicht und Präsentation.
  - **Größenmaßstab**: Radien relativ korrekt, Entfernungen bewusst komprimiert.
  - **Entfernungsmaßstab**: Umlaufbahnen relativ korrekt, Planetengrößen sichtbar über Mindestgröße/Marker.
  - **Vergleichsmodus**: Größenvergleich nebeneinander oder als „Line-up“.
- Coole, aber performante Effekte: echte Planetentexturen, Bloom, Atmosphären-Glow, Sternfeld, Orbitlinien, sanfte Kameraübergänge.
- Zeitsteuerung (Pause, 1×, 10×, 100×) für die Umlaufbewegung.
- Veröffentlichung über GitHub Pages.

Texturen werden mit dokumentierter Lizenz eingebunden, siehe `public/textures/TEXTURE_CREDITS.md`.

## Warum mehrere Maßstäbe nötig sind

Ein vollständig echter Maßstab für Größen und Entfernungen gleichzeitig ist im Browser didaktisch problematisch: Die Sonne wäre im Verhältnis zur Erde sehr groß, die Abstände zwischen den Planeten wären extrem weit, und die kleinen Planeten wären kaum sichtbar. Deshalb soll die App transparent mit **mehreren Maßstabsmodi** arbeiten und im UI klar erklären, welcher Modus aktiv ist.

## Technische Basis

Empfohlener Stack:

- Vite als schneller Static-Site-Build.
- Three.js für die 3D-Szene.
- GitHub Pages für Veröffentlichung.
- Datengetriebene Planetenkonfiguration in `public/data/solar-system.json`.

## Lokaler Start

```bash
npm install
npm run dev
```

Dann die lokale Vite-Adresse öffnen.

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages

Die Seite wird bei jedem Push auf `main` automatisch durch `.github/workflows/deploy.yml` gebaut und veröffentlicht:

https://jakobsawazki.github.io/solarsystem/

## Einstieg für Codex

Codex soll zuerst diese Dateien lesen:

1. `AGENTS.md`
2. `SKILL.md`
3. `TASKS.md`
4. `docs/PROJECT_SPEC.md`
5. `docs/DATA_MODEL.md`

Ein sehr kurzer Codex-Startprompt befindet sich in `CODEX_PROMPT_SHORT.md`.
