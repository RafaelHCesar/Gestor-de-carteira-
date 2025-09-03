# 📁 Estrutura do Projeto - Gestor de Carteiras

## 🏗️ **Arquitetura Refatorada**

### **📂 Estrutura de Pastas**

```
src/
├── 📄 main.js                 # Ponto de entrada da aplicação
├── 📄 state.js                # Gerenciamento de estado global
├── 🎨 assets/                 # Recursos estáticos
│   └── icons/                 # Ícones SVG da aplicação
├── 🧰 utils/                  # Utilitários e helpers
│   ├── index.js               # Centralizador de exports
│   ├── dates.js               # Formatação e manipulação de datas
│   └── format.js              # Formatação de valores (moeda, números)
├── 🔧 services/               # Serviços da aplicação
│   ├── index.js               # Centralizador de exports
│   ├── storage/               # Sistema de persistência
│   ├── symbols.js             # Autocompletar de símbolos
│   ├── prices.js              # Busca de preços de ativos
│   ├── portfolio.js           # Cálculos de portfólio
│   └── accounting.js          # Cálculos contábeis
├── 📊 modules/                # Módulos de funcionalidade
│   ├── index.js               # Centralizador de exports
│   ├── operations/            # Módulo de operações
│   │   ├── index.js           # Centralizador de operações
│   │   ├── operationsSwingTrade.js    # Operações swing trade
│   │   ├── operationsDayTrade.js      # Operações day trade
│   │   └── operationsFinanceiras.js   # Gestão de capital
│   ├── taxes.js               # Cálculo de impostos
│   └── analytics.js           # Análises e relatórios
├── 🎭 ui/                     # Componentes de interface
│   ├── index.js               # Centralizador de exports
│   ├── dashboard.js           # Dashboard principal
│   ├── tabs.js                # Sistema de abas
│   ├── dateModal.js           # Modal de seleção de datas
│   ├── backToTop.js           # Botão voltar ao topo
│   ├── messages.js            # Sistema de mensagens
│   └── dialogs.js             # Diálogos de confirmação
└── 🎨 styles/                 # Estilos CSS
    ├── styles.css             # Estilos principais
    └── colors.css             # Variáveis de cores
```

## 🔄 **Sistema de Imports Centralizados**

### **✅ Vantagens da Nova Estrutura:**

1. **Imports Limpos**: Um único import por categoria
2. **Manutenibilidade**: Fácil de encontrar e modificar exports
3. **Organização**: Separação clara de responsabilidades
4. **Escalabilidade**: Fácil adicionar novos módulos

### **📥 Exemplo de Imports:**

```javascript
// ❌ ANTES (múltiplos imports)
import { wireTabs } from "./ui/tabs.js";
import { wireDateModal } from "./ui/dateModal.js";
import { initBackToTop } from "./ui/backToTop.js";

// ✅ AGORA (um único import)
import { wireTabs, wireDateModal, initBackToTop } from "./ui/index.js";
```

## 🎯 **Responsabilidades por Pasta**

### **🧰 Utils**

- **dates.js**: Formatação e manipulação de datas
- **format.js**: Formatação de valores monetários e numéricos

### **🔧 Services**

- **storage/**: Persistência de dados no localStorage
- **symbols.js**: Autocompletar de símbolos de ativos
- **prices.js**: Busca de preços em tempo real
- **portfolio.js**: Cálculos de valor do portfólio
- **accounting.js**: Cálculos contábeis e de P&L

### **📊 Modules**

- **operations/**: Todas as operações de trading
- **taxes.js**: Cálculo de impostos (IRRF, DARF)
- **analytics.js**: Análises, filtros e relatórios

### **🎭 UI**

- **dashboard.js**: Dashboard principal com KPIs
- **tabs.js**: Sistema de navegação por abas
- **dateModal.js**: Seleção de períodos
- **messages.js**: Notificações e alertas
- **dialogs.js**: Confirmações e modais

## 🚀 **Como Adicionar Novos Módulos**

1. **Criar arquivo** na pasta apropriada
2. **Exportar funções** do arquivo
3. **Adicionar ao index.js** da pasta
4. **Importar no main.js** via index.js

### **📝 Exemplo:**

```javascript
// 1. Criar: src/modules/newModule.js
export function newFunction() {
  /* ... */
}

// 2. Adicionar ao: src/modules/index.js
export { newFunction } from "./newModule.js";

// 3. Usar no: src/main.js
import { newFunction } from "./modules/index.js";
```

## 🔍 **Arquivos Removidos na Refatoração**

- ❌ `src/utils/theme.js` - Não utilizado
- ❌ `src/config/` - Pasta vazia
- ❌ `src/auth/` - Sistema de autenticação removido

## ✅ **Status da Refatoração**

- **✅ Estrutura organizada** por responsabilidade
- **✅ Imports centralizados** via index.js
- **✅ Separação clara** entre UI, módulos e serviços
- **✅ Fácil manutenção** e escalabilidade
- **✅ Aplicação funcionando** sem erros

---

**📅 Última atualização**: Setembro 2025  
**🔧 Versão**: 2.0.0 (Refatorada)
