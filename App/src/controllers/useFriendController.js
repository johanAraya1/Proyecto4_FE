import { useState } from 'react';
import friendService from '../services/friendService';

export const useFriendController = (currentUser) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  const searchByEmail = async (email) => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await friendService.findUserByEmail(email, currentUser?.id);
      
      // Debug para ver qué datos estamos recibiendo del backend
      console.log('🔍 DEBUG searchByEmail result:', {
        email,
        user,
        hasUser: !!user,
        userName: user?.name,
        userEmail: user?.email,
        userElo: user?.elo
      });
      
      setSearchResult(user);
      return user;
    } catch (err) {
      setError(err.message || 'Error buscando usuario');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const sendRequest = async (toUserId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validaciones
      if (!currentUser?.id) {
        throw new Error('Usuario actual no definido. Inicia sesión nuevamente.');
      }
      
      if (!toUserId) {
        throw new Error('ID de usuario destinatario no válido.');
      }
      
      if (currentUser.id === toUserId) {
        throw new Error('No puedes enviarte una solicitud a ti mismo.');
      }
      
      console.log('📤 Enviando solicitud:', { 
        from: currentUser.id, 
        to: toUserId,
        fromUser: currentUser.name || currentUser.email 
      });
      
      const res = await friendService.sendFriendRequest(currentUser.id, toUserId);
      
      // Validar diferentes tipos de respuesta exitosa
      if (res) {
        if (res.success === true || res.message || res.id || res.request_id) {
          console.log('✅ Solicitud enviada exitosamente:', res);
          return res;
        } else if (res.error) {
          // El backend retornó un error pero con status 200
          throw new Error(res.error);
        } else {
          console.log('⚠️ Respuesta inesperada pero no nula:', res);
          return res; // Asumir éxito si tenemos alguna respuesta
        }
      } else {
        throw new Error('No se recibió respuesta del servidor');
      }
    } catch (err) {
      console.error('❌ Error enviando solicitud:', err);
      setError(err.message || 'Error enviando solicitud');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (!currentUser?.id) return setRequests([]);
      
      const res = await friendService.getIncomingRequests(currentUser.id);
      
      // Debug para ver qué solicitudes estamos recibiendo
      console.log('📥 DEBUG loadRequests result:', {
        currentUserId: currentUser.id,
        requestsCount: res.length,
        requests: res,
        firstRequest: res[0]
      });
      
      setRequests(res || []);
      return res;
    } catch (err) {
      setError(err.message || 'Error cargando solicitudes');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validaciones
      if (!currentUser?.id) {
        throw new Error('Usuario actual no definido. Inicia sesión nuevamente.');
      }
      
      if (!requestId) {
        throw new Error('ID de solicitud no válido.');
      }
      
      console.log('✅ Aceptando solicitud:', { 
        requestId, 
        userId: currentUser.id,
        userName: currentUser.name || currentUser.email 
      });
      
      const res = await friendService.acceptFriendRequest(requestId, currentUser?.id);
      
      // Validar diferentes tipos de respuesta exitosa
      if (res) {
        if (res.success === true || res.message || res.id || res.friendship_id) {
          console.log('✅ Solicitud aceptada exitosamente:', res);
          // Recargar requests/friends después de aceptar
          await loadRequests();
          await loadFriends();
          return res;
        } else if (res.error) {
          // El backend retornó un error pero con status 200
          throw new Error(res.error);
        } else {
          console.log('⚠️ Respuesta inesperada pero no nula:', res);
          // Recargar de todas formas por si acaso
          await loadRequests();
          await loadFriends();
          return res; // Asumir éxito si tenemos alguna respuesta
        }
      } else {
        throw new Error('No se recibió respuesta del servidor');
      }
    } catch (err) {
      console.error('❌ Error aceptando solicitud:', err);
      setError(err.message || 'Error aceptando solicitud');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validaciones
      if (!currentUser?.id) {
        throw new Error('Usuario actual no definido. Inicia sesión nuevamente.');
      }
      
      if (!requestId) {
        throw new Error('ID de solicitud no válido.');
      }
      
      console.log('❌ Rechazando solicitud:', { 
        requestId, 
        userId: currentUser.id,
        userName: currentUser.name || currentUser.email 
      });
      
      const res = await friendService.rejectFriendRequest(requestId, currentUser?.id);
      
      console.log('🔍 DETAILED DEBUG - Backend response for reject:', {
        res,
        type: typeof res,
        hasMessage: !!res?.message,
        message: res?.message,
        hasSuccess: !!res?.success,
        success: res?.success,
        hasId: !!res?.id,
        id: res?.id,
        hasError: !!res?.error,
        error: res?.error,
        keys: res ? Object.keys(res) : 'No keys'
      });
      
      // Validar diferentes tipos de respuesta exitosa
      if (res) {
        if (res.success === true || res.message || res.id) {
          console.log('✅ Validación exitosa - Solicitud rechazada:', res);
          // Recargar requests después de rechazar
          await loadRequests();
          return res;
        } else if (res.error) {
          // El backend retornó un error pero con status 200
          console.error('❌ Backend retornó error:', res.error);
          throw new Error(res.error);
        } else {
          console.log('⚠️ Respuesta inesperada pero no nula:', res);
          // Recargar de todas formas por si acaso
          await loadRequests();
          return res; // Asumir éxito si tenemos alguna respuesta
        }
      } else {
        console.error('❌ No se recibió respuesta del servidor');
        throw new Error('No se recibió respuesta del servidor');
      }
    } catch (err) {
      console.error('❌ Error rechazando solicitud:', err);
      setError(err.message || 'Error rechazando solicitud');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriends = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (!currentUser?.id) return setFriends([]);
      
      const res = await friendService.getFriends(currentUser.id);
      
      // Debug para ver qué amigos estamos recibiendo
      console.log('👫 DEBUG loadFriends result:', {
        currentUserId: currentUser.id,
        friendsCount: res.length,
        friends: res,
        firstFriend: res[0]
      });
      
      setFriends(res || []);
      return res;
    } catch (err) {
      setError(err.message || 'Error cargando amigos');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearchResult = () => {
    setSearchResult(null);
    setError(null);
  };

  return {
    // estados
    isLoading,
    error,
    searchResult,
    requests,
    friends,
    // acciones
    searchByEmail,
    sendRequest,
    loadRequests,
    acceptRequest,
    rejectRequest,
    loadFriends,
    clearSearchResult,
  };
};
