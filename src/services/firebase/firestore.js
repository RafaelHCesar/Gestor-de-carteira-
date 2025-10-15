/**
 * Serviço Firestore
 * =================
 * Gerencia todas as operações de banco de dados (CRUD)
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config.js";
import { getCurrentUser } from "./auth.js";

/**
 * Obtém a referência da coleção do usuário
 * @param {string} collectionName - Nome da coleção
 * @returns {Object|null} Referência da coleção ou null
 */
function getUserCollection(collectionName) {
  const user = getCurrentUser();
  if (!user) {
    console.error("Usuário não autenticado");
    return null;
  }
  return collection(db, "users", user.uid, collectionName);
}

/**
 * Obtém a referência do documento do usuário
 * @param {string} docName - Nome do documento
 * @returns {Object|null} Referência do documento ou null
 */
function getUserDoc(docName) {
  const user = getCurrentUser();
  if (!user) {
    console.error("Usuário não autenticado");
    return null;
  }
  return doc(db, "users", user.uid, docName);
}

// ============================================================================
// OPERAÇÕES SWING TRADE
// ============================================================================

/**
 * Salva uma operação Swing Trade
 * @param {Object} operation - Dados da operação
 * @returns {Promise<Object>} Resultado da operação
 */
export async function saveOperation(operation) {
  try {
    const operationsRef = getUserCollection("operations");
    if (!operationsRef) return { success: false, error: "Não autenticado" };

    const operationData = {
      ...operation,
      date:
        operation.date instanceof Date
          ? Timestamp.fromDate(operation.date)
          : Timestamp.fromDate(new Date(operation.date)),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    if (operation.id) {
      // Atualizar existente
      await setDoc(doc(operationsRef, String(operation.id)), operationData);
    } else {
      // Criar novo
      const newDoc = await addDoc(operationsRef, operationData);
      operationData.id = newDoc.id;
    }

    console.log("✅ Operação salva no Firestore");
    return { success: true, data: operationData };
  } catch (error) {
    console.error("❌ Erro ao salvar operação:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Carrega todas as operações Swing Trade
 * @returns {Promise<Array>} Lista de operações
 */
export async function loadOperations() {
  try {
    const operationsRef = getUserCollection("operations");
    if (!operationsRef) return [];

    const querySnapshot = await getDocs(
      query(operationsRef, orderBy("date", "desc"))
    );

    const operations = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      operations.push({
        ...data,
        id: doc.id,
        date:
          data.date instanceof Timestamp
            ? data.date.toDate().toISOString()
            : data.date,
      });
    });

    console.log(`✅ ${operations.length} operações carregadas do Firestore`);
    return operations;
  } catch (error) {
    console.error("❌ Erro ao carregar operações:", error);
    return [];
  }
}

/**
 * Deleta uma operação Swing Trade
 * @param {string} operationId - ID da operação
 * @returns {Promise<Object>} Resultado da operação
 */
export async function deleteOperation(operationId) {
  try {
    const operationsRef = getUserCollection("operations");
    if (!operationsRef) return { success: false, error: "Não autenticado" };

    await deleteDoc(doc(operationsRef, String(operationId)));
    console.log("✅ Operação deletada do Firestore");
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao deletar operação:", error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// OPERAÇÕES DAY TRADE
// ============================================================================

/**
 * Salva uma operação Day Trade
 * @param {Object} operation - Dados da operação
 * @returns {Promise<Object>} Resultado da operação
 */
export async function saveDayTradeOperation(operation) {
  try {
    const operationsRef = getUserCollection("dayTradeOperations");
    if (!operationsRef) return { success: false, error: "Não autenticado" };

    const operationData = {
      ...operation,
      date:
        operation.date instanceof Date
          ? Timestamp.fromDate(operation.date)
          : Timestamp.fromDate(new Date(operation.date)),
      createdAt: Timestamp.now(),
    };

    if (operation.id) {
      await setDoc(doc(operationsRef, String(operation.id)), operationData);
    } else {
      const newDoc = await addDoc(operationsRef, operationData);
      operationData.id = newDoc.id;
    }

    console.log("✅ Operação Day Trade salva no Firestore");
    return { success: true, data: operationData };
  } catch (error) {
    console.error("❌ Erro ao salvar operação Day Trade:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Carrega todas as operações Day Trade
 * @returns {Promise<Array>} Lista de operações
 */
export async function loadDayTradeOperations() {
  try {
    const operationsRef = getUserCollection("dayTradeOperations");
    if (!operationsRef) return [];

    const querySnapshot = await getDocs(
      query(operationsRef, orderBy("date", "desc"))
    );

    const operations = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      operations.push({
        ...data,
        id: doc.id,
        date:
          data.date instanceof Timestamp
            ? data.date.toDate().toISOString()
            : data.date,
      });
    });

    console.log(
      `✅ ${operations.length} operações Day Trade carregadas do Firestore`
    );
    return operations;
  } catch (error) {
    console.error("❌ Erro ao carregar operações Day Trade:", error);
    return [];
  }
}

/**
 * Deleta uma operação Day Trade
 * @param {string} operationId - ID da operação
 * @returns {Promise<Object>} Resultado da operação
 */
export async function deleteDayTradeOperation(operationId) {
  try {
    const operationsRef = getUserCollection("dayTradeOperations");
    if (!operationsRef) return { success: false, error: "Não autenticado" };

    await deleteDoc(doc(operationsRef, String(operationId)));
    console.log("✅ Operação Day Trade deletada do Firestore");
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao deletar operação Day Trade:", error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// TRANSAÇÕES DE CAPITAL
// ============================================================================

/**
 * Salva uma transação de capital
 * @param {Object} transaction - Dados da transação
 * @returns {Promise<Object>} Resultado da operação
 */
export async function saveCapitalTransaction(transaction) {
  try {
    const transactionsRef = getUserCollection("capitalTransactions");
    if (!transactionsRef) return { success: false, error: "Não autenticado" };

    const transactionData = {
      ...transaction,
      date:
        transaction.date instanceof Date
          ? Timestamp.fromDate(transaction.date)
          : Timestamp.fromDate(new Date(transaction.date)),
      createdAt: Timestamp.now(),
    };

    if (transaction.id) {
      await setDoc(
        doc(transactionsRef, String(transaction.id)),
        transactionData
      );
    } else {
      const newDoc = await addDoc(transactionsRef, transactionData);
      transactionData.id = newDoc.id;
    }

    console.log("✅ Transação de capital salva no Firestore");
    return { success: true, data: transactionData };
  } catch (error) {
    console.error("❌ Erro ao salvar transação de capital:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Carrega todas as transações de capital
 * @returns {Promise<Array>} Lista de transações
 */
export async function loadCapitalTransactions() {
  try {
    const transactionsRef = getUserCollection("capitalTransactions");
    if (!transactionsRef) return [];

    const querySnapshot = await getDocs(
      query(transactionsRef, orderBy("date", "desc"))
    );

    const transactions = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      transactions.push({
        ...data,
        id: doc.id,
        date:
          data.date instanceof Timestamp
            ? data.date.toDate().toISOString()
            : data.date,
      });
    });

    console.log(
      `✅ ${transactions.length} transações de capital carregadas do Firestore`
    );
    return transactions;
  } catch (error) {
    console.error("❌ Erro ao carregar transações de capital:", error);
    return [];
  }
}

/**
 * Deleta uma transação de capital
 * @param {string} transactionId - ID da transação
 * @returns {Promise<Object>} Resultado da operação
 */
export async function deleteCapitalTransaction(transactionId) {
  try {
    const transactionsRef = getUserCollection("capitalTransactions");
    if (!transactionsRef) return { success: false, error: "Não autenticado" };

    await deleteDoc(doc(transactionsRef, String(transactionId)));
    console.log("✅ Transação de capital deletada do Firestore");
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao deletar transação de capital:", error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// HOLDINGS (Posições em Carteira)
// ============================================================================

/**
 * Salva as posições em carteira
 * @param {Object} holdings - Objeto com todas as posições
 * @returns {Promise<Object>} Resultado da operação
 */
export async function saveHoldings(holdings) {
  try {
    const user = getCurrentUser();
    if (!user) return { success: false, error: "Não autenticado" };

    const batch = writeBatch(db);
    const holdingsRef = collection(db, "users", user.uid, "holdings");

    // Deletar todas as holdings antigas
    const oldHoldings = await getDocs(holdingsRef);
    oldHoldings.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Adicionar novas holdings
    Object.entries(holdings).forEach(([symbol, data]) => {
      const docRef = doc(holdingsRef, symbol);
      batch.set(docRef, {
        symbol,
        ...data,
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();
    console.log("✅ Holdings salvos no Firestore");
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao salvar holdings:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Carrega as posições em carteira
 * @returns {Promise<Object>} Objeto com as posições
 */
export async function loadHoldings() {
  try {
    const holdingsRef = getUserCollection("holdings");
    if (!holdingsRef) return {};

    const querySnapshot = await getDocs(holdingsRef);

    const holdings = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      holdings[data.symbol] = {
        quantity: data.quantity,
        averageCost: data.averageCost,
        totalCost: data.totalCost,
      };
    });

    console.log(`✅ Holdings carregados do Firestore`);
    return holdings;
  } catch (error) {
    console.error("❌ Erro ao carregar holdings:", error);
    return {};
  }
}

// ============================================================================
// CONFIGURAÇÕES (Settings)
// ============================================================================

/**
 * Salva as configurações do usuário
 * @param {Object} settings - Configurações
 * @returns {Promise<Object>} Resultado da operação
 */
export async function saveSettings(settings) {
  try {
    const settingsRef = getUserDoc("settings");
    if (!settingsRef) return { success: false, error: "Não autenticado" };

    await setDoc(settingsRef, {
      ...settings,
      lastSync: Timestamp.now(),
    });

    console.log("✅ Configurações salvas no Firestore");
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao salvar configurações:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Carrega as configurações do usuário
 * @returns {Promise<Object|null>} Configurações ou null
 */
export async function loadSettings() {
  try {
    const settingsRef = getUserDoc("settings");
    if (!settingsRef) return null;

    const docSnap = await getDoc(settingsRef);

    if (docSnap.exists()) {
      console.log("✅ Configurações carregadas do Firestore");
      return docSnap.data();
    }

    return null;
  } catch (error) {
    console.error("❌ Erro ao carregar configurações:", error);
    return null;
  }
}

// ============================================================================
// SINCRONIZAÇÃO COMPLETA
// ============================================================================

/**
 * Sincroniza todos os dados locais com o Firebase
 * @param {Object} appState - Estado completo da aplicação
 * @returns {Promise<Object>} Resultado da sincronização
 */
export async function syncAllData(appState) {
  try {
    console.log("🔄 Iniciando sincronização completa...");

    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Batch de operações
    const results = await Promise.allSettled([
      // Sync operations
      ...appState.operations.map((op) => saveOperation(op)),

      // Sync day trade operations
      ...appState.dayTradeOperations.map((op) => saveDayTradeOperation(op)),

      // Sync capital transactions
      ...appState.capitalTransactions.map((tx) => saveCapitalTransaction(tx)),

      // Sync holdings
      saveHoldings(appState.holdings),

      // Sync settings
      saveSettings({
        balance: appState.balance,
        taxesConfig: appState.taxesConfig,
        theme: localStorage.getItem("capital_trader_theme") || "light",
      }),
    ]);

    const errors = results.filter((r) => r.status === "rejected");

    if (errors.length > 0) {
      console.warn(`⚠️ ${errors.length} erros durante sincronização`);
    }

    console.log("✅ Sincronização completa finalizada");
    return { success: true, errors: errors.length };
  } catch (error) {
    console.error("❌ Erro na sincronização completa:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Carrega todos os dados do Firebase
 * @returns {Promise<Object>} Dados carregados
 */
export async function loadAllData() {
  try {
    console.log("📥 Carregando todos os dados do Firebase...");

    const [operations, dayTradeOps, capitalTxs, holdings, settings] =
      await Promise.all([
        loadOperations(),
        loadDayTradeOperations(),
        loadCapitalTransactions(),
        loadHoldings(),
        loadSettings(),
      ]);

    console.log("✅ Todos os dados carregados do Firebase");

    return {
      operations: operations || [],
      dayTradeOperations: dayTradeOps || [],
      capitalTransactions: capitalTxs || [],
      holdings: holdings || {},
      balance: settings?.balance || 0,
      taxesConfig: settings?.taxesConfig || {
        futuresFees: { WIN: 0, WDO: 0, IND: 0, DOL: 0, BIT: 0 },
        stocksPercentFee: 0,
        percentPerTrade: 0,
        initialDeposit: 0,
      },
    };
  } catch (error) {
    console.error("❌ Erro ao carregar todos os dados:", error);
    return null;
  }
}

