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
      const user = await friendService.findUserByEmail(email);
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
      if (!currentUser?.id) throw new Error('Usuario actual no definido');
      const res = await friendService.sendFriendRequest(currentUser.id, toUserId);
      return res;
    } catch (err) {
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
      const res = await friendService.acceptFriendRequest(requestId);
      // recargar requests/friends luego de aceptar
      await loadRequests();
      await loadFriends();
      return res;
    } catch (err) {
      setError(err.message || 'Error aceptando solicitud');
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
      setFriends(res || []);
      return res;
    } catch (err) {
      setError(err.message || 'Error cargando amigos');
      return [];
    } finally {
      setIsLoading(false);
    }
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
    loadFriends,
  };
};
