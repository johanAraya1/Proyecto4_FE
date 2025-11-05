import { useState, useCallback } from 'react';

/**
 * Hook base para operaciones asíncronas con estado común
 * Proporciona estados de loading, error y éxito que comparten todos los hooks
 */
export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  /**
   * Limpia los estados de error y éxito
   */
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  /**
   * Limpia todos los estados
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccessMessage(null);
  }, []);

  /**
   * Ejecuta una operación asíncrona con manejo automático de estados
   * @param {Function} operation - Función asíncrona a ejecutar
   * @param {Object} options - Opciones de configuración
   * @returns {Promise} - Resultado de la operación
   */
  const executeOperation = useCallback(
    async (operation, options = {}) => {
      const {
        successMessage: customSuccessMessage = null,
        errorHandler = null,
        onSuccess = null,
        onError = null,
        clearPrevious = true,
      } = options;

      try {
        setLoading(true);

        if (clearPrevious) {
          clearMessages();
        }

        const result = await operation();

        if (customSuccessMessage) {
          setSuccessMessage(customSuccessMessage);
        }

        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (err) {
        const errorMessage = errorHandler ? errorHandler(err) : err.message;
        setError(errorMessage);

        if (onError) {
          onError(err);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clearMessages]
  );

  return {
    loading,
    error,
    successMessage,
    clearMessages,
    reset,
    executeOperation,
    setLoading,
    setError,
    setSuccessMessage,
  };
};

export default useAsyncOperation;
