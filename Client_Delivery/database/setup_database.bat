@echo off
title The Royal Bakery - Database Setup
cd /d "%~dp0"

echo =====================================================================
echo  THE ROYAL BAKERY POS - MSSQL DATABASE SETUP SCRIPT
echo =====================================================================
echo.
echo This script will execute TRB_PreOrder_Database_Schema.sql
echo against your local Microsoft SQL Server instance (localhost / SQLEXPRESS).
echo.
set /p SQL_SERVER="Enter SQL Server instance name (Press ENTER for default '.' or SQLEXPRESS): "
if "%SQL_SERVER%"=="" set SQL_SERVER=.

echo.
echo Executing schema creation on %SQL_SERVER% ...
sqlcmd -S %SQL_SERVER% -E -i TRB_PreOrder_Database_Schema.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo =====================================================================
    echo  SUCCESS: Database [TRB_PreOrder_DB] has been set up successfully!
    echo =====================================================================
) else (
    echo.
    echo =====================================================================
    echo  NOTE: If sqlcmd failed, please open SQL Server Management Studio
    echo  (SSMS), open TRB_PreOrder_Database_Schema.sql, and click Execute.
    echo =====================================================================
)

echo.
pause
