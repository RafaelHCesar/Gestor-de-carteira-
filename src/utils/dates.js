// Retorna YYYY-MM-DD em horário local, evitando fuso (usa locale fr-CA)
export const toISODateLocal = (date = new Date()) =>
  date.toLocaleDateString("fr-CA");

// Faz parsing seguro de YYYY-MM-DD como data local
export const parseISODateLocal = (iso) => {
  if (!iso || typeof iso !== "string") return null;
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return new Date(iso); // fallback para strings com hora (ex.: 2025-08-17T00:00)
  const [, y, mo, d] = m;
  return new Date(Number(y), Number(mo) - 1, Number(d));
};

// Formata em pt-BR aceitando Date ou string (YYYY-MM-DD ou ISO com hora)
export const formatDateBR = (value) => {
  if (!value) return "";
  const date =
    value instanceof Date
      ? value
      : value.includes("T")
      ? new Date(value)
      : parseISODateLocal(value);
  return date ? date.toLocaleDateString("pt-BR") : "";
};

export const setTodayToAllDateInputs = () => {
  const today = toISODateLocal();
  document.querySelectorAll('input[type="date"]').forEach((input) => {
    try {
      // não auto-preencher se marcado para não autofill (usado em filtros personalizados)
      if (!input.value && !input.hasAttribute("data-no-autofill")) {
        input.value = today;
      }
    } catch (_) {
      /* ignore */
    }
  });
};
