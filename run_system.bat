@echo off
title The Royal Bakery Pre-Order System Launcher
color 0E

echo ========================================================
echo   THE ROYAL BAKERY (TRB) - PRE-ORDER POS SYSTEM
echo ========================================================
echo.
echo Starting Backend API Server (Port 5000)...
start "TRB Backend Server (Port 5000)" cmd /k "cd /d "%~dp0backend" && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend POS App (Port 3000)...
start "TRB Frontend POS (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 2 /nobreak >nul

echo Opening browser at http://localhost:3000...
start http://localhost:3000

echo.
echo ========================================================
echo System launched successfully!
echo Do not close the Backend and Frontend command windows.
echo ========================================================
