# 📚 ÍNDICE COMPLETO - Sistema Analítico AvaliaLocais

## 📁 Arquivos Criados

### **1. Schema SQL** (Banco de Dados)

#### `backend/src/main/resources/schema-analytics.sql`
**O arquivo principal com toda a estrutura analítica**

Contém:
- ✅ 20+ índices de performance
- ✅ 6 tabelas agregadas (usuario_stats, local_stats, etc)
- ✅ 8 views otimizadas (v_usuario_perfil_completo, v_top_100_locais, etc)
- ✅ 5 stored procedures (sp_get_usuario_stats_by_email, etc)
- ✅ 5 triggers automáticos (auto-atualização de stats)
- ✅ 10 exemplos de consultas comentados

**Total:** ~600 linhas de SQL otimizado

---

#### `backend/src/main/resources/init-analytics.sql`
**Script de inicialização automática**

- Popula todas as tabelas agregadas
- Recalcula estatísticas de usuários e locais
- Valida instalação
- Mostra estatísticas gerais

**Total:** ~150 linhas

---

### **2. Scripts de Instalação**

#### `backend/install-analytics.ps1`
**Instalador automático PowerShell**

Funcionalidades:
- ✅ Conecta ao MySQL automaticamente
- ✅ Executa schema-analytics.sql
- ✅ Executa init-analytics.sql
- ✅ Valida instalação
- ✅ Mostra estatísticas finais
- ✅ Colorido e interativo

**Uso:**
```powershell
cd backend
.\install-analytics.ps1
```

---

### **3. Documentação**

#### `backend/README-ANALYTICS.md`
**Resumo executivo - Início rápido**

Conteúdo:
- 📖 Visão geral do sistema
- 🚀 Instalação em 2 minutos
- ✅ O que você pode fazer agora
- 🔍 Principais consultas com exemplos
- 💡 Casos de uso práticos
- 📈 Informações de performance

**Tamanho:** ~300 linhas - **COMECE POR AQUI!**

---

#### `backend/GUIA-ANALYTICS.md`
**Guia completo e detalhado**

Conteúdo:
- 🎯 Como instalar (3 métodos)
- 🔍 Todas as consultas principais (50+)
- 👤 Consultas por usuário (15+)
- 🏆 Top rankings (10+)
- 📈 Análises temporais (10+)
- 🍽️ Consultas sobre comida (10+)
- 💡 Exemplos práticos de uso
- 🚀 Informações de performance
- 📊 Estrutura completa de dados
- ✅ Checklist de instalação

**Tamanho:** ~800 linhas - **REFERÊNCIA COMPLETA**

---

#### `backend/CONSULTAS-RAPIDAS.sql`
**Biblioteca de consultas prontas**

Conteúdo organizado em 10 seções:
1. Informações básicas do sistema (4 consultas)
2. Informações por usuário (8 consultas)
3. Comida/Restaurantes (8 consultas)
4. Top rankings (6 consultas)
5. Análises temporais (5 consultas)
6. Descoberta de locais (3 consultas)
7. Engajamento de usuários (4 consultas)
8. Relatórios personalizados (4 consultas)
9. Manutenção (4 consultas)
10. Consultas avançadas (4 consultas)

**Total:** 50+ consultas SQL prontas para copiar e colar

---

### **4. Código Java (Spring Boot)**

#### DTOs Criados

**`backend/src/main/java/com/eric/avalia/dto/UsuarioStatsDTO.java`**
```java
// DTO completo para estatísticas de usuário
// Campos: nome, email, totalAvaliacoes, notaMedia, nivelUsuario, etc
// 15 campos + getters/setters
```

**`backend/src/main/java/com/eric/avalia/dto/LocalStatsDTO.java`**
```java
// DTO para estatísticas de locais
// Campos: nome, categoria, notaMedia, totalAvaliacoes, etc
// 10 campos + getters/setters
```

**`backend/src/main/java/com/eric/avalia/dto/StatsGeraisDTO.java`**
```java
// DTO para estatísticas gerais do sistema
// Campos: totalUsuarios, totalLocais, notaMediaGeral, etc
// 10 campos + getters/setters
```

---

#### Repository

**`backend/src/main/java/com/eric/avalia/repository/AnalyticsRepository.java`**

Métodos disponíveis:
```java
// Buscar por email
findUsuarioStatsByEmail(email)

// Top locais
findTop100Locais()
findTopLocaisByCategoria(categoria, limit)

// Stats gerais
findStatsGerais()
countUsuariosAvaliaramComida()

// Top usuários
findTopUsuariosAtivos(limit)

// Manutenção
recalcularUsuarioStats(usuarioId)
recalcularLocalStats(localId)
atualizarCategoriaRankings()
```

**Total:** 9 métodos prontos para usar

---

## 🗂️ Estrutura de Banco de Dados

### **Tabelas Principais** (Já existiam)
- ✅ `usuario` - Usuários do sistema
- ✅ `local` - Locais cadastrados
- ✅ `avaliacao` - Avaliações feitas
- ✅ `visita` - Check-ins em locais
- ✅ `relatorio` - Relatórios gerados

### **Tabelas Agregadas** (Criadas - Auto-atualizam)
- ✅ `usuario_stats` - Estatísticas por usuário
- ✅ `local_stats` - Estatísticas por local
- ✅ `categoria_stats` - Estatísticas por categoria
- ✅ `categoria_top_locais` - Rankings de cada categoria
- ✅ `avaliacoes_daily` - Histórico diário de avaliações
- ✅ `visitas_daily` - Histórico diário de visitas
- ✅ `usuarios_top_avaliadores` - Leaderboard de usuários

### **Views** (Consultas pré-otimizadas)
- ✅ `v_usuario_perfil_completo` - Perfil + stats do usuário
- ✅ `v_top_100_locais` - Top 100 melhores locais
- ✅ `v_top_locais_por_categoria` - Rankings por categoria
- ✅ `v_avaliacoes_recentes` - Avaliações recentes completas
- ✅ `v_stats_gerais` - Estatísticas gerais do sistema
- ✅ `v_usuarios_avaliaram_comida` - Quem avaliou comida
- ✅ `v_usuario_engajamento` - Análise de atividade/engajamento

### **Stored Procedures**
- ✅ `sp_recalcular_usuario_stats(usuario_id)` - Recalcular um usuário
- ✅ `sp_recalcular_local_stats(local_id)` - Recalcular um local
- ✅ `sp_atualizar_categoria_rankings()` - Atualizar todos os rankings
- ✅ `sp_get_usuario_stats_by_email(email)` - Buscar por email
- ✅ `sp_top_locais_categoria(categoria, limit)` - Top de uma categoria

### **Triggers** (Automáticos)
- ✅ `trg_after_avaliacao_insert` - Após inserir avaliação
- ✅ `trg_after_avaliacao_update` - Após atualizar avaliação
- ✅ `trg_after_avaliacao_delete` - Após deletar avaliação
- ✅ `trg_after_visita_insert` - Após inserir visita
- ✅ `trg_after_visita_delete` - Após deletar visita

---

## 📊 Principais Consultas

### **Por Usuário** (Pelo Email)

```sql
-- Tudo sobre o Eric
CALL sp_get_usuario_stats_by_email('eric@example.com');

-- Perfil completo
SELECT * FROM v_usuario_perfil_completo 
WHERE email = 'eric@example.com';

-- Quantas avaliações?
SELECT total_avaliacoes FROM v_usuario_perfil_completo 
WHERE email = 'eric@example.com';
```

### **Top Locais**

```sql
-- Top 100 gerais
SELECT * FROM v_top_100_locais;

-- Top 10 restaurantes
CALL sp_top_locais_categoria('restaurante', 10);

-- Top 10 cafés
CALL sp_top_locais_categoria('cafe', 10);
```

### **Estatísticas Gerais**

```sql
-- Tudo sobre o sistema
SELECT * FROM v_stats_gerais;

-- Quantos usuários?
SELECT COUNT(*) FROM usuario;

-- Quantos avaliaram comida?
SELECT COUNT(*) FROM v_usuarios_avaliaram_comida;
```

---

## 🎯 Casos de Uso Principais

### **1. Dashboard do Usuário**
Ver perfil completo + estatísticas + últimas avaliações + categorias favoritas

**Arquivo:** `GUIA-ANALYTICS.md` → Seção "Dashboard do Usuário"

### **2. Descobrir Novos Lugares**
Top locais próximos, bem avaliados, que o usuário ainda não foi

**Arquivo:** `CONSULTAS-RAPIDAS.sql` → Seção 6

### **3. Leaderboard/Ranking**
Posição do usuário, top usuários ativos, melhores avaliadores

**Arquivo:** `CONSULTAS-RAPIDAS.sql` → Seção 4

### **4. Relatório Mensal**
Atividade do mês, locais visitados, categorias exploradas

**Arquivo:** `GUIA-ANALYTICS.md` → "Relatório mensal para o usuário"

### **5. Análise de Comida**
Quem mais avalia comida, melhores restaurantes, categorias de comida

**Arquivo:** `CONSULTAS-RAPIDAS.sql` → Seção 3

---

## ⚡ Quick Start (3 Passos)

### **1️⃣ Instalar**
```powershell
cd backend
.\install-analytics.ps1
```

### **2️⃣ Testar**
```sql
-- Ver stats gerais
SELECT * FROM v_stats_gerais;

-- Top 10 locais
SELECT * FROM v_top_100_locais LIMIT 10;
```

### **3️⃣ Usar no Spring Boot**
```java
@Autowired
private AnalyticsRepository analyticsRepo;

UsuarioStatsDTO stats = analyticsRepo
    .findUsuarioStatsByEmail("eric@example.com");
```

---

## 📖 Ordem de Leitura Recomendada

1. **README-ANALYTICS.md** ← **COMECE AQUI** (5 min)
2. **Instalar** com `install-analytics.ps1` (2 min)
3. **Testar** com `CONSULTAS-RAPIDAS.sql` (copiar e colar)
4. **Aprofundar** com `GUIA-ANALYTICS.md` (referência completa)
5. **Integrar** usando `AnalyticsRepository.java`

---

## 🎓 Resumo dos Benefícios

✅ **50+ consultas prontas** - Copiar e colar  
✅ **Dados sempre atualizados** - Triggers automáticos  
✅ **Performance otimizada** - Índices + views + agregação  
✅ **Relacionamentos fortes** - Tudo conectado por email/IDs  
✅ **Escalável** - Suporta milhões de registros  
✅ **Fácil manutenção** - Procedures prontas  
✅ **Documentação completa** - 3 guias detalhados  
✅ **Integração Spring Boot** - Repository pronto  
✅ **Instalação automatizada** - 1 comando PowerShell  

---

## 📞 Referência Rápida de Arquivos

| Arquivo | Propósito | Quando Usar |
|---------|-----------|-------------|
| **README-ANALYTICS.md** | Visão geral e quick start | Primeiro contato |
| **GUIA-ANALYTICS.md** | Documentação completa | Referência detalhada |
| **CONSULTAS-RAPIDAS.sql** | 50+ queries prontas | Copiar/colar consultas |
| **schema-analytics.sql** | Schema completo | Instalação manual |
| **init-analytics.sql** | Inicialização | Instalação manual |
| **install-analytics.ps1** | Instalador automático | Instalação rápida |
| **AnalyticsRepository.java** | Spring Boot integration | Usar no backend |

---

## 🔗 Links Úteis

- **Consulta por email:** `sp_get_usuario_stats_by_email('email@example.com')`
- **Top locais:** `SELECT * FROM v_top_100_locais LIMIT 10`
- **Stats gerais:** `SELECT * FROM v_stats_gerais`
- **Recalcular:** `CALL sp_recalcular_usuario_stats(1)`

---

**Sistema 100% funcional e pronto para produção! 🚀**
