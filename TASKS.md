# TASKS.md – Projektaufgaben: Simuliertes Sonnensystem

Arbeitsregel für Codex: Immer nur die erste Task mit Status `OPEN` bearbeiten. Statuswerte: `OPEN`, `IN_PROGRESS`, `DONE`, `BLOCKED`.

---

## MVP – Phase 1: Solide, veröffentlichbare Grundversion

### TASK-001 – Repository prüfen und lauffähiges Grundgerüst herstellen

**Status:** DONE  
**Abgeschlossen:** 2026-06-18 – Grundgerüst, Installation, Datentest, Produktions-Build und GitHub-Pages-Basis geprüft.  
**Priorität:** Sehr hoch  
**Ziel:** Das Projekt muss lokal start- und buildbar sein.

**Umfang:**

- Vorhandene Vite-/Three.js-Struktur prüfen.
- Falls nötig, fehlende Dateien ergänzen oder korrigieren.
- `npm install`, `npm run dev`, `npm run build` vorbereiten.
- Sicherstellen, dass `vite.config.js` GitHub-Pages-kompatibel ist.
- Falls noch nicht vorhanden, eine einfache Startszene anzeigen.

**Akzeptanzkriterien:**

- `npm run build` läuft erfolgreich.
- Startseite zeigt eine dunkle Weltraumfläche mit mindestens Sonne und Platzhaltern für Planeten.
- Keine kritischen Konsolenfehler.
- `docs/VERSION_STATE.md` und `docs/CHANGELOG.md` aktualisiert.

---

### TASK-002 – Three.js-Szene mit Kamera, Licht, Controls und Resize-Handling

**Status:** DONE  
**Abgeschlossen:** 2026-06-18 – Szenenbasis modularisiert, responsives Resize-Handling und WebGL-Fallback ergänzt.  
**Priorität:** Sehr hoch

**Ziel:** Eine stabile 3D-Basis mit OrbitControls, perspektivischer Kamera, Renderer, Licht und responsiver Größenanpassung.

**Umfang:**

- Scene, PerspectiveCamera, WebGLRenderer.
- OrbitControls mit Dämpfung.
- ResizeObserver oder Window-Resize.
- Pixelratio-Begrenzung.
- WebGL-Fallback-Hinweis.
- Saubere Trennung in Module, falls sinnvoll.

**Akzeptanzkriterien:**

- Ansicht lässt sich drehen und zoomen.
- Browserfensteränderung funktioniert ohne verzerrte Darstellung.
- App bleibt bei kleinen Viewports bedienbar.

---

### TASK-003 – Datenmodell laden und validieren

**Status:** DONE  
**Abgeschlossen:** 2026-06-18 – Zentralen Datenloader, Laufzeitvalidierung, UI-Fehlerzustand und erweiterte Datentests ergänzt.  
**Priorität:** Sehr hoch

**Ziel:** Planetendaten werden aus `public/data/solar-system.json` geladen und zentral genutzt.

**Umfang:**

- Daten laden mit `fetch` unter Berücksichtigung von `import.meta.env.BASE_URL`.
- Minimale Validierung: Sonne vorhanden, acht Planeten vorhanden, numerische Radius-/Distanzwerte.
- Fehlerzustand im UI anzeigen.
- Keine Planetendaten dupliziert im Renderer halten.

**Akzeptanzkriterien:**

- Alle acht Planeten werden aus der JSON-Datei gelesen.
- Fehlerhafte Daten führen zu verständlicher Meldung.
- `npm run test` prüft Basisdaten, sofern Script vorhanden.

---

### TASK-004 – Sonne, Planeten und Orbitlinien rendern

**Status:** DONE  
**Abgeschlossen:** 2026-06-18 – Datengetriebenes Rendering für Sonne, acht Planeten, dezente Orbits und Saturnringe modularisiert und geprüft.  
**Priorität:** Hoch

**Ziel:** Alle Himmelskörper werden sichtbar als 3D-Objekte mit Umlaufbahnen dargestellt.

**Umfang:**

- Sonne als leuchtender Mittelpunkt.
- Acht Planeten als Kugeln mit farblich unterscheidbaren Materialien.
- Orbitlinien um die Sonne.
- Saturn mit einfachem Ringsystem.
- Labels optional als HTML-Overlay oder Sprite.

**Akzeptanzkriterien:**

- Sonne, Merkur, Venus, Erde, Mars, Jupiter, Saturn, Uranus, Neptun sichtbar.
- Orbitlinien erkennbar und nicht dominant.
- Saturn ist visuell eindeutig als Saturn erkennbar.

---

### TASK-005 – Maßstabsmodi implementieren

**Status:** DONE  
**Abgeschlossen:** 2026-06-18 – Vier didaktisch klar beschriftete Skalierungsmodi samt Kameravorgaben, Vergleichslayout und Verhältnistests umgesetzt.  
**Priorität:** Sehr hoch

**Ziel:** Umschaltbare Darstellungsmodi für Größe, Entfernung und cinematic Darstellung.

**Umfang:**

- Modusauswahl im UI.
- `cinematic`: schöne Präsentationsansicht.
- `size`: relative Größen korrekt, Entfernungen komprimiert.
- `distance`: relative Distanzen korrekt, Planeten über Mindestgröße sichtbar.
- `compare`: Größenvergleich nebeneinander oder fokussierte Vergleichsansicht.
- Erklärungstext pro Modus.

**Akzeptanzkriterien:**

- Nutzer kann Modi umschalten.
- UI erklärt, ob der Modus maßstäblich, komprimiert oder visuell optimiert ist.
- Keine falsche Behauptung vollständiger Maßstabstreue.

---

### TASK-006 – Infopanel und Auswahl/Fokusfunktion

**Status:** DONE  
**Abgeschlossen:** 2026-06-19 – Datengetriebenes Infopanel, direkte Auswahl, Raycasting und sanften Kamerafokus inklusive Esc-Schließen umgesetzt.  
**Priorität:** Hoch

**Ziel:** Klick auf Planet oder Button öffnet ein verständliches Infopanel und fokussiert die Kamera.

**Umfang:**

- Raycasting für Objektklick.
- Infopanel mit Name, Kurzbeschreibung und Basisdaten.
- Buttons oder Liste für direkte Auswahl.
- Sanfter Kamerafokus auf gewählten Himmelskörper.
- `Esc` schließt Panel.

**Akzeptanzkriterien:**

- Jeder Planet ist auswählbar.
- Infopanel zeigt korrekte Daten aus JSON.
- Fokus wirkt ruhig und nicht sprunghaft.

---

### TASK-007 – Animation: Umlauf, Rotation und Zeitsteuerung

**Status:** OPEN  
**Priorität:** Mittel/Hoch

**Ziel:** Das Sonnensystem wirkt lebendig und steuerbar.

**Umfang:**

- Planeten bewegen sich auf Kreisbahnen auf Basis der Umlaufperioden.
- Eigenrotation angedeutet.
- Zeitgeschwindigkeitsregler: Pause, 1x, 10x, 100x, 1000x oder sinnvoll skaliert.
- Animation darf UI und Performance nicht stören.

**Akzeptanzkriterien:**

- Bewegung ist sichtbar und kontrollierbar.
- Pause funktioniert.
- Keine Geometrie-/Material-Neuerzeugung pro Frame.

---

### TASK-008 – Visuelle Effekte und Designpolitur

**Status:** OPEN  
**Priorität:** Mittel

**Ziel:** Die App erhält einen hochwertigen, modernen Look.

**Umfang:**

- Sternfeld.
- Dezenter Sonnen-Glow.
- HUD-/Glasoptik für UI.
- Hover- und Fokuszustände.
- Optional Bloom oder Shader nur, wenn Performance stabil bleibt.

**Akzeptanzkriterien:**

- App wirkt hochwertig, aber nicht überladen.
- Effekte laufen flüssig auf durchschnittlicher Hardware.
- Mobile Darstellung bleibt lesbar.

---

### TASK-009 – Mobile, Barrierefreiheit und Fallbacks

**Status:** OPEN  
**Priorität:** Hoch

**Ziel:** Die Seite ist auf Smartphone, Tablet und Desktop nutzbar.

**Umfang:**

- Responsive Layout.
- Touch-Bedienung prüfen.
- ARIA-Labels für relevante UI-Elemente.
- Tastaturbedienung für zentrale Funktionen.
- WebGL-Fallback-Hinweis.

**Akzeptanzkriterien:**

- Bedienung auf Smartphone ist sinnvoll möglich.
- Buttons und Infopanel sind lesbar.
- Kontrast und Fokusmarkierung ausreichend.

---

### TASK-010 – GitHub-Pages-Deployment finalisieren

**Status:** OPEN  
**Priorität:** Sehr hoch

**Ziel:** Veröffentlichung über GitHub Pages zuverlässig ermöglichen.

**Umfang:**

- Workflow `.github/workflows/deploy.yml` prüfen.
- Build-Pfad und `base`-Pfad testen.
- README-Anleitung aktualisieren.
- Optional: Repository-Name in Doku als Platzhalter erklären.

**Akzeptanzkriterien:**

- Workflow kann `dist` als Pages-Artefakt deployen.
- README beschreibt GitHub-Pages-Aktivierung.
- App funktioniert auch unter Repository-Unterpfad.

---

## Phase 2 – Erweiterungen nach MVP

### TASK-011 – Monde, Asteroidengürtel und Zwergplaneten

**Status:** OPEN  
**Priorität:** Mittel

**Idee:** Mond der Erde, große Jupitermonde, Titan, Pluto/Ceres als optionale Objekte einbauen.

---

### TASK-012 – Lernmodus für Schule/Unterricht

**Status:** OPEN  
**Priorität:** Mittel

**Idee:** Kurze Lernkarten, Quizfragen, Vergleichsfragen und didaktische Erklärungen zu Größen, Distanzen und Umlaufzeiten.

---

### TASK-013 – Screenshot-/Share-Funktion

**Status:** OPEN  
**Priorität:** Niedrig/Mittel

**Idee:** Aktuelle Ansicht als Bild speichern oder Link mit Kameraposition/ausgewähltem Planeten teilen.

---

### TASK-014 – Texturen mit sauberer Quellenangabe

**Status:** OPEN  
**Priorität:** Niedrig/Mittel

**Idee:** Optionale echte Planetentexturen einbinden, aber nur mit sauber dokumentierten Lizenzen/Quellen.
