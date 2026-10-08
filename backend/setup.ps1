$ErrorActionPreference = "Stop"

Write-Host "=== JG University Placement Portal setup ===" -ForegroundColor Cyan

if (!(Test-Path ".venv")) {
    py -m venv .venv
}
& ".\.venv\Scripts\python.exe" -m pip install --upgrade pip
& ".\.venv\Scripts\pip.exe" install -r requirements.txt

Write-Host "Creating MySQL database/tables and demo data..." -ForegroundColor Yellow
& ".\.venv\Scripts\python.exe" manage.py init_portal_db

Write-Host ""
Write-Host "Backend setup complete." -ForegroundColor Green
Write-Host "Start API with: .\.venv\Scripts\python.exe manage.py runserver 8000"
