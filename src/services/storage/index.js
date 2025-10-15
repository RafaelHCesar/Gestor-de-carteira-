// Sistema de storage para persistência de dados da aplicação
import { STORAGE, FIREBASE } from "../../config/constants.js";
import { isFirebaseConfigured } from "../firebase/index.js";
import {
  saveStateHybrid,
  loadStateHybrid,
  migrateToFirebase,
  forceSyncFirebase,
  clearAllData,
} from "./firebase-storage.js";

const { KEY: STORAGE_KEY, VERSION: STORAGE_VERSION } = STORAGE;

/**
 * Salva o estado da aplicação
 * Usa Firebase se disponível, senão usa apenas localStorage
 * @param {Object} state - Estado a ser salvo
 * @returns {Promise<void>}
 */
export async function saveState(state) {
  // Se Firebase está configurado, usar sistema híbrido
  if (FIREBASE.ENABLED && isFirebaseConfigured()) {
    await saveStateHybrid(state);
  } else {
    // Fallback: apenas localStorage
    try {
      const dataToSave = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        data: state,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      console.log("Estado salvo com sucesso (localStorage)");
    } catch (error) {
      console.error("Erro ao salvar estado:", error);
    }
  }
}

/**
 * Carrega o estado da aplicação
 * Tenta Firebase primeiro se disponível, senão usa localStorage
 * @param {boolean} forceFirebase - Forçar carregar do Firebase
 * @returns {Promise<Object|null>} Estado carregado ou null se não existir
 */
export async function loadState(forceFirebase = false) {
  // Se Firebase está configurado, usar sistema híbrido
  if (FIREBASE.ENABLED && isFirebaseConfigured()) {
    return await loadStateHybrid(forceFirebase);
  } else {
    // Fallback: apenas localStorage
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);

      if (!savedData) {
        console.log("Nenhum estado salvo encontrado");
        return null;
      }

      const parsed = JSON.parse(savedData);

      // Verificar versão para compatibilidade futura
      if (parsed.version !== STORAGE_VERSION) {
        console.warn("Versão do storage diferente, resetando dados");
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      console.log("Estado carregado com sucesso (localStorage)");
      return parsed.data;
    } catch (error) {
      console.error("Erro ao carregar estado:", error);
      return null;
    }
  }
}

/**
 * Limpa todos os dados salvos
 * @returns {Promise<void>}
 */
export async function clearState() {
  if (FIREBASE.ENABLED && isFirebaseConfigured()) {
    await clearAllData();
  } else {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log("Estado limpo com sucesso");
    } catch (error) {
      console.error("Erro ao limpar estado:", error);
    }
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
      lastModified: new Date(parsed.timestamp),
    };
  } catch (error) {
    console.error("Erro ao obter informações do storage:", error);
    return null;
  }
}
