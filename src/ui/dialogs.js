export const confirmDialog = ({
  title = "Confirmação",
  message = "Você confirma esta ação?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "info", // "success" | "danger" | "warning" | "info"
} = {}) => {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className =
      "fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4";

    const modal = document.createElement("div");
    modal.className =
      "w-full max-w-md rounded-xl shadow-xl bg-white overflow-hidden";

    const color =
      variant === "danger"
        ? "#ef4444"
        : variant === "success"
        ? "#10b981"
        : variant === "warning"
        ? "#f59e0b"
        : "#3b82f6"; // info

    const icon =
      variant === "danger"
        ? '<img src="src/assets/icons/warning.svg" class="h-6 w-6" alt="Aviso">'
        : variant === "success"
        ? '<img src="src/assets/icons/success.svg" class="h-6 w-6" alt="Sucesso">'
        : variant === "warning"
        ? '<img src="src/assets/icons/warning.svg" class="h-6 w-6" alt="Aviso">'
        : '<img src="src/assets/icons/info.svg" class="h-6 w-6" alt="Informação">';

    modal.innerHTML = `
      <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3" style="background: linear-gradient(90deg, ${color}22, transparent)">
        <div class="rounded-full flex items-center justify-center" style="background:${color}; width: 2rem; height: 2rem;">
          ${icon}
        </div>
        <h3 class="text-lg font-semibold text-gray-800">${title}</h3>
      </div>
      <div class="px-6 py-5 text-gray-700 leading-6">
        <p>${message}</p>
      </div>
      <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
        <button data-action="cancel" class="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100">${cancelText}</button>
        <button data-action="confirm" class="px-4 py-2 rounded-md text-white hover:opacity-90" style="background:${color}">${confirmText}</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const cleanup = (result) => {
      document.removeEventListener("keydown", onKey);
      overlay.remove();
      resolve(result);
    };

    const onKey = (e) => {
      if (e.key === "Escape") cleanup(false);
      if (e.key === "Enter") cleanup(true);
    };

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) cleanup(false);
    });
    modal
      .querySelector('[data-action="cancel"]')
      .addEventListener("click", () => cleanup(false));
    modal
      .querySelector('[data-action="confirm"]')
      .addEventListener("click", () => cleanup(true));
    setTimeout(() => document.addEventListener("keydown", onKey), 0);
  });
};
