import axios from 'axios';
import { FeatureFlag } from '../models/FeatureFlag';
import { Platform } from 'react-native';

/**
 * Determina la URL base del servidor según la plataforma
 * @returns {string} URL base del API
 */
const getBaseURL = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  } else if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:3000';
  } else {
    return 'http://192.168.100.55:3000';
  }
};

const BASE_URL = getBaseURL();

// Cliente HTTP configurado para el API de feature flags
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Extrae datos de feature flag desde diferentes estructuras de respuesta
 * @param {Object} data - Datos del servidor
 * @returns {Object|null} - Datos extraídos o null
 */
const _extractFeatureFlagData = (data) => {
  if (!data) return null;
  
  if (data.feature_flag) {
    return data.feature_flag;
  } else if (data.featureFlag) {
    return data.featureFlag;
  } else if (data.name || data.id) {
    return data;
  } else {
    return null;
  }
};

/**
 * Servicio para gestionar Feature Flags a través del API REST
 * Maneja todas las operaciones CRUD para feature flags
 */
class FeatureFlagService {
  /**
   * Obtiene todos los feature flags del servidor
   * @returns {Promise<Object>} - Respuesta con array de feature flags
   */
  async getAllFeatureFlags() {
    try {
      const response = await api.get('/api/feature-flags');
      
      if (response.data && response.data.featureFlags) {
        const featureFlags = response.data.featureFlags.map(flagData => {
          const extractedData = _extractFeatureFlagData(flagData);
          return FeatureFlag.fromApiResponse(extractedData);
        });
        
        return {
          success: true,
          featureFlags: featureFlags
        };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Error de red');
    }
  }

  /**
   * Obtiene un feature flag específico por su ID
   * @param {string} id - ID del feature flag
   * @returns {Promise<Object>} - Respuesta con el feature flag encontrado
   */
  async getFeatureFlagById(id) {
    try {
      const response = await api.get(`/api/feature-flags/${id}`);
      
      if (response.data) {
        const extractedData = _extractFeatureFlagData(response.data);
        
        if (!extractedData) {
          throw new Error('Feature flag no encontrado');
        }
        
        return {
          success: true,
          featureFlag: FeatureFlag.fromApiResponse(extractedData)
        };
      } else {
        throw new Error('Feature flag no encontrado');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Error de red');
    }
  }

  /**
   * Busca un feature flag por su nombre
   * @param {string} name - Nombre del feature flag
   * @returns {Promise<Object>} - Respuesta con el feature flag encontrado
   */
  async getFeatureFlagByName(name) {
    try {
      const response = await api.get(`/api/feature-flags/name/${name}`);
      
      if (response.data) {
        const extractedData = _extractFeatureFlagData(response.data);
        
        if (!extractedData) {
          throw new Error('Feature flag no encontrado');
        }
        
        return {
          success: true,
          featureFlag: FeatureFlag.fromApiResponse(extractedData)
        };
      } else {
        throw new Error('Feature flag no encontrado');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Error de red');
    }
  }

  /**
   * Crea un nuevo feature flag en el servidor
   * @param {Object} featureFlagData - Datos del nuevo feature flag
   * @returns {Promise<Object>} - Respuesta con el feature flag creado
   */
  async createFeatureFlag(featureFlagData) {
    try {
      if (!featureFlagData || !featureFlagData.name) {
        throw new Error('Datos del feature flag requeridos');
      }

      const response = await api.post('/api/feature-flags', featureFlagData);

      if (response.data) {
        const extractedData = _extractFeatureFlagData(response.data);
        
        if (!extractedData) {
          throw new Error('Error al crear feature flag');
        }

        return {
          success: true,
          featureFlag: FeatureFlag.fromApiResponse(extractedData),
          message: 'Feature flag creado exitosamente'
        };
      } else {
        throw new Error('Error al crear feature flag');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Error de red');
    }
  }

  /**
   * Actualiza un feature flag existente
   * @param {string} id - ID del feature flag a actualizar
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} - Respuesta con el feature flag actualizado
   */
  async updateFeatureFlag(id, updateData) {
    try {
      if (!id) {
        throw new Error('ID del feature flag requerido');
      }

      if (!updateData || typeof updateData !== 'object') {
        throw new Error('Datos de actualización requeridos');
      }

      const response = await api.put(`/api/feature-flags/${id}`, updateData);

      if (response.data) {
        const extractedData = _extractFeatureFlagData(response.data);
        
        if (!extractedData) {
          throw new Error('Error al actualizar feature flag');
        }

        return {
          success: true,
          featureFlag: FeatureFlag.fromApiResponse(extractedData),
          message: 'Feature flag actualizado exitosamente'
        };
      } else {
        throw new Error('Error al actualizar feature flag');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Error de red');
    }
  }

  /**
   * Alterna el estado (activo/inactivo) de un feature flag
   * @param {string} id - ID del feature flag
   * @returns {Promise<Object>} - Respuesta con el feature flag actualizado
   */
  async toggleFeatureFlag(id) {
    try {
      if (!id) {
        throw new Error('ID del feature flag requerido');
      }

      const response = await api.patch(`/api/feature-flags/${id}/toggle`);

      if (response.data) {
        const extractedData = _extractFeatureFlagData(response.data);
        
        if (!extractedData) {
          throw new Error('Error al alternar feature flag');
        }

        const featureFlag = FeatureFlag.fromApiResponse(extractedData);
        const newState = featureFlag.isEnabled() ? 'habilitado' : 'deshabilitado';

        return {
          success: true,
          featureFlag: featureFlag,
          message: `Feature flag ${newState} exitosamente`
        };
      } else {
        throw new Error('Error al alternar feature flag');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Error de red');
    }
  }

  /**
   * Elimina un feature flag del servidor
   * @param {string} id - ID del feature flag a eliminar
   * @returns {Promise<Object>} - Respuesta de confirmación
   */
  async deleteFeatureFlag(id) {
    try {
      if (!id) {
        throw new Error('ID del feature flag requerido');
      }

      const response = await api.delete(`/api/feature-flags/${id}`);

      if (response.status === 204 || response.status === 200) {
        return {
          success: true,
          message: 'Feature flag eliminado exitosamente'
        };
      } else {
        throw new Error('Error al eliminar feature flag');
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Error de red');
    }
  }
}

// Instancia única del servicio para usar en toda la aplicación
const featureFlagService = new FeatureFlagService();
export default featureFlagService;