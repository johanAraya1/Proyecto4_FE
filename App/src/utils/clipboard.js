import { Platform } from 'react-native';

/**
 * Utilidades para manejo del portapapeles
 * Funciones comunes para copiar texto al portapapeles
 * NOTA: Estas funciones no muestran modales, deben ser manejados por el componente que las llama
 */

/**
 * Copia un texto al portapapeles del dispositivo
 * @param {string} text - Texto a copiar
 * @returns {Promise<{success: boolean, error?: string}>} - Resultado de la operación
 */
export const copyToClipboard = async (text) => {
  try {
    if (!text) {
      return { success: false, error: 'No hay texto para copiar' };
    }

    if (Platform.OS === 'web') {
      // En React Native Web usamos navigator.clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Tu navegador no soporta copiar al portapapeles',
        };
      }
    } else {
      // En React Native móvil usamos Clipboard
      const { Clipboard } = require('react-native');
      await Clipboard.setString(text);
      return { success: true };
    }
  } catch (error) {
    return { success: false, error: 'No se pudo copiar el texto' };
  }
};

/**
 * Copia el código de una sala al portapapeles
 * @param {string} roomCode - Código de la sala
 * @returns {Promise<{success: boolean, error?: string}>} - Resultado de la operación
 */
export const copyRoomCode = async (roomCode) => {
  return await copyToClipboard(roomCode);
};

/**
 * Lee texto del portapapeles (si está disponible)
 * @returns {Promise<{success: boolean, text?: string, error?: string}>} - Resultado de la operación
 */
export const readFromClipboard = async () => {
  try {
    if (Platform.OS === 'web') {
      // En React Native Web usamos navigator.clipboard
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        return { success: true, text };
      } else {
        return {
          success: false,
          error: 'Tu navegador no soporta leer del portapapeles',
        };
      }
    } else {
      // En React Native móvil usamos Clipboard
      const { Clipboard } = require('react-native');
      const text = await Clipboard.getString();
      return { success: true, text };
    }
  } catch (error) {
    return { success: false, error: 'No se pudo leer el portapapeles' };
  }
};
