# AvaliaLocais (Pack Completo)

Estrutura:
- **backend/** → Spring Boot (Java 21) + MySQL + Google Places + Relatórios `@Scheduled`
- **mobile/**  → Expo (React Native) + GPS + Mapa + Avaliação + Cartão para Instagram

## Como abrir no VS Code
1. Descompacte este arquivo ZIP.
2. Abra o VS Code e vá em **File → Open Folder…** e selecione a pasta **AvaliaLocais** (raiz).
3. No VS Code, abra dois terminais:
   - **Terminal 1 (backend):**
     ```bash
     cd backend
     # edite src/main/resources/application.properties:
     #   spring.datasource.username=SEU_USUARIO
     #   spring.datasource.password=SUA_SENHA
     #   google.places.apiKey=SUA_CHAVE
     mvn spring-boot:run
     ```
   - **Terminal 2 (mobile):**
     ```bash
     cd mobile
     npm i
     npm start
     ```

Swagger: http://localhost:8080/swagger-ui/index.html

Atenção:
- É necessário ter MySQL 8 rodando localmente.
- A chave do Google deve ser colada em `backend/src/main/resources/application.properties` (propriedade `google.places.apiKey`).

Bom uso! 🚀
