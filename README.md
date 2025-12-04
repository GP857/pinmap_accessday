# 📊 Painel de Acessos Hora a Hora

Sistema completo de visualização e análise de acessos hora a hora com comparações inteligentes e integração com o Pinmap.

## 🎯 Funcionalidades

### Comparações Disponíveis
- **Hoje x Ontem**: Comparação direta entre dois dias consecutivos
- **3 Dias**: Visualização de Hoje, Ontem e Anteontem simultaneamente
- **Média Segunda a Sexta**: Média calculada dos últimos 4 semanas de dias úteis

### Características
- ✅ Gráfico de linha interativo com Chart.js
- ✅ Cores e espessuras personalizadas por dataset
  - **Hoje**: Verde escuro (#16A34A) - linha grossa (3px)
  - **Ontem**: Azul (#3B82F6) - linha fina (2px)
  - **Anteontem**: Preto (#000000) - linha fina (2px)
  - **Média**: Vermelho (#DC2626) - linha grossa tracejada (3px)
- ✅ Recarregamento automático a cada 30 minutos
- ✅ Variação percentual hora a hora (verde para ganho, vermelho para perda)
- ✅ Interface responsiva e profissional
- ✅ Integração completa com Pinmap via modal

## 🚀 Instalação

### Pré-requisitos
- Node.js 22.x ou superior
- pnpm 10.x ou superior
- Banco de dados MySQL configurado

### Passos

1. **Instalar dependências**
```bash
cd /home/ubuntu/access_chart_panel
pnpm install
```

2. **Configurar variáveis de ambiente**
O projeto já vem com as variáveis configuradas automaticamente pelo sistema Manus.

3. **Aplicar schema do banco de dados**
```bash
pnpm db:push
```

4. **Popular banco com dados simulados** (opcional, para testes)
```bash
pnpm tsx scripts/seed-data.ts
```

5. **Importar dados reais** (se disponível)
```bash
pnpm tsx scripts/import-access-data.ts
```

6. **Iniciar servidor de desenvolvimento**
```bash
pnpm dev
```

O painel estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
access_chart_panel/
├── client/                 # Frontend React
│   └── src/
│       ├── pages/
│       │   └── AccessChart.tsx  # Componente principal do painel
│       └── App.tsx
├── server/                 # Backend Node.js + tRPC
│   ├── routers/
│   │   └── access.ts       # API de acessos
│   └── db.ts              # Configuração do banco
├── drizzle/               # Schema e migrações
│   └── schema.ts          # Definição das tabelas
├── scripts/               # Scripts utilitários
│   ├── seed-data.ts       # Gerar dados simulados
│   └── import-access-data.ts  # Importar dados reais
├── INTEGRACAO_PINMAP.md   # Guia de integração
└── README.md              # Este arquivo
```

## 🔌 Integração com Pinmap

Consulte o arquivo [INTEGRACAO_PINMAP.md](./INTEGRACAO_PINMAP.md) para instruções detalhadas de como integrar este painel ao sistema Pinmap.

### Resumo Rápido
1. Adicione o botão HTML na barra de ferramentas
2. Adicione os estilos CSS
3. Adicione as funções JavaScript
4. Configure a URL do iframe
5. Teste a integração

## 🗄️ Estrutura do Banco de Dados

### Tabela: `hourlyAccesses`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | int | Chave primária auto-incrementada |
| accessDate | timestamp | Data do acesso (sem hora) |
| hour | int | Hora do dia (0-23) |
| dayOfWeek | int | Dia da semana (0=Domingo, 6=Sábado) |
| accessCount | int | Número de acessos naquela hora |
| userId | varchar(64) | ID do usuário (opcional) |
| createdAt | timestamp | Data de criação do registro |
| updatedAt | timestamp | Data de atualização do registro |

## 🧪 Testes

Executar todos os testes:
```bash
pnpm test
```

Executar testes em modo watch:
```bash
pnpm test:watch
```

## 📊 API Endpoints

### `access.getComparativeData`
Busca dados comparativos de Hoje, Ontem e Anteontem.

**Input:**
```typescript
{
  referenceDate?: string  // Formato: YYYY-MM-DD (opcional, padrão: hoje)
}
```

**Output:**
```typescript
{
  today: Array<{ hour: number, accessCount: number }>,
  yesterday: Array<{ hour: number, accessCount: number }>,
  dayBeforeYesterday: Array<{ hour: number, accessCount: number }>
}
```

### `access.getWeekdayAverage`
Calcula média de acessos de segunda a sexta por hora.

**Input:**
```typescript
{
  weeks?: number  // Número de semanas (padrão: 4)
}
```

**Output:**
```typescript
Array<{ hour: number, accessCount: number }>
```

## 🎨 Personalização

### Alterar Cores das Linhas
Edite o arquivo `client/src/pages/AccessChart.tsx`:

```typescript
// Hoje (Verde escuro)
borderColor: "rgb(22, 163, 74)",

// Ontem (Azul)
borderColor: "rgb(59, 130, 246)",

// Anteontem (Preto)
borderColor: "rgb(0, 0, 0)",

// Média (Vermelho)
borderColor: "rgb(220, 38, 38)",
```

### Alterar Intervalo de Atualização
Por padrão, o painel recarrega a cada 30 minutos. Para alterar:

```typescript
// Em AccessChart.tsx
const interval = setInterval(() => {
  // ...
}, 30 * 60 * 1000); // Altere 30 para o número de minutos desejado
```

## 🐛 Troubleshooting

### Dados não aparecem no gráfico
1. Verifique se o banco de dados tem dados: `pnpm tsx scripts/seed-data.ts`
2. Verifique o console do navegador para erros
3. Verifique se a API está respondendo corretamente

### Erro de conexão com banco de dados
1. Verifique as variáveis de ambiente
2. Certifique-se de que o banco MySQL está rodando
3. Execute `pnpm db:push` para aplicar o schema

### Modal não abre no Pinmap
1. Verifique se as funções JavaScript foram adicionadas corretamente
2. Verifique o console do navegador para erros
3. Certifique-se de que a URL do iframe está correta

## 📝 Licença

Este projeto foi desenvolvido para uso interno.

## 🤝 Suporte

Para dúvidas ou problemas, consulte a documentação ou entre em contato com a equipe de desenvolvimento.
