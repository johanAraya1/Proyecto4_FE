// Configuración de ingredientes con emojis/iconos visuales
const INGREDIENTS = {
  AGUA: { 
    name: 'Agua', 
    minCount: 2,
    emoji: '💧',
    text: 'AGUA',
    color: '#4FC3F7'
  },
  CAFE: { 
    name: 'Café', 
    minCount: 2,
    emoji: '☕',
    text: 'CAFÉ',
    color: '#6F4E37'
  },
  LECHE: { 
    name: 'Leche', 
    minCount: 2,
    emoji: '🥛',
    text: 'LECHE',
    color: '#F5F5F5'
  },
  CARAMELO: { 
    name: 'Caramelo', 
    minCount: 1, 
    maxCount: 1,
    emoji: '🟫',
    text: 'CARAMELO',
    color: '#8B4513'
  }
};

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};


/**
 * Genera una cuadrícula 3x3 con la distribución requerida de ingredientes:
 * - 1 caramelo
 * - Al menos 2 de cada uno de los demás (agua, café, leche)
 * @returns {Array<Array<Object>>} Una matriz 3x3 con objetos que contienen información de cada celda
 */
export const generateGrid = () => {
  // Intentar varias veces para evitar bloqueos por falta de opciones válidas
  for (let attempt = 0; attempt < 20; attempt++) {
    // 1. Construir el pool de ingredientes según min/max
    const pool = [];
    Object.entries(INGREDIENTS).forEach(([key, config]) => {
      for (let i = 0; i < config.minCount; i++) {
        pool.push({
          type: key,
          emoji: config.emoji,
          text: config.text,
          color: config.color,
          name: config.name
        });
      }
    });
    // Llenar los espacios restantes con ingredientes aleatorios (excepto caramelo)
    const remainingSpaces = 9 - pool.length;
    const remainingOptions = ['AGUA', 'CAFE', 'LECHE'];
    for (let i = 0; i < remainingSpaces; i++) {
      const randomType = remainingOptions[getRandomInt(0, remainingOptions.length - 1)];
      pool.push({
        type: randomType,
        emoji: INGREDIENTS[randomType].emoji,
        text: INGREDIENTS[randomType].text,
        color: INGREDIENTS[randomType].color,
        name: INGREDIENTS[randomType].name
      });
    }
    // 2. Intentar armar la cuadrícula cumpliendo la restricción
    const grid = Array.from({ length: 3 }, () => Array(3).fill(null));
    // Copia del pool para ir sacando ingredientes
    const available = [...pool];
    let valid = true;
    for (let i = 0; i < 3 && valid; i++) {
      for (let j = 0; j < 3 && valid; j++) {
        // Obtener tipos prohibidos por vecinos
        const forbidden = new Set();
        if (i > 0 && grid[i-1][j]) forbidden.add(grid[i-1][j].type);
        if (j > 0 && grid[i][j-1]) forbidden.add(grid[i][j-1].type);
        // Filtrar opciones válidas
        const candidates = available.filter(item => !forbidden.has(item.type));
        if (candidates.length === 0) {
          valid = false; // No hay opción válida, abortar intento
          break;
        }
        // Elegir aleatoriamente una opción válida
        const chosenIdx = getRandomInt(0, candidates.length - 1);
        const chosen = candidates[chosenIdx];
        // Quitar el ingrediente elegido del pool disponible
        const removeIdx = available.findIndex(item => item.type === chosen.type);
        grid[i][j] = chosen;
        available.splice(removeIdx, 1);
      }
    }
    if (valid) {
      return grid;
    }
    // Si no fue posible, reintentar
  }
  // Si después de varios intentos no se logra, retornar una cuadrícula vacía (o lanzar error)
  return Array.from({ length: 3 }, () => Array(3).fill(null));
};