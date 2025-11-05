import { useState, useCallback } from 'react';
import { roomService } from '../services/roomService';

/**
 * Hook personalizado para manejar operaciones de salas de juego
 * Proporciona funcionalidades para crear salas, unirse y gestionar estado
 */
export const useRoom = () => {
  // Estados para manejar el estado de la operación
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [userRooms, setUserRooms] = useState([]);

  /**
   * Limpia los estados de error y éxito
   */
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  /**
   * Crea una nueva sala de juego
   * @param {number} userId - ID del usuario que crea la sala
   * @returns {Promise<Object|null>} - Objeto con los datos de la sala creada o null si falla
   */
  const createRoom = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Validar entrada
      if (!userId) {
        throw new Error('ID de usuario es requerido');
      }

      // Llamar al servicio para crear la sala
      const response = await roomService.createRoom(userId);

      if (response.success) {
        setCurrentRoom(response.room);
        setSuccessMessage(response.message);
        return response.room;
      } else {
        throw new Error('Error al crear la sala');
      }
    } catch (err) {
      setError(err.message);
      setCurrentRoom(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Busca una sala por su código
   * @param {string} roomCode - Código de la sala a buscar
   * @param {number} userId - ID del usuario que busca la sala
   * @returns {Promise<Object|null>} - Objeto con los datos de la sala y estado del usuario
   */
  const getRoomByCode = useCallback(async (roomCode, userId) => {
    try {
      setLoading(true);
      setError(null);

      // Validar entradas
      if (!roomCode) {
        throw new Error('Código de sala es requerido');
      }

      if (!userId) {
        throw new Error('ID de usuario es requerido');
      }

      // Llamar al servicio para buscar la sala
      const response = await roomService.getRoomByCode(roomCode, userId);

      if (response.success) {
        setCurrentRoom(response.room);
        // Retornar toda la información adicional
        return {
          room: response.room,
          isUserInRoom: response.isUserInRoom,
          isRoomFull: response.isRoomFull,
          message: response.message,
          userRole: response.userRole,
        };
      } else {
        throw new Error('Sala no encontrada');
      }
    } catch (err) {
      setError(err.message);
      setCurrentRoom(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Une a un usuario a una sala existente
   * @param {string} roomCode - Código de la sala
   * @param {number} userId - ID del usuario que se une
   * @returns {Promise<Object|null>} - Objeto con los datos actualizados de la sala o null si falla
   */
  const joinRoom = useCallback(async (roomCode, userId) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Validar entradas
      if (!roomCode || !userId) {
        throw new Error('Código de sala y ID de usuario son requeridos');
      }

      // Llamar al servicio para unirse a la sala
      const response = await roomService.joinRoom(roomCode, userId);

      if (response.success) {
        setCurrentRoom(response.room);
        setSuccessMessage(response.message);
        return response.room;
      } else {
        throw new Error('Error al unirse a la sala');
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtiene todas las salas de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array|null>} - Array con las salas del usuario o null si falla
   */
  const getUserRooms = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);

      // Validar entrada
      if (!userId) {
        throw new Error('ID de usuario es requerido');
      }

      // Llamar al servicio para obtener las salas
      const response = await roomService.getUserRooms(userId);

      if (response.success) {
        setUserRooms(response.rooms);
        return response.rooms;
      } else {
        throw new Error('Error al obtener las salas');
      }
    } catch (err) {
      setError(err.message);
      setUserRooms([]);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Une a un usuario a una sala existente por ID
   * @param {string} roomId - ID de la sala
   * @param {number} userId - ID del usuario que se une
   * @returns {Promise<Object|null>} - Objeto con los datos actualizados de la sala o null si falla
   */
  const joinRoomById = useCallback(async (roomId, userId) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Validar entradas
      if (!roomId || !userId) {
        throw new Error('ID de sala y ID de usuario son requeridos');
      }

      // Llamar al servicio para unirse a la sala
      const response = await roomService.joinRoomById(roomId, userId);

      if (response.success) {
        setCurrentRoom(response.room);
        setSuccessMessage(response.message);
        return response.room;
      } else {
        throw new Error('Error al unirse a la sala');
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reinicia el estado del hook
   */
  const resetRoomState = useCallback(() => {
    setCurrentRoom(null);
    setError(null);
    setSuccessMessage(null);
    setLoading(false);
  }, []);

  /**
   * Verifica si el usuario actual es el creador de la sala
   * @param {number} userId - ID del usuario a verificar
   * @returns {boolean} - Verdadero si es el creador
   */
  const isCreator = useCallback(
    (userId) => {
      return currentRoom ? currentRoom.isCreator(userId) : false;
    },
    [currentRoom]
  );

  /**
   * Verifica si el usuario actual es participante de la sala
   * @param {number} userId - ID del usuario a verificar
   * @returns {boolean} - Verdadero si es participante
   */
  const isParticipant = useCallback(
    (userId) => {
      return currentRoom ? currentRoom.isParticipant(userId) : false;
    },
    [currentRoom]
  );

  /**
   * Obtiene el estado de la sala en español
   * @returns {string} - Estado traducido o vacío si no hay sala
   */
  const getRoomStatusInSpanish = useCallback(() => {
    return currentRoom ? currentRoom.getStatusInSpanish() : '';
  }, [currentRoom]);

  /**
   * Verifica si la sala puede aceptar más jugadores
   * @returns {boolean} - Verdadero si la sala puede aceptar jugadores
   */
  const canJoin = useCallback(() => {
    return currentRoom
      ? !currentRoom.isFull() && currentRoom.isWaiting()
      : false;
  }, [currentRoom]);

  // Retornar el estado y las funciones del hook
  return {
    // Estados
    loading,
    error,
    currentRoom,
    successMessage,
    userRooms,

    // Acciones
    createRoom,
    getUserRooms,
    getRoomByCode,
    joinRoom,
    joinRoomById,
    resetRoomState,
    clearMessages,

    // Utilidades
    isCreator,
    isParticipant,
    getRoomStatusInSpanish,
    canJoin,

    // Propiedades computadas
    hasRoom: !!currentRoom,
    roomCode: currentRoom?.code || null,
    roomStatus: currentRoom?.status || null,
    playerCount: currentRoom?.getPlayerCount() || 0,
    isRoomFull: currentRoom?.isFull() || false,
    isRoomWaiting: currentRoom?.isWaiting() || false,
    isRoomPlaying: currentRoom?.isPlaying() || false,
    isRoomFinished: currentRoom?.isFinished() || false,
    hasUserRooms: userRooms.length > 0,
    userRoomsCount: userRooms.length,
  };
};
