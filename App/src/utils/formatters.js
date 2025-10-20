/**
 * Utilidades para formateo de fechas y datos
 * Funciones comunes para formatear información
 */

/**
 * Formatea una fecha en formato legible
 * @param {string|Date} date - Fecha a formatear
 * @param {Object} options - Opciones de formateo
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date, options = {}) => {
  try {
    if (!date) return 'No disponible';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return 'Fecha inválida';
    }

    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options,
    };

    return dateObj.toLocaleDateString('es-ES', defaultOptions);
  } catch (error) {
    return 'Error en fecha';
  }
};

/**
 * Formatea un código de sala para visualización
 * @param {string} code - Código de la sala
 * @returns {string} - Código formateado
 */
export const formatRoomCode = (code) => {
  if (!code || typeof code !== 'string') {
    return 'N/A';
  }

  // Convertir a mayúsculas y agregar espacios cada 3 caracteres
  return code
    .toUpperCase()
    .replace(/(.{3})/g, '$1 ')
    .trim();
};

/**
 * Trunca un texto a una longitud específica
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @param {string} suffix - Sufijo para texto truncado
 * @returns {string} - Texto truncado
 */
export const truncateText = (text, maxLength = 50, suffix = '...') => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitaliza la primera letra de cada palabra
 * @param {string} text - Texto a capitalizar
 * @returns {string} - Texto capitalizado
 */
export const capitalizeWords = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};
