@echo off
title AlumSphere Launcher
color 0A

echo.
echo  =============================================
echo   AlumSphere - Starting Application...
echo  =============================================
echo.

cd /d "%~dp0"
echo.
echo =============================================
echo   AlumSphere - Starting AlumSphere...
echo =============================================
echo.

npx --yes concurrently --kill-others --names "BACKEND,FRONTEND" --prefix-colors "cyan,magenta" "npm run dev" "npm --prefix ..\frontend run dev"

if errorlevel 1 (
  echo.
  echo One or more processes exited with an error.
  pause
)
