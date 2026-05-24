@echo off
cd /d "%~dp0"

if not exist "node_modules" (
  echo Installing dependencies...
  call npm.cmd install --cache .npm-cache
  if errorlevel 1 exit /b %errorlevel%
)

call npm.cmd run dev
