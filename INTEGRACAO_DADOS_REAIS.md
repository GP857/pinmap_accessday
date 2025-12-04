# 📊 Integração com Dados Reais de Acessos

Este documento explica como integrar o painel com seus dados reais de acessos.

## 🔄 Como funciona atualmente

**Dados Simulados:**
- Os dados atuais são **simulados** e gerados pelo script `scripts/seed-data.ts`
- São inseridos diretamente no banco de dados MySQL
- Servem apenas para demonstração e testes

**Atualização Automática:**
- ✅ O painel **recarrega automaticamente a cada 5 minutos**
- ✅ Busca novos dados da API sempre que recarrega
- ✅ A linha de "Hoje" avança conforme novas horas são registradas

## 📥 Opções para Integrar Dados Reais

### Opção 1: Importação Manual (Recomendado para início)

Se você já tem dados de acessos em arquivo JSON (como o `eclub_db.dailyaccesses.json`):

1. **Criar script de importação:**
```bash
cd /home/ubuntu/access_chart_panel
pnpm tsx scripts/import-real-data.ts
```

2. **Estrutura esperada do JSON:**
```json
[
  {
    "date": "2025-11-30",
    "hour": 14,
    "accessCount": 235,
    "userId": "opcional"
  }
]
```

3. **Executar importação periodicamente** (cron job, por exemplo)

---

### Opção 2: API Webhook (Tempo Real)

Para receber dados em tempo real conforme os acessos acontecem:

1. **Criar endpoint para receber acessos:**

Edite `server/routers/access.ts` e adicione:

```typescript
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { hourlyAccesses } from "../../drizzle/schema";

export const accessRouter = router({
  // ... rotas existentes ...
  
  // Nova rota para registrar acesso
  registerAccess: publicProcedure
    .input(z.object({
      userId: z.string().optional(),
      timestamp: z.string().optional(), // ISO 8601 format
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco não disponível");

      const accessTime = input.timestamp ? new Date(input.timestamp) : new Date();
      const hour = accessTime.getHours();
      const dayOfWeek = accessTime.getDay();
      
      const accessDate = new Date(accessTime);
      accessDate.setHours(0, 0, 0, 0);

      // Incrementar contador de acessos para aquela hora
      await db.insert(hourlyAccesses).values({
        accessDate,
        hour,
        dayOfWeek,
        accessCount: 1,
        userId: input.userId || null,
      });

      return { success: true };
    }),
});
```

2. **Chamar a API sempre que houver um acesso:**

Do seu sistema de acessos (Pinmap, por exemplo):

```javascript
// Quando um usuário acessar
fetch('https://3000-i4d3ko3eamqvtvnvlsvxp-e14d44e3.manusvm.computer/api/trpc/access.registerAccess', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    timestamp: new Date().toISOString()
  })
});
```

---

### Opção 3: Integração com Google Analytics / Banco Existente

Se você já tem dados em outra fonte:

1. **Criar script de sincronização:**

```typescript
// scripts/sync-from-analytics.ts
import { getDb } from '../server/db';
import { hourlyAccesses } from '../drizzle/schema';

async function syncFromAnalytics() {
  const db = await getDb();
  if (!db) throw new Error("Banco não disponível");

  // Buscar dados do Google Analytics, MySQL, etc.
  const analyticsData = await fetchFromYourSource();

  // Inserir no banco
  for (const record of analyticsData) {
    await db.insert(hourlyAccesses).values({
      accessDate: new Date(record.date),
      hour: record.hour,
      dayOfWeek: new Date(record.date).getDay(),
      accessCount: record.count,
      userId: record.userId || null,
    });
  }

  console.log(`✅ ${analyticsData.length} registros sincronizados`);
}

syncFromAnalytics();
```

2. **Agendar execução periódica** (cron, por exemplo):

```bash
# Executar a cada 5 minutos
*/5 * * * * cd /home/ubuntu/access_chart_panel && pnpm tsx scripts/sync-from-analytics.ts
```

---

## 🗄️ Estrutura da Tabela

A tabela `hourlyAccesses` tem a seguinte estrutura:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | Chave primária auto-incrementada |
| accessDate | timestamp | Data do acesso (00:00:00) |
| hour | int | Hora do dia (0-23) |
| dayOfWeek | int | Dia da semana (0=Domingo, 6=Sábado) |
| accessCount | int | Número de acessos naquela hora |
| userId | varchar(64) | ID do usuário (opcional) |
| createdAt | timestamp | Data de criação do registro |
| updatedAt | timestamp | Data de atualização |

---

## ⚡ Otimização: Agregação de Dados

Para melhor performance, recomendo **agregar dados** ao invés de inserir cada acesso individualmente:

```typescript
// Ao invés de inserir 1 acesso por vez:
await db.insert(hourlyAccesses).values({ accessCount: 1, ... });

// Agregar e inserir/atualizar periodicamente:
await db.insert(hourlyAccesses).values({ accessCount: 150, ... })
  .onDuplicateKeyUpdate({ set: { accessCount: sql`accessCount + 150` } });
```

---

## 🔍 Monitoramento

Para verificar se os dados estão sendo inseridos:

```bash
# Acessar banco de dados
cd /home/ubuntu/access_chart_panel

# Executar query
pnpm tsx -e "
import { getDb } from './server/db';
import { hourlyAccesses } from './drizzle/schema';
const db = await getDb();
const result = await db.select().from(hourlyAccesses).limit(10);
console.log(result);
"
```

---

## 📞 Suporte

Para dúvidas sobre integração:
1. Verifique os logs do servidor: `pnpm dev`
2. Teste a API manualmente
3. Consulte a documentação do tRPC

---

## ✅ Checklist de Integração

- [ ] Decidir qual método de integração usar (Manual, Webhook, ou Sync)
- [ ] Configurar fonte de dados (JSON, API, Analytics, etc.)
- [ ] Criar script de importação/sincronização
- [ ] Testar inserção de dados
- [ ] Verificar se dados aparecem no painel
- [ ] Configurar execução automática (cron, webhook, etc.)
- [ ] Monitorar logs e performance
