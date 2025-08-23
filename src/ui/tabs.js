export const wireTabs = () => {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".tab-button")
        .forEach((btn) => btn.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((content) => content.classList.remove("active"));
      button.classList.add("active");
      const tabId = button.dataset.tab;
      document.getElementById(tabId).classList.add("active");
      try {
        console.debug("[tabs] changed ->", tabId);
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
    });
  });
};
