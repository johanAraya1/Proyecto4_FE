import { API_BASE_URL, ENDPOINTS } from '../config/api';

/**
 * Servicio para gestionar el ranking de jugadores
 */

export const rankingService = {
  /**
   * Obtiene el top 10 de jugadores del ranking global
   * @returns {Promise<Array>} Lista de jugadores ordenados por ranking
   */
  async getTop10Players() {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.RANKING.BASE}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`No se pudo cargar el ranking: ${response.status}`);
      }

      const data = await response.json();
      
      // Verificar que la respuesta tenga datos válidos
      if (data && data.ranking && Array.isArray(data.ranking)) {
        return data.ranking;
      } else if (Array.isArray(data)) {
        return data;
      }
      
      throw new Error('Formato de respuesta inválido');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Error al obtener ranking:', error);
      throw error;
    }
  },

  /**
   * Actualiza el ELO de un jugador específico
   * @param {string} playerId - ID del jugador
   * @param {number} newElo - Nuevo valor de ELO
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async updatePlayerElo(playerId, newElo) {
    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.RANKING.PLAYER.replace('{playerId}', playerId)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ elo: newElo }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  },
};
