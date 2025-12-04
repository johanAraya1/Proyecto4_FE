import { useState, useEffect } from 'react';
import { useAuth } from '../controllers/AuthContext';
import friendService from '../services/friendService';

/**
 * Hook personalizado para manejar el ranking de amigos
 * @returns {Object} Estado y funciones del ranking de amigos
 */
export const useFriendsRanking = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  /**
   * Obtiene la lista de amigos y los ordena por ELO
   */
  const fetchFriendsRanking = async () => {
    try {
      setError(null);
      
      if (!user?.id) {
        throw new Error('Usuario no autenticado');
      }

      // Obtener lista de amigos
      const friends = await friendService.getFriends(user.id);
      
      // Incluir al usuario actual en la lista
      const allPlayers = [
        ...friends,
        {
          id: user.id,
          name: user.name,
          email: user.email,
          elo: user.elo || 0
        }
      ];

      // Ordenar por ELO descendente
      const sortedPlayers = allPlayers.sort((a, b) => (b.elo || 0) - (a.elo || 0));

      // Asignar ranking
      const rankedPlayers = sortedPlayers.map((player, index) => ({
        ...player,
        rank: index + 1
      }));

      setRanking(rankedPlayers);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching friends ranking:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Refresca los datos del ranking de amigos
   */
  const refreshFriendsRanking = async () => {
    setRefreshing(true);
    await fetchFriendsRanking();
  };

  /**
   * Reinicia el estado de error
   */
  const clearError = () => {
    setError(null);
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (user?.id) {
      fetchFriendsRanking();
    }
  }, [user?.id]);

  return {
    ranking,
    loading,
    error,
    refreshing,
    refetch: fetchFriendsRanking,
    refresh: refreshFriendsRanking,
    clearError
  };
};