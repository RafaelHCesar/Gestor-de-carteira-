// Sistema de storage para persistência de dados da aplicação

const STORAGE_KEY = 'capital_trader_state';
const STORAGE_VERSION = '1.0.0';

/**
 * Salva o estado da aplicação no localStorage
 * @param {Object} state - Estado a ser salvo
 */
export function saveState(state) {
  try {
    const dataToSave = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      data: state
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    console.log('Estado salvo com sucesso');
  } catch (error) {
    console.error('Erro ao salvar estado:', error);
  }
}

/**
 * Carrega o estado da aplicação do localStorage
 * @returns {Object|null} Estado carregado ou null se não existir
 */
export function loadState() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    if (!savedData) {
      console.log('Nenhum estado salvo encontrado');
      return null;
    }
    
    const parsed = JSON.parse(savedData);
    
    // Verificar versão para compatibilidade futura
    if (parsed.version !== STORAGE_VERSION) {
      console.warn('Versão do storage diferente, resetando dados');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    console.log('Estado carregado com sucesso');
    return parsed.data;
  } catch (error) {
    console.error('Erro ao carregar estado:', error);
    return null;
  }
}

/**
 * Limpa todos os dados salvos
 */
export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Estado limpo com sucesso');
  } catch (error) {
    console.error('Erro ao limpar estado:', error);
  }
}

/**
 * Verifica se há dados salvos
 * @returns {boolean} True se existirem dados salvos
 */
export function hasSavedState() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Obtém informações sobre o storage
 * @returns {Object} Informações do storage
 */
export function getStorageInfo() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return null;
    
    const parsed = JSON.parse(savedData);
    return {
      version: parsed.version,
      timestamp: parsed.timestamp,
      size: savedData.length,
      lastModified: new Date(parsed.timestamp)
    };
  } catch (error) {
    console.error('Erro ao obter informações do storage:', error);
    return null;
  }
}

