# Projektspezifikation – Interaktive Homepage „Simuliertes Sonnensystem“

## 1. Projektname

**Simuliertes Sonnensystem**

Alternative spätere Titel:

- „Solar Scale Explorer“
- „Unser Sonnensystem – interaktiv“
- „Sonnensystem 3D“

## 2. Ziel

Eine moderne Web-App, die unser Sonnensystem visuell attraktiv und didaktisch korrekt erfahrbar macht. Nutzerinnen und Nutzer sollen Sonne und Planeten betrachten, die Ansicht drehen und zoomen, Informationen abrufen und zwischen verschiedenen Maßstabslogiken wechseln können.

Die Seite soll vollständig statisch sein und über GitHub Pages veröffentlicht werden.

## 3. Zielgruppe

- Schüler und Schülerinnen im Informatik-, Physik- oder allgemeinbildenden Unterricht.
- Technikinteressierte Besucher.
- Portfolio-/Showcase-Projekt für moderne Webentwicklung mit Three.js.
- Eigene Nutzung als Demonstrationsprojekt für Codex/Webentwicklung.

## 4. Kernfunktionen

### 4.1 3D-Szene

- Sonne im Zentrum.
- Acht Planeten.
- Orbitlinien.
- Dreh-/Zoom-/Pan-Funktion.
- Optional: Sternfeld und Glow.

### 4.2 Planetenauswahl

- Klick/Tap auf Planet.
- Button-Liste im UI.
- Kamera fokussiert das Objekt.
- Infopanel zeigt Daten.

### 4.3 Infopanel

Für jeden Himmelskörper:

- Name.
- Typ.
- Kurzbeschreibung.
- Radius/Durchmesser.
- mittlere Sonnenentfernung.
- Umlaufzeit.
- Rotationsdauer.
- Besonderheiten.

### 4.4 Maßstabsmodi

#### Cinematic Mode

Startmodus. Optisch schön und intuitiv. Nicht wissenschaftlich maßstabsgetreu. UI-Hinweis erforderlich.

#### Größenmaßstab

Planetenradien relativ zueinander korrekt. Entfernungen werden komprimiert, damit das System sichtbar bleibt.

#### Entfernungsmaßstab

Entfernungen werden relativ korrekt dargestellt. Planetengrößen werden künstlich sichtbar gehalten oder mit Markern ergänzt.

#### Vergleichsmodus

Planeten nebeneinander als Größenvergleich. Ideal für Unterricht und schnelle Erkenntnis.

## 5. Nicht-Ziele für MVP

Nicht im MVP erforderlich:

- Physikalisch exakte n-Körper-Simulation.
- Echtzeit-Ephemeriden.
- Exakte Bahnneigungen/Ellipsen.
- Vollständige Mondsysteme.
- Hochauflösende Texturen.
- Backend oder Datenbank.

## 6. Technische Architektur

### Stack

- Vite
- Three.js
- Plain JavaScript/ES Modules
- CSS
- GitHub Actions + GitHub Pages

### Prinzip

Die App bleibt bewusst als statische Website ohne Backend. Alle Daten werden lokal aus JSON geladen.

## 7. Qualitätsanforderungen

- Buildbar über `npm run build`.
- Bedienbar auf Desktop und Mobilgerät.
- Keine kritischen Konsolenfehler.
- Verständliche deutschsprachige UI.
- Maßstabsmodi didaktisch korrekt erklärt.
- Saubere Quellen-/Datenhinweise.
- GitHub-Pages-kompatible Pfade.

## 8. Erweiterungsideen

- Mond und große Monde.
- Asteroidengürtel.
- Kuipergürtel und Zwergplaneten.
- Missionsmarker: Voyager, Cassini, New Horizons.
- Quiz-/Lernmodus.
- „Reisegeschwindigkeit“-Simulation: Wie lange bräuchte Licht, ein Flugzeug oder eine Raumsonde?
- Export einer aktuellen Ansicht als Screenshot.
