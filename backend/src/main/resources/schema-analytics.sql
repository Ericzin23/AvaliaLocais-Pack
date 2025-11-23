-- ========================================
-- SCHEMA ANALÍTICO COMPLETO - AvaliaLocais
-- Sistema otimizado para relatórios e análises
-- ========================================

-- ========================================
-- PARTE 1: ÍNDICES DE PERFORMANCE
-- ========================================

-- Índices para Usuario
CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_created_at ON usuario(created_at);
CREATE INDEX idx_usuario_genero ON usuario(genero);
CREATE INDEX idx_usuario_data_nascimento ON usuario(data_nascimento);

-- Índices para Local
CREATE INDEX idx_local_categoria ON local(categoria);
CREATE INDEX idx_local_google_place_id ON local(google_place_id);
CREATE INDEX idx_local_lat_lng ON local(lat, lng);
CREATE INDEX idx_local_created_at ON local(created_at);

-- Índices para Avaliacao
CREATE INDEX idx_avaliacao_usuario_id ON avaliacao(usuario_id);
CREATE INDEX idx_avaliacao_local_id ON avaliacao(local_id);
CREATE INDEX idx_avaliacao_nota ON avaliacao(nota);
CREATE INDEX idx_avaliacao_created_at ON avaliacao(created_at);
CREATE INDEX idx_avaliacao_usuario_created ON avaliacao(usuario_id, created_at);
CREATE INDEX idx_avaliacao_local_created ON avaliacao(local_id, created_at);

-- Índices para Visita
CREATE INDEX idx_visita_usuario_id ON visita(usuario_id);
CREATE INDEX idx_visita_local_id ON visita(local_id);
CREATE INDEX idx_visita_checkin_at ON visita(checkin_at);
CREATE INDEX idx_visita_created_at ON visita(created_at);

-- Índices para Relatorio
CREATE INDEX idx_relatorio_usuario_id ON relatorio(usuario_id);
CREATE INDEX idx_relatorio_periodo ON relatorio(periodo);
CREATE INDEX idx_relatorio_created_at ON relatorio(created_at);


-- ========================================
-- PARTE 2: TABELAS ANALÍTICAS AGREGADAS
-- ========================================

-- Estatísticas por Usuário (cache de métricas)
CREATE TABLE IF NOT EXISTS usuario_stats (
    usuario_id BIGINT PRIMARY KEY,
    total_avaliacoes INT DEFAULT 0,
    total_visitas INT DEFAULT 0,
    total_relatorios INT DEFAULT 0,
    nota_media DECIMAL(3,2) DEFAULT 0.00,
    locais_unicos_avaliados INT DEFAULT 0,
    categorias_avaliadas TEXT, -- JSON array com contadores
    primeira_avaliacao DATETIME(6),
    ultima_avaliacao DATETIME(6),
    primeira_visita DATETIME(6),
    ultima_visita DATETIME(6),
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_usuario_stats_total_avaliacoes ON usuario_stats(total_avaliacoes DESC);
CREATE INDEX idx_usuario_stats_nota_media ON usuario_stats(nota_media DESC);


-- Estatísticas por Local (cache de métricas)
CREATE TABLE IF NOT EXISTS local_stats (
    local_id BIGINT PRIMARY KEY,
    total_avaliacoes INT DEFAULT 0,
    total_visitas INT DEFAULT 0,
    nota_media DECIMAL(3,2) DEFAULT 0.00,
    nota_total INT DEFAULT 0, -- soma das notas
    usuarios_unicos INT DEFAULT 0,
    primeira_avaliacao DATETIME(6),
    ultima_avaliacao DATETIME(6),
    primeira_visita DATETIME(6),
    ultima_visita DATETIME(6),
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (local_id) REFERENCES local(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_local_stats_total_avaliacoes ON local_stats(total_avaliacoes DESC);
CREATE INDEX idx_local_stats_nota_media ON local_stats(nota_media DESC);
CREATE INDEX idx_local_stats_usuarios_unicos ON local_stats(usuarios_unicos DESC);


-- Top Locais por Categoria
CREATE TABLE IF NOT EXISTS categoria_top_locais (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    categoria VARCHAR(255) NOT NULL,
    local_id BIGINT NOT NULL,
    ranking_posicao INT NOT NULL,
    nota_media DECIMAL(3,2) NOT NULL,
    total_avaliacoes INT NOT NULL,
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (local_id) REFERENCES local(id) ON DELETE CASCADE,
    UNIQUE KEY unique_categoria_local (categoria, local_id)
) ENGINE=InnoDB;

CREATE INDEX idx_categoria_top_ranking ON categoria_top_locais(categoria, ranking_posicao);


-- Estatísticas por Categoria
CREATE TABLE IF NOT EXISTS categoria_stats (
    categoria VARCHAR(255) PRIMARY KEY,
    total_locais INT DEFAULT 0,
    total_avaliacoes INT DEFAULT 0,
    total_visitas INT DEFAULT 0,
    nota_media DECIMAL(3,2) DEFAULT 0.00,
    usuarios_unicos INT DEFAULT 0,
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB;

CREATE INDEX idx_categoria_stats_total_avaliacoes ON categoria_stats(total_avaliacoes DESC);
CREATE INDEX idx_categoria_stats_nota_media ON categoria_stats(nota_media DESC);


-- Histórico de Avaliações por Dia (time series)
CREATE TABLE IF NOT EXISTS avaliacoes_daily (
    data_avaliacao DATE NOT NULL,
    categoria VARCHAR(255),
    total_avaliacoes INT DEFAULT 0,
    nota_media DECIMAL(3,2) DEFAULT 0.00,
    usuarios_unicos INT DEFAULT 0,
    locais_unicos INT DEFAULT 0,
    PRIMARY KEY (data_avaliacao, categoria)
) ENGINE=InnoDB;

CREATE INDEX idx_avaliacoes_daily_data ON avaliacoes_daily(data_avaliacao DESC);


-- Histórico de Visitas por Dia
CREATE TABLE IF NOT EXISTS visitas_daily (
    data_visita DATE NOT NULL,
    categoria VARCHAR(255),
    total_visitas INT DEFAULT 0,
    duracao_media_min INT DEFAULT 0,
    usuarios_unicos INT DEFAULT 0,
    locais_unicos INT DEFAULT 0,
    PRIMARY KEY (data_visita, categoria)
) ENGINE=InnoDB;

CREATE INDEX idx_visitas_daily_data ON visitas_daily(data_visita DESC);


-- Usuários Mais Ativos (leaderboard)
CREATE TABLE IF NOT EXISTS usuarios_top_avaliadores (
    ranking_posicao INT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    total_avaliacoes INT NOT NULL,
    nota_media DECIMAL(3,2) NOT NULL,
    categorias_diferentes INT NOT NULL,
    updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ========================================
-- PARTE 3: VIEWS PARA CONSULTAS RÁPIDAS
-- ========================================

-- View: Perfil completo do usuário com estatísticas
CREATE OR REPLACE VIEW v_usuario_perfil_completo AS
SELECT 
    u.id,
    u.nome,
    u.email,
    u.data_nascimento,
    u.genero,
    u.foto_url,
    u.created_at AS membro_desde,
    u.ultimo_login_at,
    COALESCE(us.total_avaliacoes, 0) AS total_avaliacoes,
    COALESCE(us.total_visitas, 0) AS total_visitas,
    COALESCE(us.total_relatorios, 0) AS total_relatorios,
    COALESCE(us.nota_media, 0.00) AS nota_media,
    COALESCE(us.locais_unicos_avaliados, 0) AS locais_unicos_avaliados,
    us.categorias_avaliadas,
    us.primeira_avaliacao,
    us.ultima_avaliacao,
    DATEDIFF(CURDATE(), u.created_at) AS dias_como_membro,
    CASE 
        WHEN us.total_avaliacoes >= 100 THEN 'EXPERT'
        WHEN us.total_avaliacoes >= 50 THEN 'AVANÇADO'
        WHEN us.total_avaliacoes >= 20 THEN 'INTERMEDIÁRIO'
        WHEN us.total_avaliacoes >= 5 THEN 'INICIANTE'
        ELSE 'NOVATO'
    END AS nivel_usuario
FROM usuario u
LEFT JOIN usuario_stats us ON u.id = us.usuario_id;


-- View: Top 100 locais por nota média
CREATE OR REPLACE VIEW v_top_100_locais AS
SELECT 
    l.id,
    l.nome,
    l.categoria,
    l.endereco,
    l.lat,
    l.lng,
    COALESCE(ls.nota_media, 0.00) AS nota_media,
    COALESCE(ls.total_avaliacoes, 0) AS total_avaliacoes,
    COALESCE(ls.usuarios_unicos, 0) AS usuarios_unicos,
    COALESCE(ls.total_visitas, 0) AS total_visitas,
    l.created_at
FROM local l
LEFT JOIN local_stats ls ON l.id = ls.local_id
WHERE ls.total_avaliacoes >= 3 -- mínimo de 3 avaliações
ORDER BY ls.nota_media DESC, ls.total_avaliacoes DESC
LIMIT 100;


-- View: Top locais por categoria
CREATE OR REPLACE VIEW v_top_locais_por_categoria AS
SELECT 
    l.categoria,
    l.id AS local_id,
    l.nome,
    l.endereco,
    COALESCE(ls.nota_media, 0.00) AS nota_media,
    COALESCE(ls.total_avaliacoes, 0) AS total_avaliacoes,
    COALESCE(ls.usuarios_unicos, 0) AS usuarios_unicos,
    ROW_NUMBER() OVER (PARTITION BY l.categoria ORDER BY ls.nota_media DESC, ls.total_avaliacoes DESC) AS ranking_categoria
FROM local l
LEFT JOIN local_stats ls ON l.id = ls.local_id
WHERE ls.total_avaliacoes >= 3;


-- View: Avaliações recentes com informações completas
CREATE OR REPLACE VIEW v_avaliacoes_recentes AS
SELECT 
    a.id,
    a.nota,
    a.comentario,
    a.foto_url,
    a.created_at,
    u.id AS usuario_id,
    u.nome AS usuario_nome,
    u.foto_url AS usuario_foto,
    l.id AS local_id,
    l.nome AS local_nome,
    l.categoria AS local_categoria,
    l.endereco AS local_endereco,
    COALESCE(ls.nota_media, 0.00) AS local_nota_media,
    COALESCE(ls.total_avaliacoes, 0) AS local_total_avaliacoes
FROM avaliacao a
JOIN usuario u ON a.usuario_id = u.id
JOIN local l ON a.local_id = l.id
LEFT JOIN local_stats ls ON l.id = ls.local_id
ORDER BY a.created_at DESC;


-- View: Estatísticas gerais do sistema
CREATE OR REPLACE VIEW v_stats_gerais AS
SELECT 
    (SELECT COUNT(*) FROM usuario) AS total_usuarios,
    (SELECT COUNT(*) FROM usuario WHERE created_at >= CURDATE() - INTERVAL 30 DAY) AS novos_usuarios_30d,
    (SELECT COUNT(*) FROM local) AS total_locais,
    (SELECT COUNT(DISTINCT categoria) FROM local) AS total_categorias,
    (SELECT COUNT(*) FROM avaliacao) AS total_avaliacoes,
    (SELECT COUNT(*) FROM avaliacao WHERE created_at >= CURDATE() - INTERVAL 30 DAY) AS avaliacoes_30d,
    (SELECT AVG(nota) FROM avaliacao) AS nota_media_geral,
    (SELECT COUNT(*) FROM visita) AS total_visitas,
    (SELECT COUNT(*) FROM visita WHERE checkin_at >= CURDATE() - INTERVAL 30 DAY) AS visitas_30d,
    (SELECT AVG(duracao_min) FROM visita WHERE duracao_min IS NOT NULL) AS duracao_media_visitas_min;


-- View: Usuários avaliaram comida (restaurantes, cafés, etc)
CREATE OR REPLACE VIEW v_usuarios_avaliaram_comida AS
SELECT 
    u.id AS usuario_id,
    u.nome,
    u.email,
    COUNT(DISTINCT a.id) AS total_avaliacoes_comida,
    AVG(a.nota) AS nota_media_comida,
    COUNT(DISTINCT l.id) AS locais_diferentes_comida,
    COUNT(DISTINCT l.categoria) AS categorias_comida_diferentes,
    MIN(a.created_at) AS primeira_avaliacao_comida,
    MAX(a.created_at) AS ultima_avaliacao_comida
FROM usuario u
JOIN avaliacao a ON u.id = a.usuario_id
JOIN local l ON a.local_id = l.id
WHERE l.categoria IN (
    'restaurante', 'restaurant', 'bar', 'cafe', 'bakery', 
    'food', 'meal_delivery', 'meal_takeaway', 'pizza',
    'lanchonete', 'hamburgueria', 'pizzaria', 'churrascaria'
)
GROUP BY u.id, u.nome, u.email;


-- View: Análise de engajamento do usuário
CREATE OR REPLACE VIEW v_usuario_engajamento AS
SELECT 
    u.id AS usuario_id,
    u.nome,
    u.email,
    COALESCE(us.total_avaliacoes, 0) AS total_avaliacoes,
    COALESCE(us.total_visitas, 0) AS total_visitas,
    DATEDIFF(CURDATE(), u.created_at) AS dias_cadastrado,
    CASE 
        WHEN DATEDIFF(CURDATE(), u.created_at) > 0 
        THEN ROUND(COALESCE(us.total_avaliacoes, 0) / DATEDIFF(CURDATE(), u.created_at), 2)
        ELSE 0
    END AS avaliacoes_por_dia,
    DATEDIFF(CURDATE(), u.ultimo_login_at) AS dias_sem_login,
    CASE 
        WHEN DATEDIFF(CURDATE(), u.ultimo_login_at) <= 7 THEN 'ATIVO'
        WHEN DATEDIFF(CURDATE(), u.ultimo_login_at) <= 30 THEN 'MODERADO'
        WHEN DATEDIFF(CURDATE(), u.ultimo_login_at) <= 90 THEN 'INATIVO'
        ELSE 'ABANDONOU'
    END AS status_engajamento
FROM usuario u
LEFT JOIN usuario_stats us ON u.id = us.usuario_id;


-- ========================================
-- PARTE 4: STORED PROCEDURES ANALÍTICAS
-- ========================================

DELIMITER //

-- Procedure: Recalcular estatísticas de usuário
CREATE PROCEDURE sp_recalcular_usuario_stats(IN p_usuario_id BIGINT)
BEGIN
    INSERT INTO usuario_stats (
        usuario_id,
        total_avaliacoes,
        total_visitas,
        total_relatorios,
        nota_media,
        locais_unicos_avaliados,
        primeira_avaliacao,
        ultima_avaliacao,
        primeira_visita,
        ultima_visita
    )
    SELECT 
        p_usuario_id,
        COUNT(DISTINCT a.id),
        COUNT(DISTINCT v.id),
        COUNT(DISTINCT r.id),
        COALESCE(AVG(a.nota), 0),
        COUNT(DISTINCT a.local_id),
        MIN(a.created_at),
        MAX(a.created_at),
        MIN(v.checkin_at),
        MAX(v.checkin_at)
    FROM usuario u
    LEFT JOIN avaliacao a ON u.id = a.usuario_id
    LEFT JOIN visita v ON u.id = v.usuario_id
    LEFT JOIN relatorio r ON u.id = r.usuario_id
    WHERE u.id = p_usuario_id
    GROUP BY u.id
    ON DUPLICATE KEY UPDATE
        total_avaliacoes = VALUES(total_avaliacoes),
        total_visitas = VALUES(total_visitas),
        total_relatorios = VALUES(total_relatorios),
        nota_media = VALUES(nota_media),
        locais_unicos_avaliados = VALUES(locais_unicos_avaliados),
        primeira_avaliacao = VALUES(primeira_avaliacao),
        ultima_avaliacao = VALUES(ultima_avaliacao),
        primeira_visita = VALUES(primeira_visita),
        ultima_visita = VALUES(ultima_visita);
END//


-- Procedure: Recalcular estatísticas de local
CREATE PROCEDURE sp_recalcular_local_stats(IN p_local_id BIGINT)
BEGIN
    INSERT INTO local_stats (
        local_id,
        total_avaliacoes,
        total_visitas,
        nota_media,
        nota_total,
        usuarios_unicos,
        primeira_avaliacao,
        ultima_avaliacao,
        primeira_visita,
        ultima_visita
    )
    SELECT 
        p_local_id,
        COUNT(DISTINCT a.id),
        COUNT(DISTINCT v.id),
        COALESCE(AVG(a.nota), 0),
        COALESCE(SUM(a.nota), 0),
        COUNT(DISTINCT a.usuario_id),
        MIN(a.created_at),
        MAX(a.created_at),
        MIN(v.checkin_at),
        MAX(v.checkin_at)
    FROM local l
    LEFT JOIN avaliacao a ON l.id = a.local_id
    LEFT JOIN visita v ON l.id = v.local_id
    WHERE l.id = p_local_id
    GROUP BY l.id
    ON DUPLICATE KEY UPDATE
        total_avaliacoes = VALUES(total_avaliacoes),
        total_visitas = VALUES(total_visitas),
        nota_media = VALUES(nota_media),
        nota_total = VALUES(nota_total),
        usuarios_unicos = VALUES(usuarios_unicos),
        primeira_avaliacao = VALUES(primeira_avaliacao),
        ultima_avaliacao = VALUES(ultima_avaliacao),
        primeira_visita = VALUES(primeira_visita),
        ultima_visita = VALUES(ultima_visita);
END//


-- Procedure: Atualizar rankings de categoria
CREATE PROCEDURE sp_atualizar_categoria_rankings()
BEGIN
    -- Limpar rankings antigos
    DELETE FROM categoria_top_locais;
    
    -- Inserir novos rankings
    INSERT INTO categoria_top_locais (categoria, local_id, ranking_posicao, nota_media, total_avaliacoes)
    SELECT 
        categoria,
        local_id,
        ranking_categoria,
        nota_media,
        total_avaliacoes
    FROM v_top_locais_por_categoria
    WHERE ranking_categoria <= 100;
    
    -- Atualizar estatísticas de categoria
    INSERT INTO categoria_stats (categoria, total_locais, total_avaliacoes, nota_media, usuarios_unicos)
    SELECT 
        l.categoria,
        COUNT(DISTINCT l.id),
        COALESCE(SUM(ls.total_avaliacoes), 0),
        COALESCE(AVG(ls.nota_media), 0),
        COUNT(DISTINCT a.usuario_id)
    FROM local l
    LEFT JOIN local_stats ls ON l.id = ls.local_id
    LEFT JOIN avaliacao a ON l.id = a.local_id
    WHERE l.categoria IS NOT NULL
    GROUP BY l.categoria
    ON DUPLICATE KEY UPDATE
        total_locais = VALUES(total_locais),
        total_avaliacoes = VALUES(total_avaliacoes),
        nota_media = VALUES(nota_media),
        usuarios_unicos = VALUES(usuarios_unicos);
END//


-- Procedure: Obter estatísticas completas de um usuário por email
CREATE PROCEDURE sp_get_usuario_stats_by_email(IN p_email VARCHAR(255))
BEGIN
    SELECT * FROM v_usuario_perfil_completo WHERE email = p_email;
    
    SELECT 
        l.categoria,
        COUNT(*) AS total_avaliacoes,
        AVG(a.nota) AS nota_media
    FROM avaliacao a
    JOIN local l ON a.local_id = l.id
    JOIN usuario u ON a.usuario_id = u.id
    WHERE u.email = p_email
    GROUP BY l.categoria
    ORDER BY total_avaliacoes DESC;
    
    SELECT 
        l.id,
        l.nome,
        l.categoria,
        a.nota,
        a.comentario,
        a.created_at
    FROM avaliacao a
    JOIN local l ON a.local_id = l.id
    JOIN usuario u ON a.usuario_id = u.id
    WHERE u.email = p_email
    ORDER BY a.created_at DESC
    LIMIT 20;
END//


-- Procedure: Top locais de uma categoria específica
CREATE PROCEDURE sp_top_locais_categoria(IN p_categoria VARCHAR(255), IN p_limit INT)
BEGIN
    SELECT 
        l.id,
        l.nome,
        l.endereco,
        l.lat,
        l.lng,
        ls.nota_media,
        ls.total_avaliacoes,
        ls.usuarios_unicos
    FROM local l
    JOIN local_stats ls ON l.id = ls.local_id
    WHERE l.categoria = p_categoria
        AND ls.total_avaliacoes >= 3
    ORDER BY ls.nota_media DESC, ls.total_avaliacoes DESC
    LIMIT p_limit;
END//

DELIMITER ;


-- ========================================
-- PARTE 5: TRIGGERS PARA AUTO-ATUALIZAÇÃO
-- ========================================

DELIMITER //

-- Trigger: Após inserir avaliação, atualizar stats
CREATE TRIGGER trg_after_avaliacao_insert
AFTER INSERT ON avaliacao
FOR EACH ROW
BEGIN
    CALL sp_recalcular_usuario_stats(NEW.usuario_id);
    CALL sp_recalcular_local_stats(NEW.local_id);
END//

-- Trigger: Após atualizar avaliação, atualizar stats
CREATE TRIGGER trg_after_avaliacao_update
AFTER UPDATE ON avaliacao
FOR EACH ROW
BEGIN
    CALL sp_recalcular_usuario_stats(NEW.usuario_id);
    CALL sp_recalcular_local_stats(NEW.local_id);
    IF OLD.usuario_id != NEW.usuario_id THEN
        CALL sp_recalcular_usuario_stats(OLD.usuario_id);
    END IF;
    IF OLD.local_id != NEW.local_id THEN
        CALL sp_recalcular_local_stats(OLD.local_id);
    END IF;
END//

-- Trigger: Após deletar avaliação, atualizar stats
CREATE TRIGGER trg_after_avaliacao_delete
AFTER DELETE ON avaliacao
FOR EACH ROW
BEGIN
    CALL sp_recalcular_usuario_stats(OLD.usuario_id);
    CALL sp_recalcular_local_stats(OLD.local_id);
END//

-- Trigger: Após inserir visita, atualizar stats
CREATE TRIGGER trg_after_visita_insert
AFTER INSERT ON visita
FOR EACH ROW
BEGIN
    CALL sp_recalcular_usuario_stats(NEW.usuario_id);
    CALL sp_recalcular_local_stats(NEW.local_id);
END//

-- Trigger: Após deletar visita, atualizar stats
CREATE TRIGGER trg_after_visita_delete
AFTER DELETE ON visita
FOR EACH ROW
BEGIN
    CALL sp_recalcular_usuario_stats(OLD.usuario_id);
    CALL sp_recalcular_local_stats(OLD.local_id);
END//

DELIMITER ;


-- ========================================
-- PARTE 6: EXEMPLOS DE CONSULTAS ÚTEIS
-- ========================================

-- Consulta 1: Quantos usuários tem no sistema?
-- SELECT COUNT(*) AS total_usuarios FROM usuario;

-- Consulta 2: Quantos usuários avaliaram comida?
-- SELECT COUNT(DISTINCT usuario_id) AS usuarios_comida FROM v_usuarios_avaliaram_comida;

-- Consulta 3: Estatísticas do Eric por email
-- CALL sp_get_usuario_stats_by_email('eric@example.com');

-- Consulta 4: Top 10 restaurantes
-- CALL sp_top_locais_categoria('restaurante', 10);

-- Consulta 5: Todas as avaliações de um usuário específico
-- SELECT * FROM v_avaliacoes_recentes WHERE usuario_email = 'eric@example.com';

-- Consulta 6: Usuários mais ativos
-- SELECT * FROM v_usuario_engajamento ORDER BY total_avaliacoes DESC LIMIT 10;

-- Consulta 7: Estatísticas gerais do sistema
-- SELECT * FROM v_stats_gerais;

-- Consulta 8: Top 100 melhores locais de todos
-- SELECT * FROM v_top_100_locais;

-- Consulta 9: Análise de categorias mais populares
-- SELECT * FROM categoria_stats ORDER BY total_avaliacoes DESC;

-- Consulta 10: Atividade dos últimos 30 dias
-- SELECT * FROM avaliacoes_daily WHERE data_avaliacao >= CURDATE() - INTERVAL 30 DAY;
