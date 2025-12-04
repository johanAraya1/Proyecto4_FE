/**
 * Utilidades para manejo de errores de red y HTTP
 * Funciones comunes para procesar y formatear errores
 */

/**
 * Tipos de errores de red comunes
 */
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  TIMEOUT: 'TIMEOUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  VALIDATION: 'VALIDATION',
  UNKNOWN: 'UNKNOWN',
};

/**
 * Mensajes de error estándar
 */
export const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Error de conexión. Verifica tu conexión a internet.',
  [ERROR_TYPES.TIMEOUT]:
    'La solicitud tardó demasiado tiempo. Inténtalo nuevamente.',
  [ERROR_TYPES.UNAUTHORIZED]: 'Credenciales incorrectas o sesión expirada.',
  [ERROR_TYPES.FORBIDDEN]: 'No tienes permisos para realizar esta acción.',
  [ERROR_TYPES.NOT_FOUND]: 'El recurso solicitado no fue encontrado.',
  [ERROR_TYPES.SERVER_ERROR]:
    'Error interno del servidor. Inténtalo más tarde.',
  [ERROR_TYPES.VALIDATION]: 'Los datos proporcionados no son válidos.',
  [ERROR_TYPES.UNKNOWN]: 'Ha ocurrido un error inesperado.',
};

/**
 * Procesa un error de axios y retorna información estructurada
 * @param {Error} error - Error de axios o genérico
 * @returns {Object} - Información estructurada del error
 */
export const processApiError = (error) => {
  if (!error) {
    return {
      type: ERROR_TYPES.UNKNOWN,
      message: ERROR_MESSAGES[ERROR_TYPES.UNKNOWN],
      status: null,
    };
  }

  // Error de respuesta HTTP
  if (error.response) {
    const status = error.response.status;
    const serverMessage = error.response.data?.message;

    let type;
    switch (status) {
      case 400:
        type = ERROR_TYPES.VALIDATION;
        break;
      case 401:
        type = ERROR_TYPES.UNAUTHORIZED;
        break;
      case 403:
        type = ERROR_TYPES.FORBIDDEN;
        break;
      case 404:
        type = ERROR_TYPES.NOT_FOUND;
        break;
      case 500:
      case 502:
      case 503:
        type = ERROR_TYPES.SERVER_ERROR;
        break;
      default:
        type = ERROR_TYPES.UNKNOWN;
    }

    return {
      type,
      message: serverMessage || ERROR_MESSAGES[type],
      status,
    };
  }

  // Error de red/timeout
  if (error.request) {
    const isTimeout =
      error.code === 'ECONNABORTED' || error.message?.includes('timeout');

    return {
      type: isTimeout ? ERROR_TYPES.TIMEOUT : ERROR_TYPES.NETWORK,
      message: isTimeout
        ? ERROR_MESSAGES[ERROR_TYPES.TIMEOUT]
        : ERROR_MESSAGES[ERROR_TYPES.NETWORK],
      status: null,
    };
  }

  // Error genérico
  return {
    type: ERROR_TYPES.UNKNOWN,
    message: error.message || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN],
    status: null,
  };
};

/**
 * Crea un error estándar para lanzar en servicios
 * @param {Error} originalError - Error original
 * @returns {Error} - Error procesado
 */
export const createApiError = (originalError) => {
  const errorInfo = processApiError(originalError);
  const error = new Error(errorInfo.message);
  error.type = errorInfo.type;
  error.status = errorInfo.status;
  return error;
};

/**
 * Determina si un error es de conexión de red
 * @param {Error} error - Error a evaluar
 * @returns {boolean} - True si es error de red
 */
export const isNetworkError = (error) => {
  const errorInfo = processApiError(error);
  return (
    errorInfo.type === ERROR_TYPES.NETWORK ||
    errorInfo.type === ERROR_TYPES.TIMEOUT
  );
};

/**
 * Determina si un error requiere reautenticación
 * @param {Error} error - Error a evaluar
 * @returns {boolean} - True si requiere reautenticación
 */
export const requiresReauth = (error) => {
  const errorInfo = processApiError(error);
  return errorInfo.type === ERROR_TYPES.UNAUTHORIZED;
};
