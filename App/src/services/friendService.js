import { Platform } from 'react-native';

const getBaseURL = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  } else if (Platform.OS === 'web') {
    return 'http://localhost:3000/api';
  } else {
    return 'http://192.168.1.100:3000/api';
  }
};

/**
 * Servicio para manejar solicitudes de amistad
 */
const friendService = {
  async findUserByEmail(email, userId = '1') {
    try {
      const res = await fetch(`${getBaseURL()}/friends/find`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString()
        },
        body: JSON.stringify({ query: email }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // Backend devuelve { users: [...] }, tomamos el primer usuario
      return data.users && data.users.length > 0 ? data.users[0] : null;
    } catch (err) {
      console.error('friendService.findUserByEmail error', err.message);
      return null;
    }
  },

  async sendFriendRequest(fromUserId, toUserId) {
    try {
      // Validaciones previas
      if (!fromUserId || !toUserId) {
        throw new Error('IDs de usuario requeridos para enviar solicitud');
      }
      
      if (fromUserId === toUserId) {
        throw new Error('No puedes enviarte una solicitud a ti mismo');
      }
      
      console.log('📤 Enviando solicitud al backend:', { fromUserId, toUserId });
      
      const res = await fetch(`${getBaseURL()}/friends/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': fromUserId.toString()
        },
        body: JSON.stringify({ fromUserId, toUserId }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        // Extraer mensaje de error del backend
        const errorMessage = data.error || `HTTP ${res.status}`;
        throw new Error(errorMessage);
      }
      
      console.log('✅ Respuesta del backend:', data);
      return data;
    } catch (err) {
      console.error('❌ friendService.sendFriendRequest error:', err.message);
      throw err;
    }
  },

  async getIncomingRequests(userId) {
    try {
      const res = await fetch(`${getBaseURL()}/friends/requests?userId=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString()
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      // Backend devuelve { requests: [...] } con estructura específica
      const requests = data.requests || [];
      
      // Mapear la estructura del backend al formato esperado del frontend
      return requests.map(request => ({
        id: request.id,
        fromUser: {
          id: request.from_user,
          name: request.from_user_name,
          email: request.from_user_email,
          elo: request.from_user_elo || 0
        },
        status: request.status,
        created_at: request.created_at
      }));
    } catch (err) {
      console.error('friendService.getIncomingRequests error', err.message);
      return [];
    }
  },

  async acceptFriendRequest(requestId, userId) {
    try {
      // Validaciones previas
      if (!requestId || !userId) {
        throw new Error('ID de solicitud y usuario requeridos para aceptar');
      }
      
      console.log('✅ Aceptando solicitud en backend:', { requestId, userId });
      
      const res = await fetch(`${getBaseURL()}/friends/request/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString()
        },
        body: JSON.stringify({ requestId }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        const errorMessage = data.error || `HTTP ${res.status}`;
        throw new Error(errorMessage);
      }
      
      console.log('✅ Solicitud aceptada en backend:', data);
      return data;
    } catch (err) {
      console.error('❌ friendService.acceptFriendRequest error:', err.message);
      throw err;
    }
  },

  async rejectFriendRequest(requestId, userId) {
    try {
      // Validaciones previas
      if (!requestId || !userId) {
        throw new Error('ID de solicitud y usuario requeridos para rechazar');
      }
      
      console.log('❌ Rechazando solicitud en backend:', { requestId, userId });
      
      const res = await fetch(`${getBaseURL()}/friends/request/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString()
        },
        body: JSON.stringify({ requestId }),
      });

      const data = await res.json();
      
      console.log('🔍 DETAILED DEBUG - friendService.rejectFriendRequest response:', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        data,
        dataType: typeof data,
        hasMessage: !!data?.message,
        message: data?.message,
        hasError: !!data?.error,
        error: data?.error,
        keys: data ? Object.keys(data) : 'No keys'
      });
      
      if (!res.ok) {
        const errorMessage = data.error || `HTTP ${res.status}`;
        console.error('❌ Backend returned error:', errorMessage);
        throw new Error(errorMessage);
      }
      
      console.log('✅ Solicitud rechazada en backend:', data);
      return data;
    } catch (err) {
      console.error('❌ friendService.rejectFriendRequest error:', err.message);
      throw err;
    }
  },

  async getFriends(userId) {
    try {
      const res = await fetch(`${getBaseURL()}/friends/list?userId=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString()
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      // Backend devuelve { friends: [...] } con estructura específica
      const friends = data.friends || [];
      
      // Mapear la estructura del backend al formato esperado del frontend
      return friends.map(friend => ({
        id: friend.friend_id,
        name: friend.friend_name,
        email: friend.friend_email,
        elo: friend.friend_elo || 0,
        friendship_id: friend.id,
        created_at: friend.created_at
      }));
    } catch (err) {
      console.error('friendService.getFriends error', err.message);
      return [];
    }
  }
};

export default friendService;
