# 🚀 Guia Rápido - Novas Funcionalidades

## 📖 Como Usar as Melhorias Implementadas

---

## 1. 📦 Importando Constantes

### Antes:

```javascript
if (type === "compra") { ... }
if (theme === "dark") { ... }
const key = "capital_trader_state";
```

### Agora:

```javascript
import { OPERATION_TYPES, THEMES, STORAGE } from './config/constants.js';

if (type === OPERATION_TYPES.BUY) { ... }
if (theme === THEMES.DARK) { ... }
const key = STORAGE.KEY;
```

---

## 2. ✅ Validações

### Validar Números

```javascript
import {
  isValidNumber,
  isPositiveNumber,
  toSafeNumber,
} from "./utils/validators.js";

// Validar
if (isValidNumber(value)) {
  console.log("Número válido!");
}

// Validar positivo
if (isPositiveNumber(amount)) {
  console.log("Valor positivo!");
}

// Conversão segura (retorna 0 se inválido)
const safeValue = toSafeNumber(input.value);
```

### Validar Operações

```javascript
import { validateOperation } from "./utils/validators.js";

const operation = {
  assetSymbol: "PETR4",
  quantity: 100,
  entryValue: 28.5,
  date: "2025-10-15",
  operationType: "compra",
};

const { valid, errors } = validateOperation(operation);

if (!valid) {
  console.error("Erros:", errors);
  // ['Símbolo do ativo inválido', 'Quantidade inválida', ...]
}
```

### Validar Símbolos

```javascript
import { isValidSymbol, sanitizeSymbol } from "./utils/validators.js";

// Validar
if (isValidSymbol("PETR4")) {
  console.log("Símbolo válido!");
}

// Sanitizar (remove espaços, converte para maiúsculas)
const clean = sanitizeSymbol("  petr4  "); // "PETR4"
```

---

## 3. 🛠️ Helpers

### Gerar ID Único

```javascript
import { generateUniqueId } from "./utils/helpers.js";

const id = generateUniqueId();
// "1729000000000-abc123def"
```

### Debounce

```javascript
import { debounce } from "./utils/helpers.js";

const debouncedSearch = debounce((query) => {
  // Busca executada apenas após 300ms sem novas chamadas
  performSearch(query);
}, 300);

input.addEventListener("input", (e) => {
  debouncedSearch(e.target.value);
});
```

### Agrupar Arrays

```javascript
import { groupBy } from "./utils/helpers.js";

const operations = [
  { symbol: "PETR4", type: "compra" },
  { symbol: "VALE3", type: "venda" },
  { symbol: "PETR4", type: "venda" },
];

const grouped = groupBy(operations, "symbol");
// {
//   PETR4: [{ symbol: 'PETR4', type: 'compra' }, { symbol: 'PETR4', type: 'venda' }],
//   VALE3: [{ symbol: 'VALE3', type: 'venda' }]
// }
```

### Formatar Número Compacto

```javascript
import { formatCompactNumber } from "./utils/helpers.js";

formatCompactNumber(1500); // "1.5K"
formatCompactNumber(1500000); // "1.5M"
formatCompactNumber(850); // "850"
```

### Copiar para Clipboard

```javascript
import { copyToClipboard } from "./utils/helpers.js";

async function handleCopy() {
  const success = await copyToClipboard("Texto copiado!");
  if (success) {
    console.log("Copiado com sucesso!");
  }
}
```

---

## 4. 📅 Funções de Data

### Verificar se é Hoje

```javascript
import { isToday } from "./utils/dates.js";

if (isToday("2025-10-15")) {
  console.log("É hoje!");
}
```

### Adicionar/Subtrair Dias

```javascript
import { addDays, toISODateLocal } from "./utils/dates.js";

const hoje = new Date();
const amanha = addDays(hoje, 1);
const ontem = addDays(hoje, -1);
const proximaSemana = addDays(hoje, 7);

console.log(toISODateLocal(amanha)); // "2025-10-16"
```

### Formatar Data Relativa

```javascript
import { formatRelativeDate } from "./utils/dates.js";

formatRelativeDate(new Date()); // "Hoje"
formatRelativeDate(addDays(new Date(), -1)); // "Ontem"
formatRelativeDate(addDays(new Date(), -3)); // "Há 3 dias"
formatRelativeDate(addDays(new Date(), -10)); // "Há 1 semanas"
```

### Diferença entre Datas

```javascript
import { getDaysDifference } from "./utils/dates.js";

const dias = getDaysDifference("2025-10-01", "2025-10-15");
console.log(`${dias} dias de diferença`); // "14 dias de diferença"
```

---

## 5. 💰 Formatação

### Moeda

```javascript
import { formatCurrency, formatMoney } from "./utils/format.js";

formatCurrency(1500.5); // "R$ 1.500,50"
formatCurrency(1500.5, false); // "1.500,50"
formatMoney(1500.5); // "1.500,50" (sem R$)
```

### Percentual

```javascript
import { formatPercent } from "./utils/format.js";

formatPercent(0.15); // "15,00%"
formatPercent(0.1567, 1); // "15,7%"
```

### Quantidade

```javascript
import { formatQuantity } from "./utils/format.js";

formatQuantity(1500); // "1.500"
formatQuantity(100.5); // "101" (arredonda)
```

### Tabelas

```javascript
import { formatForTable } from "./utils/format.js";

formatForTable(1500, "currency"); // "R$ 1.500,00"
formatForTable(0.15, "percent"); // "15,00%"
formatForTable(1500, "quantity"); // "1.500"
```

---

## 6. 💼 Contabilidade

### Calcular Total Investido

```javascript
import { calculateTotalInvested } from "./services/accounting.js";
import { appState } from "./state.js";

const totalInvestido = calculateTotalInvested(appState);
console.log(`Total investido: R$ ${totalInvestido.toFixed(2)}`);
```

### Calcular Total de Vendas

```javascript
import { calculateTotalSales } from "./services/accounting.js";
import { appState } from "./state.js";

const totalVendas = calculateTotalSales(appState);
console.log(`Total em vendas: R$ ${totalVendas.toFixed(2)}`);
```

### Calcular Lucro/Prejuízo

```javascript
import {
  calculateTotalInvested,
  calculateTotalSales,
} from "./services/accounting.js";
import { appState } from "./state.js";

const investido = calculateTotalInvested(appState);
const vendas = calculateTotalSales(appState);
const resultado = vendas - investido;

if (resultado > 0) {
  console.log(`Lucro: R$ ${resultado.toFixed(2)}`);
} else {
  console.log(`Prejuízo: R$ ${Math.abs(resultado).toFixed(2)}`);
}
```

---

## 7. 💾 Storage

### Obter Informações do Storage

```javascript
import { getStorageInfo } from "./services/storage/index.js";

const info = getStorageInfo();
if (info) {
  console.log("Versão:", info.version);
  console.log("Tamanho:", info.size, "bytes");
  console.log("Última modificação:", info.lastModified);
}
```

---

## 8. 🎨 Temas

### Verificar Tema Atual

```javascript
import { getThemeInfo } from "./utils/theme.js";

const themeInfo = getThemeInfo();
console.log("Tema atual:", themeInfo.current);
console.log("É escuro?", themeInfo.isDark);
console.log("Próximo tema:", themeInfo.next);
```

---

## 9. 📋 Exemplos Práticos

### Validar e Processar Formulário

```javascript
import {
  validateOperation,
  toSafeNumber,
  sanitizeSymbol,
} from "./utils/validators.js";

function processarFormulario(formData) {
  // Sanitizar e converter dados
  const operation = {
    assetSymbol: sanitizeSymbol(formData.symbol),
    quantity: toSafeNumber(formData.quantity),
    entryValue: toSafeNumber(formData.price),
    date: formData.date,
    operationType: formData.type,
  };

  // Validar
  const { valid, errors } = validateOperation(operation);

  if (!valid) {
    console.error("Erros de validação:", errors);
    return false;
  }

  // Processar operação válida
  // ...
  return true;
}
```

### Busca com Debounce

```javascript
import { debounce } from "./utils/helpers.js";
import { API } from "./config/constants.js";

const buscarAtivos = debounce(async (query) => {
  if (query.length < API.AUTOCOMPLETE_MIN_CHARS) return;

  try {
    const response = await fetch(`/api/search?q=${query}`);
    const data = await response.json();
    // Processar resultados...
  } catch (error) {
    console.error("Erro na busca:", error);
  }
}, API.AUTOCOMPLETE_DEBOUNCE_MS);

// Usar no input
input.addEventListener("input", (e) => {
  buscarAtivos(e.target.value);
});
```

### Filtrar e Agrupar Operações

```javascript
import { groupBy, sortBy } from "./utils/helpers.js";
import { formatDateBR, formatCurrency } from "./utils/index.js";

function mostrarOperacoesPorAcao(operations) {
  // Agrupar por ativo
  const grouped = groupBy(operations, "assetSymbol");

  // Para cada ativo
  Object.entries(grouped).forEach(([symbol, ops]) => {
    console.log(`\n${symbol}:`);

    // Ordenar por data
    const sorted = sortBy(ops, "date", "desc");

    // Mostrar operações
    sorted.forEach((op) => {
      console.log(
        formatDateBR(op.date),
        op.operationType,
        op.quantity,
        formatCurrency(op.entryValue)
      );
    });
  });
}
```

---

## 🎯 Dicas de Boas Práticas

### ✅ DO (Faça)

```javascript
// Use constantes
import { OPERATION_TYPES } from './config/constants.js';
if (type === OPERATION_TYPES.BUY) { ... }

// Valide entradas
import { toSafeNumber } from './utils/validators.js';
const amount = toSafeNumber(input.value);

// Use helpers
import { debounce } from './utils/helpers.js';
const debouncedFn = debounce(myFunction, 300);
```

### ❌ DON'T (Não faça)

```javascript
// Não use strings mágicas
if (type === "compra") { ... }  // ❌

// Não confie em conversões diretas
const amount = Number(input.value);  // ❌ Pode ser NaN

// Não reimplemente funções existentes
function myDebounce() { ... }  // ❌ Use a do helpers
```

---

## 📚 Referências Completas

- **Documentação Técnica**: `REFACTORING.md`
- **Resumo Visual**: `MELHORIAS_RESUMO.md`
- **Este Guia**: `GUIA_RAPIDO.md`

---

**💡 Dica**: Importe apenas o que precisa para manter o bundle pequeno!

```javascript
// ✅ Bom
import { formatCurrency } from "./utils/format.js";

// ❌ Evite (importa tudo)
import * as utils from "./utils/index.js";
```

---

**🎉 Aproveite as novas funcionalidades!**
