# Script para iniciar Backend e Mobile juntos
# Avalia Locais - Startup Script

Write-Host "==================================" -ForegroundColor Green
Write-Host "  AVALIA LOCAIS - STARTUP" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""

# Definir JAVA_HOME
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'

# Ir para diretório do backend
Set-Location -Path "$PSScriptRoot\backend"

Write-Host "[1/2] Iniciando Backend (Spring Boot)..." -ForegroundColor Cyan
Write-Host "       Porta: 8080" -ForegroundColor Gray
Write-Host ""

# Iniciar backend em background
$backendJob = Start-Job -ScriptBlock {
    param($backendPath)
    Set-Location $backendPath
    $env:JAVA_HOME = 'C:\Program Files\Java\jdk-21'
    mvn compile exec:java -Dexec.mainClass="com.eric.avalia.AvaliaLocaisApplication"
} -ArgumentList (Get-Location).Path

# Aguardar alguns segundos para o backend iniciar
Write-Host "       Aguardando backend inicializar..." -ForegroundColor Gray
Start-Sleep -Seconds 15

# Ir para diretório mobile
Set-Location -Path "$PSScriptRoot\mobile"

Write-Host "[2/2] Iniciando Expo (React Native)..." -ForegroundColor Cyan
Write-Host "       Expo DevTools abrirá no navegador" -ForegroundColor Gray
Write-Host ""

# Iniciar Expo em foreground (para ver QR code)
npm start

# Quando usuário encerrar Expo (Ctrl+C), parar backend também
Write-Host ""
Write-Host "Encerrando backend..." -ForegroundColor Yellow
Stop-Job -Job $backendJob
Remove-Job -Job $backendJob

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "  Aplicação encerrada!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
