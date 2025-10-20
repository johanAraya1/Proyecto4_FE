/**
 * Constantes globales de la aplicación
 * Centraliza valores comunes usados en toda la app
 */

// Timeouts y configuraciones de red
export const NETWORK = {
  DEFAULT_TIMEOUT: 10000, // 10 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
};

// Códigos de estado HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Mensajes de validación comunes
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'Este campo es requerido',
  INVALID_EMAIL: 'Email inválido',
  INVALID_PASSWORD: 'Contraseña debe tener al menos 6 caracteres',
  INVALID_ROOM_CODE: 'Código de sala inválido',
  INVALID_USER_ID: 'ID de usuario inválido',
  PASSWORDS_DONT_MATCH: 'Las contraseñas no coinciden',
};

// Límites de la aplicación
export const LIMITS = {
  ROOM_CODE_LENGTH: 6,
  MIN_PASSWORD_LENGTH: 6,
  MAX_USERNAME_LENGTH: 50,
  MAX_ROOM_PLAYERS: 2,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
};

// Claves de AsyncStorage
export const STORAGE_KEYS = {
  USER_TOKEN: '@CodeRoom:userToken',
  USER_DATA: '@CodeRoom:userData',
  LAST_LOGIN: '@CodeRoom:lastLogin',
  SETTINGS: '@CodeRoom:settings',
  GAME_HISTORY: '@CodeRoom:gameHistory',
};

// Estados de juego
export const GAME_STATES = {
  WAITING: 'waiting',
  IN_PROGRESS: 'in_progress',
  FINISHED: 'finished',
  CANCELLED: 'cancelled',
};

// Estados de sala
export const ROOM_STATES = {
  ACTIVE: 'active',
  WAITING: 'waiting',
  FULL: 'full',
  CLOSED: 'closed',
};

// Tipos de notificación
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

// Configuraciones de interfaz
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300, // Delay para búsquedas
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 300,
};

// Rutas de navegación
export const ROUTES = {
  SPLASH: 'Splash',
  LOGIN: 'Login',
  DASHBOARD: 'Dashboard',
  CREATE_ROOM: 'CreateRoom',
  JOIN_ROOM: 'JoinRoom',
  ROOM_CREATED: 'RoomCreated',
  ACTIVE_ROOMS: 'ActiveRooms',
  GAME: 'Game',
  SETTINGS: 'Settings',
  PROFILE: 'Profile',
};

// Eventos del sistema
export const EVENTS = {
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  ROOM_CREATED: 'room_created',
  ROOM_JOINED: 'room_joined',
  GAME_STARTED: 'game_started',
  GAME_FINISHED: 'game_finished',
  CONNECTION_LOST: 'connection_lost',
  CONNECTION_RESTORED: 'connection_restored',
};

// Roles de usuario
export const USER_ROLES = {
  PLAYER: 'player',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
};

// Configuraciones de desarrollo
export const DEV_CONFIG = {
  ENABLE_LOGS: __DEV__,
  ENABLE_DEBUG_MENU: __DEV__,
  // Configuración de modo desarrollo
  DEV_MODE: __DEV__,
  SHOW_PERFORMANCE_METRICS: __DEV__,
};

// Feature flags por defecto
export const DEFAULT_FEATURE_FLAGS = {
  ENABLE_TELEMETRY: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_DARK_MODE: false,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_ANALYTICS: true,
};

// Patrones de validación regex
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ROOM_CODE: /^[A-Z0-9]{6}$/,
  PASSWORD: /^.{6,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
};

// Mensajes de error específicos por contexto
export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Credenciales incorrectas',
    SESSION_EXPIRED: 'Sesión expirada',
    ACCOUNT_LOCKED: 'Cuenta bloqueada',
    NETWORK_ERROR: 'Error de conexión',
  },
  ROOM: {
    NOT_FOUND: 'Sala no encontrada',
    ALREADY_FULL: 'La sala está llena',
    ALREADY_MEMBER: 'Ya eres miembro de esta sala',
    INVALID_CODE: 'Código de sala inválido',
    CREATION_FAILED: 'Error al crear la sala',
    JOIN_FAILED: 'Error al unirse a la sala',
  },
  GAME: {
    CONNECTION_LOST: 'Conexión perdida con el juego',
    INVALID_MOVE: 'Movimiento inválido',
    GAME_ENDED: 'El juego ha terminado',
    TIMEOUT: 'Tiempo agotado',
  },
  GENERAL: {
    UNKNOWN_ERROR: 'Ha ocurrido un error inesperado',
    SERVER_ERROR: 'Error del servidor',
    MAINTENANCE: 'Servicio en mantenimiento',
    VERSION_OUTDATED: 'Versión de la app desactualizada',
  },
};

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  ROOM_CREATED: 'Sala creada exitosamente',
  ROOM_JOINED: 'Te has unido a la sala',
  GAME_WON: '¡Felicidades! Has ganado',
  SETTINGS_SAVED: 'Configuraciones guardadas',
  PROFILE_UPDATED: 'Perfil actualizado',
};

export default {
  NETWORK,
  HTTP_STATUS,
  VALIDATION_MESSAGES,
  LIMITS,
  STORAGE_KEYS,
  GAME_STATES,
  ROOM_STATES,
  NOTIFICATION_TYPES,
  UI_CONFIG,
  ROUTES,
  EVENTS,
  USER_ROLES,
  DEV_CONFIG,
  DEFAULT_FEATURE_FLAGS,
  REGEX_PATTERNS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
