export const wireTabs = () => {
  // Função para trocar de aba
  const switchTab = (button) => {
    document
      .querySelectorAll(".sidebar-tab-button, .tab-button")
      .forEach((btn) => btn.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((content) => content.classList.remove("active"));

    button.classList.add("active");
    const tabId = button.dataset.tab;
    document.getElementById(tabId).classList.add("active");

    try {
    } catch (_) {}

    // notificar interessados (dashboard, etc.)
    document.dispatchEvent(
      new CustomEvent("tab:changed", { detail: { tab: tabId } })
    );

    // Foco nos campos de ativo ao entrar nas abas
    try {
      if (tabId === "swing") {
        document.getElementById("asset-symbol")?.focus();
      } else if (tabId === "daytrade") {
        document.getElementById("dt-asset-symbol")?.focus();
      }
    } catch (_) {}

    // Fechar sidebar no mobile após clicar
    if (window.innerWidth <= 768) {
      const sidebar = document.querySelector(".sidebar");
      const overlay = document.querySelector(".sidebar-overlay");
      if (sidebar) {
        sidebar.classList.remove("open");
      }
      if (overlay) {
        overlay.classList.remove("open");
      }
    }
  };

  // Event listeners para botões da sidebar
  document.querySelectorAll(".sidebar-tab-button").forEach((button) => {
    button.addEventListener("click", () => switchTab(button));
  });

  // Event listeners para botões antigos (mantém compatibilidade)
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => switchTab(button));
  });

  // Adiciona funcionalidade mobile
  addMobileToggle();
};

const addMobileToggle = () => {
  // Remove botão toggle existente se houver
  const existingToggle = document.querySelector(".sidebar-toggle");
  if (existingToggle) {
    existingToggle.remove();
  }

  // Cria botão toggle para mobile
  const toggleButton = document.createElement("button");
  toggleButton.className = "sidebar-toggle";
  toggleButton.innerHTML = `
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
    </svg>
  `;

  toggleButton.addEventListener("click", () => {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".sidebar-overlay");
    if (sidebar) {
      sidebar.classList.toggle("open");
    }
    if (overlay) {
      overlay.classList.toggle("open");
    }
  });

  // Adiciona o botão apenas em telas pequenas
  if (window.innerWidth <= 768) {
    document.body.appendChild(toggleButton);
  }

  // Listener para redimensionamento da janela
  window.addEventListener("resize", () => {
    if (window.innerWidth <= 768) {
      if (!document.querySelector(".sidebar-toggle")) {
        document.body.appendChild(toggleButton);
      }
    } else {
      const toggleButton = document.querySelector(".sidebar-toggle");
      if (toggleButton) {
        toggleButton.remove();
      }
      // Fecha sidebar se estiver aberta
      const sidebar = document.querySelector(".sidebar");
      const overlay = document.querySelector(".sidebar-overlay");
      if (sidebar) {
        sidebar.classList.remove("open");
      }
      if (overlay) {
        overlay.classList.remove("open");
      }
    }
  });

  // Fechar sidebar ao clicar no overlay
  const overlay = document.querySelector(".sidebar-overlay");
  if (overlay) {
    overlay.addEventListener("click", () => {
      const sidebar = document.querySelector(".sidebar");
      if (sidebar) {
        sidebar.classList.remove("open");
      }
      overlay.classList.remove("open");
    });
  }
};
