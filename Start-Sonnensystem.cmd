@echo off
setlocal

set "SOURCE=%~dp0"
set "RUNTIME=%USERPROFILE%\Documents\Software\solarsystem-local-runtime"
set "NODE=%RUNTIME%\node.exe"
set "VITE=%RUNTIME%\node_modules\vite\bin\vite.js"

title Simuliertes Sonnensystem
echo.
echo  Simuliertes Sonnensystem wird vorbereitet ...

if not exist "%NODE%" goto :missing
if not exist "%VITE%" goto :missing

robocopy "%SOURCE%" "%RUNTIME%" /E /XD node_modules dist .git /XF Start-Sonnensystem.cmd /NFL /NDL /NJH /NJS /NP >nul
if errorlevel 8 goto :syncerror

powershell.exe -NoProfile -Command "try { $null = Invoke-WebRequest -Uri 'http://127.0.0.1:5173' -UseBasicParsing -TimeoutSec 2; exit 0 } catch { exit 1 }" >nul 2>nul
if not errorlevel 1 (
  echo  Der Server laeuft bereits. Die App wird geoeffnet.
  start "" "http://127.0.0.1:5173"
  goto :end
)

echo  Die App startet unter http://127.0.0.1:5173
echo  Dieses Fenster offen lassen. Mit Strg+C wird der Server beendet.
echo.

start "" powershell.exe -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://127.0.0.1:5173'"
"%NODE%" "%VITE%" --host 127.0.0.1 --port 5173
goto :end

:missing
echo.
echo  Die lokale Laufzeit fehlt. Bitte Codex erneut um die Einrichtung bitten.
pause
goto :end

:syncerror
echo.
echo  Der Projektstand konnte nicht in die lokale Laufzeit kopiert werden.
pause

:end
endlocal
