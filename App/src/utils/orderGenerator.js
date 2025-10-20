// Constantes para la generación de órdenes
const INGREDIENTS = {
  COFFEE: 'Café',
  MILK: 'Leche',
  WATER: 'Agua',
  CARAMEL: 'Caramelo'
};

const POINTS_CONFIG = {
  BASE_POINTS: 50,
  MAX_POINTS: 250,
  INCREMENT: 50
};

// Nombres de bebidas basadas en los ingredientes
const DRINK_NAMES = {
  // Combinaciones de 2 ingredientes
  'Café,Leche': 'Café con Leche',
  'Café,Agua': 'Americano',
  'Café,Caramelo': 'Café Caramel',
  
  // Combinaciones de 3 ingredientes
  'Café,Leche,Caramelo': 'Caramel Macchiato',
  'Café,Agua,Caramelo': 'Caramel Americano',
  'Café,Agua,Leche': 'Café Latte Suave'
};

/**
 * Selecciona ingredientes aleatorios evitando duplicados
 * @param {Array} ingredients Lista de ingredientes disponibles
 * @param {number} count Número de ingredientes a seleccionar
 * @returns {Array} Ingredientes seleccionados
 */
const selectRandomIngredients = (ingredients, count) => {
  const available = [...ingredients];
  const selected = [];

  while (selected.length < count && available.length > 0) {
    const randomIndex = Math.floor(Math.random() * available.length);
    selected.push(available[randomIndex]);
    available.splice(randomIndex, 1);
  }

  return selected;
};

/**
 * Genera una orden aleatoria de bebida
 * @returns {Object} Orden generada con ingredientes, nombre y puntos
 */
export const generateRandomOrder = () => {
  // Convertir los ingredientes en un array para selección aleatoria
  const ingredientsList = Object.values(INGREDIENTS);
  
  // Determinar número aleatorio de ingredientes (2 o 3)
  const ingredientCount = Math.random() < 0.5 ? 2 : 3;
  
  // Asegurarse de que Café siempre esté incluido como base
  const baseIngredient = INGREDIENTS.COFFEE;
  const remainingIngredients = ingredientsList.filter(ing => ing !== baseIngredient);
  
  // Seleccionar ingredientes adicionales
  const additionalIngredients = selectRandomIngredients(
    remainingIngredients,
    ingredientCount - 1
  );
  
  // Combinar y ordenar todos los ingredientes
  const selectedIngredients = [baseIngredient, ...additionalIngredients].sort();
  
  // Determinar el nombre de la bebida
  const drinkKey = selectedIngredients.join(',');
  const hasCaramel = selectedIngredients.includes(INGREDIENTS.CARAMEL);
  const hasMilk = selectedIngredients.includes(INGREDIENTS.MILK);
  const hasWater = selectedIngredients.includes(INGREDIENTS.WATER);
  
  // Determinar el nombre de la bebida usando las combinaciones predefinidas o generando uno descriptivo
  const drinkName = DRINK_NAMES[drinkKey] || 
    (hasCaramel && hasMilk ? 'Caramel Latte' :
     hasCaramel ? 'Café Caramel' :
     hasMilk && hasWater ? 'Café Latte Suave' :
     hasMilk ? 'Café con Leche' :
     hasWater ? 'Americano' : 'Café Especial');
  
  // Calcular puntos basados en la complejidad y rareza
  const complexityPoints = POINTS_CONFIG.BASE_POINTS * selectedIngredients.length;
  const caramelBonus = hasCaramel ? 50 : 0;
  const points = Math.min(complexityPoints + caramelBonus, POINTS_CONFIG.MAX_POINTS);
  
  const order = {
    name: drinkName,
    ingredients: selectedIngredients,
    points,
    id: Date.now()
  };

  // Debug log
  console.log('Orden generada:', order);
  
  return order;
};

/**
 * Verifica si dos órdenes son iguales
 * @param {Object} order1 Primera orden
 * @param {Object} order2 Segunda orden
 * @returns {boolean}
 */
export const areOrdersEqual = (order1, order2) => {
  if (!order1 || !order2) return false;
  
  const ingredients1 = [...order1.ingredients].sort().join(',');
  const ingredients2 = [...order2.ingredients].sort().join(',');
  
  return ingredients1 === ingredients2;
};