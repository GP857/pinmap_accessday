# 🔗 Integração Completa com Dados Reais do Pinmap

Este documento explica como integrar o Painel de Acessos com os dados reais do Pinmap.

---

## 📋 Visão Geral

O painel agora possui uma interface completa de importação que processa o arquivo JSON exportado pela automação do Pinmap e converte automaticamente para intervalos de 30 minutos.

---

## 🚀 Como Usar

### Passo 1: Exportar Dados do Pinmap

Execute o script de automação do Pinmap:

```bash
cd /Users/gustavopinheiro/Desktop/PINMAP_OLD
python3 automacao_pinmap.py
```

Isso gerará o arquivo: `eclub_db.dailyaccesses.json`

### Passo 2: Acessar Interface de Importação

1. Abra o painel: `http://localhost:3000` (ou URL pública)
2. Clique no botão verde **"Importar Dados"** no cabeçalho
3. Você será redirecionado para `/import`

### Passo 3: Fazer Upload do Arquivo

1. Clique na área de upload ou arraste o arquivo `eclub_db.dailyaccesses.json`
2. Clique em **"Importar Dados"**
3. Aguarde o processamento (alguns segundos para ~17k registros)
4. Veja o resultado com estatísticas de importação

### Passo 4: Visualizar Dados Reais

1. Volte para o painel principal (clique no logo ou navegue para `/`)
2. Os gráficos agora exibem dados reais do Pinmap!

---

## 🔄 Processamento Automático

O sistema faz automaticamente:

1. **Conversão de Timezone**: UTC → GMT-3 (Brasil)
2. **Arredondamento**: Minutos → Intervalos de 30min (0 ou 30)
3. **Agrupamento**: Conta acessos por dia + hora + intervalo
4. **Substituição**: Remove dados simulados e insere dados reais

---

## 📊 Estrutura dos Dados

### Formato de Entrada (Pinmap)

```json
{
  "_id": { "$oid": "..." },
  "userId": "638914cd5003c644bb596787",
  "sequenceNumber": 1,
  "accessDay": { "$date": "2025-11-30T14:30:00.000Z" },
  "createdAt": { "$date": "2023-10-31T15:16:23.507Z" },
  "updatedAt": { "$date": "2025-11-30T14:30:00.000Z" },
  "__v": 0
}
```

### Formato de Saída (Banco)

```sql
CREATE TABLE hourlyAccesses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  accessDate TIMESTAMP NOT NULL,
  hour INT NOT NULL,
  minute INT NOT NULL DEFAULT 0,
  dayOfWeek INT NOT NULL,
  accessCount INT NOT NULL DEFAULT 0,
  userId VARCHAR(64),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🔧 Exemplo de Conversão

**Entrada:**
- `accessDay`: `2025-11-30T14:35:00.000Z` (UTC)

**Processamento:**
1. Converter para GMT-3: `11:35:00`
2. Arredondar minutos: `11:30` (< 30 → 0, >= 30 → 30)
3. Extrair dia da semana: `6` (Sábado)

**Saída:**
```sql
INSERT INTO hourlyAccesses (accessDate, hour, minute, dayOfWeek, accessCount)
VALUES ('2025-11-30', 11, 30, 6, 1);
```

---

## 📈 Estatísticas

A interface exibe:

- **Total de Registros**: Número de intervalos únicos no banco
- **Data Inicial**: Primeiro acesso registrado
- **Data Final**: Último acesso registrado

---

## ⚠️ Avisos Importantes

1. **Substituição Total**: A importação **substitui todos os dados** existentes no banco
2. **Backup**: Não há backup automático - salve um checkpoint antes de importar
3. **Tamanho**: Arquivos muito grandes (>100MB) podem demorar
4. **Formato**: Apenas arquivos `.json` no formato do MongoDB são aceitos

---

## 🔄 Automação Futura

Para automatizar completamente, você pode:

1. **Cron Job**: Executar `automacao_pinmap.py` periodicamente
2. **API Upload**: Criar script que faz POST direto para `/api/trpc/import.importPinmapData`
3. **Webhook**: Configurar Pinmap para enviar dados em tempo real

---

## 🐛 Solução de Problemas

### Erro: "Failed to import data"

- Verifique se o arquivo é válido JSON
- Confirme que o formato está correto (MongoDB export)

### Erro: "Database not available"

- Verifique se o servidor está rodando
- Confirme conexão com banco de dados

### Dados não aparecem no gráfico

- Verifique se a importação foi bem-sucedida
- Recarregue a página principal
- Aguarde 5 minutos para atualização automática

---

## 📞 Suporte

Se tiver problemas, verifique:

1. Logs do servidor: `pnpm dev` (terminal)
2. Console do navegador (F12)
3. Arquivo de teste: `server/import.test.ts`

---

## ✅ Checklist de Integração

- [ ] Automação do Pinmap rodando
- [ ] Arquivo `eclub_db.dailyaccesses.json` exportado
- [ ] Painel acessível em `localhost:3000`
- [ ] Upload do arquivo realizado
- [ ] Dados importados com sucesso
- [ ] Gráficos exibindo dados reais
- [ ] Estatísticas corretas na página de importação

---

**Última atualização**: 30/11/2025
