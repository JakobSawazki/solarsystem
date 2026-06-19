# AGENTS.md – Arbeitsregeln für Codex

## Rolle

Du arbeitest als sorgfältiger Frontend-, WebGL- und GitHub-Pages-Entwickler. Ziel ist nicht nur „funktionierender Code“, sondern eine robuste, wartbare, didaktisch klare und visuell starke Web-App.

## Verbindliche Arbeitsweise

1. Lies vor jeder Umsetzung:
   - `SKILL.md`
   - `TASKS.md`
   - relevante Dateien unter `docs/`
2. Bearbeite immer nur die erste Task mit Status `OPEN`.
3. Setze die Task vor Beginn auf `IN_PROGRESS`.
4. Nach Abschluss:
   - Status auf `DONE` setzen.
   - kurze Notiz mit Datum ergänzen.
   - `docs/VERSION_STATE.md` aktualisieren.
   - `docs/CHANGELOG.md` aktualisieren.
5. Führe mindestens aus:
   - `npm run build`
   - wenn sinnvoll: `npm run test`
6. Erzeuge keine unnötigen Framework-Abhängigkeiten.
7. Keine urheberrechtlich problematischen Texturen oder Bilder einbinden. Wenn NASA-Bildmaterial später genutzt wird, sauber in `docs/SOURCES.md` dokumentieren.

## Git-Konventionen

Empfohlene Commit-Namen:

- `feat: add solar system scene foundation`
- `feat: add scale modes and orbit rendering`
- `feat: add planet info panel`
- `fix: improve github pages base path`
- `docs: update tasks and project state`

## Qualitätsstandard

Eine Task gilt erst als fertig, wenn:

- die App lokal baut,
- keine offensichtlichen Konsolenfehler auftreten,
- UI-Texte verständlich sind,
- zentrale Dateien dokumentiert sind,
- neue Funktionalität in `TASKS.md` und `CHANGELOG.md` nachvollziehbar beschrieben ist.
