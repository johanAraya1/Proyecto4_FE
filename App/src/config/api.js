/**
 * Configuración centralizada de APIs
 * Define todas las URLs base para diferentes plataformas
 */
import { Platform } from 'react-native';

// Constantes de URLs por plataforma
export const BASE_URL_WEB = 'http://localhost:3000';
export const BASE_URL_ANDROID =
  'https://fruitily-preexceptional-lacresha.ngrok-free.dev';
export const BASE_URL_IOS =
  'https://fruitily-preexceptional-lacresha.ngrok-free.dev';
export const BASE_URL_PHYSICAL_DEVICE = 'http://192.168.100.55:3000';

/**
 * Función para obtener la URL base según la plataforma actual
 * @returns {string} URL base correspondiente a la plataforma
 */
export const getBaseURL = () => {
  if (Platform.OS === 'web') {
    return BASE_URL_WEB;
  } else if (Platform.OS === 'android') {
    return BASE_URL_ANDROID;
  } else if (Platform.OS === 'ios') {
    return BASE_URL_IOS;
  } else {
    return BASE_URL_PHYSICAL_DEVICE;
  }
};

// Configuraciones adicionales de API
export const API_CONFIG = {
  timeout: 10000, // 10 segundos
  retries: 3,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

// Endpoints comunes
export const ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },

  // Salas de juego
  ROOMS: {
    BASE: '/rooms',
    JOIN: '/rooms/join',
    LEAVE: '/rooms/leave',
    CREATE: '/rooms/create',
  },

  // Telemetría
  TELEMETRY: {
    METRICS: '/telemetry/metrics',
    HEALTH: '/telemetry/health',
    RESET: '/telemetry/reset',
  },

  // Ranking
  RANKING: {
    BASE: '/ranking',
    PLAYER: '/ranking/{playerId}',
  },

  // Feature Flags
  FEATURE_FLAGS: {
    BASE: '/feature-flags',
    TOGGLE: '/feature-flags/{id}/toggle',
  },
};

// URL base actual (se actualiza automáticamente según la plataforma)
export const API_BASE_URL = getBaseURL();

export default {
  BASE_URL_WEB,
  BASE_URL_ANDROID,
  BASE_URL_IOS,
  BASE_URL_PHYSICAL_DEVICE,
  getBaseURL,
  API_CONFIG,
  ENDPOINTS,
  API_BASE_URL,
};
