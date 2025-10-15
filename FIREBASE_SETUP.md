# 🔥 Guia de Configuração Firebase

## 📋 Passo a Passo Completo

### 1️⃣ Criar Projeto no Firebase Console

1. Acesse: **https://console.firebase.google.com**
2. Clique em **"Adicionar projeto"** ou **"Create a project"**
3. Nome do projeto: **Capital Trader** (ou nome de sua escolha)
4. Desabilite Google Analytics (opcional)
5. Clique em **"Criar projeto"**

---

### 2️⃣ Configurar Authentication

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Get started"** ou **"Começar"**
3. Em **"Sign-in method"**, clique em **"Email/Password"**
4. **Ative** a opção "Email/Password"
5. Clique em **"Save"** ou **"Salvar"**

---

### 3️⃣ Configurar Firestore Database

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Create database"** ou **"Criar banco de dados"**
3. Escolha **"Start in test mode"** (pode mudar depois)
4. Selecione a localização: **southamerica-east1 (São Paulo)** (recomendado)
5. Clique em **"Enable"** ou **"Ativar"**

---

### 4️⃣ Obter Credenciais da Aplicação Web

1. No menu lateral, vá em **"Configurações do projeto"** (ícone de engrenagem)
2. Role até **"Seus aplicativos"**
3. Clique no ícone **</>** (Web)
4. Nome do app: **Capital Trader Web**
5. **NÃO** marque "Configure Firebase Hosting"
6. Clique em **"Register app"** ou **"Registrar app"**
7. **COPIE** as credenciais que aparecem (algo assim):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "capital-trader.firebaseapp.com",
  projectId: "capital-trader",
  storageBucket: "capital-trader.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

### 5️⃣ Configurar Variáveis de Ambiente

1. Na raiz do projeto, crie o arquivo **`.env`**
2. Copie o conteúdo de **`.env.example`** para **`.env`**
3. Preencha com as credenciais obtidas no passo anterior:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=capital-trader.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=capital-trader
VITE_FIREBASE_STORAGE_BUCKET=capital-trader.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

4. **Salve o arquivo** `.env`

⚠️ **IMPORTANTE**: O arquivo `.env` está no `.gitignore` e **NÃO será commitado** no Git!

---

### 6️⃣ Configurar Regras de Segurança (IMPORTANTE!)

#### Regras de Firestore

1. No Firebase Console, vá em **"Firestore Database"**
2. Clique na aba **"Rules"** ou **"Regras"**
3. Substitua pelas seguintes regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regra para dados do usuário
    match /users/{userId}/{document=**} {
      // Apenas o próprio usuário pode ler/escrever seus dados
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Clique em **"Publish"** ou **"Publicar"**

---

### 7️⃣ Reiniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

---

## ✅ Verificação

Após configurar tudo:

1. **Abra a aplicação** (geralmente em `http://localhost:5176`)
2. **Console do navegador** deve mostrar: `✅ Firebase inicializado com sucesso`
3. Deve aparecer um **botão "Entrar"** na sidebar
4. Clique em **"Entrar"** e teste o registro de novo usuário

---

## 🎯 Funcionalidades Disponíveis

### Após Login

- ✅ **Sincronização automática** de dados
- ✅ **Botão "Sincronizar"** para sync manual
- ✅ **Acesso de qualquer dispositivo**
- ✅ **Backup automático** na nuvem
- ✅ **Botão "Sair"** para fazer logout

### Modo Guest (sem login)

- ✅ Continua funcionando com **localStorage**
- ✅ Dados apenas locais (não sincronizados)
- ✅ Botão **"Entrar"** sempre disponível

---

## 🔧 Configurações Avançadas

### Desabilitar Firebase Temporariamente

Em `src/config/constants.js`:

```javascript
export const FIREBASE = {
  ENABLED: false, // Mude para false
  SYNC_INTERVAL: 30000,
  OFFLINE_FIRST: true,
};
```

### Tornar Autenticação Obrigatória

Em `src/config/constants.js`:

```javascript
export const AUTH = {
  REQUIRED: true,   // Mude para true
  GUEST_MODE: false, // Mude para false
  SESSION_TIMEOUT: 7200000,
};
```

---

## 🐛 Solução de Problemas

### Erro: "Firebase not configured"

✅ **Solução**: Verifique se o arquivo `.env` existe e está preenchido corretamente.

### Erro: "Permission denied"

✅ **Solução**: Verifique as regras de segurança do Firestore (passo 6).

### Erro: "Network request failed"

✅ **Solução**: Verifique sua conexão com a internet.

### Dados não sincronizam

✅ **Solução**: 
1. Verifique se está logado
2. Clique em "Sincronizar"
3. Abra o console e procure por erros

---

## 📚 Links Úteis

- **Firebase Console**: https://console.firebase.google.com
- **Documentação Firebase**: https://firebase.google.com/docs
- **Documentação Firestore**: https://firebase.google.com/docs/firestore
- **Documentação Auth**: https://firebase.google.com/docs/auth

---

## 🎉 Pronto!

Seu Capital Trader agora está conectado ao Firebase! 🔥

Para começar a usar:
1. Crie uma conta (botão "Entrar" → "Criar conta")
2. Faça login
3. Seus dados serão sincronizados automaticamente!

---

**Dúvidas?** Consulte a documentação ou abra uma issue no repositório.

