import { Platform } from 'react-native';

/**
 * Servicio para gestionar el ranking de jugadores
 */

// Función para obtener la URL base según la plataforma
const getBaseURL = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api'; // Para emulador Android
  } else if (Platform.OS === 'web') {
    return 'http://localhost:3000/api'; // Para web
  } else {
    return 'http://192.168.1.100:3000/api'; // Para iOS - cambiar por tu IP local
  }
};

export const rankingService = {
  /**
   * Obtiene el top 10 de jugadores del ranking global
   * @returns {Promise<Array>} Lista de jugadores ordenados por ranking
   */
  async getTop10Players() {
    try {
      const response = await fetch(`${getBaseURL()}/ranking`, {
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
      console.error('Error fetching ranking:', error);
      
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
        { rank: 10, name: 'Arjun', elo: 2740 }
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
    try {
      const response = await fetch(`${getBaseURL()}/ranking/${playerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ elo: newElo }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating player ELO:', error);
      throw error;
    }
  }
};