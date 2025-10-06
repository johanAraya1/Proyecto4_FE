import { useState, useEffect } from 'react';
import { rankingService } from '../services/rankingService';

/**
 * Hook personalizado para manejar el estado del ranking
 * @returns {Object} Estado y funciones del ranking
 */
export const useRanking = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Obtiene los datos del ranking
   */
  const fetchRanking = async () => {
    try {
      setError(null);
      const data = await rankingService.getTop10Players();
      setRanking(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching ranking:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Refresca los datos del ranking
   */
  const refreshRanking = async () => {
    setRefreshing(true);
    await fetchRanking();
  };

  /**
   * Reinicia el estado de error
   */
  const clearError = () => {
    setError(null);
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchRanking();
  }, []);

  return {
    ranking,
    loading,
    error,
    refreshing,
    refetch: fetchRanking,
    refresh: refreshRanking,
    clearError
  };
};