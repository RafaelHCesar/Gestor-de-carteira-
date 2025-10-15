/**
 * Storage Híbrido - Local Storage + Firebase
 * ==========================================
 * Gerencia sincronização entre localStorage e Firebase
 */

import { STORAGE, FIREBASE } from "../../config/constants.js";
import {
  isFirebaseConfigured,
  isAuthenticated,
  syncAllData,
  loadAllData,
} from "../firebase/index.js";

const { KEY: STORAGE_KEY, VERSION: STORAGE_VERSION } = STORAGE;

/**
 * Salva estado no localStorage e sincroniza com Firebase
 * @param {Object} state - Estado a ser salvo
 * @returns {Promise<Object>} Resultado da operação
 */
export async function saveStateHybrid(state) {
  try {
    // 1. Salvar no localStorage (sempre)
    const dataToSave = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      data: state,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    console.log("✅ Estado salvo no localStorage");

    // 2. Sincronizar com Firebase (se configurado e autenticado)
    if (
      FIREBASE.ENABLED &&
      isFirebaseConfigured() &&
      isAuthenticated()
    ) {
      const syncResult = await syncAllData(state);
      if (syncResult.success) {
        console.log("✅ Estado sincronizado com Firebase");
      } else {
        console.warn("⚠️ Falha na sincronização com Firebase");
      }
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao salvar estado:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Carrega estado do localStorage ou Firebase
 * @param {boolean} forceFirebase - Forçar carregar do Firebase
 * @returns {Promise<Object|null>} Estado carregado ou null
 */
export async function loadStateHybrid(forceFirebase = false) {
  try {
    // 1. Se Firebase está disponível e autenticado
    if (
      FIREBASE.ENABLED &&
      isFirebaseConfigured() &&
      isAuthenticated() &&
      (forceFirebase || !FIREBASE.OFFLINE_FIRST)
    ) {
      console.log("📥 Carregando do Firebase...");
      const firebaseData = await loadAllData();

      if (firebaseData) {
        // Salvar no localStorage como cache
        const dataToSave = {
          version: STORAGE_VERSION,
          timestamp: Date.now(),
          data: firebaseData,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        console.log("✅ Estado carregado do Firebase e cacheado localmente");
        return firebaseData;
      }
    }

    // 2. Fallback: Carregar do localStorage
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (!savedData) {
      console.log("ℹ️ Nenhum estado salvo encontrado");
      return null;
    }

    const parsed = JSON.parse(savedData);

    // Verificar versão
    if (parsed.version !== STORAGE_VERSION) {
      console.warn("⚠️ Versão do storage diferente, resetando dados");
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    console.log("✅ Estado carregado do localStorage");
    return parsed.data;
  } catch (error) {
    console.error("❌ Erro ao carregar estado:", error);
    return null;
  }
}

/**
 * Migra dados do localStorage para Firebase
 * @returns {Promise<Object>} Resultado da migração
 */
export async function migrateToFirebase() {
  try {
    if (!isAuthenticated()) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    // Carregar dados do localStorage
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) {
      return {
        success: true,
        message: "Nenhum dado para migrar",
      };
    }

    const parsed = JSON.parse(savedData);
    const localData = parsed.data;

    // Sincronizar com Firebase
    console.log("🔄 Migrando dados para Firebase...");
    const result = await syncAllData(localData);

    if (result.success) {
      console.log("✅ Migração concluída com sucesso");
      return {
        success: true,
        message: "Dados migrados para Firebase com sucesso!",
      };
    } else {
      return {
        success: false,
        error: "Erro ao migrar dados",
      };
    }
  } catch (error) {
    console.error("❌ Erro na migração:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Força sincronização com Firebase
 * @param {Object} state - Estado atual
 * @returns {Promise<Object>} Resultado da sincronização
 */
export async function forceSyncFirebase(state) {
  try {
    if (!isAuthenticated()) {
      return {
        success: false,
        error: "Usuário não autenticado",
      };
    }

    console.log("🔄 Sincronização manual iniciada...");
    const result = await syncAllData(state);

    if (result.success) {
      console.log("✅ Sincronização manual concluída");
      return {
        success: true,
        message: "Dados sincronizados com sucesso!",
      };
    } else {
      return {
        success: false,
        error: "Erro na sincronização",
      };
    }
  } catch (error) {
    console.error("❌ Erro na sincronização:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Limpa dados locais e do Firebase
 * @returns {Promise<Object>} Resultado da operação
 */
export async function clearAllData() {
  try {
    // Limpar localStorage
    localStorage.removeItem(STORAGE_KEY);
    console.log("✅ localStorage limpo");

    // Se autenticado, limpar Firebase também
    if (isAuthenticated()) {
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
      console.log("✅ Firebase limpo");
    }

    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao limpar dados:", error);
    return { success: false, error: error.message };
  }
}

