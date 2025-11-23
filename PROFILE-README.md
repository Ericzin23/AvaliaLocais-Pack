# 🎯 Avalia Locais - Profile Screen Complete

## ✨ Atualizações Realizadas

### 📱 **Mobile - ProfileScreen.js**

**Tela de Perfil completamente redesenhada com:**

#### 1. **Upload de Foto de Perfil**
- Seleção de foto da galeria com `expo-image-picker`
- Upload automático para o servidor
- **Persistência no banco de dados** via campo `fotoUrl` na tabela `usuario`
- Preview da foto com placeholder quando não há foto
- Badge de câmera para indicar possibilidade de alteração
- Validação no backend (apenas imagens, máximo 5MB)

#### 2. **Informações do Usuário**
Exibe de forma organizada:
- Nome
- Email
- Data de Nascimento (se disponível)
- Gênero (se disponível)
- Ícones Ionicons para cada campo

#### 3. **Estatísticas do Usuário**
Seção expansível com:
- **Total de Avaliações** - Quantidade total de reviews
- **Nota Média** - Média calculada de todas as avaliações
- **Locais Visitados** - Quantidade de locais únicos avaliados
- **Categoria Favorita** - Categoria mais avaliada pelo usuário
- **Distribuição por Categoria** - Lista completa com contagem

#### 4. **Design & UX**
- Dark theme consistente (#0F172A background)
- Cores de destaque: Verde (#22C55E) e acentos coloridos
- Cards com bordas arredondadas
- Animações suaves
- SafeAreaView para diferentes dispositivos
- ScrollView para conteúdo extenso

---

### 🖥️ **Backend - Novos Endpoints**

#### `PerfilController.java`

**`GET /perfil/me`**
- Retorna dados completos do perfil (sem senha)
- Campos: id, nome, email, fotoUrl, dataNascimento, genero, createdAt
- Header: `X-User-Email`

**`PUT /perfil/foto`**
- Atualiza URL da foto de perfil no banco
- Persiste em `usuario.fotoUrl`
- Body: `{ "fotoUrl": "/uploads/perfil/..." }`
- Header: `X-User-Email`

**`PUT /perfil/atualizar`**
- Atualiza informações do perfil
- Campos editáveis: nome, dataNascimento, genero
- Body: JSON com campos a atualizar
- Header: `X-User-Email`

#### `UploadController.java`

**`POST /upload/foto-perfil`**
- Upload dedicado para fotos de perfil
- Validações:
  - Apenas arquivos de imagem
  - Tamanho máximo: 5MB
- Salvamento: `/uploads/perfil/perfil_{email}_{timestamp}.ext`
- Retorna: `{ "url": "/uploads/perfil/...", "filename": "...", "size": ... }`
- Header: `X-User-Email`

---

### 🎨 **App.js - Tab Bar Atualizada**

- ✅ Tabs renomeadas para **português**: "Início" e "Perfil"
- ✅ Ícones Ionicons adicionados:
  - `home` / `home-outline` para tab Início
  - `person` / `person-outline` para tab Perfil
- ✅ Cores:
  - Ativo: Verde #22C55E
  - Inativo: Cinza #9CA3AF
  - Background: Dark #0F172A
  - Borda: #1E293B

---

## 🗄️ **Persistência no Banco de Dados**

### Tabela `usuario`
A foto de perfil é persistida no campo:
```sql
fotoUrl VARCHAR(500) -- Armazena caminho relativo: /uploads/perfil/...
```

### Fluxo Completo:
1. **Usuário** seleciona foto na galeria
2. **App** envia arquivo via `FormData` para `POST /upload/foto-perfil`
3. **Backend** salva arquivo em `/uploads/perfil/` e retorna URL
4. **App** chama `PUT /perfil/foto` com a URL recebida
5. **Backend** atualiza `usuario.fotoUrl` no banco
6. **Foto persiste** mesmo após logout ou reinstalação do app

---

## 🚀 **Como Executar**

### Opção 1: Script Automático (Recomendado)
```powershell
.\start-all.ps1
```
Este script:
- Inicia backend (porta 8080)
- Aguarda 15s para backend inicializar
- Inicia Expo DevTools
- Ao encerrar Expo (Ctrl+C), para backend automaticamente

### Opção 2: Manual

**Terminal 1 - Backend:**
```powershell
cd backend
mvn compile exec:java -Dexec.mainClass="com.eric.avalia.AvaliaLocaisApplication"
```

**Terminal 2 - Mobile:**
```powershell
cd mobile
npm start
```

---

## 📸 **Testando Upload de Foto**

1. Faça login no app
2. Vá para a tab "Perfil"
3. Toque na foto de perfil (círculo com ícone de pessoa)
4. Selecione uma foto da galeria
5. Aguarde o upload (spinner aparece durante processo)
6. Foto será exibida e **salva permanentemente no banco**
7. Saia do app e entre novamente - a foto permanece! ✨

---

## 📊 **Estatísticas Exibidas**

As estatísticas são calculadas em tempo real a partir das avaliações do usuário:

- **Total Avaliações**: `COUNT(*)` de `avaliacao` onde `usuario_id = user.id`
- **Nota Média**: `AVG(nota)` de todas as avaliações do usuário
- **Locais Únicos**: `COUNT(DISTINCT local_id)` das avaliações
- **Categoria Favorita**: Categoria com maior número de avaliações
- **Por Categoria**: Agrupamento `GROUP BY local.categoria`

**Futuro:** Integração com views analytics (`v_usuario_perfil_completo`) para estatísticas avançadas.

---

## 🔧 **Estrutura de Arquivos Modificados**

```
AvaliaLocais-Pack/
├── start-all.ps1                          # ✨ NOVO - Script de inicialização
├── PROFILE-README.md                      # ✨ NOVO - Esta documentação
├── mobile/
│   ├── package.json                       # expo-image-picker já incluído
│   └── src/
│       ├── App.js                         # ✏️ MODIFICADO - Tab bar português
│       └── screens/
│           └── ProfileScreen.js           # 🔄 REDESENHADO - Tela completa
└── backend/
    └── src/main/java/com/eric/avalia/
        ├── controller/
        │   ├── PerfilController.java      # ✏️ MODIFICADO - Novos endpoints
        │   └── UploadController.java      # ✏️ MODIFICADO - Upload foto perfil
        └── entity/
            └── Usuario.java               # fotoUrl já existe
```

---

## ✅ **Checklist de Funcionalidades**

- [x] Upload de foto de perfil
- [x] Persistência da foto no banco de dados (campo `usuario.fotoUrl`)
- [x] Exibição de informações do usuário (nome, email, etc)
- [x] Estatísticas em tempo real (avaliações, nota média, locais)
- [x] Categoria favorita calculada dinamicamente
- [x] Distribuição de avaliações por categoria
- [x] Logout com confirmação
- [x] Tab bar em português com ícones
- [x] Dark theme consistente
- [x] Validações no backend (tipo arquivo, tamanho)
- [x] Endpoints REST completos e documentados
- [x] Script de inicialização automática

---

## 🎯 **Próximos Passos Sugeridos**

1. **Integrar Analytics Avançados**
   - Usar view `v_usuario_perfil_completo` 
   - Exibir nível do usuário (NOVATO, EXPERT, etc)
   - Mostrar ranking e posição

2. **Edição de Perfil**
   - Tela para editar nome, data nascimento, gênero
   - Usar endpoint `PUT /perfil/atualizar`

3. **Histórico de Avaliações**
   - Seção mostrando últimas avaliações do usuário
   - Link para detalhes de cada local avaliado

4. **Badges e Conquistas**
   - Sistema de gamificação
   - Badges persistidos no banco

---

## 📝 **Notas Técnicas**

- **Expo Image Picker** já estava instalado (`expo-image-picker@~17.0.8`)
- Backend compilado com **Java 21** e **Spring Boot 3.5.0**
- Banco de dados **MySQL 8.0** (`banco_avaliacoes_final`)
- Fotos salvas em diretório `/uploads/perfil/` no servidor
- URLs de foto são **relativas** para portabilidade

---

## 🐛 **Troubleshooting**

**Erro: "Permissão necessária"**
- O app solicitará permissão para acessar fotos
- Conceda a permissão nas configurações do dispositivo/emulador

**Erro: "Não foi possível atualizar a foto"**
- Verifique se backend está rodando (porta 8080)
- Confirme conexão de rede entre app e backend
- Cheque logs do backend para detalhes

**Foto não aparece após upload**
- Confirme que diretório `/uploads/perfil/` existe no backend
- Verifique permissões de escrita no servidor
- Consulte tabela `usuario` para confirmar `fotoUrl` foi salvo

---

**Desenvolvido com ❤️**  
Todas as funcionalidades implementadas com persistência em banco de dados relacional.
