/**
 * Sistema de Autenticação - Cadastro
 * ===================================
 * Gerencia o cadastro com validação, verificação e integração Google
 */

class RegisterManager {
  constructor() {
    this.verificationCode = null;
    this.countdownTimer = null;
    this.verificationMethod = null;
    this.userData = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupPasswordValidation();
    this.validateElements();
  }

  validateElements() {
    // Verificar se todos os elementos necessários existem
    const requiredElements = [
      'register-form',
      'password',
      'confirm-password',
      'toggle-password',
      'toggle-confirm-password'
    ];

    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
      console.error('Elementos não encontrados:', missingElements);
      this.showError('Erro ao carregar o formulário. Recarregue a página.');
    } else {
      console.log('Todos os elementos do formulário carregados com sucesso');
    }
  }

  setupEventListeners() {
    // Formulário de cadastro
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
      registerForm.addEventListener("submit", (e) => this.handleRegister(e));
    }

    // Cadastro com Google
    const googleRegisterBtn = document.getElementById("google-register");
    if (googleRegisterBtn) {
      googleRegisterBtn.addEventListener("click", () =>
        this.handleGoogleRegister()
      );
    }

    // Toggle de senhas
    const togglePassword = document.getElementById("toggle-password");
    const toggleConfirmPassword = document.getElementById(
      "toggle-confirm-password"
    );

    if (togglePassword) {
      togglePassword.addEventListener("click", () =>
        this.togglePasswordVisibility("password")
      );
    }

    if (toggleConfirmPassword) {
      toggleConfirmPassword.addEventListener("click", () =>
        this.togglePasswordVisibility("confirm-password")
      );
    }

    // Modais de verificação
    this.setupVerificationModals();
  }

  setupPasswordValidation() {
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirm-password");

    if (passwordInput) {
      passwordInput.addEventListener("input", () => this.validatePassword());
    }

    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener("input", () =>
        this.validatePasswordMatch()
      );
    }
  }

  setupVerificationModals() {
    // Modal de escolha de método
    const verifyEmailBtn = document.getElementById("verify-email");
    const verifySmsBtn = document.getElementById("verify-sms");
    const cancelVerificationBtn = document.getElementById(
      "cancel-verification"
    );

    if (verifyEmailBtn) {
      verifyEmailBtn.addEventListener("click", () =>
        this.selectVerificationMethod("email")
      );
    }

    if (verifySmsBtn) {
      verifySmsBtn.addEventListener("click", () =>
        this.selectVerificationMethod("sms")
      );
    }

    if (cancelVerificationBtn) {
      cancelVerificationBtn.addEventListener("click", () =>
        this.hideVerificationModal()
      );
    }

    // Modal de código
    const verifyCodeBtn = document.getElementById("verify-code");
    const cancelCodeBtn = document.getElementById("cancel-code");
    const resendCodeBtn = document.getElementById("resend-code");
    const codeInput = document.getElementById("verification-code");

    if (verifyCodeBtn) {
      verifyCodeBtn.addEventListener("click", () => this.verifyCode());
    }

    if (cancelCodeBtn) {
      cancelCodeBtn.addEventListener("click", () => this.hideCodeModal());
    }

    if (resendCodeBtn) {
      resendCodeBtn.addEventListener("click", () => this.resendCode());
    }

    if (codeInput) {
      codeInput.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
        if (e.target.value.length === 6) {
          this.verifyCode();
        }
      });
    }
  }

  async handleRegister(e) {
    e.preventDefault();

    const formData = this.getFormData();

    if (!this.validateRegisterForm(formData)) {
      return;
    }

    this.setLoadingState(true);

    try {
      // Simular chamada de API para verificar se email já existe
      const emailExists = await this.checkEmailExists(formData.email);

      if (emailExists) {
        this.showError("Este email já está cadastrado. Tente fazer login.");
        return;
      }

      // Salvar dados do usuário para verificação
      this.userData = formData;

      // Mostrar modal de escolha de verificação
      this.showVerificationModal(formData);
    } catch (error) {
      this.showError("Erro ao processar cadastro: " + error.message);
    } finally {
      this.setLoadingState(false);
    }
  }

  async handleGoogleRegister() {
    this.setLoadingState(true, "google");

    try {
      // Simular autenticação Google
      const response = await this.authenticateWithGoogle();

      // Verificar se usuário já existe
      const userExists = await this.checkEmailExists(response.user.email);

      if (userExists) {
        this.showError("Este email já está cadastrado. Tente fazer login.");
        return;
      }

      // Salvar dados do usuário
      this.userData = {
        name: response.user.name,
        email: response.user.email,
        phone: "",
        password: null, // Google não fornece senha
        googleId: response.user.id,
      };

      // Mostrar modal de verificação
      this.showVerificationModal(this.userData);
    } catch (error) {
      this.showError("Erro ao fazer cadastro com Google: " + error.message);
    } finally {
      this.setLoadingState(false, "google");
    }
  }

  getFormData() {
    return {
      name: document.getElementById("full-name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      password: document.getElementById("password").value,
      confirmPassword: document.getElementById("confirm-password").value,
      terms: document.getElementById("terms").checked,
    };
  }

  validateRegisterForm(data) {
    const errors = [];

    // Validar nome
    if (!data.name || data.name.trim().length < 2) {
      errors.push("Nome deve ter pelo menos 2 caracteres");
    }

    // Validar email
    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push("Email inválido");
    }

    // Validar senha (apenas se não for Google)
    if (data.password) {
      if (!this.isValidPassword(data.password)) {
        errors.push(
          "Senha deve ter pelo menos 8 caracteres, incluindo letra maiúscula, minúscula e número"
        );
      }

      if (data.password !== data.confirmPassword) {
        errors.push("Senhas não coincidem");
      }
    }

    // Validar telefone (se fornecido)
    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push("Telefone inválido");
    }

    // Validar termos
    if (!data.terms) {
      errors.push("Você deve aceitar os termos de uso");
    }

    if (errors.length > 0) {
      this.showError(errors.join(", "));
      return false;
    }

    return true;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPassword(password) {
    // Mínimo 8 caracteres, pelo menos 1 maiúscula, 1 minúscula e 1 número
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  isValidPhone(phone) {
    // Formato brasileiro: (11) 99999-9999 ou 11999999999
    const phoneRegex = /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  }

  validatePassword() {
    const password = document.getElementById("password").value;
    const strengthIndicator = this.getPasswordStrength(password);

    // Aqui você pode adicionar um indicador visual de força da senha
    console.log("Força da senha:", strengthIndicator);
  }

  validatePasswordMatch() {
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (confirmPassword && password !== confirmPassword) {
      document.getElementById("confirm-password").classList.add("input-error");
    } else {
      document
        .getElementById("confirm-password")
        .classList.remove("input-error");
    }
  }

  getPasswordStrength(password) {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score < 3) return "weak";
    if (score < 5) return "medium";
    return "strong";
  }

  async checkEmailExists(email) {
    // Simular verificação de email existente
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simular que alguns emails já existem
        const existingEmails = ["admin@teste.com", "usuario@teste.com"];
        resolve(existingEmails.includes(email));
      }, 500);
    });
  }

  async authenticateWithGoogle() {
    // Simular autenticação Google
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            id: "google_" + Date.now(),
            name: "Usuário Google",
            email: "usuario@gmail.com",
            avatar: "https://via.placeholder.com/40",
          },
        });
      }, 1500);
    });
  }

  showVerificationModal(userData) {
    const modal = document.getElementById("verification-modal");
    const emailDisplay = document.getElementById("email-display");
    const phoneDisplay = document.getElementById("phone-display");

    if (emailDisplay) {
      emailDisplay.textContent = userData.email;
    }

    if (phoneDisplay) {
      phoneDisplay.textContent = userData.phone || "Não informado";
    }

    if (modal) {
      modal.classList.remove("hidden");
    }
  }

  hideVerificationModal() {
    const modal = document.getElementById("verification-modal");
    if (modal) {
      modal.classList.add("hidden");
    }
  }

  selectVerificationMethod(method) {
    this.verificationMethod = method;
    this.hideVerificationModal();
    this.showCodeModal(method);
    this.sendVerificationCode(method);
  }

  showCodeModal(method) {
    const modal = document.getElementById("code-modal");
    const targetElement = document.getElementById("verification-target");

    if (targetElement) {
      const target =
        method === "email" ? this.userData.email : this.userData.phone;
      targetElement.textContent = target;
    }

    if (modal) {
      modal.classList.remove("hidden");
      this.startCountdown();
    }
  }

  hideCodeModal() {
    const modal = document.getElementById("code-modal");
    if (modal) {
      modal.classList.add("hidden");
    }
    this.stopCountdown();
    this.clearVerificationCode();
  }

  async sendVerificationCode(method) {
    try {
      // Simular envio de código
      this.verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      const target =
        method === "email" ? this.userData.email : this.userData.phone;
      console.log(
        `Código de verificação enviado para ${method} ${target}: ${this.verificationCode}`
      );

      this.showSuccess(
        `Código enviado para ${
          method === "email" ? "seu email" : "seu telefone"
        }`
      );
    } catch (error) {
      this.showError("Erro ao enviar código de verificação");
    }
  }

  async verifyCode() {
    const codeInput = document.getElementById("verification-code");
    const enteredCode = codeInput.value;

    if (!enteredCode || enteredCode.length !== 6) {
      this.showError("Digite o código de 6 dígitos");
      return;
    }

    if (enteredCode === this.verificationCode) {
      this.hideCodeModal();
      await this.completeRegistration();
    } else {
      this.showError("Código incorreto. Tente novamente.");
      codeInput.value = "";
      codeInput.focus();
    }
  }

  async resendCode() {
    await this.sendVerificationCode(this.verificationMethod);
    this.startCountdown();
  }

  async completeRegistration() {
    try {
      // Simular criação da conta
      const user = await this.createUser(this.userData);

      this.showSuccess("Conta criada com sucesso!");

      // Salvar dados do usuário
      localStorage.setItem("auth_user", JSON.stringify(user));
      localStorage.setItem("auth_token", "mock_token_" + Date.now());

      // Redirecionar para a aplicação
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1500);
    } catch (error) {
      this.showError("Erro ao criar conta: " + error.message);
    }
  }

  async createUser(userData) {
    // Simular criação de usuário na API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Date.now(),
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          avatar: userData.googleId ? "https://via.placeholder.com/40" : null,
          googleId: userData.googleId || null,
          createdAt: new Date().toISOString(),
        });
      }, 1000);
    });
  }

  startCountdown() {
    let timeLeft = 60;
    const timerElement = document.getElementById("timer");
    const countdownElement = document.getElementById("countdown");
    const resendElement = document.getElementById("resend-code");

    this.countdownTimer = setInterval(() => {
      if (timeLeft > 0) {
        if (timerElement) timerElement.textContent = timeLeft;
        timeLeft--;
      } else {
        this.stopCountdown();
        if (countdownElement) countdownElement.classList.add("hidden");
        if (resendElement) resendElement.classList.remove("hidden");
      }
    }, 1000);
  }

  stopCountdown() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  clearVerificationCode() {
    this.verificationCode = null;
    const codeInput = document.getElementById("verification-code");
    if (codeInput) {
      codeInput.value = "";
    }
  }

  togglePasswordVisibility(field) {
    const passwordInput = document.getElementById(field);
    const toggleBtn = document.getElementById(`toggle-${field}`);

    if (!passwordInput || !toggleBtn) {
      console.error(`Elementos não encontrados para o campo: ${field}`);
      return;
    }

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleBtn.innerHTML = `
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: #6b7280;">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
            `;
      toggleBtn.setAttribute('title', 'Ocultar senha');
    } else {
      passwordInput.type = "password";
      toggleBtn.innerHTML = `
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: #6b7280;">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            `;
      toggleBtn.setAttribute('title', 'Mostrar senha');
    }

    // Garantir que o campo mantenha a visibilidade
    passwordInput.style.color = '#1f2937';
    passwordInput.style.webkitTextFillColor = '#1f2937';
    passwordInput.style.backgroundColor = 'white';

    // Garantir que o botão seja sempre visível
    toggleBtn.style.color = '#6b7280';

    // Focar no campo após o toggle
    setTimeout(() => {
      passwordInput.focus();
    }, 10);
  }

  setLoadingState(loading, type = "form") {
    const registerButton = document.getElementById("register-button");
    const registerText = document.getElementById("register-text");
    const registerSpinner = document.getElementById("register-spinner");
    const googleButton = document.getElementById("google-register");

    if (type === "form") {
      if (loading) {
        registerButton.disabled = true;
        registerText.textContent = "Criando conta...";
        registerSpinner.classList.remove("hidden");
      } else {
        registerButton.disabled = false;
        registerText.textContent = "Criar Conta";
        registerSpinner.classList.add("hidden");
      }
    } else if (type === "google") {
      if (loading) {
        googleButton.disabled = true;
        googleButton.innerHTML = `
                    <svg class="animate-spin w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Criando conta...
                `;
      } else {
        googleButton.disabled = false;
        googleButton.innerHTML = `
                    <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continuar com Google
                `;
      }
    }
  }

  showMessage(message, type = "info") {
    // Remover mensagens anteriores
    const existingMessages = document.querySelectorAll(".message");
    existingMessages.forEach((msg) => msg.remove());

    // Criar nova mensagem
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    // Inserir no início do formulário
    const form = document.getElementById("register-form");
    if (form) {
      form.insertBefore(messageDiv, form.firstChild);
    }

    // Auto-remover após 5 segundos
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }

  showError(message) {
    this.showMessage(message, "error");
  }

  showSuccess(message) {
    this.showMessage(message, "success");
  }
}

// Inicializar o sistema de cadastro
const registerManager = new RegisterManager();

// Exportar para uso global
window.registerManager = registerManager;
