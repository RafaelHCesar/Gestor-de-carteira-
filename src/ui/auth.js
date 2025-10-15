/**
 * Interface de Autenticação
 * =========================
 * Modals e UI para login, registro e recuperação de senha
 */

import {
  registerUser,
  loginUser,
  resetPassword,
  validateEmail,
  validatePassword,
} from "../services/firebase/index.js";
import { showMessage } from "./messages.js";

/**
 * Cria e mostra o modal de autenticação
 * @param {string} mode - 'login', 'register' ou 'reset'
 * @returns {Promise} Promise que resolve quando autenticação é bem-sucedida
 */
export function showAuthModal(mode = "login") {
  return new Promise((resolve, reject) => {
    // Remover modal existente
    const existing = document.getElementById("auth-modal");
    if (existing) existing.remove();

    // Criar modal
    const modal = document.createElement("div");
    modal.id = "auth-modal";
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    modal.innerHTML = getAuthModalHTML(mode);

    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";

    // Wire event listeners
    setupAuthModalEvents(modal, mode, resolve, reject);

    // Focar no primeiro input
    setTimeout(() => {
      const firstInput = modal.querySelector("input");
      if (firstInput) firstInput.focus();
    }, 100);
  });
}

/**
 * Fecha o modal de autenticação
 */
export function closeAuthModal() {
  const modal = document.getElementById("auth-modal");
  if (modal) {
    modal.remove();
    document.body.style.overflow = "";
  }
}

/**
 * Retorna o HTML do modal de autenticação
 * @param {string} mode - Modo do modal
 * @returns {string} HTML do modal
 */
function getAuthModalHTML(mode) {
  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isReset = mode === "reset";

  return `
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex justify-between items-center">
        <h2 class="text-xl font-bold text-white">
          ${
            isLogin
              ? "Entrar"
              : isRegister
              ? "Criar Conta"
              : "Recuperar Senha"
          }
        </h2>
        <button onclick="document.getElementById('auth-modal').remove(); document.body.style.overflow = ''" 
                class="text-white hover:text-gray-200 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="p-6">
        ${
          isLogin
            ? getLoginFormHTML()
            : isRegister
            ? getRegisterFormHTML()
            : getResetFormHTML()
        }

        <!-- Links de navegação -->
        <div class="mt-6 text-center text-sm">
          ${
            isLogin
              ? `
            <div class="space-y-2">
              <p class="text-gray-600">
                Não tem uma conta?
                <button data-switch="register" class="text-blue-600 hover:text-blue-700 font-medium">
                  Criar conta
                </button>
              </p>
              <p class="text-gray-600">
                Esqueceu a senha?
                <button data-switch="reset" class="text-blue-600 hover:text-blue-700 font-medium">
                  Recuperar
                </button>
              </p>
            </div>
          `
              : isRegister
              ? `
            <p class="text-gray-600">
              Já tem uma conta?
              <button data-switch="login" class="text-blue-600 hover:text-blue-700 font-medium">
                Entrar
              </button>
            </p>
          `
              : `
            <p class="text-gray-600">
              Lembrou a senha?
              <button data-switch="login" class="text-blue-600 hover:text-blue-700 font-medium">
                Voltar ao login
              </button>
            </p>
          `
          }
        </div>

        <!-- Modo Guest (opcional) -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <button id="guest-mode-btn" 
                  class="w-full py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors">
            Continuar sem login (modo local)
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * HTML do formulário de login
 */
function getLoginFormHTML() {
  return `
    <form id="login-form" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input type="email" 
               name="email" 
               required 
               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               placeholder="seu@email.com">
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Senha
        </label>
        <input type="password" 
               name="password" 
               required 
               minlength="6"
               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               placeholder="••••••">
      </div>

      <div id="auth-error" class="hidden text-red-600 text-sm bg-red-50 p-3 rounded-md"></div>

      <button type="submit" 
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium">
        Entrar
      </button>
    </form>
  `;
}

/**
 * HTML do formulário de registro
 */
function getRegisterFormHTML() {
  return `
    <form id="register-form" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Nome completo
        </label>
        <input type="text" 
               name="displayName" 
               required 
               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               placeholder="Seu nome">
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input type="email" 
               name="email" 
               required 
               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               placeholder="seu@email.com">
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Senha
        </label>
        <input type="password" 
               name="password" 
               required 
               minlength="6"
               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               placeholder="Mínimo 6 caracteres">
        <div id="password-strength" class="mt-1 text-xs"></div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Confirmar senha
        </label>
        <input type="password" 
               name="confirmPassword" 
               required 
               minlength="6"
               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               placeholder="Digite a senha novamente">
      </div>

      <div id="auth-error" class="hidden text-red-600 text-sm bg-red-50 p-3 rounded-md"></div>

      <button type="submit" 
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium">
        Criar Conta
      </button>
    </form>
  `;
}

/**
 * HTML do formulário de recuperação de senha
 */
function getResetFormHTML() {
  return `
    <form id="reset-form" class="space-y-4">
      <p class="text-sm text-gray-600 mb-4">
        Digite seu email e enviaremos um link para redefinir sua senha.
      </p>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input type="email" 
               name="email" 
               required 
               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               placeholder="seu@email.com">
      </div>

      <div id="auth-error" class="hidden text-red-600 text-sm bg-red-50 p-3 rounded-md"></div>
      <div id="auth-success" class="hidden text-green-600 text-sm bg-green-50 p-3 rounded-md"></div>

      <button type="submit" 
              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium">
        Enviar Link de Recuperação
      </button>
    </form>
  `;
}

/**
 * Configura os event listeners do modal
 */
function setupAuthModalEvents(modal, mode, resolve, reject) {
  // Switch entre modos
  modal.querySelectorAll("[data-switch]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const newMode = btn.getAttribute("data-switch");
      modal.remove();
      showAuthModal(newMode).then(resolve).catch(reject);
    });
  });

  // Modo guest
  const guestBtn = modal.querySelector("#guest-mode-btn");
  if (guestBtn) {
    guestBtn.addEventListener("click", () => {
      closeAuthModal();
      resolve({ guest: true });
    });
  }

  // Formulário de login
  const loginForm = modal.querySelector("#login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleLogin(loginForm, resolve, reject);
    });
  }

  // Formulário de registro
  const registerForm = modal.querySelector("#register-form");
  if (registerForm) {
    // Validação de senha em tempo real
    const passwordInput = registerForm.querySelector('input[name="password"]');
    if (passwordInput) {
      passwordInput.addEventListener("input", (e) => {
        const validation = validatePassword(e.target.value);
        const strengthDiv = modal.querySelector("#password-strength");
        if (strengthDiv) {
          strengthDiv.textContent = `Força: ${validation.strength}`;
          strengthDiv.className = `mt-1 text-xs ${
            validation.strength === "forte"
              ? "text-green-600"
              : validation.strength === "média"
              ? "text-yellow-600"
              : "text-red-600"
          }`;
        }
      });
    }

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleRegister(registerForm, resolve, reject);
    });
  }

  // Formulário de reset
  const resetForm = modal.querySelector("#reset-form");
  if (resetForm) {
    resetForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleReset(resetForm);
    });
  }

  // Fechar ao clicar fora
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeAuthModal();
      reject(new Error("Cancelado pelo usuário"));
    }
  });
}

/**
 * Processa o login
 */
async function handleLogin(form, resolve, reject) {
  const formData = new FormData(form);
  const email = formData.get("email");
  const password = formData.get("password");
  const errorDiv = form.querySelector("#auth-error");
  const submitBtn = form.querySelector('button[type="submit"]');

  // Validações
  if (!validateEmail(email)) {
    showError(errorDiv, "Email inválido");
    return;
  }

  // Desabilitar botão
  submitBtn.disabled = true;
  submitBtn.textContent = "Entrando...";

  // Fazer login
  const result = await loginUser(email, password);

  if (result.success) {
    showMessage("Login realizado com sucesso!", "success");
    closeAuthModal();
    resolve(result.user);
  } else {
    showError(errorDiv, result.error);
    submitBtn.disabled = false;
    submitBtn.textContent = "Entrar";
  }
}

/**
 * Processa o registro
 */
async function handleRegister(form, resolve, reject) {
  const formData = new FormData(form);
  const displayName = formData.get("displayName");
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const errorDiv = form.querySelector("#auth-error");
  const submitBtn = form.querySelector('button[type="submit"]');

  // Validações
  if (!validateEmail(email)) {
    showError(errorDiv, "Email inválido");
    return;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    showError(errorDiv, passwordValidation.message);
    return;
  }

  if (password !== confirmPassword) {
    showError(errorDiv, "As senhas não conferem");
    return;
  }

  // Desabilitar botão
  submitBtn.disabled = true;
  submitBtn.textContent = "Criando conta...";

  // Fazer registro
  const result = await registerUser(email, password, displayName);

  if (result.success) {
    showMessage("Conta criada com sucesso!", "success");
    closeAuthModal();
    resolve(result.user);
  } else {
    showError(errorDiv, result.error);
    submitBtn.disabled = false;
    submitBtn.textContent = "Criar Conta";
  }
}

/**
 * Processa a recuperação de senha
 */
async function handleReset(form) {
  const formData = new FormData(form);
  const email = formData.get("email");
  const errorDiv = form.querySelector("#auth-error");
  const successDiv = form.querySelector("#auth-success");
  const submitBtn = form.querySelector('button[type="submit"]');

  // Validações
  if (!validateEmail(email)) {
    showError(errorDiv, "Email inválido");
    return;
  }

  // Desabilitar botão
  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";

  // Enviar email
  const result = await resetPassword(email);

  if (result.success) {
    errorDiv.classList.add("hidden");
    successDiv.classList.remove("hidden");
    successDiv.textContent = result.message;
    submitBtn.textContent = "Email Enviado!";
    setTimeout(() => {
      closeAuthModal();
      showMessage("Verifique seu email!", "success");
    }, 2000);
  } else {
    showError(errorDiv, result.error);
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar Link de Recuperação";
  }
}

/**
 * Mostra mensagem de erro
 */
function showError(errorDiv, message) {
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.remove("hidden");
  }
}

