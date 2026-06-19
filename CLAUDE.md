# CLAUDE.md – Projektkontext für Claude Code

## Worum geht es

Interaktive 3D-Homepage über unser Sonnensystem (Vite + Three.js), veröffentlicht
über GitHub Pages. Sonne + acht Planeten, vier transparent erklärte Maßstabsmodi
(`cinematic`, `size`, `distance`, `compare`), Infopanel, Zoom/Dreh/Fokus,
echte Planetentexturen, Bloom/Atmosphären-Effekte und eine Zeitsteuerung.

- **Live-Demo:** https://jakobsawazki.github.io/solarsystem/
- **Repo:** https://github.com/JakobSawazki/solarsystem
- Sprache der UI und Doku: **Deutsch**.

## Projektstruktur (Kurz)

- `index.html` – Markup, Toolbar (Maßstab, Zeitsteuerung), Meta-/OG-Tags.
- `src/main.js` – App-Einstieg: Daten + Texturen laden, Szene/UI verdrahten, Render-/Zeit-Loop.
- `src/scene.js` – Renderer, Kamera, OrbitControls, Licht, Tone-Mapping, **Bloom-Postprocessing** (`EffectComposer`).
- `src/solarSystem.js` – datengetriebener Aufbau: Körper, Materialien/Texturen, Achsneigung, Saturnring, Erd-Wolken, Atmosphären-Glow, Sonnen-Korona, Orbits.
- `src/textures.js` – **browser-only** Texturlader; liefert ein Asset-Bündel an `solarSystem.js`.
- `src/ephemeris.js` – Keplersche Bahnelemente (JPL/Standish); berechnet die heliozentrische Länge je Planet für ein Datum (reine Mathematik, Node-tauglich). `solarSystem.setDate(date)` setzt damit die Konstellation.
- `src/scaling.js` – vier Maßstabsmodi, Radien/Distanzen, Vergleichslayout, Kameravorgaben.
- `src/data.js` – Laden + Validierung von `public/data/solar-system.json`.
- `src/ui.js`, `src/cameraFocus.js` – Infopanel/Buttons bzw. sanfte Kamerafahrt.
- `public/textures/` – Planetentexturen + `TEXTURE_CREDITS.md` (Lizenzen!).
- `scripts/validate-*.mjs` – Node-Tests (Daten, Skalierung, Rendering, Interaktion).

## Wichtige Invariante (Tests nicht brechen!)

`scripts/validate-rendering.mjs` läuft **in Node ohne DOM**. Deshalb:

- Texturen/Canvas/Postprocessing dürfen **nicht** in `solarSystem.js` direkt geladen werden – sie kommen als `assets` aus `main.js` herein. Ohne `assets` baut sich die Szene rein farbbasiert auf.
- Sonne muss `MeshBasicMaterial` bleiben, Planeten `MeshStandardMaterial`.
- `saturn-rings`-Gruppe behält **genau 2** Kindelemente.
- `bodies.size === 9`, `selectable.length === 9` (nur die 9 Hauptkugeln sind klickbar).

## Lokal bauen/testen (Windows-Eigenheit)

Es liegt **kein** `node_modules` und **kein npm** im Projektordner. Eine portable
Node-Runtime liegt unter
`%USERPROFILE%\Documents\Software\solarsystem-local-runtime` (enthält `node.exe`
und installierte `node_modules`). `Start-Sonnensystem.cmd` synchronisiert das
Projekt dorthin und startet Vite.

Tests/Build manuell (PowerShell):

```powershell
$rt = "$env:USERPROFILE\Documents\Software\solarsystem-local-runtime"
robocopy "G:\Meine Ablage\Codex\Solarsystem" $rt /E /XD node_modules dist .git /XF Start-Sonnensystem.cmd
Set-Location $rt
& "$rt\node.exe" scripts\validate-data.mjs
& "$rt\node.exe" scripts\validate-scaling.mjs
& "$rt\node.exe" scripts\validate-rendering.mjs
& "$rt\node.exe" scripts\validate-interaction.mjs
& "$rt\node.exe" node_modules\vite\bin\vite.js build
```

Visuelle Vorschau: `.claude/launch.json` → Preview „solarsystem-preview" serviert
das gebaute `dist` über die portable Runtime (Headless-Screenshots scheitern an
der WebGL-Dauerschleife – Funktion stattdessen per `preview_eval`/Netzwerk prüfen).

## Deployment

`.github/workflows/deploy.yml` baut bei Push auf `main` mit `npm ci` und
veröffentlicht `dist` über GitHub Pages. `vite.config.js` setzt die `base`
dynamisch auf `/<Repositoryname>/`. Abhängigkeiten sind in `package.json`
**exakt gepinnt** (three 0.184.0, vite 8.0.16) – Lockfile synchron halten.

## Stand

Siehe `docs/VERSION_STATE.md`, `docs/CHANGELOG.md` und `TASKS.md`.
