// Configurações da aplicação

export const config = {
  // Configurações da API
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
    timeout: 30000,
  },
  
  // Configurações de autenticação
  auth: {
    tokenKey: 'user_session',
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
  },
  
  // Configurações de preços
  prices: {
    cacheTimeout: 30000, // 30 segundos
    maxRetries: 3,
  },
  
  // Configurações de UI
  ui: {
    theme: 'light',
    language: 'pt-BR',
    dateFormat: 'DD/MM/YYYY',
    currencyFormat: 'BRL',
  },
  
  // Configurações de desenvolvimento
  dev: {
    debug: import.meta.env.DEV || false,
    logLevel: 'info',
  }
};

export default config;

