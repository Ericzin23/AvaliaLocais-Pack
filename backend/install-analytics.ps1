# ========================================
# Script de Instalação do Sistema Analítico
# AvaliaLocais - Analytics Database Setup
# ========================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AvaliaLocais - Analytics Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configurações do banco de dados
$DB_HOST = "localhost"
$DB_PORT = "3306"
$DB_NAME = "banco_avaliacoes_final"
$DB_USER = "root"

# Solicitar senha
$DB_PASSWORD = Read-Host "Digite a senha do MySQL (root)" -AsSecureString
$DB_PASSWORD_TEXT = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD)
)

Write-Host ""
Write-Host "Verificando MySQL..." -ForegroundColor Yellow

# Testar conexão
$testConnection = & mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD_TEXT -e "SELECT 1;" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao conectar ao MySQL!" -ForegroundColor Red
    Write-Host "Verifique se o MySQL está rodando e as credenciais estão corretas." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Conexão com MySQL estabelecida!" -ForegroundColor Green
Write-Host ""

# Passo 1: Instalar schema analítico
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PASSO 1: Instalando Schema Analítico" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$schemaFile = "backend\src\main\resources\schema-analytics.sql"

if (-Not (Test-Path $schemaFile)) {
    Write-Host "❌ Arquivo não encontrado: $schemaFile" -ForegroundColor Red
    exit 1
}

Write-Host "Executando schema-analytics.sql..." -ForegroundColor Yellow

& mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD_TEXT $DB_NAME < $schemaFile 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Schema analítico instalado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao instalar schema analítico!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Passo 2: Inicializar dados
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PASSO 2: Inicializando Dados" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$initFile = "backend\src\main\resources\init-analytics.sql"

if (-Not (Test-Path $initFile)) {
    Write-Host "❌ Arquivo não encontrado: $initFile" -ForegroundColor Red
    exit 1
}

Write-Host "Executando init-analytics.sql..." -ForegroundColor Yellow
Write-Host "Isso pode demorar alguns minutos..." -ForegroundColor Yellow

& mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD_TEXT $DB_NAME < $initFile 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dados inicializados com sucesso!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Aviso: Alguns erros podem ter ocorrido na inicialização" -ForegroundColor Yellow
}

Write-Host ""

# Passo 3: Verificar instalação
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PASSO 3: Verificando Instalação" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "Verificando tabelas criadas..." -ForegroundColor Yellow

$query = @"
SELECT 
    'usuario_stats' AS tabela,
    COUNT(*) AS registros
FROM usuario_stats
UNION ALL
SELECT 
    'local_stats',
    COUNT(*)
FROM local_stats
UNION ALL
SELECT 
    'categoria_stats',
    COUNT(*)
FROM categoria_stats
UNION ALL
SELECT 
    'categoria_top_locais',
    COUNT(*)
FROM categoria_top_locais;
"@

$result = & mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD_TEXT $DB_NAME -e $query 2>&1

Write-Host ""
Write-Host $result
Write-Host ""

# Estatísticas gerais
Write-Host "Estatísticas Gerais do Sistema:" -ForegroundColor Yellow

$statsQuery = "SELECT * FROM v_stats_gerais;"
$stats = & mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD_TEXT $DB_NAME -e $statsQuery 2>&1

Write-Host ""
Write-Host $stats
Write-Host ""

# Conclusão
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ INSTALAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Leia o arquivo backend\GUIA-ANALYTICS.md" -ForegroundColor White
Write-Host "2. Teste as consultas de exemplo" -ForegroundColor White
Write-Host "3. Os triggers estão ativos - dados serão atualizados automaticamente" -ForegroundColor White
Write-Host ""
Write-Host "Exemplos de consultas:" -ForegroundColor Yellow
Write-Host "  - Total de usuários: SELECT COUNT(*) FROM usuario;" -ForegroundColor White
Write-Host "  - Top 10 locais: SELECT * FROM v_top_100_locais LIMIT 10;" -ForegroundColor White
Write-Host "  - Stats de um usuário: CALL sp_get_usuario_stats_by_email('seu@email.com');" -ForegroundColor White
Write-Host ""
Write-Host "Consulte o GUIA-ANALYTICS.md para mais exemplos! 📊" -ForegroundColor Cyan
Write-Host ""

# Limpar senha da memória
$DB_PASSWORD_TEXT = $null
