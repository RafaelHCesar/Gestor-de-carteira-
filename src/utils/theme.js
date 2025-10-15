/**
 * Sistema de Gerenciamento de Temas
 * =================================
 * Gerencia a alternância entre tema claro e escuro
 */

import { STORAGE, THEMES } from "../config/constants.js";

const THEME_STORAGE_KEY = STORAGE.THEME_KEY;
const DEFAULT_THEME = THEMES.DEFAULT;

/**
 * Obtém o tema atual do localStorage ou usa o padrão
 */
export const getCurrentTheme = () => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
  } catch (error) {
    console.warn("Erro ao ler tema do localStorage:", error);
    return DEFAULT_THEME;
  }
};

/**
 * Define o tema no localStorage e aplica ao documento
 */
export const setTheme = (theme) => {
  try {
    // Salva no localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    // Aplica ao documento (HTML, body e todos os elementos principais)
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);

    // Força a aplicação do tema em elementos específicos
    forceThemeApplication(theme);

    // Atualiza o botão de tema
    updateThemeToggleButton(theme);

    // Dispara evento para notificar mudança
    document.dispatchEvent(
      new CustomEvent("theme:changed", { detail: { theme } })
    );

    console.log(`Tema alterado para: ${theme}`);
  } catch (error) {
    console.error("Erro ao definir tema:", error);
  }
};

/**
 * Força a aplicação do tema em elementos específicos
 */
const forceThemeApplication = (theme) => {
  // Força a aplicação em elementos que podem não herdar o tema
  const elements = document.querySelectorAll(
    "input, select, textarea, .card, .chart-card, .kpi-card"
  );
  elements.forEach((element) => {
    element.style.backgroundColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--bg-primary");
    element.style.color = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--text-primary");
    element.style.borderColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--border-color");
  });
};

/**
 * Alterna entre tema claro e escuro
 */
export const toggleTheme = () => {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
  setTheme(newTheme);
  return newTheme;
};

/**
 * Aplica o tema salvo ao carregar a página
 */
export const applySavedTheme = () => {
  const savedTheme = getCurrentTheme();
  setTheme(savedTheme);
};

/**
 * Atualiza o switch de tema para refletir o estado atual
 */
const updateThemeToggleButton = (theme) => {
  const themeToggle = document.querySelector("#theme-toggle");
  if (!themeToggle) return;

  // Atualiza o estado do checkbox
  themeToggle.checked = theme === THEMES.DARK;

  // Atualiza o aria-label
  const isDark = theme === THEMES.DARK;
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Mudar para tema claro" : "Mudar para tema escuro"
  );
};

/**
 * Inicializa o sistema de temas
 */
export const initThemeSystem = () => {
  // Aplica o tema salvo
  applySavedTheme();

  // Adiciona listener para mudanças de tema
  document.addEventListener("theme:changed", (event) => {
    console.log("Tema alterado:", event.detail.theme);
  });

  console.log("Sistema de temas inicializado");
};

/**
 * Obtém informações sobre o tema atual
 */
export const getThemeInfo = () => {
  const currentTheme = getCurrentTheme();
  return {
    current: currentTheme,
    isDark: currentTheme === THEMES.DARK,
    isLight: currentTheme === THEMES.LIGHT,
    next: currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT,
  };
};
