# VERSION_STATE.md

## Aktueller Stand

**Version:** 0.6.0  
**Datum:** 2026-06-19  
**Status:** `TASK-006` abgeschlossen; alle Himmelskörper sind direkt oder in der 3D-Szene auswählbar, das Datenpanel ist schließbar und die Kamera fokussiert sanft.

## Nächster Schritt

Codex soll als Nächstes `TASK-007` bearbeiten:

> Animation: Umlauf, Rotation und Zeitsteuerung.

## Technischer Zustand

- Abhängigkeiten sind in `package-lock.json` reproduzierbar festgehalten.
- `npm run test` validiert Sonne und acht Planeten erfolgreich.
- `npm run build` erzeugt erfolgreich das statische Produktionspaket unter `dist/`.
- `src/scene.js` kapselt Szene, Perspektivkamera, Renderer, Licht und OrbitControls.
- `ResizeObserver` passt Renderer und Kamera an die tatsächliche Containergröße an.
- Die Renderer-Pixelratio ist zur Performance-Sicherung auf maximal 2 begrenzt.
- Geräte ohne WebGL 2 erhalten einen deutschsprachigen, barrierearmen Hinweis.
- `src/data.js` lädt die JSON-Datei über `import.meta.env.BASE_URL` und validiert sie vor dem Rendering.
- Browser-App und Node-Test verwenden dieselbe zentrale Validierungsfunktion.
- Sonne, exakt acht Planeten sowie numerische Radius-, Durchmesser- und Entfernungswerte werden geprüft.
- Daten- und Ladefehler erscheinen sicher als deutscher Hinweis im Infopanel.
- `src/solarSystem.js` kapselt datengetrieben Himmelskörper, Orbitlinien, Materialien und Saturnringe.
- Der Cinematic-Startmodus nutzt sichtbare, komprimierte Abstände ohne übergroße Sonne.
- Planeten starten verteilt auf ihren Bahnen statt übereinander auf einer Linie.
- Alle Körperzentren liegen in der geprüften Desktop-Startansicht.
- `npm run test` umfasst neben Daten- nun auch Renderingstruktur und Kamerafrustum.
- Die Startseite enthält eine dunkle Three.js-Weltraumszene mit Sonne, Planeten und Orbitlinien.
- `src/scaling.js` verwaltet vier Modi, Erklärtexte, Radien, Distanzen, Vergleichslayout und Kameravorgaben zentral.
- Größen- und Vergleichsmodus erhalten die realen Radiusverhältnisse.
- Der Entfernungsmodus erhält die realen Verhältnisse der Sonnenabstände und nutzt sichtbare Markergrößen.
- Cinematic/Hybrid weist ausdrücklich auf die visuelle Optimierung ohne Maßstabstreue hin.
- Der Vergleichsmodus ordnet Sonne und Planeten berührungsfrei in einer Reihe an.
- `npm run test` prüft zusätzlich Modusbeschriftung und Skalierungsverhältnisse.
- `src/ui.js` erzeugt das Infopanel und alle neun Auswahlbuttons vollständig aus den zentralen JSON-Daten.
- Das Infopanel zeigt Beschreibung, Basiswerte und Besonderheiten und lässt sich über Schließen-Button oder `Esc` ausblenden.
- Planetenklicks werden per Raycasting ausgewertet; Ziehgesten lösen keine versehentliche Auswahl aus.
- `src/cameraFocus.js` interpoliert Position und Kameraziel über eine ruhige Ease-in-out-Fahrt und lässt sich durch direkte Bedienung abbrechen.
- Eine dauerhaft sichtbare Objektnavigation bleibt auch bei geschlossenem Infopanel erreichbar.
- Beim direkten Öffnen von `index.html` erklärt eine gestaltete Hinweisseite den erforderlichen Vite-Start statt eine scheinbar defekte Rohansicht zu zeigen.
- `npm run test` umfasst zusätzlich Auswahlmodelle, Infodaten aller neun Himmelskörper und die Kamerainterpolation.
- `vite.config.js` setzt lokal `/` und in GitHub Actions dynamisch `/<Repositoryname>/` als Basis.
- Der vorhandene GitHub-Pages-Workflow baut und veröffentlicht das `dist`-Verzeichnis, sobald das Projekt zu GitHub übertragen wird.

## Offene Risiken

- Das JavaScript-Hauptbundle überschreitet derzeit Vites Warnschwelle von 500 kB; Performance-Optimierung bleibt eine spätere Aufgabe.
- Der Projektordner ist noch kein Git-Repository und deshalb noch nicht mit GitHub oder GitHub Pages verbunden.
- Planetendaten sind für MVP ausreichend, sollten bei späterer wissenschaftlicher Vertiefung nochmals gegen Primärquellen geprüft werden.
- Vollständig maßstabsgetreue Größen + Entfernungen gleichzeitig sind didaktisch nur über spezielle Modi sinnvoll.
- Die interaktive 3D-App benötigt wegen ES-Modulen und Daten-Fetch einen HTTP-Server; der direkte `file://`-Aufruf zeigt deshalb bewusst nur eine Startanleitung.
