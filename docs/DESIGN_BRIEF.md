# Design Brief – Simuliertes Sonnensystem

## Stilrichtung

Modern, wissenschaftlich, dunkel, hochwertig. Die Seite soll wie ein seriöses interaktives NASA-/Planetarium-inspiriertes Web-Experiment wirken, ohne fremde Marken zu imitieren.

## Farbwelt

- Hintergrund: sehr dunkles Blau/Schwarz.
- Akzent: Cyan/Blau/Violett.
- UI-Flächen: halbtransparent, Glasoptik.
- Text: hell, hoher Kontrast.
- Warn-/Hinweistexte: dezent, nicht alarmistisch.

## UI-Bereiche

### Header

- Titel der App.
- Kurzer Untertitel: „Interaktive 3D-Ansicht mit Größen- und Entfernungsvergleich“.

### Linke/obere Toolbar

- Maßstabsmodus.
- Zeitsteuerung.
- Reset-Button.
- ggf. Vollbild-Button.

### Rechte/untere Infokarte

- Name des ausgewählten Objekts.
- Kennzahlen.
- Kurztext.
- Quellenhinweis optional.

### Objektliste

Buttons für:

- Sonne
- Merkur
- Venus
- Erde
- Mars
- Jupiter
- Saturn
- Uranus
- Neptun

## Motion Design

- Sanfte Kameraübergänge.
- Langsame Rotation der Himmelskörper.
- Orbitbewegung skalierbar.
- Kein hektisches Blinken.
- Keine übertriebene Animation, die Lerninhalt verdeckt.

## Typografie

Systemfont reicht aus. Priorität: Lesbarkeit, nicht dekorative Schrift.

Beispiel:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

## Didaktische Hinweise im UI

Jeder Maßstabsmodus soll einen kurzen Hinweis anzeigen, z. B.:

- „Cinematic: Größen und Abstände sind visuell optimiert.“
- „Größenmaßstab: Planetengrößen sind relativ korrekt, Entfernungen komprimiert.“
- „Entfernungsmaßstab: Abstände sind relativ korrekt, Planetengrößen zur Sichtbarkeit vergrößert.“
