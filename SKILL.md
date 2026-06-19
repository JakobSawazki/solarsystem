# SKILL.md – Skill: Interaktive Sonnensystem-Web-App mit Three.js und GitHub Pages

## Zweck

Diese Skill-Datei beschreibt, wie Codex in diesem Projekt arbeiten soll, um eine hochwertige, interaktive 3D-Homepage über das Sonnensystem zu entwickeln.

## Produktprinzipien

### 1. Didaktisch ehrlich mit Maßstab umgehen

Ein echter simultaner Maßstab für Planetengrößen und Entfernungen ist im Browser kaum sinnvoll sichtbar. Deshalb muss jede Darstellung klar als einer der folgenden Modi ausgewiesen werden:

- **Cinematic**: visuell schöne Startansicht; Größen und Abstände bewusst nicht real.
- **Größenmaßstab**: Planetenradien relativ korrekt; Entfernungen komprimiert.
- **Entfernungsmaßstab**: Entfernungen relativ korrekt; kleine Planeten über Marker/Mindestgröße sichtbar.
- **Vergleich**: Größenvergleich als Line-up oder separater Vergleichsbereich.

Niemals behaupten, ein komprimierter oder cinematic Modus sei vollständig maßstabsgetreu.

### 2. Datengetrieben arbeiten

Planetendaten liegen zentral in:

`public/data/solar-system.json`

Rendering, UI und Animation sollen daraus erzeugt werden. Keine Planetendaten hart im Renderer duplizieren, außer kurzfristig als Fallback mit klarer TODO-Markierung.

### 3. Three.js sauber strukturieren

Empfohlene Struktur:

- `src/main.js`: Einstieg, App-Initialisierung.
- `src/scene.js`: Szene, Kamera, Renderer, Licht, Sternfeld.
- `src/solarSystem.js`: Sonne, Planeten, Orbits, Animation.
- `src/scaling.js`: Maßstabslogik.
- `src/ui.js`: Infopanel, Toolbar, Moduswahl.
- `src/styles.css`: Layout, responsive UI.

Bei wachsendem Umfang darf in Unterordner wie `src/app/` refaktoriert werden.

### 4. Bedienung

Mindestbedienung:

- Maus links: drehen.
- Mausrad/Pinch: zoomen.
- Rechtsklick oder zwei Finger: schwenken, sofern OrbitControls dies unterstützt.
- Klick/Tap auf Himmelskörper: Infopanel öffnen.
- Buttons: Sonne, Merkur, Venus, Erde, Mars, Jupiter, Saturn, Uranus, Neptun fokussieren.
- Taste `Esc`: Infopanel schließen.
- Optional: Taste `R`: Ansicht zurücksetzen.

### 5. Visuelle Qualität

Angestrebter Stil:

- dunkler Weltraumhintergrund,
- dezentes Sternfeld,
- leuchtende Sonne,
- Orbitlinien fein und nicht störend,
- moderne Glas-/HUD-Optik,
- klare Typografie,
- keine überladenen Effekte.

Effekte müssen performant bleiben. Besonders auf mobilen Geräten keine übertriebenen Partikelsysteme.

### 6. Performance

- Renderer an Containergröße koppeln.
- `devicePixelRatio` begrenzen, z. B. auf maximal 2.
- Animationen mit `requestAnimationFrame`.
- Nicht unnötig neue Geometrien oder Materialien pro Frame erzeugen.
- Bei vielen Sternen BufferGeometry/Points verwenden.
- Buildgröße im Blick behalten.

### 7. GitHub Pages

Vite muss mit GitHub-Pages-Unterpfaden funktionieren. Der `base`-Pfad darf Deployment nicht brechen. `vite.config.js` enthält dafür eine dynamische Basislogik.

### 8. Barrierefreiheit und Fallback

- Wichtige Informationen dürfen nicht ausschließlich visuell im 3D-Raum erscheinen.
- Infopanel muss per Tastatur erreichbar sein.
- UI-Kontraste ausreichend.
- Bei fehlender WebGL-Unterstützung soll ein verständlicher Hinweis erscheinen.

## Definition of Done für jede Implementierung

Eine Umsetzung ist fertig, wenn:

- `npm run build` erfolgreich ist,
- keine offensichtlichen Runtime-Fehler auftreten,
- Funktionalität in Deutsch benutzbar ist,
- neue/angepasste Dateien nachvollziehbar strukturiert sind,
- Dokumentation aktualisiert wurde.
