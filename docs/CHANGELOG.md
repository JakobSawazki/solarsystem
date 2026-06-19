# CHANGELOG.md

## 0.7.0 – 2026-06-19

### Hinzugefügt

- Echte equirektangulare Planetentexturen für Sonne und alle acht Planeten inklusive Erd-Wolkenschicht, Erd-Glanzkarte (Ozean-Spiegelung) sowie Höhenkarten (Bump) für die Gesteinsplaneten.
- Neues, browser-only Texturmodul `src/textures.js`, das ein Asset-Bündel an die Szene übergibt, sodass die Node-Tests ohne DOM unverändert laufen.
- Bloom-Postprocessing über `EffectComposer` (`RenderPass`/`UnrealBloomPass`/`OutputPass`) plus ACES-Filmic-Tone-Mapping für einen cineastischen Look.
- Atmosphären-Glow (Fresnel-Shader) für Erde und Venus sowie eine additive Sonnen-Korona.
- Eigenrotationsachsen mit realer Achsneigung (z. B. „liegender" Uranus); Saturnring nutzt eine Ringtextur mit radial korrekter UV-Abbildung.
- Zeitsteuerung in der Toolbar (Pause, 1×, 10×, 100×) mit Simulationszeit-Akkumulator und Beachtung von `prefers-reduced-motion`.
- Verbesserter Sternenhimmel mit weichen, runden Sternen in zwei Helligkeits-/Farbebenen.
- SEO/Sharing: Open-Graph- und Twitter-Card-Tags, `theme-color`, ein SVG-Favicon sowie ein gerendertes Vorschaubild `og-image.jpg`.
- `public/textures/TEXTURE_CREDITS.md` mit Quelle, Lizenz und Autor je Textur.
- `CLAUDE.md` als Projektanker (Kontext, Start-/Test-Befehle, Test-Invarianten).

### Verbessert

- Beleuchtung mit niedrigerem Grundlicht und Sonnenlicht ohne Abstandsabfall, sodass eine klare Tag/Nacht-Grenze auf allen Planeten sichtbar ist.
- Orbit-Distanz wird beim Aufbau einmal zwischengespeichert statt pro Frame neu berechnet.
- Abhängigkeiten exakt gepinnt (`three` 0.184.0, `vite` 8.0.16); der Deploy-Workflow nutzt nun das reproduzierbare `npm ci` mit npm-Cache.
- `TASK-007`, `TASK-008` und `TASK-014` abgeschlossen; alle vier Validierungstests und der Produktions-Build erfolgreich ausgeführt, App im Browser mit allen Texturen fehlerfrei geladen.

## 0.6.0 – 2026-06-19

### Hinzugefügt

- Eigenständiges UI-Modul für Infopanel, Faktenliste, Besonderheiten und neun datengetriebene Auswahlbuttons.
- Sanfte, abbrechbare Kamerafahrt mit Ease-in-out-Interpolation und objektabhängigem Betrachtungsabstand.
- Schließen-Button und `Esc`-Bedienung für das Infopanel.
- Interaktionstest für alle Auswahlmodelle, Infodaten und die Kamerainterpolation.
- Gestalteter Hinweis beim direkten `file://`-Aufruf mit den korrekten lokalen Startbefehlen.

### Verbessert

- Öffentliches GitHub-Repository und automatische GitHub-Pages-Veröffentlichung eingerichtet.
- README und Versionsstand mit Repository- und Live-Demo-Links aktualisiert.
- Himmelskörper-Navigation bleibt auch bei geschlossenem Infopanel sichtbar und markiert die aktive Auswahl.
- Raycasting unterscheidet kurze Klicks von Drehgesten, damit beim Navigieren keine versehentlichen Auswahlen entstehen.
- Infopanel zeigt nun auch die Besonderheiten aus `facts_de` der zentralen JSON-Datei.
- CSS wird zusätzlich über `index.html` eingebunden, sodass selbst der direkte Dateiaufruf nicht mehr als ungestaltete Textseite erscheint.
- `TASK-006` abgeschlossen; Daten-, Skalierungs-, Rendering- und Interaktionstests sowie Produktions-Build erfolgreich ausgeführt.

## 0.5.0 – 2026-06-18

### Hinzugefügt

- Zentrale Maßstabslogik in `src/scaling.js` mit vier klar definierten Modi.
- Modusspezifische Kameravorgaben für eine passende Start- und Resetansicht.
- Automatisch erzeugte deutsche Modusauswahl und transparente Erklärungstexte.
- Skalierungstest für reale Radius- und Distanzverhältnisse sowie Vergleichslayout.

### Verbessert

- Größenmodus bildet Radien relativ korrekt ab und komprimiert nur die Distanzen.
- Entfernungsmodus erhält relative Sonnenabstände und kennzeichnet Planeten durch künstliche Markergrößen.
- Vergleichsmodus ordnet Sonne und Planeten berührungsfrei mit korrekten Radiusverhältnissen an.
- Cinematic/Hybrid kommuniziert ausdrücklich, dass Größen und Abstände visuell optimiert sind.
- Renderingtest prüft die Kamerafrusten aller vier Modi.
- `TASK-005` abgeschlossen; Daten-, Skalierungs- und Renderingtests sowie Produktions-Build erfolgreich ausgeführt.

## 0.4.0 – 2026-06-18

### Hinzugefügt

- Eigenständiges Renderingmodul `src/solarSystem.js` für Sonne, acht Planeten und Orbitlinien.
- Zwei getrennte, geneigte Ringbänder für einen eindeutig erkennbaren Saturn.
- Struktureller Renderingtest für alle Himmelskörper, Orbits, Materialien, Saturnringe und Startkamera.

### Verbessert

- Cinematic-Größen und -Abstände so korrigiert, dass innere Planeten nicht mehr von der Sonne verschluckt werden.
- Planeten mit festen Startphasen sichtbar auf ihren Umlaufbahnen verteilt.
- Orbitlinien auf eine dezente Deckkraft begrenzt und Planetenseiten leicht aufgehellt.
- Startkamera so erweitert, dass alle Körperzentren im Desktop-Frustum liegen.
- `TASK-004` abgeschlossen; Daten- und Renderingtests sowie Produktions-Build erfolgreich ausgeführt.

## 0.3.0 – 2026-06-18

### Hinzugefügt

- Zentraler Datenloader und Validator in `src/data.js`.
- Laufzeitprüfung für Sonne, acht Planeten, eindeutige IDs sowie positive Größen- und Entfernungswerte.
- Verständlicher deutschsprachiger Fehlerzustand im Infopanel bei Netzwerk-, JSON- oder Datenfehlern.
- Tests für GitHub-Pages-Basispfad und fehlerhafte Datenvarianten.

### Verbessert

- Browser-App und Node-Datentest verwenden dieselbe Validierungslogik.
- Fehlertexte werden über DOM-Textknoten statt unsicherem HTML ausgegeben.
- `TASK-003` abgeschlossen; Datentest und Produktions-Build erfolgreich ausgeführt.

## 0.2.0 – 2026-06-18

### Hinzugefügt

- Neue modulare Szenenbasis in `src/scene.js` für Scene, PerspectiveCamera, WebGLRenderer, Licht und OrbitControls.
- Responsives Resize-Handling mit `ResizeObserver` und Window-Resize-Fallback.
- Deutschsprachiger Hinweis für Geräte oder Browser ohne WebGL-2-Unterstützung.

### Verbessert

- Renderer-Pixelratio auf maximal 2 begrenzt und bei Größenänderungen aktualisiert.
- Canvas-Größe, Touch-Verhalten, Schwenken und Zurücksetzen der Kamera zentralisiert.
- `TASK-002` abgeschlossen; Datentest und Produktions-Build erfolgreich ausgeführt.

## 0.1.0 – 2026-06-18

### Geprüft und abgeschlossen

- `TASK-001` abgeschlossen und das vorhandene Vite-/Three.js-Grundgerüst strukturell geprüft.
- Reproduzierbare npm-Installation mit `package-lock.json` ergänzt.
- Datentest für Sonne und acht Planeten erfolgreich ausgeführt.
- Produktions-Build mit Vite erfolgreich erzeugt.
- Dynamische GitHub-Pages-Basis in `vite.config.js` und vorhandenen Deployment-Workflow geprüft.
- Dunkle Three.js-Startszene mit Sonne, Planeten, Orbitlinien und deutschsprachiger Oberfläche bestätigt.

### Hinweise

- Vite meldet für das Three.js-Hauptbundle lediglich eine nicht blockierende Größenwarnung; die Optimierung bleibt einer späteren Performance-Aufgabe vorbehalten.
- Das Projekt ist noch nicht als Git-Repository initialisiert oder zu GitHub übertragen.

## 0.0.0-startpack – 2026-06-18

### Hinzugefügt

- Codex-Startpaket erstellt.
- Projektvision, Aufgabenliste, Skill-Datei und Agent-Regeln ergänzt.
- Vite-/Three.js-Grundstruktur vorbereitet.
- GitHub-Pages-Workflow ergänzt.
- Datenmodell und erste Planetendaten ergänzt.
- Akzeptanztests und Deployment-Anleitung ergänzt.

### Ursprünglich offen

- Danach schrittweise 3D-Szene, Maßstabsmodi, Infopanel und Deployment finalisieren.
