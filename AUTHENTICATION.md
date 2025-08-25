# Sistema de Autenticação - Capital Trader

## 📋 Visão Geral

O sistema de autenticação do Capital Trader oferece uma experiência completa e segura para login e cadastro de usuários, com múltiplas opções de autenticação e verificação.

## 🚀 Funcionalidades

### ✅ **Login**

- **Email/Senha**: Autenticação tradicional
- **Google OAuth**: Login rápido com conta Google
- **Lembrar de mim**: Opção para manter sessão ativa
- **Esqueci a senha**: Recuperação de senha por email
- **Verificação de segurança**: Código de verificação opcional

### ✅ **Cadastro**

- **Formulário completo**: Nome, email, telefone, senha
- **Google OAuth**: Cadastro rápido com Google
- **Validação robusta**: Email, senha forte, telefone
- **Verificação dupla**: Email ou SMS
- **Termos de uso**: Aceitação obrigatória

### ✅ **Segurança**

- **Verificação de código**: 6 dígitos por email/SMS
- **Senhas fortes**: Mínimo 8 caracteres com maiúscula, minúscula e número
- **Tokens JWT**: Autenticação baseada em tokens
- **Sessões seguras**: LocalStorage/SessionStorage
- **Auto-logout**: Proteção contra sessões expiradas

## 📁 Estrutura de Arquivos

```
src/auth/
├── login.html          # Tela de login
├── register.html       # Tela de cadastro
├── login.js           # Lógica do login
├── register.js        # Lógica do cadastro
├── authService.js     # Serviço global de autenticação
└── styles/
    └── auth.css       # Estilos das telas de auth
```

## 🎨 Design e UX

### **Interface Moderna**

- Design responsivo com Tailwind CSS
- Animações suaves e transições
- Gradientes e sombras elegantes
- Ícones SVG otimizados

### **Experiência do Usuário**

- Feedback visual em tempo real
- Estados de loading com spinners
- Mensagens de erro/sucesso claras
- Validação em tempo real
- Auto-foco em campos importantes

### **Acessibilidade**

- Navegação por teclado
- Labels semânticos
- Contraste adequado
- Suporte a leitores de tela

## 🔧 Como Usar

### **1. Acessar o Sistema**

```bash
# Abrir a aplicação
http://localhost:3000/src/auth/login.html
```

### **2. Fazer Login**

- **Email**: `teste@teste.com`
- **Senha**: `123456`
- Ou clicar em "Continuar com Google"

### **3. Criar Conta**

- Preencher formulário completo
- Escolher método de verificação (Email/SMS)
- Inserir código de verificação
- Acesso liberado automaticamente

## 🛠️ Configuração

### **Variáveis de Ambiente**

```javascript
// Configurações do Google OAuth (futuro)
GOOGLE_CLIENT_ID = your_client_id;
GOOGLE_CLIENT_SECRET = your_client_secret;

// Configurações de Email/SMS (futuro)
EMAIL_SERVICE = sendgrid;
SMS_SERVICE = twilio;
```

### **Integração com Backend**

```javascript
// Exemplo de integração com API
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password123",
  }),
});
```

## 🔐 Segurança

### **Validações Implementadas**

- ✅ Email válido
- ✅ Senha forte (8+ chars, maiúscula, minúscula, número)
- ✅ Telefone brasileiro válido
- ✅ Código de verificação de 6 dígitos
- ✅ Proteção contra XSS
- ✅ Sanitização de inputs

### **Medidas de Segurança**

- ✅ Tokens JWT seguros
- ✅ Sessões com expiração
- ✅ Rate limiting (futuro)
- ✅ 2FA opcional
- ✅ Logs de auditoria (futuro)

## 📱 Responsividade

### **Breakpoints**

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### **Adaptações**

- Layout flexível
- Botões touch-friendly
- Texto legível em todas as telas
- Modais responsivos

## 🎯 Funcionalidades Futuras

### **Planejadas**

- [ ] Integração real com Google OAuth
- [ ] Envio real de emails/SMS
- [ ] Recuperação de senha
- [ ] Perfil do usuário
- [ ] Configurações de conta
- [ ] Histórico de login
- [ ] Notificações push

### **Melhorias**

- [ ] Biometria (fingerprint/face)
- [ ] Autenticação por QR Code
- [ ] Login social (Facebook, Apple)
- [ ] 2FA com TOTP
- [ ] Sessões simultâneas

## 🐛 Debug e Testes

### **Credenciais de Teste**

```javascript
// Login
Email: teste@teste.com
Senha: 123456

// Cadastro
// Qualquer email válido funciona
// Senha deve seguir padrão forte
```

### **Console Logs**

```javascript
// Verificar estado de autenticação
console.log(authService.isLoggedIn());
console.log(authService.getCurrentUser());

// Verificar token
console.log(authService.getToken());
```

### **Testes Manuais**

1. **Login com credenciais válidas**
2. **Login com credenciais inválidas**
3. **Cadastro com dados válidos**
4. **Cadastro com dados inválidos**
5. **Verificação de código**
6. **Logout**
7. **Persistência de sessão**

## 📞 Suporte

### **Problemas Comuns**

1. **Código não chega**: Verificar console para código mock
2. **Login não funciona**: Verificar credenciais de teste
3. **Redirecionamento**: Verificar rotas no authService.js

### **Logs de Debug**

```javascript
// Ativar logs detalhados
localStorage.setItem("debug_auth", "true");

// Verificar logs no console
// Todos os códigos de verificação são logados
```

## 🔄 Integração com Aplicação Principal

### **Proteção de Rotas**

```javascript
// Verificar autenticação antes de acessar páginas
if (!authService.isLoggedIn()) {
  window.location.href = "./src/auth/login.html";
}
```

### **Informações do Usuário**

```javascript
// Exibir dados do usuário no header
const user = authService.getCurrentUser();
document.getElementById("user-name").textContent = user.name;
document.getElementById("user-email").textContent = user.email;
```

### **Logout**

```javascript
// Botão de logout
document.getElementById("logout-button").addEventListener("click", () => {
  authService.logout();
});
```

---

## 📝 Notas de Desenvolvimento

Este sistema foi desenvolvido com foco em:

- **Simplicidade**: Fácil de usar e entender
- **Segurança**: Múltiplas camadas de proteção
- **Escalabilidade**: Preparado para crescimento
- **Manutenibilidade**: Código limpo e documentado

Para dúvidas ou sugestões, consulte a documentação ou entre em contato com a equipe de desenvolvimento.
