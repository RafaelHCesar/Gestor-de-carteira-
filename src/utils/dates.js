// Funções utilitárias para manipulação de datas

/**
 * Converte uma data para string ISO no fuso horário local
 * @param {Date} date - Data a ser convertida
 * @returns {string} Data no formato ISO local
 */
export function toISODateLocal(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converte uma string ISO para Date no fuso horário local
 * @param {string} isoString - String ISO da data
 * @returns {Date} Objeto Date
 */
export function parseISODateLocal(isoString) {
  if (!isoString) return new Date();
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Formata uma data para o formato brasileiro (dd/mm/aaaa)
 * @param {Date|string} date - Data a ser formatada
 * @returns {string} Data formatada
 */
export function formatDateBR(date) {
  if (typeof date === 'string') {
    date = parseISODateLocal(date);
  }
  if (!(date instanceof Date) || isNaN(date)) {
    return '';
  }
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Define a data atual em todos os campos de data da aplicação
 */
export function setTodayToAllDateInputs() {
  const today = toISODateLocal();
  const dateInputs = document.querySelectorAll('input[type="date"]');
  
  dateInputs.forEach(input => {
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
 * @param {string} dateString - String da data
 * @returns {boolean} True se a data for válida
 */
export function isValidDate(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Calcula a diferença em dias entre duas datas
 * @param {string|Date} startDate - Data inicial
 * @param {string|Date} endDate - Data final
 * @returns {number} Diferença em dias
 */
export function getDaysDifference(startDate, endDate) {
  const start = typeof startDate === 'string' ? parseISODateLocal(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISODateLocal(endDate) : endDate;
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

