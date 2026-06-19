# Datenmodell – `public/data/solar-system.json`

## Grundstruktur

```json
{
  "meta": {},
  "sun": {},
  "planets": []
}
```

## Objektfelder

Für Sonne und Planeten möglichst einheitlich verwenden:

| Feld | Typ | Bedeutung |
|---|---:|---|
| `id` | string | stabile technische ID, z. B. `earth` |
| `name_de` | string | deutscher Anzeigename |
| `name_en` | string | englischer Name für Quellen/Debug |
| `type_de` | string | Typ, z. B. `Gesteinsplanet` |
| `radius_km` | number | mittlerer Radius in km |
| `diameter_km` | number | Durchmesser in km |
| `mean_distance_million_km` | number/null | mittlere Entfernung zur Sonne in Mio. km |
| `semi_major_axis_au` | number/null | große Halbachse in AE |
| `orbital_period_days` | number/null | Umlaufzeit in Tagen |
| `rotation_period_hours` | number/null | Rotationsperiode in Stunden, negativ bei retrograder Rotation |
| `axial_tilt_deg` | number/null | Achsneigung |
| `color` | string | Fallback-Farbe für Material |
| `short_description_de` | string | kurzer Infotext |
| `facts_de` | string[] | kurze Faktenliste |

## Hinweise zu Genauigkeit

- MVP nutzt vereinfachte Kreisbahnen auf Basis mittlerer Sonnenentfernung.
- Exakte elliptische Bahnen, Bahnneigungen und aktuelle Positionen sind Erweiterungen.
- Werte sollten in `docs/SOURCES.md` nachvollziehbar dokumentiert werden.

## Skalierungslogik

Die Skalierung ist in `src/scaling.js` zentralisiert. Datenwerte bleiben unverändert; das Modul berechnet daraus nur Szenenradien, Orbitabstände, Vergleichspositionen und Kameravorgaben.

Die vier Modi arbeiten bewusst unterschiedlich:

- **Cinematic/Hybrid:** Größen und Distanzen sind visuell optimiert und ausdrücklich nicht maßstabsgetreu.
- **Größenmaßstab:** Radien stehen im realen Verhältnis; Orbitabstände sind stark komprimiert.
- **Entfernungsmaßstab:** Sonnenabstände stehen im realen Verhältnis; sichtbare Markergrößen ersetzen reale Planetengrößen.
- **Vergleichsmodus:** Sonne und Planeten stehen mit realen Radiusverhältnissen berührungsfrei in einer Reihe; Orbitabstände entfallen.

`scripts/validate-scaling.mjs` prüft die Modusdefinitionen, Radius- und Distanzverhältnisse sowie das überlappungsfreie Vergleichslayout.

## Wichtig

Die Datenquelle darf nicht im Renderingcode dupliziert werden. Renderer und UI lesen dieselben Daten.

## Laden und Validierung

`src/data.js` lädt die Datei unter Berücksichtigung von `import.meta.env.BASE_URL` und prüft vor dem Rendering mindestens:

- eine Sonne mit der technischen ID `sun`,
- genau acht Planeten,
- eindeutige, nicht leere IDs und deutsche Namen,
- positive numerische Radien und Durchmesser,
- positive numerische Sonnenentfernungen für alle Planeten.

`scripts/validate-data.mjs` verwendet dieselbe Validierungsfunktion wie die Browser-App, damit Build-Test und Laufzeitprüfung nicht auseinanderlaufen.
