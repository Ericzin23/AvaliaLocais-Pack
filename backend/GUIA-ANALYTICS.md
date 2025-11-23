# 📊 GUIA COMPLETO - Sistema Analítico AvaliaLocais

## 🎯 Visão Geral

Este sistema fornece **análises completas e em tempo real** de todas as informações do AvaliaLocais, com:

- ✅ **Tabelas agregadas** que atualizam automaticamente
- ✅ **Índices otimizados** para consultas rápidas
- ✅ **Views materializadas** para relatórios instantâneos
- ✅ **Triggers** que mantêm dados sincronizados
- ✅ **Stored Procedures** para consultas complexas
- ✅ **Relacionamentos fortes** entre todas as tabelas

---

## 📋 COMO INSTALAR

### 1. Executar o schema analítico

```bash
# No terminal, executar:
mysql -u root -p banco_avaliacoes_final < backend/src/main/resources/schema-analytics.sql
```

Ou via MySQL Workbench:
1. Abrir o arquivo `schema-analytics.sql`
2. Executar todo o conteúdo (Ctrl+Shift+Enter)

---

## 🔍 CONSULTAS PRINCIPAIS

### **Quantos usuários existem?**

```sql
SELECT COUNT(*) AS total_usuarios FROM usuario;
```

### **Quantos usuários avaliaram comida?**

```sql
SELECT COUNT(DISTINCT usuario_id) AS usuarios_avaliaram_comida 
FROM v_usuarios_avaliaram_comida;
```

### **Ver TODAS as informações de um usuário pelo email**

```sql
CALL sp_get_usuario_stats_by_email('eric@example.com');
```

Retorna:
- Perfil completo do usuário
- Estatísticas por categoria
- Últimas 20 avaliações

### **Top 10 melhores restaurantes**

```sql
CALL sp_top_locais_categoria('restaurante', 10);
```

### **Top 10 melhores cafés**

```sql
CALL sp_top_locais_categoria('cafe', 10);
```

### **Top 100 melhores locais de TODAS as categorias**

```sql
SELECT * FROM v_top_100_locais;
```

### **Estatísticas gerais do sistema**

```sql
SELECT * FROM v_stats_gerais;
```

Retorna:
- Total de usuários
- Total de locais
- Total de avaliações
- Média geral de notas
- Total de visitas
- E muito mais!

---

## 👤 CONSULTAS POR USUÁRIO

### **Perfil completo de um usuário**

```sql
SELECT * FROM v_usuario_perfil_completo WHERE email = 'eric@example.com';
```

Retorna:
- Nome, email, foto
- Total de avaliações
- Total de visitas
- Nota média
- Locais únicos avaliados
- Categorias avaliadas
- Nível do usuário (NOVATO, INICIANTE, INTERMEDIÁRIO, AVANÇADO, EXPERT)

### **Todas as avaliações de um usuário**

```sql
SELECT * FROM v_avaliacoes_recentes 
WHERE usuario_email = 'eric@example.com'
ORDER BY created_at DESC;
```

### **Quantas avaliações o Eric fez?**

```sql
SELECT total_avaliacoes 
FROM v_usuario_perfil_completo 
WHERE email = 'eric@example.com';
```

### **Quais categorias o Eric mais avalia?**

```sql
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
```

### **Usuários que avaliaram comida**

```sql
SELECT * FROM v_usuarios_avaliaram_comida
ORDER BY total_avaliacoes_comida DESC;
```

### **Engajamento dos usuários**

```sql
SELECT * FROM v_usuario_engajamento
ORDER BY avaliacoes_por_dia DESC;
```

---

## 🏆 TOP RANKINGS

### **Top 10 usuários mais ativos**

```sql
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
```

### **Top locais por categoria específica**

```sql
SELECT * FROM v_top_locais_por_categoria
WHERE categoria = 'restaurante'
    AND ranking_categoria <= 10;
```

### **Categorias mais populares**

```sql
SELECT * FROM categoria_stats
ORDER BY total_avaliacoes DESC;
```

---

## 📈 ANÁLISES TEMPORAIS

### **Avaliações dos últimos 30 dias**

```sql
SELECT * FROM avaliacoes_daily 
WHERE data_avaliacao >= CURDATE() - INTERVAL 30 DAY
ORDER BY data_avaliacao DESC;
```

### **Crescimento de usuários**

```sql
SELECT 
    DATE(created_at) AS data,
    COUNT(*) AS novos_usuarios
FROM usuario
WHERE created_at >= CURDATE() - INTERVAL 30 DAY
GROUP BY DATE(created_at)
ORDER BY data DESC;
```

### **Avaliações por mês**

```sql
SELECT 
    DATE_FORMAT(created_at, '%Y-%m') AS mes,
    COUNT(*) AS total_avaliacoes,
    AVG(nota) AS nota_media
FROM avaliacao
GROUP BY mes
ORDER BY mes DESC;
```

---

## 🍽️ CONSULTAS SOBRE COMIDA

### **Melhores restaurantes por nota**

```sql
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
```

### **Usuários que mais avaliam comida**

```sql
SELECT 
    nome,
    email,
    total_avaliacoes_comida,
    nota_media_comida,
    locais_diferentes_comida
FROM v_usuarios_avaliaram_comida
ORDER BY total_avaliacoes_comida DESC
LIMIT 20;
```

### **Todas as categorias de comida disponíveis**

```sql
SELECT DISTINCT categoria
FROM local
WHERE categoria IN (
    'restaurante', 'restaurant', 'bar', 'cafe', 'bakery',
    'food', 'meal_delivery', 'meal_takeaway', 'pizza',
    'lanchonete', 'hamburgueria', 'pizzaria', 'churrascaria'
)
ORDER BY categoria;
```

---

## 🔄 MANUTENÇÃO E ATUALIZAÇÃO

### **Recalcular estatísticas de um usuário**

```sql
CALL sp_recalcular_usuario_stats(1); -- Substituir 1 pelo ID do usuário
```

### **Recalcular estatísticas de um local**

```sql
CALL sp_recalcular_local_stats(1); -- Substituir 1 pelo ID do local
```

### **Atualizar todos os rankings de categoria**

```sql
CALL sp_atualizar_categoria_rankings();
```

### **Inicializar estatísticas de TODOS os usuários**

```sql
-- Executar uma vez após instalar o schema
INSERT INTO usuario_stats (usuario_id)
SELECT id FROM usuario
ON DUPLICATE KEY UPDATE usuario_id=usuario_id;

-- Recalcular todos
CREATE TEMPORARY TABLE temp_usuarios AS SELECT id FROM usuario;
WHILE (SELECT COUNT(*) FROM temp_usuarios) > 0 DO
    SET @user_id = (SELECT id FROM temp_usuarios LIMIT 1);
    CALL sp_recalcular_usuario_stats(@user_id);
    DELETE FROM temp_usuarios WHERE id = @user_id;
END WHILE;
```

### **Inicializar estatísticas de TODOS os locais**

```sql
-- Executar uma vez após instalar o schema
INSERT INTO local_stats (local_id)
SELECT id FROM local
ON DUPLICATE KEY UPDATE local_id=local_id;

-- Recalcular todos (fazer em lotes)
SELECT CONCAT('CALL sp_recalcular_local_stats(', id, ');') 
FROM local;
-- Copiar e executar os resultados
```

---

## 💡 EXEMPLOS PRÁTICOS DE USO

### **Dashboard do Usuário**

```sql
-- Nome: Eric
-- Email: eric@example.com

-- 1. Informações do perfil
SELECT * FROM v_usuario_perfil_completo 
WHERE email = 'eric@example.com';

-- 2. Minhas categorias favoritas
SELECT 
    l.categoria,
    COUNT(*) AS total,
    AVG(a.nota) AS minha_nota_media
FROM avaliacao a
JOIN local l ON a.local_id = l.id
JOIN usuario u ON a.usuario_id = u.id
WHERE u.email = 'eric@example.com'
GROUP BY l.categoria
ORDER BY total DESC;

-- 3. Meus últimos 10 lugares avaliados
SELECT 
    l.nome,
    l.categoria,
    a.nota,
    a.comentario,
    a.created_at
FROM avaliacao a
JOIN local l ON a.local_id = l.id
JOIN usuario u ON a.usuario_id = u.id
WHERE u.email = 'eric@example.com'
ORDER BY a.created_at DESC
LIMIT 10;

-- 4. Minha posição no ranking
SELECT 
    (SELECT COUNT(*) + 1 
     FROM usuario_stats us2 
     WHERE us2.total_avaliacoes > us1.total_avaliacoes) AS minha_posicao,
    us1.total_avaliacoes,
    (SELECT COUNT(*) FROM usuario) AS total_usuarios
FROM usuario u
JOIN usuario_stats us1 ON u.id = us1.usuario_id
WHERE u.email = 'eric@example.com';
```

### **Buscar locais próximos e bem avaliados**

```sql
-- Localização: -11.8399, -55.5537 (exemplo)
-- Raio: 5km

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
```

### **Relatório mensal para o usuário**

```sql
-- Relatório do mês atual para eric@example.com

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

-- Detalhes das avaliações do mês
SELECT 
    l.nome,
    l.categoria,
    a.nota,
    a.comentario,
    a.created_at
FROM avaliacao a
JOIN usuario u ON a.usuario_id = u.id
JOIN local l ON a.local_id = l.id
WHERE u.email = 'eric@example.com'
    AND MONTH(a.created_at) = MONTH(CURDATE())
    AND YEAR(a.created_at) = YEAR(CURDATE())
ORDER BY a.created_at DESC;
```

---

## 🚀 PERFORMANCE

### **Índices criados para otimização:**

- ✅ Email de usuário (busca por email super rápida)
- ✅ Categoria de local (filtros por tipo)
- ✅ Nota de avaliação (rankings)
- ✅ Datas (análises temporais)
- ✅ Relacionamentos (joins otimizados)

### **Tabelas agregadas atualizam automaticamente via triggers:**

- Quando uma avaliação é criada → stats atualizam
- Quando uma visita é registrada → stats atualizam
- Quando dados são deletados → stats limpam

### **Tempo de resposta esperado:**

- Consultas simples: < 10ms
- Consultas com agregação: < 50ms
- Top rankings: < 100ms
- Análises complexas: < 500ms

---

## 📊 ESTRUTURA DE DADOS

### **Tabelas Principais:**
- `usuario` - Informações dos usuários
- `local` - Informações dos locais
- `avaliacao` - Avaliações feitas
- `visita` - Check-ins em locais
- `relatorio` - Relatórios gerados

### **Tabelas Analíticas:**
- `usuario_stats` - Estatísticas agregadas por usuário
- `local_stats` - Estatísticas agregadas por local
- `categoria_stats` - Estatísticas por categoria
- `categoria_top_locais` - Rankings de cada categoria
- `avaliacoes_daily` - Séries temporais diárias
- `usuarios_top_avaliadores` - Leaderboard

### **Views (Consultas prontas):**
- `v_usuario_perfil_completo` - Perfil completo do usuário
- `v_top_100_locais` - Top 100 melhores locais
- `v_top_locais_por_categoria` - Rankings por categoria
- `v_avaliacoes_recentes` - Avaliações recentes
- `v_stats_gerais` - Estatísticas gerais
- `v_usuarios_avaliaram_comida` - Quem avaliou comida
- `v_usuario_engajamento` - Análise de engajamento

### **Stored Procedures:**
- `sp_recalcular_usuario_stats` - Recalcular stats de usuário
- `sp_recalcular_local_stats` - Recalcular stats de local
- `sp_atualizar_categoria_rankings` - Atualizar rankings
- `sp_get_usuario_stats_by_email` - Buscar por email
- `sp_top_locais_categoria` - Top de uma categoria

---

## ✅ CHECKLIST DE INSTALAÇÃO

1. ✅ Executar `schema-analytics.sql` no MySQL
2. ✅ Inicializar estatísticas de usuários existentes
3. ✅ Inicializar estatísticas de locais existentes
4. ✅ Executar `CALL sp_atualizar_categoria_rankings();`
5. ✅ Testar consultas básicas
6. ✅ Verificar se triggers estão funcionando

---

## 🎓 DICAS DE USO

1. **Use sempre as views** para consultas frequentes - são otimizadas
2. **Consulte por email** - é indexado e único
3. **Use os stored procedures** - são mais rápidos que queries ad-hoc
4. **Atualize rankings periodicamente** - rodar `sp_atualizar_categoria_rankings()` 1x por dia
5. **Monitore o tamanho** das tabelas agregadas - fazer limpeza de dados antigos se necessário

---

## 📞 SUPORTE

Para adicionar novas consultas ou métricas, basta:

1. Criar uma nova VIEW com a consulta desejada
2. Ou criar um novo STORED PROCEDURE
3. Sempre usar os índices existentes para melhor performance

**Todas as informações estão relacionadas pelo email ou ID do usuário!** 🎯
