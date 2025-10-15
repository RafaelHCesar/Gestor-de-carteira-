# 🔥 Firebase - Documentação Completa

## 📖 Visão Geral

O **Capital Trader** agora possui integração completa com Firebase, oferecendo:
- 🔐 Autenticação de usuários
- 💾 Armazenamento em nuvem (Firestore)
- 🔄 Sincronização multi-dispositivo
- 📦 Backup automático
- 🌐 Acesso de qualquer lugar

---

## 🏗️ Arquitetura Implementada

### Sistema Híbrido: localStorage + Firebase

```
┌─────────────────┐         ┌──────────────────┐
│   localStorage  │ ←──────→│     Firebase     │
│   (Cache Local) │  Sync   │    (Nuvem)       │
└─────────────────┘         └──────────────────┘
         ↓                            ↓
    Rápido                      Sincronizado
    Offline                    Multi-device
```

### Fluxo de Dados

1. **Escrita (Save)**:
   - Salva primeiro no **localStorage** (rápido)
   - Sincroniza com **Firebase** em background
   - UI sempre responsiva

2. **Leitura (Load)**:
   - **Com Firebase**: Carrega do Firebase e cacheia localmente
   - **Sem Firebase**: Carrega apenas do localStorage
   - Fallback automático se Firebase indisponível

---

## 📁 Estrutura de Arquivos Criados

```
src/services/firebase/
├── config.js           # Inicialização e configuração
├── auth.js             # Autenticação (login, registro, logout)
├── firestore.js        # CRUD e sincronização de dados
└── index.js            # Exports centralizados

src/services/storage/
├── firebase-storage.js # Sistema híbrido de storage
└── index.js            # Interface unificada (modificado)

src/ui/
└── auth.js             # Modals de login/registro

Arquivos de configuração:
├── .env.example        # Template de variáveis
├── .gitignore          # Atualizado para ignorar .env
├── FIREBASE_SETUP.md   # Guia de configuração
├── FIREBASE_PLAN.md    # Planejamento original
└── FIREBASE_README.md  # Este arquivo
```

---

## 🔑 Funções Principais

### Autenticação (`src/services/firebase/auth.js`)

```javascript
import { 
  registerUser, 
  loginUser, 
  logoutUser,
  getCurrentUser,
  isAuthenticated,
  onAuthChange,
  resetPassword
} from './services/firebase/index.js';

// Registrar novo usuário
const result = await registerUser(email, password, displayName);

// Fazer login
const result = await loginUser(email, password);

// Fazer logout
await logoutUser();

// Verificar se está autenticado
if (isAuthenticated()) {
  console.log('Usuário logado');
}

// Observar mudanças de autenticação
const unsubscribe = onAuthChange((user) => {
  if (user) {
    console.log('Logado como:', user.email);
  } else {
    console.log('Não autenticado');
  }
});

// Recuperar senha
await resetPassword(email);
```

### Firestore (`src/services/firebase/firestore.js`)

```javascript
import {
  saveOperation,
  loadOperations,
  deleteOperation,
  syncAllData,
  loadAllData
} from './services/firebase/index.js';

// Salvar operação
await saveOperation(operationData);

// Carregar todas as operações
const operations = await loadOperations();

// Deletar operação
await deleteOperation(operationId);

// Sincronizar todos os dados
await syncAllData(appState);

// Carregar todos os dados
const allData = await loadAllData();
```

### Storage Híbrido (`src/services/storage/firebase-storage.js`)

```javascript
import {
  saveStateHybrid,
  loadStateHybrid,
  migrateToFirebase,
  forceSyncFirebase
} from './services/storage/firebase-storage.js';

// Salvar com sync automático
await saveStateHybrid(appState);

// Carregar (Firebase ou localStorage)
const data = await loadStateHybrid();

// Migrar dados locais para Firebase
await migrateToFirebase();

// Forçar sincronização
await forceSyncFirebase(appState);
```

---

## 🎨 Interface de Usuário

### Modais de Autenticação

```javascript
import { showAuthModal, closeAuthModal } from './ui/auth.js';

// Mostrar modal de login
const user = await showAuthModal('login');

// Mostrar modal de registro
const user = await showAuthModal('register');

// Mostrar modal de recuperação de senha
await showAuthModal('reset');

// Fechar modal
closeAuthModal();
```

### Botões na Sidebar

- **Botão "Entrar"**: Aparece quando Firebase está configurado e usuário não está logado
- **Botão "Sair"**: Aparece quando usuário está autenticado
- **Botão "Sincronizar"**: Sincronização manual com Firebase

---

## ⚙️ Configurações

### Constantes Firebase (`src/config/constants.js`)

```javascript
export const FIREBASE = {
  ENABLED: true,              // Habilitar/desabilitar Firebase
  SYNC_INTERVAL: 30000,       // Intervalo de sync automático (ms)
  OFFLINE_FIRST: true,        // Priorizar localStorage
};

export const AUTH = {
  REQUIRED: false,            // Se true, login é obrigatório
  GUEST_MODE: true,           // Permitir uso sem login
  SESSION_TIMEOUT: 7200000,   // 2 horas
};
```

### Customizações

#### Desabilitar Firebase
```javascript
FIREBASE.ENABLED = false;
```

#### Tornar Login Obrigatório
```javascript
AUTH.REQUIRED = true;
AUTH.GUEST_MODE = false;
```

#### Alterar Intervalo de Sync
```javascript
FIREBASE.SYNC_INTERVAL = 60000; // 1 minuto
```

---

## 🔒 Segurança

### Regras de Firestore

As regras garantem que:
- ✅ Apenas usuários autenticados acessam dados
- ✅ Cada usuário acessa apenas seus próprios dados
- ✅ Não é possível ler/modificar dados de outros usuários

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null 
                        && request.auth.uid == userId;
    }
  }
}
```

### Proteção de Credenciais

- ✅ Arquivo `.env` no `.gitignore`
- ✅ Credenciais nunca commitadas
- ✅ Variáveis de ambiente via Vite

---

## 📊 Estrutura de Dados no Firestore

### Coleções

```
users/
└── {userId}/
    ├── operations/              # Operações Swing Trade
    │   └── {operationId}
    ├── dayTradeOperations/      # Operações Day Trade
    │   └── {operationId}
    ├── capitalTransactions/     # Transações Financeiras
    │   └── {transactionId}
    ├── holdings/                # Posições em Carteira
    │   └── {symbol}
    └── settings/                # Configurações
```

### Exemplo de Documento (Operation)

```javascript
{
  id: "1729012345678",
  date: Timestamp(2025-10-15),
  assetSymbol: "PETR4",
  operationType: "compra",
  entryValue: 28.50,
  quantity: 100,
  operationFees: 10.00,
  result: -150.00,
  observations: "Entrada em suporte",
  createdAt: Timestamp(2025-10-15 10:30:00),
  updatedAt: Timestamp(2025-10-15 10:30:00)
}
```

---

## 🔄 Sincronização

### Sincronização Automática

Ocorre automaticamente quando:
- ✅ Usuário faz login
- ✅ Dados são salvos (`saveState`)
- ✅ Operação é criada/editada/deletada

### Sincronização Manual

Clique no botão **"Sincronizar"** na sidebar:
- Força upload de todos os dados locais
- Útil se houver conflitos
- Feedback visual durante o processo

### Migração de Dados

No primeiro login:
- ✅ Dados do localStorage são **automaticamente** migrados para Firebase
- ✅ Mensagem de confirmação exibida
- ✅ Dados locais mantidos como cache

---

## 💡 Boas Práticas

### 1. Sempre fazer backup antes de testar

```javascript
// No console do navegador
localStorage.getItem('capital_trader_state')
// Copiar e salvar em arquivo texto
```

### 2. Testar em ambiente de desenvolvimento

Use o modo de teste do Firestore inicialmente.

### 3. Monitorar uso no Firebase Console

- Verifique quantidade de leituras/escritas
- Monitore armazenamento usado
- Ative alertas se necessário

### 4. Configurar regras de produção

Após testes, ajuste as regras de segurança conforme necessário.

---

## 📈 Limites do Plano Gratuito

| Recurso | Limite Gratuito | Suficiente Para |
|---------|-----------------|-----------------|
| **Leituras** | 50.000/dia | ~100 usuários ativos |
| **Escritas** | 20.000/dia | ~50 usuários ativos |
| **Armazenamento** | 1 GB | Milhares de operações |
| **Banda** | 10 GB/mês | Uso normal |
| **Autenticações** | Ilimitado | ✅ |

---

## 🎯 Próximos Passos

### Funcionalidades Futuras

- [ ] Google Sign-In
- [ ] Autenticação por telefone
- [ ] Compartilhamento de carteiras
- [ ] Notificações em tempo real
- [ ] Análise colaborativa
- [ ] Export de relatórios para PDF

### Melhorias

- [ ] Indicador de status de sync na UI
- [ ] Resolver conflitos de sincronização
- [ ] Otimizar queries do Firestore
- [ ] Implementar paginação
- [ ] Cache mais inteligente

---

## 🐛 Troubleshooting

### Como resetar tudo

```javascript
// No console do navegador
await window.resetAppState('all');
localStorage.clear();
// Depois faça logout e login novamente
```

### Como ver dados no Firebase

1. Acesse Firebase Console
2. Vá em "Firestore Database"
3. Navegue pelas coleções: `users > {seu-uid} > operations`

### Como exportar dados

```javascript
// No console do navegador
const { appState } = await import('./state.js');
console.log(JSON.stringify(appState, null, 2));
// Copiar e salvar
```

---

## ✅ Status de Implementação

- ✅ Firebase SDK instalado
- ✅ Serviço de autenticação completo
- ✅ Serviço Firestore completo
- ✅ Interface de login/registro
- ✅ Sistema híbrido de storage
- ✅ Migração automática de dados
- ✅ Sincronização manual
- ✅ Botões de UI
- ✅ Documentação completa
- ✅ 0 erros de lint

---

**🎉 Implementação Firebase 100% Concluída!**

**Data**: 15 de Outubro de 2025  
**Versão**: 1.1.0  
**Status**: ✅ Pronto para uso

