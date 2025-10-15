/**
 * Constantes da Aplicação
 * =======================
 * Centraliza todas as constantes e valores configuráveis
 */

// ============================================================================
// ARMAZENAMENTO
// ============================================================================
export const STORAGE = {
  KEY: "capital_trader_state",
  VERSION: "1.0.0",
  THEME_KEY: "capital_trader_theme",
};

// ============================================================================
// TEMAS
// ============================================================================
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  DEFAULT: "light",
};

// ============================================================================
// TIPOS DE OPERAÇÃO
// ============================================================================
export const OPERATION_TYPES = {
  BUY: "compra",
  SELL: "venda",
};

// ============================================================================
// TIPOS DE TRANSAÇÃO DE CAPITAL
// ============================================================================
export const TRANSACTION_TYPES = {
  DEPOSIT: "deposito",
  WITHDRAWAL: "retirada",
  FEE: "taxa",
  ADJUSTMENT: "ajuste",
};

// ============================================================================
// ATIVOS PRIORITÁRIOS (FUTUROS)
// ============================================================================
export const PRIORITY_ASSETS = ["WIN", "WDO", "BIT", "IND", "DOL"];

// ============================================================================
// SÍMBOLOS PADRÃO (B3)
// ============================================================================
export const DEFAULT_SYMBOLS = [
  "PETR4",
  "PETR3",
  "VALE3",
  "ITUB4",
  "BBDC4",
  "BBAS3",
  "ABEV3",
  "WEGE3",
  "SUZB3",
  "PRIO3",
  "MGLU3",
  "RAIL3",
  "GGBR4",
  "CSNA3",
  "USIM5",
  "ELET3",
  "ELET6",
  "JBSS3",
  "BRFS3",
  "LREN3",
  "RENT3",
  "HAPV3",
  "B3SA3",
];

// ============================================================================
// CONFIGURAÇÕES DE API
// ============================================================================
export const API = {
  BRAPI_BASE_URL: "/brapi/api",
  AUTOCOMPLETE_MIN_CHARS: 2,
  AUTOCOMPLETE_DEBOUNCE_MS: 300,
  AUTOCOMPLETE_MAX_RESULTS: 50,
};

// ============================================================================
// FORMATAÇÃO
// ============================================================================
export const FORMAT = {
  LOCALE: "pt-BR",
  CURRENCY: "BRL",
  DATE_FORMAT: "DD/MM/YYYY",
  ISO_DATE_FORMAT: "YYYY-MM-DD",
};

// ============================================================================
// PERÍODOS DE FILTRO
// ============================================================================
export const PERIODS = {
  TODAY: "today",
  WEEK: "week",
  MONTH: "month",
  QUARTER: "quarter",
  YEAR: "year",
  ALL: "all",
};

// ============================================================================
// STATUS DE OPERAÇÃO
// ============================================================================
export const OPERATION_STATUS = {
  OPEN: "aberta",
  CLOSED: "fechada",
  CANCELLED: "cancelada",
};

// ============================================================================
// MENSAGENS
// ============================================================================
export const MESSAGES = {
  SUCCESS: {
    SAVE: "Dados salvos com sucesso!",
    DELETE: "Operação excluída com sucesso!",
    UPDATE: "Operação atualizada com sucesso!",
  },
  ERROR: {
    SAVE: "Erro ao salvar dados.",
    DELETE: "Erro ao excluir operação.",
    UPDATE: "Erro ao atualizar operação.",
    LOAD: "Erro ao carregar dados.",
    INVALID_DATA: "Dados inválidos.",
  },
  WARNING: {
    NO_DATA: "Nenhum dado encontrado.",
    CONFIRM_DELETE: "Tem certeza que deseja excluir?",
  },
};

// ============================================================================
// VALIDAÇÕES
// ============================================================================
export const VALIDATION = {
  MIN_VALUE: 0.01,
  MIN_QUANTITY: 1,
  MAX_SYMBOL_LENGTH: 10,
  MIN_SYMBOL_LENGTH: 3,
};

// ============================================================================
// ELEMENTOS DOM
// ============================================================================
export const DOM_IDS = {
  // Inputs de ativos
  ASSET_SYMBOL: "asset-symbol",
  DT_ASSET_SYMBOL: "dt-asset-symbol",

  // Datalists
  SYMBOLS_DATALIST: "symbols-datalist",
  SYMBOLS_DT_DATALIST: "symbols-dt-datalist",

  // User info
  USER_NAME: "user-name",
  USER_EMAIL: "user-email",
  USER_INITIALS: "user-initials",

  // Theme
  THEME_TOGGLE: "theme-toggle",

  // Config
  WIPE_RUN_BTN: "wipe-run-btn",
  WIPE_SCOPE: "wipe-scope",

  // Auth
  AUTH_MODAL: "auth-modal",
  LOGIN_FORM: "login-form",
  REGISTER_FORM: "register-form",
  RESET_PASSWORD_FORM: "reset-password-form",
};

// ============================================================================
// FIREBASE
// ============================================================================
export const FIREBASE = {
  ENABLED: true, // Habilitar/desabilitar Firebase
  SYNC_INTERVAL: 30000, // Intervalo de sincronização automática (ms)
  OFFLINE_FIRST: true, // Priorizar localStorage para leitura
};

// ============================================================================
// AUTH
// ============================================================================
export const AUTH = {
  REQUIRED: false, // Se true, usuário precisa fazer login
  GUEST_MODE: true, // Permitir uso sem login (apenas localStorage)
  SESSION_TIMEOUT: 7200000, // 2 horas em ms
};
