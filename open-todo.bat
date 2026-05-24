@echo off
cd /d "%~dp0"

if not exist "node_modules" (
  echo Installing dependencies...
  call npm.cmd install --cache .npm-cache
  if errorlevel 1 exit /b %errorlevel%
)

if not exist "dist\index.html" (
  call npm.cmd run build
  if errorlevel 1 exit /b %errorlevel%
)

start "" "%~dp0dist\index.html"
