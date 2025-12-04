import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { createApiError } from '../utils/errorHandling';

/**
 * Cliente API base para todas las comunicaciones HTTP
 * Proporciona funcionalidades comunes como manejo de errores, timeouts y headers
 */
export class ApiClient {
  /**
   * Constructor del cliente API
   * @param {Object} config - Configuración personalizada del cliente
   */
  constructor(config = {}) {
    const defaultConfig = {
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    this.client = axios.create({
      ...defaultConfig,
      ...config,
    });

    // Configurar interceptores
    this._setupInterceptors();
  }

  /**
   * Configura interceptores para requests y responses
   * @private
   */
  _setupInterceptors() {
    // Interceptor para requests
    this.client.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(createApiError(error));
      }
    );

    // Interceptor para responses
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        return Promise.reject(createApiError(error));
      }
    );
  }

  /**
   * Realiza una petición GET
   * @param {string} url - URL del endpoint
   * @param {Object} config - Configuración adicional
   * @returns {Promise<Object>} - Response de axios
   */
  async get(url, config = {}) {
    try {
      return await this.client.get(url, config);
    } catch (error) {
      throw createApiError(error);
    }
  }

  /**
   * Realiza una petición POST
   * @param {string} url - URL del endpoint
   * @param {Object} data - Datos a enviar
   * @param {Object} config - Configuración adicional
   * @returns {Promise<Object>} - Response de axios
   */
  async post(url, data = {}, config = {}) {
    try {
      return await this.client.post(url, data, config);
    } catch (error) {
      throw createApiError(error);
    }
  }

  /**
   * Realiza una petición PUT
   * @param {string} url - URL del endpoint
   * @param {Object} data - Datos a enviar
   * @param {Object} config - Configuración adicional
   * @returns {Promise<Object>} - Response de axios
   */
  async put(url, data = {}, config = {}) {
    try {
      return await this.client.put(url, data, config);
    } catch (error) {
      throw createApiError(error);
    }
  }

  /**
   * Realiza una petición PATCH
   * @param {string} url - URL del endpoint
   * @param {Object} data - Datos a enviar
   * @param {Object} config - Configuración adicional
   * @returns {Promise<Object>} - Response de axios
   */
  async patch(url, data = {}, config = {}) {
    try {
      return await this.client.patch(url, data, config);
    } catch (error) {
      throw createApiError(error);
    }
  }

  /**
   * Realiza una petición DELETE
   * @param {string} url - URL del endpoint
   * @param {Object} config - Configuración adicional
   * @returns {Promise<Object>} - Response de axios
   */
  async delete(url, config = {}) {
    try {
      return await this.client.delete(url, config);
    } catch (error) {
      throw createApiError(error);
    }
  }

  /**
   * Establece un header de autorización
   * @param {string} token - Token de autorización
   */
  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Obtiene la instancia del cliente axios para casos especiales
   * @returns {Object} - Instancia de axios
   */
  getInstance() {
    return this.client;
  }
}

// Exportar instancia singleton del cliente API
export const apiClient = new ApiClient();
export default apiClient;
