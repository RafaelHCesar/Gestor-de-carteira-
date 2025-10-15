/**
 * Sistema de Storage - Firebase APENAS
 * =====================================
 * Gerencia persistência de dados usando APENAS Firebase
 * localStorage foi REMOVIDO completamente
 */

import { STORAGE } from "../../config/constants.js";
import { isFirebaseConfigured, isAuthenticated } from "../firebase/index.js";
import { syncAllData, loadAllData } from "../firebase/index.js";

const { VERSION: STORAGE_VERSION } = STORAGE;

/**
 * Salva o estado da aplicação no Firebase
 * @param {Object} state - Estado a ser salvo
 * @returns {Promise<Object>} Resultado da operação
 */
export async function saveState(state) {
  try {
    if (!isFirebaseConfigured()) {
      console.error("❌ Firebase não configurado");
      return { success: false, error: "Firebase não configurado" };
    }

    if (!isAuthenticated()) {
      console.error("❌ Usuário não autenticado");
      return { success: false, error: "Usuário não autenticado" };
    }

    // Salvar no Firebase
    const result = await syncAllData(state);

    if (result.success) {
      console.log("✅ Estado salvo no Firebase");
      return { success: true };
    } else {
      console.error("❌ Erro ao salvar no Firebase");
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error("❌ Erro ao salvar estado:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Carrega o estado da aplicação do Firebase
 * @returns {Promise<Object|null>} Estado carregado ou null se não existir
 */
export async function loadState() {
  try {
    if (!isFirebaseConfigured()) {
      console.error("❌ Firebase não configurado");
      return null;
    }

    if (!isAuthenticated()) {
      console.log("ℹ️ Usuário não autenticado");
      return null;
    }

    // Carregar do Firebase
    const data = await loadAllData();

    if (data) {
      console.log("✅ Estado carregado do Firebase");
      return data;
    }

    console.log("ℹ️ Nenhum estado salvo encontrado");
    return null;
  } catch (error) {
    console.error("❌ Erro ao carregar estado:", error);
    return null;
  }
}

/**
 * Limpa todos os dados do Firebase
 * @returns {Promise<void>}
 */
export async function clearState() {
  try {
    if (!isAuthenticated()) {
      console.error("❌ Usuário não autenticado");
      return;
    }

    const emptyState = {
      operations: [],
      dayTradeOperations: [],
      capitalTransactions: [],
      holdings: {},
      balance: 0,
      taxesConfig: {
        futuresFees: { WIN: 0, WDO: 0, IND: 0, DOL: 0, BIT: 0 },
        stocksPercentFee: 0,
        percentPerTrade: 0,
        initialDeposit: 0,
      },
    };

    await syncAllData(emptyState);
    console.log("✅ Estado limpo no Firebase");
  } catch (error) {
    console.error("❌ Erro ao limpar estado:", error);
  }
}

/**
 * Verifica se há dados salvos
 * @returns {Promise<boolean>} True se existirem dados salvos
 */
export async function hasSavedState() {
  try {
    if (!isAuthenticated()) return false;
    const data = await loadAllData();
    return data !== null && Object.keys(data).length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Obtém informações sobre o storage
 * @returns {Promise<Object|null>} Informações do storage
 */
export async function getStorageInfo() {
  try {
    if (!isAuthenticated()) return null;

    const data = await loadAllData();
    if (!data) return null;

    return {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      size: JSON.stringify(data).length,
      lastModified: new Date(),
      source: "Firebase",
    };
  } catch (error) {
    console.error("❌ Erro ao obter informações do storage:", error);
    return null;
  }
}
