import { Platform } from 'react-native';

const getBaseURL = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  } else if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  } else {
    return 'http://192.168.1.100:3000';
  }
};

/**
 * Servicio para manejar invitaciones a salas de juego
 */
const roomInvitationService = {
  /**
   * Envía una invitación a un amigo para unirse a una sala
   * @param {number} roomId - ID de la sala
   * @param {number} fromUserId - ID del usuario que envía la invitación
   * @param {number} toUserId - ID del amigo a invitar
   * @returns {Promise<Object>} - Promesa que resuelve con la respuesta del servidor
   */
  async sendRoomInvitation(roomId, fromUserId, toUserId) {
    try {
      // Validaciones previas
      if (!roomId || !fromUserId || !toUserId) {
        throw new Error('Todos los parámetros son requeridos para enviar la invitación');
      }
      
      if (fromUserId === toUserId) {
        throw new Error('No puedes enviarte una invitación a ti mismo');
      }
      
      console.log('📤 Enviando invitación de sala al backend:', { roomId, fromUserId, toUserId });
      
      const res = await fetch(`${getBaseURL()}/api/room-invitations/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': fromUserId.toString()
        },
        body: JSON.stringify({ 
          roomId: roomId, 
          fromUserId: fromUserId, 
          toUserId: toUserId 
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        // Extraer mensaje de error del backend
        const errorMessage = data.error || `HTTP ${res.status}`;
        throw new Error(errorMessage);
      }
      
      console.log('✅ Invitación enviada exitosamente:', data);
      return data;
    } catch (err) {
      console.error('❌ roomInvitationService.sendRoomInvitation error:', err.message);
      throw err;
    }
  },

  /**
   * Obtiene las invitaciones de salas recibidas por un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} - Promesa que resuelve con las invitaciones recibidas
   */
  async getReceivedInvitations(userId) {
    try {
      const res = await fetch(`${getBaseURL()}/api/room-invitations/received?userId=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString()
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      // Backend devuelve las invitaciones
      const invitations = data.invitations || data || [];
      
      // Mapear la estructura del backend al formato esperado del frontend
      return invitations.map(invitation => ({
        id: invitation.id,
        room: {
          id: invitation.room_id,
          code: invitation.room_code,
          status: invitation.room_status,
          creatorId: invitation.room_creator_id || invitation.creator_id,
          creatorName: invitation.room_creator_name || invitation.creator_name
        },
        fromUser: {
          id: invitation.from_user_id,
          name: invitation.from_user_name,
          email: invitation.from_user_email
        },
        status: invitation.status,
        created_at: invitation.created_at
      }));
    } catch (err) {
      console.error('roomInvitationService.getReceivedInvitations error', err.message);
      return [];
    }
  },

  /**
   * Acepta una invitación a una sala
   * @param {number} invitationId - ID de la invitación
   * @param {number} userId - ID del usuario que acepta
   * @returns {Promise<Object>} - Promesa que resuelve con la respuesta del servidor
   */
  async acceptInvitation(invitationId, userId) {
    try {
      // Validaciones previas
      if (!invitationId || !userId) {
        throw new Error('ID de invitación y usuario requeridos para aceptar');
      }
      
      console.log('✅ Aceptando invitación de sala en backend:', { invitationId, userId });
      
      const res = await fetch(`${getBaseURL()}/api/room-invitations/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString()
        },
        body: JSON.stringify({ 
          invitationId: invitationId,
          userId: userId 
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        const errorMessage = data.error || `HTTP ${res.status}`;
        throw new Error(errorMessage);
      }
      
      console.log('✅ Invitación aceptada en backend:', data);
      return data;
    } catch (err) {
      console.error('❌ roomInvitationService.acceptInvitation error:', err.message);
      throw err;
    }
  },

  /**
   * Rechaza una invitación a una sala
   * @param {number} invitationId - ID de la invitación
   * @param {number} userId - ID del usuario que rechaza
   * @returns {Promise<Object>} - Promesa que resuelve con la respuesta del servidor
   */
  async rejectInvitation(invitationId, userId) {
    try {
      // Validaciones previas
      if (!invitationId || !userId) {
        throw new Error('ID de invitación y usuario requeridos para rechazar');
      }
      
      console.log('❌ Rechazando invitación de sala en backend:', { invitationId, userId });
      
      const res = await fetch(`${getBaseURL()}/api/room-invitations/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString()
        },
        body: JSON.stringify({ 
          invitationId: invitationId,
          userId: userId 
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        const errorMessage = data.error || `HTTP ${res.status}`;
        throw new Error(errorMessage);
      }
      
      console.log('✅ Invitación rechazada en backend:', data);
      return data;
    } catch (err) {
      console.error('❌ roomInvitationService.rejectInvitation error:', err.message);
      throw err;
    }
  },

  /**
   * Obtiene las salas a las que el usuario fue invitado (solo salas activas con invitaciones aceptadas)
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} - Promesa que resuelve con las salas invitadas
   */
  async getInvitedRooms(userId) {
    try {
      const res = await fetch(`${getBaseURL()}/api/room-invitations/received?userId=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString()
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      // Obtener las invitaciones y filtrar solo las aceptadas o pendientes con datos de sala
      const invitations = data.invitations || data || [];
      
      // Mapear a objetos de sala
      return invitations
        .filter(inv => inv.room_id && inv.room_code) // Solo las que tienen datos de sala
        .map(inv => ({
          id: inv.room_id,
          code: inv.room_code,
          status: inv.room_status || 'waiting',
          creator_id: inv.room_creator_id || inv.creator_id,
          creator_name: inv.room_creator_name || inv.creator_name,
          created_at: inv.created_at,
          player_count: inv.player_count || 1,
          invitationId: inv.id, // Guardar ID de invitación por si se necesita
          invitationStatus: inv.status
        }));
    } catch (err) {
      console.error('roomInvitationService.getInvitedRooms error', err.message);
      return [];
    }
  }
};

export default roomInvitationService;
