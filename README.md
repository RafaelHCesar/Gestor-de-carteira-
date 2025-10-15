## 🚀 Início Rápido

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar ambiente (.env)

Crie um arquivo `.env` na raiz copiando o conteúdo de `.env.example`:

```bash
cp .env.example .env
```

Preencha as variáveis necessárias:

```env
# Firebase (obrigatório para sincronização na nuvem)
VITE_FIREBASE_API_KEY=sua-chave
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu-id
VITE_FIREBASE_APP_ID=seu-app-id

# APIs de Cotações (opcional)
VITE_BRAPI_TOKEN=
VITE_ALPHA_VANTAGE_KEY=
```

📖 **Guia completo de configuração Firebase**: Veja `FIREBASE_SETUP.md`

### 3. Iniciar servidor de desenvolvimento

```bash
npm run dev
```

A aplicação abrirá em `http://localhost:5176`

---

## ✨ Funcionalidades

### 📊 Gestão de Operações
- ✅ **Swing Trade** - Operações de compra/venda com análise de resultados
- ✅ **Day Trade** - Registro de operações intraday
- ✅ **Capital** - Controle de depósitos, saques e taxas

### 💼 Carteira de Investimentos
- ✅ Visualização de posições em tempo real
- ✅ Preço médio de compra
- ✅ Resultado consolidado por ativo
- ✅ Atualização automática de cotações

### 📈 Análises e Relatórios
- ✅ Dashboard com KPIs principais
- ✅ Gráficos de desempenho
- ✅ Filtros por período
- ✅ Análise de lucros e prejuízos

### 💰 Cálculo de Impostos
- ✅ Configuração de taxas por ativo
- ✅ Cálculo automático de impostos
- ✅ Separação por tipo de operação

### 🔥 Firebase (NOVO!)
- ✅ **Autenticação** de usuários
- ✅ **Sincronização** em nuvem
- ✅ **Multi-dispositivo** - Acesse de qualquer lugar
- ✅ **Backup automático**
- ✅ **Modo offline** - Funciona sem internet

### 🎨 Interface
- ✅ Design moderno e responsivo
- ✅ **Tema claro e escuro**
- ✅ Tailwind CSS
- ✅ Ícones personalizados

---

## 🔥 Firebase - Modo de Uso

### Modo Guest (Sem Login)
- Dados salvos apenas **localmente** (localStorage)
- Funciona **offline** normalmente
- **Não sincroniza** entre dispositivos

### Modo Autenticado (Com Login)
1. Clique em **"Entrar"** na sidebar
2. **Crie uma conta** ou faça login
3. Seus dados serão **automaticamente sincronizados**
4. Acesse de **qualquer dispositivo** fazendo login

### Sincronização Manual
- Clique no botão **"Sincronizar"** na sidebar
- Força upload de todos os dados locais para Firebase
- Útil após fazer alterações offline

📖 **Documentação completa**: `FIREBASE_README.md`

---

## 📦 Scripts Disponíveis

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build de produção
```

---

## 🛠️ Tecnologias

- **Vite** - Build tool e dev server
- **JavaScript ES6+** - Linguagem principal
- **Tailwind CSS** - Framework CSS
- **Chart.js** - Gráficos interativos
- **Firebase** - Backend as a Service
  - Authentication
  - Firestore Database
- **BRAPI** - API de cotações (B3)

---

## 📚 Documentação

- 📖 **Firebase Setup**: `FIREBASE_SETUP.md` - Guia de configuração
- 📖 **Firebase README**: `FIREBASE_README.md` - Documentação completa
- 📖 **Refatoração**: `REFACTORING.md` - Melhorias implementadas
- 📖 **Changelog**: `CHANGELOG.md` - Histórico de mudanças
- 📖 **Guia Rápido**: `GUIA_RAPIDO.md` - Guia de uso das funcionalidades
