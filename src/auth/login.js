/**
 * Sistema de Autenticação - Login
 * =================================
 * Gerencia o login com Google, email/senha e verificação
 */

class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.verificationCode = null;
        this.countdownTimer = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Formulário de login
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Login com Google
        const googleLoginBtn = document.getElementById('google-login');
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', () => this.handleGoogleLogin());
        }

        // Toggle de senha
        const togglePassword = document.getElementById('toggle-password');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        }

        // Esqueci a senha
        const forgotPassword = document.getElementById('forgot-password');
        if (forgotPassword) {
            forgotPassword.addEventListener('click', (e) => this.handleForgotPassword(e));
        }

        // Modal de verificação
        this.setupVerificationModal();
    }

    setupVerificationModal() {
        const modal = document.getElementById('verification-modal');
        const verifyBtn = document.getElementById('verify-code');
        const cancelBtn = document.getElementById('cancel-verification');
        const resendBtn = document.getElementById('resend-code');
        const codeInput = document.getElementById('verification-code');

        if (verifyBtn) {
            verifyBtn.addEventListener('click', () => this.verifyCode());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideVerificationModal());
        }

        if (resendBtn) {
            resendBtn.addEventListener('click', () => this.resendCode());
        }

        if (codeInput) {
            codeInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                if (e.target.value.length === 6) {
                    this.verifyCode();
                }
            });
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        if (!this.validateLoginForm(email, password)) {
            return;
        }

        this.setLoadingState(true);

        try {
            // Simular chamada de API
            const response = await this.authenticateUser(email, password);
            
            if (response.requiresVerification) {
                this.showVerificationModal(email);
            } else {
                this.loginSuccess(response.user, rememberMe);
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoadingState(false);
        }
    }

    async handleGoogleLogin() {
        this.setLoadingState(true, 'google');

        try {
            // Simular autenticação Google
            const response = await this.authenticateWithGoogle();
            
            if (response.requiresVerification) {
                this.showVerificationModal(response.user.email);
            } else {
                this.loginSuccess(response.user, true);
            }
        } catch (error) {
            this.showError('Erro ao fazer login com Google: ' + error.message);
        } finally {
            this.setLoadingState(false, 'google');
        }
    }

    validateLoginForm(email, password) {
        const errors = [];

        if (!email || !email.includes('@')) {
            errors.push('Email inválido');
        }

        if (!password || password.length < 6) {
            errors.push('Senha deve ter pelo menos 6 caracteres');
        }

        if (errors.length > 0) {
            this.showError(errors.join(', '));
            return false;
        }

        return true;
    }

    async authenticateUser(email, password) {
        // Simular chamada de API
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simular verificação de credenciais
                if (email === 'teste@teste.com' && password === '123456') {
                    resolve({
                        user: {
                            id: 1,
                            name: 'Usuário Teste',
                            email: email,
                            avatar: null
                        },
                        requiresVerification: Math.random() > 0.5 // 50% de chance de precisar verificação
                    });
                } else {
                    reject(new Error('Email ou senha incorretos'));
                }
            }, 1000);
        });
    }

    async authenticateWithGoogle() {
        // Simular autenticação Google
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({
                    user: {
                        id: 2,
                        name: 'Usuário Google',
                        email: 'usuario@gmail.com',
                        avatar: 'https://via.placeholder.com/40'
                    },
                    requiresVerification: Math.random() > 0.7 // 30% de chance de precisar verificação
                });
            }, 1500);
        });
    }

    showVerificationModal(email) {
        const modal = document.getElementById('verification-modal');
        const emailDisplay = document.getElementById('verification-target');
        
        if (emailDisplay) {
            emailDisplay.textContent = email;
        }

        if (modal) {
            modal.classList.remove('hidden');
            this.sendVerificationCode(email);
            this.startCountdown();
        }
    }

    hideVerificationModal() {
        const modal = document.getElementById('verification-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        this.stopCountdown();
        this.clearVerificationCode();
    }

    async sendVerificationCode(email) {
        try {
            // Simular envio de código
            this.verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            console.log(`Código de verificação enviado para ${email}: ${this.verificationCode}`);
            
            // Em produção, aqui seria feita a chamada para a API
            this.showSuccess(`Código enviado para ${email}`);
        } catch (error) {
            this.showError('Erro ao enviar código de verificação');
        }
    }

    async verifyCode() {
        const codeInput = document.getElementById('verification-code');
        const enteredCode = codeInput.value;

        if (!enteredCode || enteredCode.length !== 6) {
            this.showError('Digite o código de 6 dígitos');
            return;
        }

        if (enteredCode === this.verificationCode) {
            this.hideVerificationModal();
            this.loginSuccess(this.currentUser, true);
        } else {
            this.showError('Código incorreto. Tente novamente.');
            codeInput.value = '';
            codeInput.focus();
        }
    }

    async resendCode() {
        const email = document.getElementById('email').value;
        await this.sendVerificationCode(email);
        this.startCountdown();
    }

    startCountdown() {
        let timeLeft = 60;
        const timerElement = document.getElementById('timer');
        const countdownElement = document.getElementById('countdown');
        const resendElement = document.getElementById('resend-code');

        this.countdownTimer = setInterval(() => {
            if (timeLeft > 0) {
                if (timerElement) timerElement.textContent = timeLeft;
                timeLeft--;
            } else {
                this.stopCountdown();
                if (countdownElement) countdownElement.classList.add('hidden');
                if (resendElement) resendElement.classList.remove('hidden');
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
        const codeInput = document.getElementById('verification-code');
        if (codeInput) {
            codeInput.value = '';
        }
    }

    loginSuccess(user, rememberMe) {
        this.isAuthenticated = true;
        this.currentUser = user;

        // Salvar dados do usuário
        if (rememberMe) {
            localStorage.setItem('auth_user', JSON.stringify(user));
            localStorage.setItem('auth_token', 'mock_token_' + Date.now());
        } else {
            sessionStorage.setItem('auth_user', JSON.stringify(user));
            sessionStorage.setItem('auth_token', 'mock_token_' + Date.now());
        }

        this.showSuccess('Login realizado com sucesso!');
        
        // Redirecionar para a aplicação principal
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    }

    async handleForgotPassword(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        
        if (!email || !email.includes('@')) {
            this.showError('Digite um email válido');
            return;
        }

        try {
            // Simular envio de email de recuperação
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.showSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
        } catch (error) {
            this.showError('Erro ao enviar email de recuperação');
        }
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleBtn = document.getElementById('toggle-password');

        if (!passwordInput || !toggleBtn) {
            console.error('Elementos não encontrados para o campo de senha');
            return;
        }

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleBtn.innerHTML = `
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: #6b7280;">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
            `;
            toggleBtn.setAttribute('title', 'Ocultar senha');
        } else {
            passwordInput.type = 'password';
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

    setLoadingState(loading, type = 'form') {
        const loginButton = document.getElementById('login-button');
        const loginText = document.getElementById('login-text');
        const loginSpinner = document.getElementById('login-spinner');
        const googleButton = document.getElementById('google-login');

        if (type === 'form') {
            if (loading) {
                loginButton.disabled = true;
                loginText.textContent = 'Entrando...';
                loginSpinner.classList.remove('hidden');
            } else {
                loginButton.disabled = false;
                loginText.textContent = 'Entrar';
                loginSpinner.classList.add('hidden');
            }
        } else if (type === 'google') {
            if (loading) {
                googleButton.disabled = true;
                googleButton.innerHTML = `
                    <svg class="animate-spin w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Entrando...
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

    showMessage(message, type = 'info') {
        // Remover mensagens anteriores
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        // Criar nova mensagem
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // Inserir no início do formulário
        const form = document.getElementById('login-form');
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
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    checkAuthStatus() {
        const user = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

        if (user && token) {
            this.isAuthenticated = true;
            this.currentUser = JSON.parse(user);
            
            // Se já está autenticado, redirecionar para a aplicação
            if (window.location.pathname.includes('login.html')) {
                window.location.href = '../index.html';
            }
        }
    }

    logout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_user');
        sessionStorage.removeItem('auth_token');
        
        window.location.href = 'login.html';
    }
}

// Inicializar o sistema de autenticação
const authManager = new AuthManager();

// Exportar para uso global
window.authManager = authManager;
