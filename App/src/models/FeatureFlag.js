/**
 * Modelo FeatureFlag - Representa una bandera de características del sistema
 * Permite activar/desactivar funcionalidades de forma dinámica
 */
export class FeatureFlag {
  /**
   * Crea una nueva instancia de FeatureFlag
   * @param {string} id - Identificador único
   * @param {string} name - Nombre del feature flag
   * @param {string|null} description - Descripción opcional
   * @param {boolean} value - Estado activo/inactivo
   * @param {string} createdAt - Fecha de creación
   * @param {string} updatedAt - Fecha de última actualización
   */
  constructor(
    id,
    name,
    description = null,
    value = false,
    createdAt,
    updatedAt
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.value = value;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Extrae datos de feature flag desde diferentes formatos de respuesta
   * @param {Object} data - Datos del API
   * @returns {Object|null} - Datos normalizados o null si son inválidos
   */
  static _extractFeatureFlagData(data) {
    if (!data || typeof data !== 'object') {
      return null;
    }

    const extractedData = {
      id: data.id || data.feature_flag_id,
      name: data.name || data.feature_flag_name,
      description: data.description || data.feature_flag_description,
      value: data.value !== undefined ? data.value : data.feature_flag_value,
      created_at: data.created_at || data.createdAt,
      updated_at: data.updated_at || data.updatedAt,
    };

    if (!extractedData.id && !extractedData.name) {
      return null;
    }

    return extractedData;
  }

  /**
   * Crea una instancia FeatureFlag desde la respuesta del API
   * @param {Object} apiData - Datos recibidos del servidor
   * @returns {FeatureFlag} - Nueva instancia de FeatureFlag
   */
  static fromApiResponse(apiData) {
    const extractedData = FeatureFlag._extractFeatureFlagData(apiData);

    if (!extractedData) {
      throw new Error('Datos de feature flag inválidos');
    }

    return new FeatureFlag(
      extractedData.id,
      extractedData.name,
      extractedData.description,
      Boolean(extractedData.value),
      extractedData.created_at,
      extractedData.updated_at
    );
  }

  /**
   * Verifica si el feature flag está habilitado
   * @returns {boolean} - true si está activo
   */
  isEnabled() {
    return this.value === true;
  }

  /**
   * Verifica si el feature flag está deshabilitado
   * @returns {boolean} - true si está inactivo
   */
  isDisabled() {
    return this.value === false;
  }

  /**
   * Alterna el estado del feature flag
   * @returns {boolean} - Nuevo valor después del cambio
   */
  toggle() {
    this.value = !this.value;
    return this.value;
  }

  /**
   * Obtiene el estado en español para mostrar al usuario
   * @returns {string} - "Habilitado" o "Deshabilitado"
   */
  getStatusInSpanish() {
    return this.value ? 'Habilitado' : 'Deshabilitado';
  }

  /**
   * Formatea el nombre para mostrar (reemplaza _ y - por espacios)
   * @returns {string} - Nombre formateado para display
   */
  getDisplayName() {
    if (!this.name || typeof this.name !== 'string') {
      return 'Sin nombre';
    }
    return this.name.replace(/_/g, ' ').replace(/-/g, ' ');
  }

  /**
   * Formatea la fecha de creación para mostrar al usuario
   * @returns {string} - Fecha formateada en español
   */
  getFormattedCreatedDate() {
    if (!this.createdAt) {
      return 'Fecha no disponible';
    }

    try {
      const date = new Date(this.createdAt);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  /**
   * Formatea la fecha de actualización para mostrar al usuario
   * @returns {string} - Fecha formateada en español
   */
  getFormattedUpdatedDate() {
    if (!this.updatedAt) {
      return 'Fecha no disponible';
    }

    try {
      const date = new Date(this.updatedAt);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  /**
   * Valida que el feature flag tenga los datos mínimos requeridos
   * @returns {boolean} - true si es válido
   */
  isValid() {
    return !!(this.id && this.name);
  }

  /**
   * Valida el formato del nombre de un feature flag
   * @param {string} name - Nombre a validar
   * @returns {boolean} - true si el nombre es válido
   */
  static isValidFeatureName(name) {
    if (!name || typeof name !== 'string') {
      return false;
    }

    const trimmedName = name.trim();

    // Verificar longitud (3-50 caracteres)
    if (trimmedName.length < 3 || trimmedName.length > 50) {
      return false;
    }

    // Verificar que solo contenga letras, números, guiones y guiones bajos
    const validNamePattern = /^[a-zA-Z0-9_-]+$/;
    return validNamePattern.test(trimmedName);
  }

  /**
   * Convierte la instancia a formato JSON para envío al servidor
   * @returns {Object} - Representación JSON del feature flag
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      value: this.value,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
