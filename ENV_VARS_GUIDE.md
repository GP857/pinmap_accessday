# 🔐 Guia de Variáveis de Ambiente para Vercel

Este arquivo lista todas as variáveis de ambiente necessárias para o deploy no Vercel.

---

## ✅ Variáveis OBRIGATÓRIAS

### DATABASE_URL
**Descrição:** Connection string do banco MySQL  
**Onde obter:** PlanetScale ou Railway (veja DEPLOY_VERCEL.md)  
**Formato:** `mysql://usuario:senha@host:porta/database`  
**Exemplo:**
```
mysql://user123:pass456@aws.connect.psdb.cloud/access_chart_panel?sslaccept=strict
```

### JWT_SECRET
**Descrição:** Chave secreta para assinar tokens JWT  
**Onde obter:** Gere uma senha forte aleatória  
**Formato:** String com mínimo 32 caracteres  
**Como gerar:**
```bash
# Linux/Mac
openssl rand -base64 32

# Ou use um gerador online
https://randomkeygen.com/
```
**Exemplo:**
```
aB3dF6hJ9kL2mN5pQ8rS1tU4vW7xY0zA
```

---

## 📱 Variáveis RECOMENDADAS

### VITE_APP_TITLE
**Descrição:** Título do aplicativo (aparece no navegador)  
**Valor padrão:** `Painel de Acessos Hora a Hora`  
**Exemplo:**
```
Painel de Acessos Hora a Hora
```

### VITE_APP_LOGO
**Descrição:** Caminho do logo/favicon  
**Valor padrão:** `/favicon.ico`  
**Exemplo:**
```
/favicon.ico
```

---

## 🔧 Variáveis OPCIONAIS

Estas variáveis são necessárias apenas se você quiser usar recursos avançados:

### OAuth Manus (Autenticação)
```
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=seu-app-id
```

### APIs Manus (LLM, Storage, etc)
```
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua-chave-backend
VITE_FRONTEND_FORGE_API_KEY=sua-chave-frontend
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
```

### Analytics
```
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```

### Owner Info
```
OWNER_NAME=Seu Nome
OWNER_OPEN_ID=seu-id
```

---

## 🚀 Como Adicionar no Vercel

### Via Interface Web (Recomendado)

1. Acesse seu projeto no Vercel
2. Vá em **Settings** → **Environment Variables**
3. Para cada variável:
   - **Key**: Nome da variável (ex: `DATABASE_URL`)
   - **Value**: Valor da variável
   - **Environments**: Marque `Production`, `Preview`, `Development`
4. Clique em **Save**

### Via Vercel CLI

```bash
vercel env add DATABASE_URL
# Cole o valor quando solicitado

vercel env add JWT_SECRET
# Cole o valor quando solicitado
```

---

## ⚠️ IMPORTANTE

### Variáveis Públicas vs Privadas

**Públicas (com prefixo `VITE_`):**
- São expostas no frontend (JavaScript do navegador)
- Qualquer pessoa pode ver no código fonte
- Use apenas para valores não-sensíveis
- Exemplos: `VITE_APP_TITLE`, `VITE_APP_LOGO`

**Privadas (sem prefixo `VITE_`):**
- Ficam apenas no backend (servidor)
- Nunca são expostas ao navegador
- Use para dados sensíveis
- Exemplos: `DATABASE_URL`, `JWT_SECRET`

### Segurança

✅ **NUNCA** commite valores reais no Git  
✅ **NUNCA** compartilhe `DATABASE_URL` ou `JWT_SECRET`  
✅ **SEMPRE** use valores diferentes em produção e desenvolvimento  
✅ **SEMPRE** regenere secrets se houver vazamento  

---

## 📋 Checklist de Configuração

Antes de fazer deploy, confirme:

- [ ] `DATABASE_URL` configurada com banco válido
- [ ] `JWT_SECRET` gerada (mínimo 32 caracteres)
- [ ] `VITE_APP_TITLE` definido (opcional)
- [ ] `VITE_APP_LOGO` definido (opcional)
- [ ] Todas as variáveis salvas no Vercel
- [ ] Testado deploy com as variáveis

---

## 🔍 Como Testar

### 1. Verificar se variáveis estão carregadas

Adicione temporariamente no código (remova depois!):

```typescript
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
```

### 2. Verificar logs do Vercel

1. Vá em **Deployments**
2. Clique no deployment mais recente
3. Vá em **Functions** → Veja os logs
4. Procure por erros de conexão ou variáveis faltando

### 3. Testar conexão com banco

Acesse: `https://seu-app.vercel.app/api/trpc/sync.getStatus`

Se retornar `{"status":"ok"}`, está funcionando!

---

## 🆘 Problemas Comuns

### Erro: "DATABASE_URL is not defined"

**Solução:**
1. Verifique se a variável está no Vercel (Settings → Environment Variables)
2. Confirme que marcou "Production"
3. Faça um novo deploy (Deployments → Redeploy)

### Erro: "Connection refused"

**Solução:**
1. Verifique se o formato da `DATABASE_URL` está correto
2. Confirme que o banco está ativo (PlanetScale/Railway)
3. Teste a connection string localmente primeiro

### Erro: "Invalid JWT_SECRET"

**Solução:**
1. Gere uma nova secret com mínimo 32 caracteres
2. Atualize no Vercel
3. Faça redeploy

---

**Última atualização:** 30/11/2025
