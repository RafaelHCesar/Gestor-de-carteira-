# Sistema de Cores - Capital Trader

## 📋 Visão Geral

O sistema de cores do Capital Trader foi centralizado para facilitar a manutenção e consistência visual. Todas as cores são definidas em um único local e podem ser alteradas programaticamente.

## 🎨 Arquivos do Sistema

### 1. `src/styles/colors.css`

Arquivo principal com todas as variáveis CSS de cores.

### 2. `src/utils/theme.js`

Gerenciador programático de cores com métodos para alterar cores dinamicamente.

### 3. `src/assets/icons/*.svg`

Todos os ícones SVG agora usam `currentColor` e a classe `.icon`.

## 🚀 Como Usar

### Alterando Cores via CSS

Para alterar uma cor, edite o arquivo `src/styles/colors.css`:

```css
:root {
  --icon-color: #ff0000; /* Altera cor dos ícones para vermelho */
  --primary-color: #00ff00; /* Altera cor primária para verde */
}
```

### Alterando Cores via JavaScript

```javascript
import themeManager from "./utils/theme.js";

// Alterar uma cor específica
themeManager.updateColor("icon", "#ff0000");

// Alterar múltiplas cores
themeManager.updateColors({
  icon: "#ff0000",
  primary: "#00ff00",
  success: "#00ff00",
});

// Definir um tema completo
themeManager.setTheme({
  primary: "#1a1a1a",
  icon: "#ffffff",
  textPrimary: "#ffffff",
  bgPrimary: "#000000",
});

// Resetar para cores padrão
themeManager.resetToDefault();
```

## 📊 Cores Disponíveis

### Cores Principais

- `--primary-color` - Azul principal (#3b82f6)
- `--primary-hover` - Azul hover (#2563eb)
- `--primary-active` - Azul ativo (#1d4ed8)

### Cores de Texto

- `--text-primary` - Texto principal (#111827)
- `--text-secondary` - Texto secundário (#6b7280)
- `--text-muted` - Texto suave (#9ca3af)

### Cores de Ícones

- `--icon-color` - Cor padrão dos ícones (#6b7280)
- `--icon-hover` - Cor hover dos ícones (#374151)
- `--icon-active` - Cor ativa dos ícones (#1f2937)
- `--icon-light` - Cor clara dos ícones (#9ca3af)

### Cores de Status

- `--success-color` - Verde sucesso (#10b981)
- `--warning-color` - Amarelo aviso (#f59e0b)
- `--error-color` - Vermelho erro (#ef4444)
- `--info-color` - Azul informação (#3b82f6)

### Cores de Fundo

- `--bg-primary` - Fundo principal (#ffffff)
- `--bg-secondary` - Fundo secundário (#f9fafb)
- `--bg-tertiary` - Fundo terciário (#f3f4f6)

### Cores de Borda

- `--border-color` - Borda padrão (#d1d5db)
- `--border-light` - Borda clara (#e5e7eb)
- `--border-dark` - Borda escura (#9ca3af)

### Cores de Resultado

- `--profit-color` - Verde lucro (#10b981)
- `--loss-color` - Vermelho prejuízo (#ef4444)
- `--neutral-color` - Cinza neutro (#6b7280)

## 🎯 Classes CSS Utilitárias

### Para Ícones

```css
.icon/* Cor padrão dos ícones */
.icon: hover /* Cor hover dos ícones */ .icon-active /* Cor ativa dos ícones */
  .icon-light;
.icon
.icon/* Cor clara dos ícones */;
```

### Para Status

```css
.text-success  /* Texto verde */
/* Texto verde */
/* Texto verde */
/* Texto verde */
.text-warning  /* Texto amarelo */
.text-error    /* Texto vermelho */
.text-info     /* Texto azul */
.text-profit   /* Texto lucro */
.text-loss; /* Texto prejuízo */
```

### Para Bordas

```css
.border-custom /* Borda padrão */
/* Borda padrão */
/* Borda padrão */
/* Borda padrão */
.border-light  /* Borda clara */
.border-dark; /* Borda escura */
```

## 🔧 Exemplos Práticos

### Mudando Tema para Modo Escuro

```javascript
themeManager.setTheme({
  bgPrimary: "#1a1a1a",
  bgSecondary: "#2d2d2d",
  textPrimary: "#ffffff",
  textSecondary: "#cccccc",
  icon: "#ffffff",
  border: "#404040",
});
```

### Mudando Cores de Resultado

```javascript
themeManager.updateColors({
  profit: "#00ff00", // Verde mais vibrante
  loss: "#ff0000", // Vermelho mais vibrante
  neutral: "#888888", // Cinza mais escuro
});
```

### Mudando Cor dos Ícones

```javascript
themeManager.updateColor("icon", "#ff6b35"); // Laranja
```

## 📝 Notas Importantes

1. **Todos os ícones SVG** agora usam `currentColor` e a classe `.icon`
2. **As cores são aplicadas automaticamente** ao carregar a página
3. **Mudanças são refletidas em tempo real** sem necessidade de recarregar
4. **O sistema é compatível** com Tailwind CSS
5. **As cores são salvas** no estado da aplicação (se implementado)

## 🎨 Temas Sugeridos

### Tema Clássico (Padrão)

```javascript
// Já implementado como padrão
```

### Tema Escuro

```javascript
themeManager.setTheme({
  bgPrimary: "#1a1a1a",
  bgSecondary: "#2d2d2d",
  bgTertiary: "#404040",
  textPrimary: "#ffffff",
  textSecondary: "#cccccc",
  textMuted: "#888888",
  icon: "#ffffff",
  border: "#404040",
  borderLight: "#555555",
  borderDark: "#333333",
});
```

### Tema Verde (Trading)

```javascript
themeManager.setTheme({
  primary: "#10b981",
  primaryHover: "#059669",
  primaryActive: "#047857",
  icon: "#10b981",
  success: "#10b981",
  profit: "#10b981",
});
```
