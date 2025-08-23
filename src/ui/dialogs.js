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
        ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 9v4m0 4h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>'
        : variant === "success"
        ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>'
        : variant === "warning"
        ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 9v4m0 4h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M13 16h-1v-4h-1M12 8h.01"/><circle cx="12" cy="12" r="9"/></svg>';

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
