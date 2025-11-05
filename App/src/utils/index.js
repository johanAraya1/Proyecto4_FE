/**
 * Archivo índice para exportar todas las utilidades
 * Punto de entrada único para importar funciones de utilidad
 */

// Exportar utilidades de portapapeles
export { copyToClipboard, copyRoomCode } from './clipboard';

// Exportar utilidades de navegación
export {
  navigateToDashboard,
  navigateToGame,
  navigateBack,
  replaceToDashboard,
} from './navigation';

// Exportar utilidades de formateo
export {
  formatDate,
  formatRoomCode,
  truncateText,
  capitalizeWords,
} from './formatters';

// Exportar utilidades de manejo de errores
export {
  processApiError,
  createApiError,
  isNetworkError,
  requiresReauth,
  ERROR_TYPES,
  ERROR_MESSAGES,
} from './errorHandling';
