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
  async findUserByEmail(email) {
    try {
      const res = await fetch(`${getBaseURL()}/friends/find`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('friendService.findUserByEmail error', err.message);
      // Fallback: retornar null para indicar no encontrado
      return null;
    }
  },

  async sendFriendRequest(fromUserId, toUserId) {
    try {
      const res = await fetch(`${getBaseURL()}/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId, toUserId }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('friendService.sendFriendRequest error', err.message);
      throw err;
    }
  },

  async getIncomingRequests(userId) {
    try {
      const res = await fetch(`${getBaseURL()}/friends/requests?userId=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('friendService.getIncomingRequests error', err.message);
      return [];
    }
  },

  async acceptFriendRequest(requestId) {
    try {
      const res = await fetch(`${getBaseURL()}/friends/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('friendService.acceptFriendRequest error', err.message);
      throw err;
    }
  },

  async getFriends(userId) {
    try {
      const res = await fetch(`${getBaseURL()}/friends/list?userId=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('friendService.getFriends error', err.message);
      return [];
    }
  }
};

export default friendService;
