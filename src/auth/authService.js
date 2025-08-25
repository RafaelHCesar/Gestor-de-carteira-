/**
 * Serviço de Autenticação Global
 * ==============================
 * Gerencia o estado de autenticação em toda a aplicação
 */

class AuthService {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.token = null;
        this.listeners = [];
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.setupAuthGuard();
    }

    checkAuthStatus() {
        const user = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user');
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

        if (user && token) {
            this.isAuthenticated = true;
            this.currentUser = JSON.parse(user);
            this.token = token;
            this.notifyListeners();
        } else {
            this.logout();
        }
    }

    setupAuthGuard() {
        // Verificar se está em uma página de autenticação
        const isAuthPage = window.location.pathname.includes('login.html') || 
                          window.location.pathname.includes('register.html');

        if (!this.isAuthenticated && !isAuthPage) {
            // Redirecionar para login se não estiver autenticado
            window.location.href = './src/auth/login.html';
        } else if (this.isAuthenticated && isAuthPage) {
            // Redirecionar para a aplicação se já estiver autenticado
            window.location.href = './index.html';
        }
    }

    login(user, token, rememberMe = false) {
        this.isAuthenticated = true;
        this.currentUser = user;
        this.token = token;

        // Salvar dados
        if (rememberMe) {
            localStorage.setItem('auth_user', JSON.stringify(user));
            localStorage.setItem('auth_token', token);
        } else {
            sessionStorage.setItem('auth_user', JSON.stringify(user));
            sessionStorage.setItem('auth_token', token);
        }

        this.notifyListeners();
    }

    logout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.token = null;

        // Limpar dados
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_user');
        sessionStorage.removeItem('auth_token');

        this.notifyListeners();

        // Redirecionar para login
        window.location.href = './src/auth/login.html';
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getToken() {
        return this.token;
    }

    isLoggedIn() {
        return this.isAuthenticated;
    }

    // Sistema de listeners para notificar mudanças de autenticação
    addAuthListener(callback) {
        this.listeners.push(callback);
    }

    removeAuthListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback({
                    isAuthenticated: this.isAuthenticated,
                    user: this.currentUser,
                    token: this.token
                });
            } catch (error) {
                console.error('Erro ao notificar listener de autenticação:', error);
            }
        });
    }

    // Métodos para verificar permissões (futuro)
    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        // Implementar lógica de permissões aqui
        return true;
    }

    hasRole(role) {
        if (!this.currentUser) return false;
        
        // Implementar lógica de roles aqui
        return true;
    }

    // Método para atualizar dados do usuário
    updateUser(userData) {
        if (this.currentUser) {
            this.currentUser = { ...this.currentUser, ...userData };
            
            // Atualizar no storage
            const storage = localStorage.getItem('auth_user') ? localStorage : sessionStorage;
            storage.setItem('auth_user', JSON.stringify(this.currentUser));
            
            this.notifyListeners();
        }
    }

    // Método para renovar token (futuro)
    async refreshToken() {
        try {
            // Implementar renovação de token aqui
            const newToken = await this.callRefreshTokenAPI();
            this.token = newToken;
            
            const storage = localStorage.getItem('auth_token') ? localStorage : sessionStorage;
            storage.setItem('auth_token', newToken);
            
            this.notifyListeners();
            return true;
        } catch (error) {
            console.error('Erro ao renovar token:', error);
            this.logout();
            return false;
        }
    }

    async callRefreshTokenAPI() {
        // Simular chamada de API para renovar token
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve('new_mock_token_' + Date.now());
            }, 1000);
        });
    }

    // Método para verificar se o token está expirado
    isTokenExpired() {
        if (!this.token) return true;
        
        // Implementar verificação de expiração do token
        // Por enquanto, sempre retorna false para tokens mock
        return false;
    }

    // Método para fazer requisições autenticadas
    async authenticatedRequest(url, options = {}) {
        if (!this.isAuthenticated) {
            throw new Error('Usuário não autenticado');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            // Token expirado, tentar renovar
            const refreshed = await this.refreshToken();
            if (!refreshed) {
                throw new Error('Sessão expirada');
            }
            
            // Tentar novamente com o novo token
            headers.Authorization = `Bearer ${this.token}`;
            return fetch(url, {
                ...options,
                headers
            });
        }

        return response;
    }
}

// Criar instância global
const authService = new AuthService();

// Exportar para uso global
window.authService = authService;

// Exportar para módulos ES6
export default authService;
