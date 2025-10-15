/**
 * Utilitários de Datas
 * ====================
 * Funções para manipulação e formatação de datas
 */

/**
 * Converte uma data para string ISO no fuso horário local (YYYY-MM-DD)
 * @param {Date} date - Data a ser convertida (padrão: data atual)
 * @returns {string} Data no formato ISO local
 */
export function toISODateLocal(date = new Date()) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    date = new Date();
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Converte uma string ISO para Date no fuso horário local
 * @param {string} isoString - String ISO da data (YYYY-MM-DD ou YYYY-MM-DDTHH:MM)
 * @returns {Date} Objeto Date
 */
export function parseISODateLocal(isoString) {
  if (!isoString) return new Date();

  // Remove a parte do horário se existir (tudo após 'T')
  const dateOnly = isoString.split("T")[0];

  const [year, month, day] = dateOnly.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formata uma data para o formato brasileiro (DD/MM/YYYY)
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data formatada ou string vazia se inválida
 */
export function formatDateBR(date) {
  if (typeof date === "string") {
    date = parseISODateLocal(date);
  }

  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return "";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Define a data atual em todos os campos de data da aplicação
 */
export function setTodayToAllDateInputs() {
  const today = toISODateLocal();
  const dateInputs = document.querySelectorAll('input[type="date"]');

  dateInputs.forEach((input) => {
    if (!input.value) {
      input.value = today;
    }
  });
}

/**
 * Obtém a data atual no formato ISO local
 * @returns {string} Data atual no formato ISO
 */
export function getTodayISO() {
  return toISODateLocal();
}

/**
 * Verifica se uma data é válida
 * @param {string|Date} dateString - String ou objeto Date
 * @returns {boolean} True se a data for válida
 */
export function isValidDate(dateString) {
  if (!dateString) return false;
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Calcula a diferença em dias entre duas datas
 * @param {string|Date} startDate - Data inicial
 * @param {string|Date} endDate - Data final (padrão: data atual)
 * @returns {number} Diferença em dias (sempre positivo)
 */
export function getDaysDifference(startDate, endDate = new Date()) {
  const start =
    typeof startDate === "string" ? parseISODateLocal(startDate) : startDate;
  const end =
    typeof endDate === "string" ? parseISODateLocal(endDate) : endDate;

  if (!isValidDate(start) || !isValidDate(end)) {
    return 0;
  }

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Verifica se uma data é hoje
 * @param {string|Date} date - Data a ser verificada
 * @returns {boolean} True se for hoje
 */
export function isToday(date) {
  const checkDate = typeof date === "string" ? parseISODateLocal(date) : date;
  if (!isValidDate(checkDate)) return false;

  const today = new Date();
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
}

/**
 * Adiciona dias a uma data
 * @param {Date|string} date - Data base
 * @param {number} days - Número de dias a adicionar (pode ser negativo)
 * @returns {Date} Nova data
 */
export function addDays(date, days) {
  const baseDate =
    typeof date === "string" ? parseISODateLocal(date) : new Date(date);
  if (!isValidDate(baseDate)) return new Date();

  const result = new Date(baseDate);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Formata uma data de forma relativa (hoje, ontem, há X dias)
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Descrição relativa da data
 */
export function formatRelativeDate(date) {
  const targetDate = typeof date === "string" ? parseISODateLocal(date) : date;
  if (!isValidDate(targetDate)) return "";

  const daysDiff = getDaysDifference(targetDate, new Date());

  if (isToday(targetDate)) return "Hoje";
  if (daysDiff === 1) return "Ontem";
  if (daysDiff < 7) return `Há ${daysDiff} dias`;
  if (daysDiff < 30) return `Há ${Math.floor(daysDiff / 7)} semanas`;
  if (daysDiff < 365) return `Há ${Math.floor(daysDiff / 30)} meses`;

  return formatDateBR(targetDate);
}
