@echo off
title The Royal Bakery POS System Launcher
cd /d "%~dp0"

echo =====================================================================
echo    THE ROYAL BAKERY (EST. 1906) - PRE-ORDER ^& PRODUCTION POS
echo =====================================================================
echo.
echo [1/3] Starting Standalone Backend Binary...
cd /d "%~dp0backend"
start "TRB POS Backend Server" trb-pos-backend.exe
cd /d "%~dp0"

echo [2/3] Waiting for backend and database connection...
timeout /t 4 /nobreak >nul

echo [3/3] Opening POS Web Portal in default browser...
start http://localhost:5000

echo.
echo =====================================================================
echo  System is running at: http://localhost:5000
echo.
echo  * To change Database Settings: Open 'backend/.env' in Notepad
echo  * For Multi-Device LAN Access: Open 'dist/connection.txt' in Notepad
echo  * Check README.txt for complete guide.
echo =====================================================================
echo.
pause
