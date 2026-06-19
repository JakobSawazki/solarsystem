# Deployment über GitHub Pages

## Ziel

Die App soll als statische Website über GitHub Pages veröffentlicht werden.

## Voraussetzungen

- Repository liegt auf GitHub.
- Branch `main` wird verwendet.
- GitHub Pages ist auf `GitHub Actions` gestellt.

## GitHub-Einstellung

In GitHub:

1. Repository öffnen.
2. `Settings` öffnen.
3. Links `Pages` auswählen.
4. Bei `Build and deployment` als `Source` die Option `GitHub Actions` wählen.
5. Änderungen auf `main` pushen.
6. Workflow unter `Actions` prüfen.

## Workflow

Die Datei `.github/workflows/deploy.yml` baut die Vite-App und lädt den Ordner `dist` als GitHub-Pages-Artefakt hoch.

## Vite-Basis-Pfad

GitHub Pages veröffentlicht Projektseiten üblicherweise unter:

`https://BENUTZERNAME.github.io/REPOSITORY_NAME/`

Deshalb muss Vite den Repository-Namen als Basis berücksichtigen. In `vite.config.js` ist eine dynamische Logik vorgesehen:

```js
base: process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
  : '/'
```

Für eine Benutzerseite wie `BENUTZERNAME.github.io` kann diese Logik später angepasst werden.

## Lokaler Test

```bash
npm install
npm run build
npm run preview
```

## Fehlerquellen

- Pages-Quelle nicht auf GitHub Actions gestellt.
- Falscher `base`-Pfad.
- Assets mit absolutem `/asset.png` statt `import.meta.env.BASE_URL` oder relativen Pfaden.
- Groß-/Kleinschreibung in Dateinamen.
- Nicht committedes `dist` ist normal; `dist` wird im Workflow erzeugt.
