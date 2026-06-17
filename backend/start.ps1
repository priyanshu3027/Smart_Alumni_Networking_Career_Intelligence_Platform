# AlumSphere - Clean Start Script
# Kills stale processes on ports 5000 & 5173, then starts backend + frontend

Write-Host ""
Write-Host "=== AlumSphere Startup ===" -ForegroundColor Cyan
Write-Host ""

# --- Kill stale processes on port 5000 (backend) ---
Write-Host "Freeing port 5000..." -ForegroundColor Yellow
$proc5000 = netstat -ano | Select-String ":5000 " | ForEach-Object {
    ($_ -split '\s+')[-1]
} | Sort-Object -Unique | Where-Object { $_ -match '^\d+$' -and $_ -ne '0' }

foreach ($procId in $proc5000) {
    Write-Host "  Killing PID $procId on port 5000" -ForegroundColor DarkYellow
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
}

# --- Kill stale processes on port 5173 (frontend) ---
Write-Host "Freeing port 5173..." -ForegroundColor Yellow
$proc5173 = netstat -ano | Select-String ":5173 " | ForEach-Object {
    ($_ -split '\s+')[-1]
} | Sort-Object -Unique | Where-Object { $_ -match '^\d+$' -and $_ -ne '0' }

foreach ($procId in $proc5173) {
    Write-Host "  Killing PID $procId on port 5173" -ForegroundColor DarkYellow
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 1
Write-Host ""

# --- Start Backend ---
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path $scriptDir -Parent
$frontendDir = Join-Path $rootDir 'frontend'

Write-Host "Starting Backend (port 5000)..." -ForegroundColor Green
$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; npm run dev" -PassThru
Write-Host "  Backend PID: $($backend.Id)" -ForegroundColor DarkGreen

# Wait for backend to initialize
Start-Sleep -Seconds 3

# --- Start Frontend ---
Write-Host "Starting Frontend (port 5173)..." -ForegroundColor Green
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev" -PassThru
Write-Host "  Frontend PID: $($frontend.Id)" -ForegroundColor DarkGreen

# Wait for frontend to be ready
Start-Sleep -Seconds 4

# --- Open Browser ---
Write-Host ""
Write-Host "Opening AlumSphere in browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "=== AlumSphere is Running ===" -ForegroundColor Cyan
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor White
Write-Host "  Backend  : http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "Close the backend/frontend terminal windows to stop." -ForegroundColor DarkGray
