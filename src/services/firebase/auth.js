/**
 * Serviço de Autenticação Firebase
 * =================================
 * Gerencia login, registro, logout e estado do usuário
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import { auth } from "./config.js";

// Estado do usuário atual
let currentUser = null;
let authStateListeners = [];

/**
 * Registra um novo usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha
 * @param {string} displayName - Nome para exibição
 * @returns {Promise<Object>} Usuário criado
 */
export async function registerUser(email, password, displayName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Atualizar nome do perfil
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    console.log("✅ Usuário registrado com sucesso:", email);
    return {
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName || userCredential.user.email,
      },
    };
  } catch (error) {
    console.error("❌ Erro ao registrar usuário:", error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
}

/**
 * Faz login do usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha
 * @returns {Promise<Object>} Resultado do login
 */
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log("✅ Login realizado com sucesso:", email);
    return {
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName:
          userCredential.user.displayName || userCredential.user.email,
      },
    };
  } catch (error) {
    console.error("❌ Erro ao fazer login:", error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
}

/**
 * Faz logout do usuário
 * @returns {Promise<Object>} Resultado do logout
 */
export async function logoutUser() {
  try {
    await signOut(auth);
    currentUser = null;
    console.log("✅ Logout realizado com sucesso");
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao fazer logout:", error);
    return {
      success: false,
      error: "Erro ao fazer logout. Tente novamente.",
    };
  }
}

/**
 * Obtém o usuário atual
 * @returns {Object|null} Usuário atual ou null
 */
export function getCurrentUser() {
  return auth.currentUser
    ? {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName || auth.currentUser.email,
      }
    : null;
}

/**
 * Verifica se há um usuário logado
 * @returns {boolean} True se logado
 */
export function isAuthenticated() {
  return !!auth.currentUser;
}

/**
 * Observa mudanças no estado de autenticação
 * @param {Function} callback - Função chamada quando o estado muda
 * @returns {Function} Função para cancelar a observação
 */
export function onAuthChange(callback) {
  authStateListeners.push(callback);

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    currentUser = user
      ? {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email,
        }
      : null;

    callback(currentUser);
  });

  return unsubscribe;
}

/**
 * Envia email de recuperação de senha
 * @param {string} email - Email do usuário
 * @returns {Promise<Object>} Resultado da operação
 */
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("✅ Email de recuperação enviado para:", email);
    return {
      success: true,
      message: "Email de recuperação enviado com sucesso!",
    };
  } catch (error) {
    console.error("❌ Erro ao enviar email de recuperação:", error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
}

/**
 * Atualiza o email do usuário
 * @param {string} newEmail - Novo email
 * @returns {Promise<Object>} Resultado da operação
 */
export async function changeEmail(newEmail) {
  try {
    if (!auth.currentUser) {
      return { success: false, error: "Usuário não autenticado" };
    }

    await updateEmail(auth.currentUser, newEmail);
    console.log("✅ Email atualizado com sucesso");
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao atualizar email:", error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
}

/**
 * Atualiza a senha do usuário
 * @param {string} newPassword - Nova senha
 * @returns {Promise<Object>} Resultado da operação
 */
export async function changePassword(newPassword) {
  try {
    if (!auth.currentUser) {
      return { success: false, error: "Usuário não autenticado" };
    }

    await updatePassword(auth.currentUser, newPassword);
    console.log("✅ Senha atualizada com sucesso");
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao atualizar senha:", error);
    return {
      success: false,
      error: getAuthErrorMessage(error.code),
    };
  }
}

/**
 * Atualiza o nome de exibição do usuário
 * @param {string} displayName - Novo nome
 * @returns {Promise<Object>} Resultado da operação
 */
export async function updateUserDisplayName(displayName) {
  try {
    if (!auth.currentUser) {
      return { success: false, error: "Usuário não autenticado" };
    }

    await updateProfile(auth.currentUser, { displayName });
    console.log("✅ Nome atualizado com sucesso");
    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao atualizar nome:", error);
    return { success: false, error: "Erro ao atualizar nome" };
  }
}

/**
 * Converte códigos de erro do Firebase em mensagens amigáveis
 * @param {string} errorCode - Código de erro do Firebase
 * @returns {string} Mensagem de erro traduzida
 */
function getAuthErrorMessage(errorCode) {
  const errorMessages = {
    "auth/email-already-in-use": "Este email já está cadastrado.",
    "auth/invalid-email": "Email inválido.",
    "auth/operation-not-allowed": "Operação não permitida.",
    "auth/weak-password": "Senha muito fraca. Use pelo menos 6 caracteres.",
    "auth/user-disabled": "Esta conta foi desativada.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "Credenciais inválidas.",
    "auth/too-many-requests":
      "Muitas tentativas. Tente novamente mais tarde.",
    "auth/network-request-failed": "Erro de conexão. Verifique sua internet.",
    "auth/requires-recent-login":
      "Esta operação requer login recente. Faça login novamente.",
  };

  return (
    errorMessages[errorCode] ||
    "Erro ao processar solicitação. Tente novamente."
  );
}

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} True se válido
 */
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Valida força da senha
 * @param {string} password - Senha a validar
 * @returns {Object} Resultado da validação
 */
export function validatePassword(password) {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  const isValid = password.length >= minLength;
  const strength =
    password.length >= 8 && hasUpperCase && hasLowerCase && hasNumbers
      ? "forte"
      : password.length >= 6 && (hasUpperCase || hasNumbers)
      ? "média"
      : "fraca";

  return {
    isValid,
    strength,
    message: isValid ? "" : `A senha deve ter pelo menos ${minLength} caracteres.`,
  };
}

