import axios from 'axios';
import { Room } from '../models/Room';
import { Platform } from 'react-native';

/**
 * Función para determinar la URL correcta según la plataforma
 */
const getBaseURL = () => {
  if (Platform.OS === 'web') {
    // Para web, usar localhost directo
    return 'http://localhost:3000';
  } else if (Platform.OS === 'android') {
    // Para Android emulador, usar IP especial que mapea a localhost de la máquina host
    return 'http://10.0.2.2:3000';
  } else if (Platform.OS === 'ios') {
    // Para iOS simulator, usar localhost
    return 'http://localhost:3000';
  } else {
    // Fallback para dispositivo físico (usar IP de la máquina)
    return 'http://192.168.100.55:3000';
  }
};

/**
 * Servicio de salas de juego - maneja la comunicación con el backend
 * Capa de servicios para operaciones de salas
 */
class RoomService {
  /**
   * Constructor del servicio de salas
   * Configura la URL base del API
   */
  constructor() {
    this.baseURL = getBaseURL();
    this.apiClient = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Crea una nueva sala de juego
   * @param {number} userId - ID del usuario que crea la sala
   * @returns {Promise<Object>} - Promesa que resuelve con la respuesta del servidor
   * @throws {Error} - Lanza error si hay problemas de red o datos inválidos
   */
  async createRoom(userId) {
    try {
      // Validar datos antes de enviar
      if (!userId || typeof userId !== 'number') {
        throw new Error('ID de usuario inválido');
      }

      const payload = { user_id: userId };
      console.log('📤 Creando sala para usuario:', userId);

      // Realizar petición al endpoint de creación de sala
      const response = await this.apiClient.post('/rooms', payload);
      
      // Verificar respuesta exitosa
      if ((response.status === 200 || response.status === 201) && response.data) {
        const roomData = response.data;
        console.log('✅ Sala creada con código:', roomData.room.code);
        
        return {
          success: true,
          message: roomData.message,
          room: Room.fromApiResponse(roomData.room)
        };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('💥 Error al crear sala:', error.message);
      
      // Manejo de errores específicos
      if (error.response) {
        // Error del servidor (4xx, 5xx)
        const status = error.response.status;
        const message = error.response.data?.message || 'Error del servidor';
        
        if (status === 400) {
          throw new Error('Datos de sala inválidos');
        } else if (status === 401) {
          throw new Error('No autorizado para crear salas');
        } else if (status === 404) {
          throw new Error('Servicio no disponible');
        } else {
          throw new Error(message);
        }
      } else if (error.request) {
        // Error de red
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      } else {
        // Error de validación u otro
        throw new Error(error.message || 'Error desconocido');
      }
    }
  }

  /**
   * Obtiene información de una sala por su código
   * @param {string} roomCode - Código de la sala
   * @returns {Promise<Object>} - Promesa que resuelve con los datos de la sala
   */
  async getRoomByCode(roomCode) {
    try {
      if (!roomCode || typeof roomCode !== 'string') {
        throw new Error('Código de sala inválido');
      }

      const response = await this.apiClient.get(`/rooms/code/${roomCode}`);
      
      console.log('🔍 Respuesta del backend para getRoomByCode:', response.data);
      
      if ((response.status === 200 || response.status === 201) && response.data) {
        // El backend envía { "room": { ... } }, así que necesitamos extraer response.data.room
        const roomData = response.data.room || response.data;
        
        return {
          success: true,
          room: Room.fromApiResponse(roomData)
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

      console.log('📋 Obteniendo salas del usuario:', userId);

      const response = await this.apiClient.get(`/rooms/user/${userId}`);
      
      if ((response.status === 200 || response.status === 201) && response.data) {
        const roomsData = response.data.rooms || [];
        console.log('✅ Salas obtenidas:', roomsData.length);
        
        // Convertir cada sala usando el modelo Room
        const rooms = roomsData.map(room => Room.fromApiResponse(room));
        
        return {
          success: true,
          rooms: rooms
        };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('💥 Error al obtener salas del usuario:', error.message);
      
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
        user_id: userId
      });
      
      if ((response.status === 200 || response.status === 201) && response.data) {
        return {
          success: true,
          message: response.data.message,
          room: Room.fromApiResponse(response.data.room)
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

      console.log('🤝 roomService.joinRoomById iniciado - Sala:', roomId, 'Usuario:', userId);

      const payload = { user_id: userId };
      console.log('📤 Enviando payload:', payload);
      
      const response = await this.apiClient.post(`/rooms/${roomId}/join`, payload);
      console.log('📥 Respuesta del servidor:', response.status, response.data);
      
      if ((response.status === 200 || response.status === 201) && response.data) {
        console.log('✅ Usuario unido exitosamente:', response.data);
        
        // Verificar si la respuesta tiene la estructura esperada
        const roomData = response.data.room || response.data;
        console.log('🏠 Datos de la sala:', roomData);
        console.log('👤 Debug creator info:', {
          creator_id: roomData.creator_id,
          creator_name: roomData.creator_name,
          hasCreatorName: !!roomData.creator_name
        });
        
        return {
          success: true,
          message: response.data.message || 'Te has unido a la sala exitosamente',
          room: Room.fromApiResponse(roomData)
        };
      } else {
        console.log('❌ Respuesta inválida del servidor');
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('💥 Error en roomService.joinRoomById:', error.message);
      console.error('💥 Response details:', error.response?.status, error.response?.data);
      console.error('💥 Stack trace:', error.stack);
      
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
}

// Exportar instancia singleton del servicio
export const roomService = new RoomService();
export default roomService;