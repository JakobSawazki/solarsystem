# Codex-Workflow für dieses Projekt

## Empfohlene Nutzung

1. ZIP entpacken.
2. Ordner in Google Drive Desktop oder lokalen Codex-Projektordner kopieren.
3. Git-Repository initialisieren oder bestehenden GitHub-Repo-Ordner verwenden.
4. Codex mit `CODEX_PROMPT_SHORT.md` starten.
5. Codex immer nur die nächste offene Task bearbeiten lassen.

## Kurzer Codex-Prompt

Siehe `CODEX_PROMPT_SHORT.md`.

## Nach jeder Codex-Runde prüfen

```bash
npm install
npm run build
```

Dann im Browser kurz testen:

```bash
npm run dev
```

## GitHub-Veröffentlichung

Nach erfolgreichem Build:

```bash
git add .
git commit -m "feat: add solar system foundation"
git push origin main
```

Danach GitHub Pages auf `GitHub Actions` stellen, falls noch nicht geschehen.

## Wenn Codex abbricht

Dann erneut starten mit:

```text
Lies TASKS.md und mache mit der ersten Task weiter, die IN_PROGRESS oder OPEN ist. Prüfe vorher den aktuellen Codezustand und führe am Ende npm run build aus.
```
