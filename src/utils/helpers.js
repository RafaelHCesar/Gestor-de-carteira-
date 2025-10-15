/**
 * Funções Auxiliares (Helpers)
 * ============================
 * Funções utilitárias gerais para a aplicação
 */

/**
 * Gera um ID único baseado em timestamp
 * @returns {string} ID único
 */
export function generateUniqueId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Cria um delay assíncrono
 * @param {number} ms - Milissegundos de delay
 * @returns {Promise} Promise que resolve após o delay
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Cria uma função debounced
 * @param {Function} func - Função a ser debounced
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} Função debounced
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Cria uma função throttled
 * @param {Function} func - Função a ser throttled
 * @param {number} limit - Limite de tempo em ms
 * @returns {Function} Função throttled
 */
export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Clona profundamente um objeto
 * @param {any} obj - Objeto a ser clonado
 * @returns {any} Objeto clonado
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;

  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error("Erro ao clonar objeto:", error);
    return obj;
  }
}

/**
 * Remove valores null/undefined de um objeto
 * @param {Object} obj - Objeto a ser limpo
 * @returns {Object} Objeto limpo
 */
export function removeNullish(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
}

/**
 * Agrupa um array de objetos por uma chave
 * @param {Array} array - Array a ser agrupado
 * @param {string} key - Chave para agrupar
 * @returns {Object} Objeto agrupado
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
}

/**
 * Ordena um array de objetos por uma chave
 * @param {Array} array - Array a ser ordenado
 * @param {string} key - Chave para ordenar
 * @param {string} order - 'asc' ou 'desc'
 * @returns {Array} Array ordenado
 */
export function sortBy(array, key, order = "asc") {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal === bVal) return 0;

    const comparison = aVal < bVal ? -1 : 1;
    return order === "asc" ? comparison : -comparison;
  });
}

/**
 * Remove duplicatas de um array
 * @param {Array} array - Array com possíveis duplicatas
 * @param {string} [key] - Chave opcional para comparação em arrays de objetos
 * @returns {Array} Array sem duplicatas
 */
export function removeDuplicates(array, key = null) {
  if (!key) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Formata um número para exibição compacta (1K, 1M, etc)
 * @param {number} num - Número a ser formatado
 * @returns {string} Número formatado
 */
export function formatCompactNumber(num) {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Capitaliza a primeira letra de uma string
 * @param {string} str - String a ser capitalizada
 * @returns {string} String capitalizada
 */
export function capitalize(str) {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Trunca uma string com reticências
 * @param {string} str - String a ser truncada
 * @param {number} maxLength - Comprimento máximo
 * @returns {string} String truncada
 */
export function truncate(str, maxLength) {
  if (!str || typeof str !== "string") return "";
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

/**
 * Verifica se um valor está vazio (null, undefined, '', [], {})
 * @param {any} value - Valor a ser verificado
 * @returns {boolean} True se vazio
 */
export function isEmpty(value) {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/**
 * Copia texto para a área de transferência
 * @param {string} text - Texto a ser copiado
 * @returns {Promise<boolean>} True se copiado com sucesso
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Erro ao copiar para área de transferência:", error);
    return false;
  }
}

/**
 * Obtém um valor de um objeto usando uma chave em formato de caminho
 * Exemplo: getNestedValue(obj, 'user.profile.name')
 * @param {Object} obj - Objeto
 * @param {string} path - Caminho da propriedade
 * @param {any} defaultValue - Valor padrão se não encontrado
 * @returns {any} Valor encontrado ou valor padrão
 */
export function getNestedValue(obj, path, defaultValue = undefined) {
  const keys = path.split(".");
  let result = obj;

  for (const key of keys) {
    if (result == null) return defaultValue;
    result = result[key];
  }

  return result !== undefined ? result : defaultValue;
}
