/**
 * Utilidades de navegación comunes
 * Funciones reutilizables para navegación entre pantallas
 */

/**
 * Navega de vuelta al dashboard principal
 * @param {Object} navigation - Objeto de navegación de React Navigation
 */
export const navigateToDashboard = (navigation) => {
  if (navigation && navigation.navigate) {
    navigation.navigate('Dashboard');
  }
};

/**
 * Navega a la pantalla del juego con los datos de la sala
 * @param {Object} navigation - Objeto de navegación de React Navigation
 * @param {Object} roomData - Datos de la sala para el juego
 */
export const navigateToGame = (navigation, roomData) => {
  if (navigation && navigation.navigate && roomData) {
    navigation.navigate('Game', { roomData });
  }
};

/**
 * Navega hacia atrás en la pila de navegación
 * @param {Object} navigation - Objeto de navegación de React Navigation
 */
export const navigateBack = (navigation) => {
  if (navigation && navigation.goBack) {
    navigation.goBack();
  } else if (navigation && navigation.navigate) {
    // Fallback al dashboard si no hay navegación hacia atrás
    navigateToDashboard(navigation);
  }
};

/**
 * Reemplaza la pantalla actual con el dashboard (sin posibilidad de volver)
 * @param {Object} navigation - Objeto de navegación de React Navigation
 */
export const replaceToDashboard = (navigation) => {
  if (navigation && navigation.replace) {
    navigation.replace('Dashboard');
  } else if (navigation && navigation.navigate) {
    navigation.navigate('Dashboard');
  }
};
