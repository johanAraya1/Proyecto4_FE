/**
 * Servicio para consumir las métricas de telemetría del backend
 * Maneja todas las llamadas a la API de métricas
 */
import { API_BASE_URL, ENDPOINTS } from '../config/api';

class TelemetryAPI {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  // Obtener todas las métricas
  async getAllMetrics() {
    const response = await fetch(
      `${this.baseUrl}${ENDPOINTS.TELEMETRY.METRICS}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // Obtener estado de salud
  async getHealthStatus() {
    const response = await fetch(
      `${this.baseUrl}${ENDPOINTS.TELEMETRY.HEALTH}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // Obtener métricas específicas
  async getSpecificMetrics(type) {
    const response = await fetch(
      `${this.baseUrl}${ENDPOINTS.TELEMETRY.METRICS}/${type}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // Reset de métricas (solo para administradores)
  async resetMetrics() {
    const response = await fetch(
      `${this.baseUrl}${ENDPOINTS.TELEMETRY.RESET}`,
      {
        method: 'POST',
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }
}

// Configurar la instancia de la API usando la configuración centralizada
export const telemetryAPI = new TelemetryAPI(API_BASE_URL);
export default telemetryAPI;
