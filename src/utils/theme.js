/**
 * Sistema de Gerenciamento de Cores - Capital Trader
 * =================================================
 *
 * Este arquivo permite alterar todas as cores do sistema
 * de forma centralizada e programática.
 */

class ThemeManager {
  constructor() {
    this.colors = {
      // Cores principais
      primary: "#3b82f6",
      primaryHover: "#2563eb",
      primaryActive: "#1d4ed8",

      // Cores de texto
      textPrimary: "#111827",
      textSecondary: "#6b7280",
      textMuted: "#9ca3af",

      // Cores de ícones
      icon: "#6b7280",
      iconHover: "#374151",
      iconActive: "#1f2937",
      iconLight: "#9ca3af",

      // Cores de status
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6",

      // Cores de fundo
      bgPrimary: "#ffffff",
      bgSecondary: "#f9fafb",
      bgTertiary: "#f3f4f6",

      // Cores de borda
      border: "#d1d5db",
      borderLight: "#e5e7eb",
      borderDark: "#9ca3af",

      // Cores de resultado
      profit: "#10b981",
      loss: "#ef4444",
      neutral: "#6b7280",
    };
  }

  /**
   * Atualiza uma cor específica
   * @param {string} colorName - Nome da cor
   * @param {string} colorValue - Valor da cor (hex, rgb, etc.)
   */
  updateColor(colorName, colorValue) {
    if (this.colors.hasOwnProperty(colorName)) {
      this.colors[colorName] = colorValue;
      this.applyColors();
      console.log(`Cor ${colorName} atualizada para ${colorValue}`);
    } else {
      console.warn(`Cor ${colorName} não encontrada`);
    }
  }

  /**
   * Atualiza múltiplas cores de uma vez
   * @param {Object} colorUpdates - Objeto com as cores a serem atualizadas
   */
  updateColors(colorUpdates) {
    Object.keys(colorUpdates).forEach((colorName) => {
      this.updateColor(colorName, colorUpdates[colorName]);
    });
  }

  /**
   * Aplica todas as cores ao CSS
   */
  applyColors() {
    const root = document.documentElement;

    Object.keys(this.colors).forEach((colorName) => {
      const cssVarName = this.getCssVarName(colorName);
      root.style.setProperty(cssVarName, this.colors[colorName]);
    });
  }

  /**
   * Converte nome da cor para variável CSS
   * @param {string} colorName - Nome da cor
   * @returns {string} Nome da variável CSS
   */
  getCssVarName(colorName) {
    const mappings = {
      primary: "--primary-color",
      primaryHover: "--primary-hover",
      primaryActive: "--primary-active",
      textPrimary: "--text-primary",
      textSecondary: "--text-secondary",
      textMuted: "--text-muted",
      icon: "--icon-color",
      iconHover: "--icon-hover",
      iconActive: "--icon-active",
      iconLight: "--icon-light",
      success: "--success-color",
      warning: "--warning-color",
      error: "--error-color",
      info: "--info-color",
      bgPrimary: "--bg-primary",
      bgSecondary: "--bg-secondary",
      bgTertiary: "--bg-tertiary",
      border: "--border-color",
      borderLight: "--border-light",
      borderDark: "--border-dark",
      profit: "--profit-color",
      loss: "--loss-color",
      neutral: "--neutral-color",
    };

    return mappings[colorName] || `--${colorName}`;
  }

  /**
   * Obtém uma cor específica
   * @param {string} colorName - Nome da cor
   * @returns {string} Valor da cor
   */
  getColor(colorName) {
    return this.colors[colorName] || null;
  }

  /**
   * Obtém todas as cores
   * @returns {Object} Objeto com todas as cores
   */
  getAllColors() {
    return { ...this.colors };
  }

  /**
   * Define um tema completo
   * @param {Object} theme - Objeto com todas as cores do tema
   */
  setTheme(theme) {
    this.colors = { ...this.colors, ...theme };
    this.applyColors();
  }

  /**
   * Reseta para as cores padrão
   */
  resetToDefault() {
    this.colors = {
      primary: "#3b82f6",
      primaryHover: "#2563eb",
      primaryActive: "#1d4ed8",
      textPrimary: "#111827",
      textSecondary: "#6b7280",
      textMuted: "#9ca3af",
      icon: "#6b7280",
      iconHover: "#374151",
      iconActive: "#1f2937",
      iconLight: "#9ca3af",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6",
      bgPrimary: "#ffffff",
      bgSecondary: "#f9fafb",
      bgTertiary: "#f3f4f6",
      border: "#d1d5db",
      borderLight: "#e5e7eb",
      borderDark: "#9ca3af",
      profit: "#10b981",
      loss: "#ef4444",
      neutral: "#6b7280",
    };
    this.applyColors();
  }
}

// Instância global do gerenciador de tema
const themeManager = new ThemeManager();

// Aplica as cores ao carregar
document.addEventListener("DOMContentLoaded", () => {
  themeManager.applyColors();
});

// Exporta para uso em outros módulos
export default themeManager;

// Exemplo de uso:
//
// // Alterar uma cor específica
// themeManager.updateColor('icon', '#ff0000');
//
// // Alterar múltiplas cores
// themeManager.updateColors({
//   icon: '#ff0000',
//   primary: '#00ff00'
// });
//
// // Definir um tema completo
// themeManager.setTheme({
//   primary: '#1a1a1a',
//   icon: '#ffffff',
//   // ... outras cores
// });
//
// // Obter uma cor
// const iconColor = themeManager.getColor('icon');
//
// // Resetar para padrão
// themeManager.resetToDefault();
