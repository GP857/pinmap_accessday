# 🚀 Deploy Gratuito no Vercel

Guia completo para hospedar o Painel de Acessos gratuitamente no Vercel.

---

## 📋 Pré-requisitos

1. Conta no GitHub (gratuita): https://github.com
2. Conta no Vercel (gratuita): https://vercel.com
3. Conta no PlanetScale ou Railway (banco MySQL gratuito)

---

## 🗄️ Passo 1: Configurar Banco de Dados Gratuito

### Opção A: PlanetScale (Recomendado)

1. Acesse https://planetscale.com
2. Crie uma conta gratuita
3. Clique em **"Create database"**
4. Nome: `access_chart_panel`
5. Região: Escolha a mais próxima (ex: AWS São Paulo)
6. Clique em **"Create database"**
7. Vá em **"Connect"** → **"Create password"**
8. Copie a **Connection String** (formato: `mysql://...`)
9. Guarde essa string - você vai precisar!

**Limites do plano gratuito:**
- 1 banco de dados
- 5 GB de armazenamento
- 1 bilhão de leituras/mês
- 10 milhões de escritas/mês
- **Suficiente para o projeto!**

### Opção B: Railway

1. Acesse https://railway.app
2. Crie uma conta gratuita
3. Clique em **"New Project"** → **"Provision MySQL"**
4. Copie as credenciais:
   - Host
   - Port
   - Database
   - Username
   - Password
5. Monte a connection string:
   ```
   mysql://username:password@host:port/database
   ```

**Limites do plano gratuito:**
- $5 de crédito/mês
- Suficiente para uso moderado

---

## 📦 Passo 2: Preparar Código para Deploy

### 2.1 Baixar Código do Projeto

Você tem duas opções:

**Opção A: Usar o painel de gerenciamento do Manus**
1. Vá em **"Code"** no painel lateral
2. Clique em **"Download All Files"**
3. Extraia o arquivo ZIP

**Opção B: Clonar via Git (se disponível)**
```bash
git clone <url-do-repositorio>
cd access_chart_panel
```

### 2.2 Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `access-chart-panel`
3. Visibilidade: **Public** (necessário para Vercel gratuito)
4. Clique em **"Create repository"**

### 2.3 Fazer Upload do Código

**Via GitHub Web (mais fácil):**
1. No repositório criado, clique em **"uploading an existing file"**
2. Arraste todos os arquivos do projeto
3. Commit message: "Initial commit"
4. Clique em **"Commit changes"**

**Via Git CLI:**
```bash
cd access_chart_panel
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/access-chart-panel.git
git push -u origin main
```

---

## 🌐 Passo 3: Deploy no Vercel

### 3.1 Conectar GitHub ao Vercel

1. Acesse https://vercel.com
2. Faça login com sua conta GitHub
3. Clique em **"Add New..."** → **"Project"**
4. Selecione o repositório `access-chart-panel`
5. Clique em **"Import"**

### 3.2 Configurar Variáveis de Ambiente

Na tela de configuração do projeto, vá em **"Environment Variables"** e adicione:

```env
# Banco de Dados
DATABASE_URL=mysql://seu-usuario:senha@host:porta/database

# JWT Secret (gere uma senha forte aleatória)
JWT_SECRET=sua-senha-super-secreta-aqui-min-32-caracteres

# OAuth (se usar autenticação Manus)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=seu-app-id

# App Info
VITE_APP_TITLE=Painel de Acessos Hora a Hora
VITE_APP_LOGO=/favicon.ico

# APIs Manus (opcional - para features avançadas)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua-chave-api
VITE_FRONTEND_FORGE_API_KEY=sua-chave-frontend
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=

# Owner Info (opcional)
OWNER_NAME=Seu Nome
OWNER_OPEN_ID=seu-id
```

**⚠️ Importante:**
- Substitua `DATABASE_URL` pela connection string do PlanetScale/Railway
- Gere um `JWT_SECRET` forte (mínimo 32 caracteres)
- As variáveis com `VITE_` são públicas (frontend)
- As sem `VITE_` são privadas (backend)

### 3.3 Configurar Build

O Vercel deve detectar automaticamente, mas confirme:

- **Framework Preset**: Other
- **Build Command**: `pnpm install && pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

### 3.4 Deploy!

1. Clique em **"Deploy"**
2. Aguarde 2-5 minutos
3. ✅ Deploy concluído!

Sua URL será algo como: `https://access-chart-panel.vercel.app`

---

## 🗃️ Passo 4: Configurar Banco de Dados

### 4.1 Executar Migrations

Após o primeiro deploy, você precisa criar as tabelas:

**Opção A: Via PlanetScale Console**
1. Acesse seu banco no PlanetScale
2. Vá em **"Console"**
3. Execute o SQL:

```sql
CREATE TABLE `hourlyAccesses` (
  `id` int AUTO_INCREMENT NOT NULL,
  `accessDate` timestamp NOT NULL,
  `hour` int NOT NULL,
  `minute` int NOT NULL DEFAULT 0,
  `dayOfWeek` int NOT NULL,
  `accessCount` int NOT NULL DEFAULT 0,
  `userId` varchar(64),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `hourlyAccesses_id` PRIMARY KEY(`id`)
);

CREATE TABLE `users` (
  `id` int AUTO_INCREMENT NOT NULL,
  `openId` varchar(64) NOT NULL,
  `name` text,
  `email` varchar(320),
  `loginMethod` varchar(64),
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `users_id` PRIMARY KEY(`id`),
  CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
```

**Opção B: Via Drizzle Kit (localmente)**
```bash
pnpm db:push
```

---

## 🔄 Passo 5: Configurar Sincronização Automática

### Problema: Vercel é Serverless

O Vercel usa **funções serverless** que não ficam rodando 24/7. A sincronização automática (timer de 5 minutos) **não vai funcionar** no Vercel.

### Solução: Usar Cron Job Externo

**Opção A: Vercel Cron Jobs (Recomendado)**

1. Crie o arquivo `vercel.json` na raiz do projeto:

```json
{
  "crons": [{
    "path": "/api/sync",
    "schedule": "*/5 * * * *"
  }]
}
```

2. Crie endpoint `/api/sync` que executa a sincronização

**Opção B: Cron-job.org (Gratuito)**

1. Acesse https://cron-job.org
2. Crie uma conta gratuita
3. Crie um novo cron job:
   - URL: `https://seu-app.vercel.app/api/sync`
   - Schedule: `*/5 * * * *` (a cada 5 minutos)
   - Método: GET ou POST

**Opção C: GitHub Actions (Gratuito)**

Crie `.github/workflows/sync.yml`:

```yaml
name: Sync Data
on:
  schedule:
    - cron: '*/5 * * * *'  # A cada 5 minutos
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Sync
        run: |
          curl -X POST https://seu-app.vercel.app/api/sync
```

---

## 📁 Passo 6: Upload do Arquivo JSON

Como o Vercel é serverless, você não pode salvar arquivos localmente. Opções:

### Opção A: Upload via API

1. Crie endpoint `/api/upload` que recebe o JSON
2. Processa e salva no banco
3. Configure o script Python para fazer POST para essa URL

### Opção B: S3/Storage Externo

1. Use AWS S3, Cloudflare R2 ou similar (gratuito até certo limite)
2. Script Python faz upload para S3
3. Vercel lê do S3 a cada 5 minutos

### Opção C: Banco de Dados Direto

**Melhor solução!**

1. Modifique o script Python para conectar **diretamente** no PlanetScale
2. Insere dados no banco MySQL
3. Vercel apenas lê do banco
4. Sem necessidade de arquivo JSON intermediário

---

## ✅ Checklist Final

- [ ] Banco de dados criado (PlanetScale ou Railway)
- [ ] Código no GitHub
- [ ] Deploy no Vercel concluído
- [ ] Variáveis de ambiente configuradas
- [ ] Tabelas criadas no banco
- [ ] Sincronização configurada (cron job)
- [ ] Testado acesso à URL pública
- [ ] Dados aparecendo no gráfico

---

## 🎯 Custos (Tudo Gratuito!)

| Serviço | Plano | Custo |
|---------|-------|-------|
| Vercel | Hobby | **$0/mês** |
| PlanetScale | Hobby | **$0/mês** |
| GitHub | Free | **$0/mês** |
| Cron-job.org | Free | **$0/mês** |
| **TOTAL** | | **$0/mês** 🎉 |

**Limites:**
- Vercel: 100 GB bandwidth/mês
- PlanetScale: 5 GB storage, 1B reads/mês
- Mais que suficiente para este projeto!

---

## 🔧 Troubleshooting

### Deploy falhou

**Erro:** `Build failed`
- Verifique logs no Vercel
- Confirme que todas as dependências estão no `package.json`
- Teste build localmente: `pnpm build`

### Banco não conecta

**Erro:** `Connection refused`
- Verifique `DATABASE_URL` nas variáveis de ambiente
- Confirme que o banco está ativo no PlanetScale
- Teste conexão localmente primeiro

### Dados não aparecem

**Erro:** Gráfico vazio
- Verifique se as tabelas foram criadas
- Confirme que há dados no banco (query SQL)
- Verifique logs do Vercel (aba "Functions")

### Sincronização não funciona

**Erro:** Dados não atualizam
- Confirme que o cron job está ativo
- Verifique logs do cron-job.org
- Teste endpoint `/api/sync` manualmente

---

## 📞 Próximos Passos

1. **Domínio Personalizado** (opcional):
   - Vá em Vercel → Settings → Domains
   - Adicione seu domínio (ex: `painel.pinmap.com.br`)
   - Configure DNS conforme instruções

2. **Monitoramento**:
   - Ative Vercel Analytics (gratuito)
   - Configure alertas de erro

3. **Backup**:
   - PlanetScale tem backup automático
   - Considere exportar dados periodicamente

---

## 🎉 Pronto!

Seu painel está no ar 24/7, totalmente gratuito!

**URL de exemplo:** `https://access-chart-panel.vercel.app`

Qualquer dúvida, consulte:
- Documentação Vercel: https://vercel.com/docs
- Documentação PlanetScale: https://planetscale.com/docs
- GitHub Issues do projeto

---

**Última atualização:** 30/11/2025
