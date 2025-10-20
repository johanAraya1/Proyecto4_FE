import { useState, useCallback } from 'react';
import featureFlagService from '../services/featureFlagService';

/**
 * Hook personalizado para gestionar Feature Flags en componentes React
 * Proporciona estado y operaciones CRUD para feature flags
 * @returns {Object} - Estado y funciones para manejar feature flags
 */
export const useFeatureFlags = () => {
  // Estados del hook
  const [featureFlags, setFeatureFlags] = useState([]);
  const [currentFeatureFlag, setCurrentFeatureFlag] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  /**
   * Obtiene todos los feature flags del servidor
   * @returns {Promise<Array|null>} - Array de feature flags o null si hay error
   */
  const getAllFeatureFlags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const response = await featureFlagService.getAllFeatureFlags();

      if (response.success) {
        setFeatureFlags(response.featureFlags);
        return response.featureFlags;
      } else {
        throw new Error('Error al obtener feature flags');
      }
    } catch (err) {
      setError(err.message);
      setFeatureFlags([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Busca un feature flag por su ID
   * @param {string} id - ID del feature flag
   * @returns {Promise<Object|null>} - Feature flag encontrado o null
   */
  const getFeatureFlagById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      if (!id) {
        throw new Error('ID del feature flag requerido');
      }

      const response = await featureFlagService.getFeatureFlagById(id);

      if (response.success) {
        setCurrentFeatureFlag(response.featureFlag);
        return response.featureFlag;
      } else {
        throw new Error('Feature flag no encontrado');
      }
    } catch (err) {
      setError(err.message);
      setCurrentFeatureFlag(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Busca un feature flag por su nombre
   * @param {string} name - Nombre del feature flag
   * @returns {Promise<Object|null>} - Feature flag encontrado o null
   */
  const getFeatureFlagByName = useCallback(async (name) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      if (!name) {
        throw new Error('Nombre del feature flag requerido');
      }

      const response = await featureFlagService.getFeatureFlagByName(name);

      if (response.success) {
        setCurrentFeatureFlag(response.featureFlag);
        return response.featureFlag;
      } else {
        throw new Error('Feature flag no encontrado');
      }
    } catch (err) {
      setError(err.message);
      setCurrentFeatureFlag(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crea un nuevo feature flag
   * @param {Object} featureFlagData - Datos del nuevo feature flag
   * @returns {Promise<Object|null>} - Feature flag creado o null si hay error
   */
  const createFeatureFlag = useCallback(async (featureFlagData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      if (!featureFlagData || !featureFlagData.name) {
        throw new Error('Nombre del feature flag requerido');
      }

      const response =
        await featureFlagService.createFeatureFlag(featureFlagData);

      if (response.success) {
        setCurrentFeatureFlag(response.featureFlag);
        setSuccessMessage(response.message);
        setFeatureFlags((prev) => [...prev, response.featureFlag]);
        return response.featureFlag;
      } else {
        throw new Error('Error al crear feature flag');
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualiza un feature flag existente
   * @param {string} id - ID del feature flag
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object|null>} - Feature flag actualizado o null
   */
  const updateFeatureFlag = useCallback(async (id, updateData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      if (!id) {
        throw new Error('ID del feature flag requerido');
      }

      if (!updateData || typeof updateData !== 'object') {
        throw new Error('Datos de actualización requeridos');
      }

      const response = await featureFlagService.updateFeatureFlag(
        id,
        updateData
      );

      if (response.success) {
        setCurrentFeatureFlag(response.featureFlag);
        setSuccessMessage(response.message);
        setFeatureFlags((prev) =>
          prev.map((flag) => (flag.id === id ? response.featureFlag : flag))
        );
        return response.featureFlag;
      } else {
        throw new Error('Error al actualizar feature flag');
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Alterna el estado de un feature flag (activo/inactivo)
   * @param {string} id - ID del feature flag
   * @returns {Promise<Object|null>} - Feature flag actualizado o null
   */
  const toggleFeatureFlag = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      if (!id) {
        throw new Error('ID del feature flag requerido');
      }

      const response = await featureFlagService.toggleFeatureFlag(id);

      if (response.success) {
        setCurrentFeatureFlag(response.featureFlag);
        setSuccessMessage(response.message);
        setFeatureFlags((prev) =>
          prev.map((flag) => (flag.id === id ? response.featureFlag : flag))
        );
        return response.featureFlag;
      } else {
        throw new Error('Error al alternar feature flag');
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Elimina un feature flag del servidor
   * @param {string} id - ID del feature flag a eliminar
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  const deleteFeatureFlag = useCallback(
    async (id) => {
      try {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!id) {
          throw new Error('ID del feature flag requerido');
        }

        const response = await featureFlagService.deleteFeatureFlag(id);

        if (response.success) {
          setSuccessMessage(response.message);
          setFeatureFlags((prev) => prev.filter((flag) => flag.id !== id));

          if (currentFeatureFlag?.id === id) {
            setCurrentFeatureFlag(null);
          }

          return true;
        } else {
          throw new Error('Error al eliminar feature flag');
        }
      } catch (err) {
        setError(err.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [currentFeatureFlag]
  );

  /**
   * Verifica si un feature flag está habilitado por nombre
   * @param {string} name - Nombre del feature flag
   * @returns {boolean} - true si está habilitado, false en caso contrario
   */
  const isFeatureEnabled = useCallback(
    (name) => {
      const flag = featureFlags.find((f) => f.name === name);
      return flag ? flag.isEnabled() : false;
    },
    [featureFlags]
  );

  /**
   * Busca un feature flag en la lista actual por nombre
   * @param {string} name - Nombre del feature flag
   * @returns {Object|null} - Feature flag encontrado o null
   */
  const getFeatureByName = useCallback(
    (name) => {
      return featureFlags.find((f) => f.name === name) || null;
    },
    [featureFlags]
  );

  // Funciones de utilidad para limpiar estados
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  const clearCurrentFeatureFlag = useCallback(() => {
    setCurrentFeatureFlag(null);
  }, []);

  /**
   * Refresca la lista de feature flags desde el servidor
   * @returns {Promise<Array|null>} - Array actualizado de feature flags
   */
  const refreshFeatureFlags = useCallback(async () => {
    return await getAllFeatureFlags();
  }, [getAllFeatureFlags]);

  return {
    featureFlags,
    currentFeatureFlag,
    loading,
    error,
    successMessage,
    getAllFeatureFlags,
    getFeatureFlagById,
    getFeatureFlagByName,
    createFeatureFlag,
    updateFeatureFlag,
    toggleFeatureFlag,
    deleteFeatureFlag,
    isFeatureEnabled,
    getFeatureByName,
    clearMessages,
    clearCurrentFeatureFlag,
    refreshFeatureFlags,
    setFeatureFlags,
    setCurrentFeatureFlag,
    setError,
    setSuccessMessage,
  };
};
