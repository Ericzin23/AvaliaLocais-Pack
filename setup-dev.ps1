# Setup Dev para AvaliaLocais (Windows PowerShell)
# - Compila backend
# - Cria diretório de uploads na home
# - Instala deps do mobile e ajusta API_URL automaticamente

$ErrorActionPreference = 'Stop'

Write-Host "[1/5] Criando pasta de uploads..." -ForegroundColor Cyan
$uploadPath = Join-Path $HOME "AvaliaLocais/uploads"
New-Item -ItemType Directory -Force -Path $uploadPath | Out-Null
Write-Host "Uploads: $uploadPath" -ForegroundColor Gray

Write-Host "[2/5] Verificando Java e Maven..." -ForegroundColor Cyan
try {
  (java -version) 2>&1 | Out-Null
  (mvn -v) | Out-Null
  Write-Host "Java/Maven OK" -ForegroundColor Green
} catch {
  Write-Host "Instale Java 21 e Maven e rode novamente." -ForegroundColor Red
  exit 1
}

Write-Host "[3/5] Compilando backend..." -ForegroundColor Cyan
Push-Location "${PSScriptRoot}\backend"
& mvn clean compile
if ($LASTEXITCODE -ne 0) { Write-Host "Falha ao compilar backend" -ForegroundColor Red; Pop-Location; exit 1 }
Pop-Location

Write-Host "[4/5] Instalando deps do mobile..." -ForegroundColor Cyan
Push-Location "${PSScriptRoot}\mobile"
if (Test-Path package-lock.json) {
  npm ci
} else {
  npm install
}
Write-Host "[5/5] Ajustando API_URL (IP local)..." -ForegroundColor Cyan
node .\scripts\set-api-url.js
Pop-Location

Write-Host "\nPronto!" -ForegroundColor Green
Write-Host "- Inicie o backend: cd backend; mvn spring-boot:run" -ForegroundColor Yellow
Write-Host "- Inicie o app:    cd mobile; npm run start:dev" -ForegroundColor Yellow
