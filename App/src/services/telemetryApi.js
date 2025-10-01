/**
 * Servicio para consumir las métricas de telemetría del backend
 * Maneja todas las llamadas a la API de métricas
 */
import { Platform } from 'react-native';

/**
 * Función para determinar la URL correcta según la plataforma
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

class TelemetryAPI {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  // Obtener todas las métricas
  async getAllMetrics() {
    try {
      const response = await fetch(`${this.baseUrl}/telemetry/metrics`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }
  }

  // Obtener estado de salud
  async getHealthStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/telemetry/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching health status:', error);
      throw error;
    }
  }

  // Obtener métricas específicas
  async getSpecificMetrics(type) {
    try {
      const response = await fetch(`${this.baseUrl}/telemetry/metrics/${type}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${type} metrics:`, error);
      throw error;
    }
  }

  // Reset de métricas (solo para administradores)
  async resetMetrics() {
    try {
      const response = await fetch(`${this.baseUrl}/telemetry/reset`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error resetting metrics:', error);
      throw error;
    }
  }
}

// Configurar la instancia de la API
const API_BASE_URL = getBaseURL();
export const telemetryAPI = new TelemetryAPI(API_BASE_URL);
export default telemetryAPI;