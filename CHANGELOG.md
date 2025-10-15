# 📝 Changelog - Capital Trader

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.2.0] - 2025-10-15

### 🔥 Firebase - Implementação Completa

#### ✨ Adicionado

**Serviços Firebase**

- **`src/services/firebase/config.js`** - Configuração e inicialização do Firebase
  - Suporte a persistência offline (IndexedDB)
  - Verificação de configuração
  
- **`src/services/firebase/auth.js`** - Sistema completo de autenticação
  - `registerUser()` - Registro de novos usuários
  - `loginUser()` - Login com email/senha
  - `logoutUser()` - Logout
  - `getCurrentUser()` - Usuário atual
  - `isAuthenticated()` - Verificação de autenticação
  - `onAuthChange()` - Observador de mudanças
  - `resetPassword()` - Recuperação de senha
  - `changeEmail()` - Alterar email
  - `changePassword()` - Alterar senha
  - `validateEmail()` - Validação de email
  - `validatePassword()` - Validação de senha com indicador de força

- **`src/services/firebase/firestore.js`** - CRUD completo e sincronização
  - Operações Swing Trade (save, load, delete)
  - Operações Day Trade (save, load, delete)
  - Transações de Capital (save, load, delete)
  - Holdings/Posições (save, load)
  - Settings/Configurações (save, load)
  - `syncAllData()` - Sincronização completa
  - `loadAllData()` - Carregamento completo

- **`src/services/storage/firebase-storage.js`** - Sistema híbrido
  - `saveStateHybrid()` - Salva em localStorage + Firebase
  - `loadStateHybrid()` - Carrega com fallback inteligente
  - `migrateToFirebase()` - Migração automática de dados locais
  - `forceSyncFirebase()` - Sincronização manual forçada
  - `clearAllData()` - Limpa dados local e remoto

**Interface de Autenticação**

- **`src/ui/auth.js`** - Modals de autenticação
  - Modal de Login com validação
  - Modal de Registro com indicador de força da senha
  - Modal de Recuperação de Senha
  - Navegação fluida entre modais
  - Modo Guest (continuar sem login)

**Documentação**

- **`FIREBASE_SETUP.md`** - Guia passo a passo de configuração
- **`FIREBASE_README.md`** - Documentação completa da integração
- **`FIREBASE_PLAN.md`** - Planejamento e arquitetura
- **`.env.example`** - Template de variáveis de ambiente
- **`.gitignore`** - Atualizado para proteger credenciais

#### 🔧 Modificado

- **`src/main.js`**
  - Adicionado fluxo de autenticação no init
  - Verificação de Firebase configurado
  - Auto-login se usuário já autenticado
  - Função `updateUserInfo()` para atualizar dados do usuário na UI
  - Função `setupAuthButtons()` para configurar botões de login/logout/sync
  - Integração com migração de dados

- **`src/services/storage/index.js`**
  - Refatorado para usar sistema híbrido
  - Auto-detecção de Firebase
  - Fallback inteligente para localStorage
  - Suporte a forceFirebase parameter

- **`src/config/constants.js`**
  - Adicionadas constantes `FIREBASE`
  - Adicionadas constantes `AUTH`
  - Novos DOM_IDs para elementos de autenticação

- **`src/ui/index.js`**
  - Exports de `showAuthModal` e `closeAuthModal`

- **`src/services/index.js`**
  - Export de todos os serviços Firebase

- **`index.html`**
  - Adicionados botões de Login, Logout e Sincronização na sidebar
  - Ícones SVG inline para botões

- **`README.md`**
  - Documentação atualizada com instruções Firebase
  - Seção de início rápido melhorada
  - Links para documentação Firebase

- **`package.json`**
  - Dependência `firebase: ^10.7.1`

#### 🎯 Funcionalidades

**Sistema Híbrido**
- localStorage como cache local (rápido, offline)
- Firebase como fonte de verdade (sincronizado, multi-device)
- Fallback automático se Firebase indisponível

**Autenticação**
- Email/Password
- Recuperação de senha
- Modo Guest opcional
- Validações robustas

**Sincronização**
- Automática ao salvar dados
- Manual via botão "Sincronizar"
- Migração automática de dados locais no primeiro login
- Suporte offline com cache

**Segurança**
- Regras de Firestore protegem dados
- Cada usuário acessa apenas seus dados
- Credenciais em variáveis de ambiente
- Arquivo .env não commitado

---

## [1.1.0] - 2025-10-15

### ✨ Adicionado

#### Novos Arquivos e Módulos

- **`src/config/constants.js`** - Sistema de constantes centralizadas
  - 150+ constantes para storage, temas, operações, API, formatação, validações e DOM
  - Elimina strings e números mágicos no código
- **`src/config/index.js`** - Export centralizado de configurações

- **`src/utils/validators.js`** - Sistema completo de validações

  - `isValidNumber()` - Valida números
  - `isPositiveNumber()` - Valida números positivos
  - `isValidMoneyValue()` - Valida valores monetários
  - `isValidQuantity()` - Valida quantidades
  - `isValidSymbol()` - Valida símbolos de ativos
  - `isValidEmail()` - Valida emails
  - `toSafeNumber()` - Conversão segura para número
  - `toSafePositiveNumber()` - Conversão segura para número positivo
  - `sanitizeSymbol()` - Sanitização de símbolos
  - `validateOperation()` - Validação completa de operações
  - `validateTransaction()` - Validação completa de transações

- **`src/utils/helpers.js`** - Coleção de funções auxiliares

  - `generateUniqueId()` - Geração de IDs únicos
  - `sleep()` - Delay assíncrono
  - `debounce()` - Função debounced
  - `throttle()` - Função throttled
  - `deepClone()` - Clonagem profunda de objetos
  - `removeNullish()` - Remove valores null/undefined
  - `groupBy()` - Agrupamento de arrays
  - `sortBy()` - Ordenação de arrays
  - `removeDuplicates()` - Remoção de duplicatas
  - `formatCompactNumber()` - Formatação compacta (1K, 1M)
  - `capitalize()` - Capitalização de strings
  - `truncate()` - Truncamento de strings
  - `isEmpty()` - Verificação de valores vazios
  - `copyToClipboard()` - Cópia para área de transferência
  - `getNestedValue()` - Acesso a valores aninhados

- **`.vscode/settings.json`** - Configurações recomendadas do editor

#### Novas Funções em Módulos Existentes

- **`src/utils/dates.js`**

  - `isToday()` - Verifica se uma data é hoje
  - `addDays()` - Adiciona/subtrai dias de uma data
  - `formatRelativeDate()` - Formata data de forma relativa (hoje, ontem, há X dias)

- **`src/services/accounting.js`**
  - `calculateTotalInvested()` - Calcula total investido em Swing Trade
  - `calculateTotalSales()` - Calcula total de vendas em Swing Trade

#### Documentação

- **`REFACTORING.md`** - Documentação técnica completa das refatorações
- **`MELHORIAS_RESUMO.md`** - Resumo visual das melhorias
- **`GUIA_RAPIDO.md`** - Guia prático de uso das novas funcionalidades
- **`CHANGELOG.md`** - Este arquivo

### 🔧 Modificado

#### Refatorações e Melhorias

- **`src/services/accounting.js`**

  - Adicionada documentação JSDoc completa
  - Uso de `toSafeNumber()` para validações
  - Uso de constantes `OPERATION_TYPES`
  - Melhor tratamento de casos edge
  - Código mais limpo e manutenível

- **`src/services/symbols.js`**

  - Uso de constantes centralizadas (`DEFAULT_SYMBOLS`, `PRIORITY_ASSETS`, `API`, `DOM_IDS`)
  - Melhor organização do código
  - Tratamento de erros aprimorado (substituído catch silencioso por log)
  - Código mais legível

- **`src/services/storage/index.js`**

  - Uso de constantes centralizadas (`STORAGE`)
  - Código mais consistente

- **`src/utils/theme.js`**

  - Uso de constantes centralizadas (`STORAGE`, `THEMES`)
  - Elimina strings mágicas
  - Código mais manutenível

- **`src/utils/format.js`**

  - Uso de constantes `FORMAT` para locale e moeda
  - Uso de `isValidNumber()` para validações
  - Eliminada duplicação de código
  - Código otimizado e mais eficiente
  - Adicionada documentação de cabeçalho

- **`src/utils/dates.js`**

  - Validações mais robustas
  - Melhor tratamento de casos edge
  - Documentação JSDoc aprimorada
  - Adicionada documentação de cabeçalho

- **`src/utils/index.js`**

  - Exports completos de todas as funções utilitárias
  - Organização melhorada por categoria
  - Inclui validators e helpers

- **`src/services/index.js`**
  - Exports atualizados com novas funções
  - Melhor organização

### 🗑️ Removido

- **Pastas vazias removidas** (limpeza de estrutura):
  - `src/components/`
  - `src/config/` (vazia - recriada com conteúdo)
  - `src/layouts/`
  - `src/router/`
  - `src/store/`
  - `src/templates/`

### 🐛 Corrigido

- Duplicação de lógica de validação em múltiplos arquivos
- Uso inconsistente de strings mágicas
- Falta de validação em conversões numéricas
- Tratamento inadequado de valores null/undefined

### 🔒 Segurança

- Validações robustas em todas as entradas de dados
- Conversões seguras de tipos
- Proteção contra valores null/undefined
- Sanitização de inputs de usuário

---

## [1.0.0] - 2025-10-15

### Versão Inicial

- Lançamento inicial do Capital Trader
- Gestão de operações Day Trade e Swing Trade
- Sistema de carteira de investimentos
- Cálculo de impostos
- Interface com Tailwind CSS
- Armazenamento local

---

## Tipos de Mudanças

- **✨ Adicionado** - Para novas funcionalidades
- **🔧 Modificado** - Para mudanças em funcionalidades existentes
- **🗑️ Removido** - Para funcionalidades removidas
- **🐛 Corrigido** - Para correções de bugs
- **🔒 Segurança** - Para correções de vulnerabilidades
- **📝 Documentação** - Para mudanças na documentação
- **⚡ Performance** - Para melhorias de performance
- **🎨 Estilo** - Para mudanças que não afetam a lógica

---

## Links

- [Documentação Técnica](REFACTORING.md)
- [Resumo Visual](MELHORIAS_RESUMO.md)
- [Guia Rápido](GUIA_RAPIDO.md)
- [README](README.md)
