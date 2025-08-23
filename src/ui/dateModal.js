// Modal de seleção de datas
let currentCallback = null;
let currentPeriodSelect = null;

export const showDateModal = (periodSelect, callback) => {
  const modal = document.getElementById("date-modal");
  const startDateInput = document.getElementById("modal-start-date");
  const endDateInput = document.getElementById("modal-end-date");
  const noEndDateCheckbox = document.getElementById("no-end-date");

  if (!modal || !startDateInput || !endDateInput || !noEndDateCheckbox) return;

  currentCallback = callback;
  currentPeriodSelect = periodSelect;

  // Limpar campos
  startDateInput.value = "";
  endDateInput.value = "";
  noEndDateCheckbox.checked = true; // Marca "Sem data final" por padrão

  // Mostrar modal
  modal.classList.remove("hidden");

  // Desabilitar campo de data final por padrão (já que "Sem data final" está marcado)
  endDateInput.disabled = true;

  // Focar no primeiro campo
  setTimeout(() => startDateInput.focus(), 100);
};

export const hideDateModal = () => {
  const modal = document.getElementById("date-modal");
  if (modal) {
    modal.classList.add("hidden");
  }
  currentCallback = null;
  currentPeriodSelect = null;
};

export const wireDateModal = () => {
  const modal = document.getElementById("date-modal");
  const closeBtn = document.getElementById("close-date-modal");
  const cancelBtn = document.getElementById("cancel-date-modal");
  const confirmBtn = document.getElementById("confirm-date-modal");
  const startDateInput = document.getElementById("modal-start-date");
  const endDateInput = document.getElementById("modal-end-date");
  const noEndDateCheckbox = document.getElementById("no-end-date");

  if (!modal || !closeBtn || !cancelBtn || !confirmBtn) {
    return;
  }

  // Fechar modal
  const closeModal = () => {
    hideDateModal();
    if (currentPeriodSelect) {
      currentPeriodSelect.value = "todos";
    }
  };

  closeBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  // Confirmar seleção
  confirmBtn.addEventListener("click", () => {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const noEndDate = noEndDateCheckbox.checked;

    if (!startDate) {
      alert("Por favor, selecione uma data inicial.");
      return;
    }

    // Removida a validação de data final - sempre aceita quando "Sem data final" está marcado

    // Chamar callback com as datas selecionadas
    if (currentCallback) {
      currentCallback({
        startDate: startDate,
        endDate: noEndDate ? null : endDate,
        noEndDate: noEndDate,
      });
    }

    hideDateModal();
  });

  // Checkbox "Sem data final"
  if (noEndDateCheckbox) {
    noEndDateCheckbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        endDateInput.disabled = true;
        endDateInput.value = "";
      } else {
        endDateInput.disabled = false;
      }
    });
  }

  // Fechar modal ao clicar fora
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Fechar com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });
};
