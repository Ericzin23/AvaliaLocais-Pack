# AvaliaLocais Backend (Spring Boot, Java 21)

## 🎯 Novidade: Sistema Analítico Completo! 📊

**NOVO!** Sistema de análise de dados com relacionamentos fortes e consultas otimizadas.

👉 **[Ver Sistema Analítico](README-ANALYTICS.md)** ← COMECE AQUI!

### Quick Start Analytics:
```powershell
cd backend
.\install-analytics.ps1
```

**Recursos:**
- ✅ 50+ consultas prontas (top locais, stats de usuários, etc)
- ✅ Busca por email: `CALL sp_get_usuario_stats_by_email('email@exemplo.com')`
- ✅ Top rankings automáticos
- ✅ Dados sempre atualizados (triggers)
- ✅ Integração Spring Boot pronta

**Documentação:**
- 📖 [README-ANALYTICS.md](README-ANALYTICS.md) - Início rápido
- 📚 [GUIA-ANALYTICS.md](GUIA-ANALYTICS.md) - Guia completo
- 🔍 [CONSULTAS-RAPIDAS.sql](CONSULTAS-RAPIDAS.sql) - 50+ queries
- 📑 [INDICE-COMPLETO.md](INDICE-COMPLETO.md) - Índice de tudo

---

## Requisitos
- Java 21
- Maven 3.9+
- MySQL 8+

## Configuração
1. Crie um banco de dados ou use o auto-create:
   - Edite `src/main/resources/application.properties`:
     - `spring.datasource.url=jdbc:mysql://localhost:3306/avalia_db...`
     - `spring.datasource.username` e `spring.datasource.password`
   - Coloque sua **Google Places API Key** em `google.places.apiKey`.

2. Rodar:
```bash
mvn spring-boot:run
```

## Endpoints principais
- `POST /auth/register` {nome, email, senha, dataNascimento, genero}
- `POST /auth/login` {email, senha}
- `POST /auth/forgot` {email, dataNascimento, novaSenha}
- `GET /locais/nearby?lat=&lng=&categoria=&radius=`
- `GET /locais/{id}`
- `POST /avaliacoes` (headers: `X-User-Email`) {localId, nota(0..10), comentario, fotoUrl}
- `GET /avaliacoes/local/{localId}`
- `GET /avaliacoes/usuario/{usuarioId}`
- `PUT /avaliacoes/{id}` (headers: `X-User-Email`)
- `DELETE /avaliacoes/{id}` (headers: `X-User-Email`)
- `GET /perfil/me` (headers: `X-User-Email`)
- `GET /relatorios/top?periodo=SEMANA|FDS`

Swagger: `http://localhost:8080/swagger-ui/index.html`
