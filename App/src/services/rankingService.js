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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Retornar datos de ejemplo en caso de error
      return [
        { rank: 1, name: 'Magnus', elo: 2830 },
        { rank: 2, name: 'Fabiano', elo: 2795 },
        { rank: 3, name: 'Hikaru', elo: 2788 },
        { rank: 4, name: 'You', elo: 2500 },
        { rank: 5, name: 'Gukesh', elo: 2764 },
        { rank: 6, name: 'Nodirbek', elo: 2756 },
        { rank: 7, name: 'Yi', elo: 2755 },
        { rank: 8, name: 'Caruana', elo: 2750 },
        { rank: 9, name: 'Nepomniachtchi', elo: 2745 },
        { rank: 10, name: 'Arjun', elo: 2740 },
      ];
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
