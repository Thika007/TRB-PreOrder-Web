@echo off
setlocal enabledelayedexpansion
title The Royal Bakery - Database Setup
cd /d "%~dp0"

echo =====================================================================
echo  THE ROYAL BAKERY POS - MSSQL DATABASE SETUP SCRIPT
echo =====================================================================
echo.
echo This script will execute TRB_PreOrder_Database_Schema.sql
echo against your Microsoft SQL Server instance (localhost / SQLEXPRESS).
echo.

set "SQL_SERVER=."
set /p SQL_SERVER="Enter SQL Server instance name (Press ENTER for default '.' or SQLEXPRESS): "
if "%SQL_SERVER%"=="" set "SQL_SERVER=."

:AUTH_MENU
echo.
echo ---------------------------------------------------------------------
echo Choose Authentication Mode:
echo   [1] Windows Authentication (Trusted Connection - No password)
echo   [2] SQL Server Authentication (Enter Username and Password e.g. sa)
echo   [3] Auto-read credentials from 'backend/.env'
echo ---------------------------------------------------------------------
set "AUTH_CHOICE=1"
set /p AUTH_CHOICE="Select option (1, 2, or 3) [Default: 1]: "

if "%AUTH_CHOICE%"=="1" goto RUN_WINDOWS_AUTH
if "%AUTH_CHOICE%"=="2" goto RUN_SQL_AUTH
if "%AUTH_CHOICE%"=="3" goto RUN_ENV_AUTH

echo Invalid choice. Defaulting to Windows Authentication.
goto RUN_WINDOWS_AUTH

:RUN_WINDOWS_AUTH
echo.
echo [Executing] Connecting with Windows Authentication on %SQL_SERVER% ...
sqlcmd -S %SQL_SERVER% -E -i TRB_PreOrder_Database_Schema.sql
if %ERRORLEVEL% EQU 0 goto SUCCESS

echo.
echo [*] Windows Authentication failed on '%SQL_SERVER%'.
echo     (Error code: %ERRORLEVEL%)
echo.
set "RETRY_SQL=Y"
set /p RETRY_SQL="Would you like to try with SQL Server Username & Password? (Y/N) [Y]: "
if "%RETRY_SQL%"=="" set "RETRY_SQL=Y"
if /i "%RETRY_SQL%"=="Y" goto RUN_SQL_AUTH
goto FAILED

:RUN_SQL_AUTH
echo.
set "SQL_USER=sa"
set /p SQL_USER="Enter SQL Server Username [Default: sa]: "
if "%SQL_USER%"=="" set "SQL_USER=sa"

set "SQL_PASS="
set /p SQL_PASS="Enter SQL Server Password for '%SQL_USER%': "

echo.
echo [Executing] Connecting as '%SQL_USER%' on %SQL_SERVER% ...
if "%SQL_PASS%"=="" (
    sqlcmd -S %SQL_SERVER% -U %SQL_USER% -P "" -i TRB_PreOrder_Database_Schema.sql
) else (
    sqlcmd -S %SQL_SERVER% -U %SQL_USER% -P "%SQL_PASS%" -i TRB_PreOrder_Database_Schema.sql
)
if %ERRORLEVEL% EQU 0 goto SUCCESS
goto FAILED

:RUN_ENV_AUTH
echo.
echo Reading configuration from '..\backend\.env' ...
set "ENV_FILE=..\backend\.env"
if not exist "%ENV_FILE%" set "ENV_FILE=backend\.env"
if not exist "%ENV_FILE%" (
    echo [*] Could not locate .env file. Switching to manual SQL Authentication.
    goto RUN_SQL_AUTH
)

set "ENV_USER=sa"
set "ENV_PASS=sqladmin"

for /f "usebackq tokens=1,* delims==" %%A in ("%ENV_FILE%") do (
    set "KEY=%%A"
    set "VAL=%%B"
    if /i "!KEY!"=="DB_USER" set "ENV_USER=!VAL!"
    if /i "!KEY!"=="DB_PASSWORD" set "ENV_PASS=!VAL!"
)

echo Found DB_USER=!ENV_USER! in .env
echo [Executing] Connecting to %SQL_SERVER% using credentials from .env ...
sqlcmd -S %SQL_SERVER% -U !ENV_USER! -P "!ENV_PASS!" -i TRB_PreOrder_Database_Schema.sql
if %ERRORLEVEL% EQU 0 goto SUCCESS
goto FAILED

:SUCCESS
echo.
echo =====================================================================
echo  SUCCESS: Database [TRB_PreOrder_DB] has been set up successfully!
echo =====================================================================
echo  All tables, views, initial store settings, and default staff
echo  profiles have been created.
echo.
goto END

:FAILED
echo.
echo =====================================================================
echo  SETUP FAILED or CANCELLED:
echo  1. Verify your SQL Server service is running.
echo  2. Verify your instance name (e.g. ., localhost, .\SQLEXPRESS).
echo  3. Verify username and password (e.g. 'sa' and your SQL password).
echo.
echo  ALTERNATIVE MANUAL SETUP:
echo  Open SQL Server Management Studio (SSMS), connect with your login,
echo  open 'TRB_PreOrder_Database_Schema.sql', and click Execute (F5).
echo =====================================================================
echo.

:END
pause
