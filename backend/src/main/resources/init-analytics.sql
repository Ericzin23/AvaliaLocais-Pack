-- ========================================
-- SCRIPT DE INICIALIZAÇÃO RÁPIDA
-- Execute este script APÓS instalar o schema-analytics.sql
-- ========================================

-- PASSO 1: Inicializar tabelas de estatísticas
-- ========================================

-- Criar registros vazios para todos os usuários
INSERT IGNORE INTO usuario_stats (usuario_id)
SELECT id FROM usuario;

-- Criar registros vazios para todos os locais
INSERT IGNORE INTO local_stats (local_id)
SELECT id FROM local;


-- PASSO 2: Recalcular estatísticas de todos os usuários
-- ========================================

-- Isso pode demorar alguns minutos dependendo da quantidade de dados
DELIMITER //

CREATE PROCEDURE sp_init_all_usuario_stats()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_user_id BIGINT;
    DECLARE user_cursor CURSOR FOR SELECT id FROM usuario;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN user_cursor;
    
    read_loop: LOOP
        FETCH user_cursor INTO v_user_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        CALL sp_recalcular_usuario_stats(v_user_id);
    END LOOP;
    
    CLOSE user_cursor;
    
    SELECT 'Estatísticas de usuários inicializadas com sucesso!' AS status;
END//

DELIMITER ;

-- Executar a inicialização
CALL sp_init_all_usuario_stats();


-- PASSO 3: Recalcular estatísticas de todos os locais
-- ========================================

DELIMITER //

CREATE PROCEDURE sp_init_all_local_stats()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_local_id BIGINT;
    DECLARE local_cursor CURSOR FOR SELECT id FROM local;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN local_cursor;
    
    read_loop: LOOP
        FETCH local_cursor INTO v_local_id;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        CALL sp_recalcular_local_stats(v_local_id);
    END LOOP;
    
    CLOSE local_cursor;
    
    SELECT 'Estatísticas de locais inicializadas com sucesso!' AS status;
END//

DELIMITER ;

-- Executar a inicialização
CALL sp_init_all_local_stats();


-- PASSO 4: Atualizar rankings de categorias
-- ========================================

CALL sp_atualizar_categoria_rankings();


-- PASSO 5: Verificar se tudo funcionou
-- ========================================

-- Verificar quantos usuários têm estatísticas
SELECT 
    (SELECT COUNT(*) FROM usuario) AS total_usuarios,
    (SELECT COUNT(*) FROM usuario_stats) AS usuarios_com_stats,
    (SELECT COUNT(*) FROM usuario_stats WHERE total_avaliacoes > 0) AS usuarios_com_avaliacoes;

-- Verificar quantos locais têm estatísticas
SELECT 
    (SELECT COUNT(*) FROM local) AS total_locais,
    (SELECT COUNT(*) FROM local_stats) AS locais_com_stats,
    (SELECT COUNT(*) FROM local_stats WHERE total_avaliacoes > 0) AS locais_com_avaliacoes;

-- Verificar categorias
SELECT 
    COUNT(*) AS total_categorias,
    SUM(total_avaliacoes) AS total_avaliacoes_todas_categorias
FROM categoria_stats;

-- Verificar top locais
SELECT COUNT(*) AS total_no_ranking FROM categoria_top_locais;

-- Ver estatísticas gerais
SELECT * FROM v_stats_gerais;


-- PASSO 6: Testar consultas principais
-- ========================================

-- Top 10 locais gerais
SELECT 
    nome,
    categoria,
    nota_media,
    total_avaliacoes
FROM v_top_100_locais
LIMIT 10;

-- Top 10 usuários mais ativos
SELECT 
    u.nome,
    u.email,
    us.total_avaliacoes,
    us.nota_media,
    us.locais_unicos_avaliados
FROM usuario u
JOIN usuario_stats us ON u.id = us.usuario_id
ORDER BY us.total_avaliacoes DESC
LIMIT 10;

-- Categorias mais populares
SELECT 
    categoria,
    total_locais,
    total_avaliacoes,
    nota_media
FROM categoria_stats
ORDER BY total_avaliacoes DESC
LIMIT 10;


-- ========================================
-- LIMPEZA: Remover procedures temporárias
-- ========================================

DROP PROCEDURE IF EXISTS sp_init_all_usuario_stats;
DROP PROCEDURE IF EXISTS sp_init_all_local_stats;


-- ========================================
-- CONCLUSÃO
-- ========================================

SELECT 
    '✅ Sistema analítico inicializado com sucesso!' AS status,
    'Você pode começar a usar as consultas do GUIA-ANALYTICS.md' AS proximo_passo;
