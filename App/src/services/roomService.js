import { Room } from '../models/Room';
import { ApiClient } from './ApiClient';

/**
 * Servicio de salas de juego - maneja la comunicación con el backend
 * Capa de servicios para operaciones de salas
 */
class RoomService {
  /**
   * Constructor del servicio de salas
   * Configura el cliente API
   */
  constructor() {
    this.apiClient = new ApiClient();
  }

  /**
   * Crea una nueva sala de juego
   * @param {number} userId - ID del usuario que crea la sala
   * @returns {Promise<Object>} - Promesa que resuelve con la respuesta del servidor
   * @throws {Error} - Lanza error si hay problemas de red o datos inválidos
   */
  async createRoom(userId) {
    // Validar datos antes de enviar
    if (!userId || typeof userId !== 'number') {
      throw new Error('ID de usuario inválido');
    }

    const payload = { user_id: userId };

    // Realizar petición al endpoint de creación de sala
    const response = await this.apiClient.post('/rooms', payload);

    // Verificar respuesta exitosa
    if ((response.status === 200 || response.status === 201) && response.data) {
      const roomData = response.data;

      return {
        success: true,
        message: roomData.message,
        room: Room.fromApiResponse(roomData.room),
      };
    } else {
      throw new Error('Respuesta inválida del servidor');
    }
  }

  /**
   * Obtiene información de una sala por su código
   * @param {string} roomCode - Código de la sala
   * @param {number} userId - ID del usuario que busca la sala
   * @returns {Promise<Object>} - Promesa que resuelve con los datos de la sala y estado del usuario
   */
  async getRoomByCode(roomCode, userId) {
    try {
      if (!roomCode || typeof roomCode !== 'string') {
        throw new Error('Código de sala inválido');
      }

      if (!userId || typeof userId !== 'number') {
        throw new Error('ID de usuario inválido');
      }

      console.log('🔍 Buscando sala en backend:', { roomCode, userId });
      
      // Agregar user_id como query parameter
      const response = await this.apiClient.get(`/rooms/code/${roomCode}?user_id=${userId}`);
      
      console.log('📥 Respuesta del backend:', response);

      if (
        (response.status === 200 || response.status === 201) &&
        response.data
      ) {
        const data = response.data;
        const roomData = data.room || data;

        // Verificar los nuevos campos de respuesta
        const isUserInRoom = data.isUserInRoom || false;
        const isRoomFull = data.isRoomFull || false;
        const message = data.message || '';
        const userRole = data.userRole || null;

        return {
          success: true,
          room: Room.fromApiResponse(roomData),
          isUserInRoom,
          isRoomFull,
          message,
          userRole,
        };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Sala no encontrada');
      }
      throw new Error(error.message || 'Error al buscar la sala');
    }
  }

  /**
   * Obtiene todas las salas de un usuario específico
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} - Promesa que resuelve con las salas del usuario
   */
  async getUserRooms(userId) {
    try {
      if (!userId || typeof userId !== 'number') {
        throw new Error('ID de usuario inválido');
      }

      const response = await this.apiClient.get(`/rooms/user/${userId}`);

      if (
        (response.status === 200 || response.status === 201) &&
        response.data
      ) {
        const roomsData = response.data.rooms || [];

        // Convertir cada sala usando el modelo Room
        const rooms = roomsData.map((room) => Room.fromApiResponse(room));

        return {
          success: true,
          rooms: rooms,
        };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Error del servidor';

        if (status === 404) {
          throw new Error('No se encontraron salas para este usuario');
        } else if (status === 401) {
          throw new Error('No autorizado para ver las salas');
        } else {
          throw new Error(message);
        }
      } else if (error.request) {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      } else {
        throw new Error(error.message || 'Error desconocido');
      }
    }
  }
  async joinRoom(roomCode, userId) {
    try {
      if (!roomCode || !userId) {
        throw new Error('Código de sala y ID de usuario son requeridos');
      }

      const response = await this.apiClient.post(`/rooms/join`, {
        code: roomCode,
        user_id: userId,
      });

      if (
        (response.status === 200 || response.status === 201) &&
        response.data
      ) {
        return {
          success: true,
          message: response.data.message,
          room: Room.fromApiResponse(response.data.room),
        };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Error del servidor';

        if (status === 400) {
          throw new Error('No se puede unir a esta sala');
        } else if (status === 404) {
          throw new Error('Sala no encontrada');
        } else {
          throw new Error(message);
        }
      }
      throw new Error(error.message || 'Error al unirse a la sala');
    }
  }

  /**
   * Une a un usuario a una sala existente por ID
   * @param {string} roomId - ID de la sala
   * @param {number} userId - ID del usuario que se une
   * @returns {Promise<Object>} - Promesa que resuelve con los datos actualizados de la sala
   */
  async joinRoomById(roomId, userId) {
    try {
      if (!roomId || !userId) {
        throw new Error('ID de sala y ID de usuario son requeridos');
      }

      const payload = { user_id: userId };

      const response = await this.apiClient.post(
        `/rooms/${roomId}/join`,
        payload
      );

      if (
        (response.status === 200 || response.status === 201) &&
        response.data
      ) {
        // Verificar si la respuesta tiene la estructura esperada
        const roomData = response.data.room || response.data;

        return {
          success: true,
          message:
            response.data.message || 'Te has unido a la sala exitosamente',
          room: Room.fromApiResponse(roomData),
        };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Error del servidor';

        if (status === 400) {
          throw new Error('No se puede unir a esta sala');
        } else if (status === 404) {
          throw new Error('Sala no encontrada');
        } else if (status === 409) {
          throw new Error('La sala ya está completa');
        } else {
          throw new Error(message);
        }
      } else if (error.request) {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      } else {
        throw new Error(error.message || 'Error desconocido');
      }
    }
  }

  /**
   * Obtiene los detalles completos de una sala para el juego
   * @param {string} roomCode - Código de la sala
   * @returns {Promise<Object>} - Promesa que resuelve con los datos completos de la sala y jugadores
   * @throws {Error} - Lanza error si hay problemas de red o sala no encontrada
   */
  async getRoomGameDetails(roomCode) {
    try {
      const response = await this.apiClient.get(
        `/rooms/${roomCode}/game-details`
      );

      if (response.data && response.data.success) {
        const backendResponse = response.data;
        const roomData = backendResponse.room;

        // Validar que existan las propiedades necesarias
        if (!roomData.creator && !roomData.opponent) {
          throw new Error('No se encontraron datos de jugadores');
        }

        // El backend ya devuelve la estructura correcta, solo la retornamos
        return {
          success: true,
          room: {
            id: roomData.id,
            code: roomData.code,
            status: roomData.status,
            creator: {
              id: roomData.creator.id,
              name: roomData.creator.name,
              elo: roomData.creator.elo,
            },
            opponent: {
              id: roomData.opponent.id,
              name: roomData.opponent.name,
              elo: roomData.opponent.elo,
            },
          },
        };
      } else {
        throw new Error('No se pudieron obtener los detalles de la sala');
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Error del servidor';

        if (status === 404) {
          throw new Error('Sala no encontrada');
        } else {
          throw new Error(message);
        }
      } else if (error.request) {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      } else {
        throw new Error(error.message || 'Error desconocido');
      }
    }
  }

  /**
   * Guarda el estado actual del juego en el backend
   * @param {string} roomCode - Código de la sala
   * @param {Object} gameState - Estado completo del juego
   * @returns {Promise<Object>} - Promesa que resuelve con confirmación del guardado
   */
  async saveGameState(roomCode, gameState) {
    try {
      if (!roomCode || typeof roomCode !== 'string') {
        throw new Error('Código de sala inválido');
      }

      const payload = {
        gameState: gameState
      };

      const response = await this.apiClient.post(
        `/rooms/${roomCode}/save-state`,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        return {
          success: true,
          message: response.data?.message || 'Estado guardado exitosamente',
        };
      } else {
        throw new Error('Error al guardar el estado del juego');
      }
    } catch (error) {
      // No lanzar error para no interrumpir el juego
      return {
        success: false,
        message: error.message || 'Error al guardar',
      };
    }
  }

  /**
   * Carga el estado guardado del juego desde el backend
   * @param {string} roomCode - Código de la sala
   * @returns {Promise<Object>} - Promesa que resuelve con el estado del juego guardado
   */
  async loadGameState(roomCode) {
    try {
      if (!roomCode || typeof roomCode !== 'string') {
        throw new Error('Código de sala inválido');
      }

      const response = await this.apiClient.get(
        `/rooms/${roomCode}/load-state`
      );

      if (response.status === 200 && response.data) {
        return {
          success: true,
          gameState: response.data.gameState || null,
        };
      } else {
        return {
          success: false,
          gameState: null,
        };
      }
    } catch (error) {
      return {
        success: false,
        gameState: null,
      };
    }
  }
}

// Exportar instancia singleton del servicio
export const roomService = new RoomService();
export default roomService;
