@echo off
title The Royal Bakery - Database Connection Diagnostic Tool
cd /d "%~dp0"

echo =====================================================================
echo  THE ROYAL BAKERY POS - DATABASE CONNECTION DIAGNOSTIC TOOL
echo =====================================================================
echo.
echo Running diagnostic test against '.env' configuration...
echo.

if exist "trb-pos-backend.exe" (
    trb-pos-backend.exe --test-db
) else (
    echo [*] Could not locate trb-pos-backend.exe.
)

echo.
pause
