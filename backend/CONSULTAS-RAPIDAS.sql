-- ========================================
-- CONSULTAS PRONTAS PARA COPIAR E COLAR
-- AvaliaLocais - Analytics Quick Reference
-- ========================================

-- ==========================================
-- SEÇÃO 1: INFORMAÇÕES BÁSICAS DO SISTEMA
-- ==========================================

-- 1.1 Quantos usuários tem no total?
SELECT COUNT(*) AS total_usuarios FROM usuario;

-- 1.2 Quantos locais cadastrados?
SELECT COUNT(*) AS total_locais FROM local;

-- 1.3 Quantas avaliações já foram feitas?
SELECT COUNT(*) AS total_avaliacoes FROM avaliacao;

-- 1.4 Estatísticas gerais completas
SELECT * FROM v_stats_gerais;


-- ==========================================
-- SEÇÃO 2: INFORMAÇÕES POR USUÁRIO
-- ==========================================

-- 2.1 Ver TUDO sobre um usuário pelo email
CALL sp_get_usuario_stats_by_email('eric@example.com');

-- 2.2 Perfil completo do usuário
SELECT * FROM v_usuario_perfil_completo 
WHERE email = 'eric@example.com';

-- 2.3 Quantas avaliações um usuário fez?
SELECT total_avaliacoes 
FROM v_usuario_perfil_completo 
WHERE email = 'eric@example.com';

-- 2.4 Qual a nota média das avaliações de um usuário?
SELECT nota_media 
FROM v_usuario_perfil_completo 
WHERE email = 'eric@example.com';

-- 2.5 Quantos locais diferentes um usuário já avaliou?
SELECT locais_unicos_avaliados 
FROM v_usuario_perfil_completo 
WHERE email = 'eric@example.com';

-- 2.6 Ver nível do usuário (NOVATO, INICIANTE, etc)
SELECT nome, email, nivel_usuario, total_avaliacoes
FROM v_usuario_perfil_completo 
WHERE email = 'eric@example.com';

-- 2.7 Todas as avaliações de um usuário
SELECT 
    l.nome AS local_nome,
    l.categoria,
    a.nota,
    a.comentario,
    a.created_at
FROM avaliacao a
JOIN local l ON a.local_id = l.id
JOIN usuario u ON a.usuario_id = u.id
WHERE u.email = 'eric@example.com'
ORDER BY a.created_at DESC;

-- 2.8 Categorias que um usuário mais avalia
SELECT 
    l.categoria,
    COUNT(*) AS total_avaliacoes,
    AVG(a.nota) AS nota_media
FROM avaliacao a
JOIN local l ON a.local_id = l.id
JOIN usuario u ON a.usuario_id = u.id
WHERE u.email = 'eric@example.com'
GROUP BY l.categoria
ORDER BY total_avaliacoes DESC;


-- ==========================================
-- SEÇÃO 3: COMIDA / RESTAURANTES
-- ==========================================

-- 3.1 Quantos usuários avaliaram comida?
SELECT COUNT(DISTINCT usuario_id) AS usuarios_avaliaram_comida 
FROM v_usuarios_avaliaram_comida;

-- 3.2 Lista completa de quem avaliou comida
SELECT * FROM v_usuarios_avaliaram_comida
ORDER BY total_avaliacoes_comida DESC;

-- 3.3 Top 10 melhores restaurantes
CALL sp_top_locais_categoria('restaurante', 10);

-- 3.4 Top 10 melhores cafés
CALL sp_top_locais_categoria('cafe', 10);

-- 3.5 Top 10 melhores bares
CALL sp_top_locais_categoria('bar', 10);

-- 3.6 Top 10 melhores pizzarias
CALL sp_top_locais_categoria('pizzaria', 10);

-- 3.7 Todas as categorias de comida disponíveis
SELECT DISTINCT categoria, COUNT(*) AS total_locais
FROM local
WHERE categoria IN (
    'restaurante', 'restaurant', 'bar', 'cafe', 'bakery',
    'food', 'meal_delivery', 'meal_takeaway', 'pizza',
    'lanchonete', 'hamburgueria', 'pizzaria', 'churrascaria'
)
GROUP BY categoria
ORDER BY total_locais DESC;

-- 3.8 Melhores restaurantes por nota (mínimo 5 avaliações)
SELECT 
    l.nome,
    l.endereco,
    ls.nota_media,
    ls.total_avaliacoes,
    ls.usuarios_unicos
FROM local l
JOIN local_stats ls ON l.id = ls.local_id
WHERE l.categoria IN ('restaurante', 'restaurant')
    AND ls.total_avaliacoes >= 5
ORDER BY ls.nota_media DESC, ls.total_avaliacoes DESC
LIMIT 20;


-- ==========================================
-- SEÇÃO 4: TOP RANKINGS
-- ==========================================

-- 4.1 Top 100 melhores locais de TODAS as categorias
SELECT * FROM v_top_100_locais;

-- 4.2 Top 10 locais gerais
SELECT * FROM v_top_100_locais LIMIT 10;

-- 4.3 Top 10 usuários mais ativos
SELECT 
    u.nome,
    u.email,
    us.total_avaliacoes,
    us.nota_media,
    us.locais_unicos_avaliados,
    us.primeira_avaliacao,
    us.ultima_avaliacao
FROM usuario u
JOIN usuario_stats us ON u.id = us.usuario_id
ORDER BY us.total_avaliacoes DESC
LIMIT 10;

-- 4.4 Top locais por categoria (todos os rankings)
SELECT * FROM v_top_locais_por_categoria
WHERE ranking_categoria <= 10
ORDER BY categoria, ranking_categoria;

-- 4.5 Categorias mais populares
SELECT * FROM categoria_stats
ORDER BY total_avaliacoes DESC;

-- 4.6 Locais mais visitados
SELECT 
    l.nome,
    l.categoria,
    ls.total_visitas,
    ls.total_avaliacoes,
    ls.nota_media
FROM local l
JOIN local_stats ls ON l.id = ls.local_id
WHERE ls.total_visitas > 0
ORDER BY ls.total_visitas DESC
LIMIT 20;


-- ==========================================
-- SEÇÃO 5: ANÁLISES TEMPORAIS
-- ==========================================

-- 5.1 Avaliações dos últimos 30 dias
SELECT * FROM avaliacoes_daily 
WHERE data_avaliacao >= CURDATE() - INTERVAL 30 DAY
ORDER BY data_avaliacao DESC;

-- 5.2 Novos usuários dos últimos 30 dias
SELECT 
    DATE(created_at) AS data,
    COUNT(*) AS novos_usuarios
FROM usuario
WHERE created_at >= CURDATE() - INTERVAL 30 DAY
GROUP BY DATE(created_at)
ORDER BY data DESC;

-- 5.3 Avaliações por mês
SELECT 
    DATE_FORMAT(created_at, '%Y-%m') AS mes,
    COUNT(*) AS total_avaliacoes,
    AVG(nota) AS nota_media
FROM avaliacao
GROUP BY mes
ORDER BY mes DESC
LIMIT 12;

-- 5.4 Crescimento mensal de usuários
SELECT 
    DATE_FORMAT(created_at, '%Y-%m') AS mes,
    COUNT(*) AS novos_usuarios,
    SUM(COUNT(*)) OVER (ORDER BY DATE_FORMAT(created_at, '%Y-%m')) AS usuarios_acumulados
FROM usuario
GROUP BY mes
ORDER BY mes DESC
LIMIT 12;

-- 5.5 Atividade da última semana
SELECT 
    DATE(created_at) AS data,
    COUNT(*) AS avaliacoes,
    COUNT(DISTINCT usuario_id) AS usuarios_ativos,
    AVG(nota) AS nota_media
FROM avaliacao
WHERE created_at >= CURDATE() - INTERVAL 7 DAY
GROUP BY DATE(created_at)
ORDER BY data DESC;


-- ==========================================
-- SEÇÃO 6: DESCOBERTA DE LOCAIS
-- ==========================================

-- 6.1 Locais próximos e bem avaliados (exemplo: -11.8399, -55.5537)
-- Substituir os valores de lat/lng pela localização desejada
SELECT 
    l.id,
    l.nome,
    l.categoria,
    l.endereco,
    l.lat,
    l.lng,
    ls.nota_media,
    ls.total_avaliacoes,
    (6371 * acos(
        cos(radians(-11.8399)) * 
        cos(radians(l.lat)) * 
        cos(radians(l.lng) - radians(-55.5537)) + 
        sin(radians(-11.8399)) * 
        sin(radians(l.lat))
    )) AS distancia_km
FROM local l
LEFT JOIN local_stats ls ON l.id = ls.local_id
WHERE l.lat IS NOT NULL 
    AND l.lng IS NOT NULL
HAVING distancia_km <= 5
ORDER BY ls.nota_media DESC, ls.total_avaliacoes DESC
LIMIT 20;

-- 6.2 Locais que um usuário ainda não avaliou
-- Substitua 'eric@example.com' pelo email desejado
SELECT l.* FROM local l
LEFT JOIN local_stats ls ON l.id = ls.local_id
WHERE l.id NOT IN (
    SELECT local_id FROM avaliacao a
    JOIN usuario u ON a.usuario_id = u.id
    WHERE u.email = 'eric@example.com'
)
AND ls.total_avaliacoes >= 3
ORDER BY ls.nota_media DESC
LIMIT 20;

-- 6.3 Locais mais populares (mais avaliados)
SELECT 
    l.nome,
    l.categoria,
    ls.total_avaliacoes,
    ls.nota_media,
    ls.usuarios_unicos
FROM local l
JOIN local_stats ls ON l.id = ls.local_id
ORDER BY ls.total_avaliacoes DESC
LIMIT 20;


-- ==========================================
-- SEÇÃO 7: ENGAJAMENTO DE USUÁRIOS
-- ==========================================

-- 7.1 Análise de engajamento de todos os usuários
SELECT * FROM v_usuario_engajamento
ORDER BY total_avaliacoes DESC;

-- 7.2 Usuários ativos (login nos últimos 7 dias)
SELECT * FROM v_usuario_engajamento
WHERE status_engajamento = 'ATIVO'
ORDER BY total_avaliacoes DESC;

-- 7.3 Usuários inativos (sem login há mais de 30 dias)
SELECT * FROM v_usuario_engajamento
WHERE status_engajamento IN ('INATIVO', 'ABANDONOU')
ORDER BY dias_sem_login DESC;

-- 7.4 Usuários com melhor taxa de avaliação por dia
SELECT * FROM v_usuario_engajamento
WHERE dias_cadastrado > 0
ORDER BY avaliacoes_por_dia DESC
LIMIT 20;


-- ==========================================
-- SEÇÃO 8: RELATÓRIOS PERSONALIZADOS
-- ==========================================

-- 8.1 Relatório mensal de um usuário
-- Substitua 'eric@example.com' pelo email desejado
SELECT 
    COUNT(*) AS avaliacoes_este_mes,
    AVG(a.nota) AS nota_media_mes,
    COUNT(DISTINCT l.id) AS locais_diferentes,
    COUNT(DISTINCT l.categoria) AS categorias_diferentes
FROM avaliacao a
JOIN usuario u ON a.usuario_id = u.id
JOIN local l ON a.local_id = l.id
WHERE u.email = 'eric@example.com'
    AND MONTH(a.created_at) = MONTH(CURDATE())
    AND YEAR(a.created_at) = YEAR(CURDATE());

-- 8.2 Posição do usuário no ranking geral
-- Substitua 'eric@example.com' pelo email desejado
SELECT 
    u.nome,
    u.email,
    us.total_avaliacoes,
    (SELECT COUNT(*) + 1 
     FROM usuario_stats us2 
     WHERE us2.total_avaliacoes > us.total_avaliacoes) AS posicao_ranking,
    (SELECT COUNT(*) FROM usuario) AS total_usuarios
FROM usuario u
JOIN usuario_stats us ON u.id = us.usuario_id
WHERE u.email = 'eric@example.com';

-- 8.3 Comparação de um usuário com a média geral
-- Substitua 'eric@example.com' pelo email desejado
SELECT 
    'Usuário' AS tipo,
    us.total_avaliacoes,
    us.nota_media,
    us.locais_unicos_avaliados
FROM usuario u
JOIN usuario_stats us ON u.id = us.usuario_id
WHERE u.email = 'eric@example.com'
UNION ALL
SELECT 
    'Média Geral',
    CAST(AVG(total_avaliacoes) AS UNSIGNED),
    AVG(nota_media),
    CAST(AVG(locais_unicos_avaliados) AS UNSIGNED)
FROM usuario_stats;

-- 8.4 Locais favoritos de um usuário (notas 9-10)
-- Substitua 'eric@example.com' pelo email desejado
SELECT 
    l.nome,
    l.categoria,
    l.endereco,
    a.nota,
    a.comentario,
    a.created_at
FROM avaliacao a
JOIN local l ON a.local_id = l.id
JOIN usuario u ON a.usuario_id = u.id
WHERE u.email = 'eric@example.com'
    AND a.nota >= 9
ORDER BY a.nota DESC, a.created_at DESC;


-- ==========================================
-- SEÇÃO 9: MANUTENÇÃO E ATUALIZAÇÃO
-- ==========================================

-- 9.1 Recalcular stats de um usuário específico
-- Substitua 1 pelo ID do usuário
CALL sp_recalcular_usuario_stats(1);

-- 9.2 Recalcular stats de um local específico
-- Substitua 1 pelo ID do local
CALL sp_recalcular_local_stats(1);

-- 9.3 Atualizar todos os rankings de categorias
CALL sp_atualizar_categoria_rankings();

-- 9.4 Verificar integridade das tabelas agregadas
SELECT 
    'usuario_stats' AS tabela,
    COUNT(*) AS registros
FROM usuario_stats
UNION ALL
SELECT 'local_stats', COUNT(*) FROM local_stats
UNION ALL
SELECT 'categoria_stats', COUNT(*) FROM categoria_stats
UNION ALL
SELECT 'categoria_top_locais', COUNT(*) FROM categoria_top_locais;


-- ==========================================
-- SEÇÃO 10: CONSULTAS AVANÇADAS
-- ==========================================

-- 10.1 Locais com maior crescimento de avaliações (últimos 30 dias vs anteriores)
SELECT 
    l.nome,
    l.categoria,
    COUNT(CASE WHEN a.created_at >= CURDATE() - INTERVAL 30 DAY THEN 1 END) AS avaliacoes_30d,
    COUNT(CASE WHEN a.created_at < CURDATE() - INTERVAL 30 DAY THEN 1 END) AS avaliacoes_anteriores,
    ROUND(
        (COUNT(CASE WHEN a.created_at >= CURDATE() - INTERVAL 30 DAY THEN 1 END) * 100.0) /
        NULLIF(COUNT(CASE WHEN a.created_at < CURDATE() - INTERVAL 30 DAY THEN 1 END), 0),
        2
    ) AS percentual_crescimento
FROM local l
JOIN avaliacao a ON l.id = a.local_id
GROUP BY l.id, l.nome, l.categoria
HAVING avaliacoes_30d > 0 AND avaliacoes_anteriores > 0
ORDER BY percentual_crescimento DESC
LIMIT 20;

-- 10.2 Usuários que avaliaram mais categorias diferentes
SELECT 
    u.nome,
    u.email,
    COUNT(DISTINCT l.categoria) AS categorias_diferentes,
    COUNT(*) AS total_avaliacoes
FROM usuario u
JOIN avaliacao a ON u.id = a.usuario_id
JOIN local l ON a.local_id = l.id
GROUP BY u.id, u.nome, u.email
ORDER BY categorias_diferentes DESC, total_avaliacoes DESC
LIMIT 20;

-- 10.3 Horários mais populares para avaliações
SELECT 
    HOUR(created_at) AS hora,
    COUNT(*) AS total_avaliacoes,
    AVG(nota) AS nota_media
FROM avaliacao
GROUP BY hora
ORDER BY hora;

-- 10.4 Análise de sentimento (notas altas vs baixas)
SELECT 
    CASE 
        WHEN nota >= 9 THEN 'Excelente (9-10)'
        WHEN nota >= 7 THEN 'Bom (7-8)'
        WHEN nota >= 5 THEN 'Regular (5-6)'
        ELSE 'Ruim (0-4)'
    END AS sentimento,
    COUNT(*) AS total,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM avaliacao), 2) AS percentual
FROM avaliacao
GROUP BY sentimento
ORDER BY 
    CASE sentimento
        WHEN 'Excelente (9-10)' THEN 1
        WHEN 'Bom (7-8)' THEN 2
        WHEN 'Regular (5-6)' THEN 3
        ELSE 4
    END;


-- ==========================================
-- DICAS DE USO
-- ==========================================

-- ✅ Sempre use índices - as consultas são otimizadas
-- ✅ Use as views prontas (v_*) para consultas frequentes
-- ✅ Use stored procedures (sp_*) para operações complexas
-- ✅ Consulte por email - é indexado e único
-- ✅ Os triggers atualizam stats automaticamente
-- ✅ Execute sp_atualizar_categoria_rankings() 1x por dia

-- Para mais informações, consulte: backend/GUIA-ANALYTICS.md
