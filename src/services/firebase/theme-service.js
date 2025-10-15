/**
 * Serviço de Tema no Firebase
 * ===========================
 * Gerencia preferência de tema usando Firebase
 */

import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./config.js";
import { getCurrentUser } from "./auth.js";

/**
 * Salva o tema no Firebase
 * @param {string} theme - Tema a salvar
 * @returns {Promise<boolean>} Sucesso da operação
 */
export async function saveThemeToFirebase(theme) {
  try {
    const user = getCurrentUser();
    if (!user) return false;

    const themeRef = doc(db, "users", user.uid, "settings");
    const settingsDoc = await getDoc(themeRef);

    const settings = settingsDoc.exists() ? settingsDoc.data() : {};
    settings.theme = theme;
    settings.updatedAt = new Date();

    await setDoc(themeRef, settings, { merge: true });
    console.log("✅ Tema salvo no Firebase");
    return true;
  } catch (error) {
    console.error("❌ Erro ao salvar tema:", error);
    return false;
  }
}

/**
 * Carrega o tema do Firebase
 * @returns {Promise<string|null>} Tema ou null
 */
export async function loadThemeFromFirebase() {
  try {
    const user = getCurrentUser();
    if (!user) return null;

    const themeRef = doc(db, "users", user.uid, "settings");
    const settingsDoc = await getDoc(themeRef);

    if (settingsDoc.exists()) {
      const theme = settingsDoc.data().theme;
      console.log("✅ Tema carregado do Firebase:", theme);
      return theme || null;
    }

    return null;
  } catch (error) {
    console.error("❌ Erro ao carregar tema:", error);
    return null;
  }
}

