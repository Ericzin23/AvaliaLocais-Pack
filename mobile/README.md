# AvaliaLocais Mobile (Expo)

## Rodar
```bash
npm i
npm start
```
Abra o **Expo Go** no celular e escaneie o QR.

A API deve estar em `http://localhost:8080` (ajuste `src/services/api.js` se necessário).

## Permissões
- Localização (GPS)
- Notificações
- Mídia (salvar cartão do Instagram)

### Smoke test do Google Places
Requisitos: Node 18+.  
Exemplo (Linux/Mac/Git Bash):
```bash
EXPO_PUBLIC_GMAPS_KEY="SUA_KEY" LAT="-11.860" LNG="-55.510" RADIUS="1500" npm run smoke:places


```

Windows (PowerShell):

```powershell
$env:EXPO_PUBLIC_GMAPS_KEY="SUA_KEY"; $env:LAT="-11.860"; $env:LNG="-55.510"; $env:RADIUS="1500"; npm run smoke:places
```

Saída esperada: status HTTP, status da API (OK/ZERO_RESULTS/REQUEST_DENIED), quantidade e tempo.


**Checklist de validação no PR**
- [ ] `npm run smoke:places` retorna `OK` e `results>0` para pelo menos um endpoint.
- [ ] Abrindo o app, os logs mostram `[fetch] ... -> 200` quando clico “restaurante/bar”.
- [ ] Pins aparecem no mapa e a lista preenche com nome/endereço/nota.

**Observação**
Depois que o smoke test confirmar `OK`, lembre de manter as chaves com restrições corretas (Android/iOS) e rebuild do app no SDK 54.
