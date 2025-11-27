import { API_BASE_URL } from '../config/api';
import { Platform } from 'react-native';

/**
 * Servicio de WebSocket para comunicación en tiempo real del juego
 */
class GameWebSocketService {
  constructor() {
    this.socket = null;
    this.roomCode = null;
    this.roomId = null;
    this.userId = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
  }

  /**
   * Conecta al WebSocket del servidor
   * @param {string} roomCode - Código de la sala
   * @param {string} roomId - ID de la sala
   * @param {number} userId - ID del usuario
   */
  connect(roomCode, roomId, userId) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    this.roomCode = roomCode;
    this.roomId = roomId;
    this.userId = userId;
    
    // Construir URL websocket de forma robusta:
    // - Usar wss si la API base usa https, ws si usa http
    // - En emulador Android, reemplazar "localhost" por 10.0.2.2 para acceder al host
    const isSecure = API_BASE_URL.startsWith('https');
    const wsProtocol = isSecure ? 'wss' : 'ws';

    // Extraer host:hostport (sin esquema)
    let host = API_BASE_URL.replace(/^https?:\/\//, '');

    // Si estamos en Android emulator y el host apunta a localhost/127.0.0.1,
    // usar 10.0.2.2 (mapa del emulador al host en Android Emulator)
    if (Platform.OS === 'android') {
      host = host.replace(/^localhost/, '10.0.2.2').replace(/^127\.0\.0\.1/, '10.0.2.2');
    }

    const socketUrl = `${wsProtocol}://${host}/game/${roomCode}?userId=${userId}`;

    try {
      this.socket = new WebSocket(socketUrl);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.emit('connected', { roomCode, roomId, userId });
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          // Error parsing message
        }
      };

      this.socket.onerror = (error) => {
        this.emit('error', error);
      };

      this.socket.onclose = () => {
        this.emit('disconnected', { roomCode });
        this.attemptReconnect(roomCode, roomId, userId);
      };
    } catch (error) {
      this.emit('error', error);
    }
  }

  /**
   * Intenta reconectar al WebSocket
   */
  attemptReconnect(roomCode, roomId, userId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect(roomCode, roomId, userId);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  /**
   * Maneja los mensajes recibidos del servidor
   */
  handleMessage(data) {
    const { type, payload } = data;

    switch (type) {
      case 'GAME_STATE_UPDATE':
        this.emit('gameStateUpdate', payload);
        break;
      case 'MOVE':
        this.emit('playerMove', payload);
        break;
      case 'TRADE':
        this.emit('trade', payload);
        break;
      case 'START_TURN':
        this.emit('startTurn', payload);
        break;
      case 'END_TURN':
        this.emit('endTurn', payload);
        break;
      case 'TURN_CHANGED':
        this.emit('turnChanged', payload);
        break;
      case 'GAME_STATE_SYNC':
        this.emit('gameStateSync', payload);
        break;
      case 'GRID_INITIALIZED':
        this.emit('gridInitialized', payload);
        break;
      case 'GAME_ENDED':
        this.emit('gameEnded', payload);
        break;
      default:
        this.emit('message', data);
    }
  }

  // ============ MÉTODOS DE ENVÍO DE EVENTOS ============

  /**
   * Envía evento de inicialización del grid
   * @param {Array} grid - Grid de ingredientes
   * @param {Object} playerPositions - Posiciones iniciales de los jugadores (opcional)
   * @param {Array} player1Orders - Array de 1-3 órdenes iniciales del jugador 1 (opcional)
   * @param {Array} player2Orders - Array de 1-3 órdenes iniciales del jugador 2 (opcional)
   */
  sendGridInitialization(grid, playerPositions = null, player1Orders = null, player2Orders = null) {
    // Función auxiliar para convertir ingredientes de español a códigos
    const ingredientNameToCode = {
      'Café': 'CAFE',
      'Leche': 'LECHE',
      'Agua': 'AGUA',
      'Caramelo': 'CARAMELO'
    };

    // Función auxiliar para convertir orden del frontend al formato del backend
    const convertOrderToBackendFormat = (order) => {
      if (!order) return null;
      
      return {
        id: order.id,
        recipe: order.name,
        ingredients: order.ingredients.map(ingredient => 
          ingredientNameToCode[ingredient] || ingredient
        ),
        reward: order.points
      };
    };

    const event = {
      type: 'GRID_INITIALIZED',
      payload: {
        grid: grid,
        gridString: this.gridToString(grid)
      }
    };
    
    // Agregar posiciones si se proporcionan
    if (playerPositions) {
      event.payload.playerPositions = playerPositions;
    }

    // ⭐ Agregar órdenes de ambos jugadores si se proporcionan
    if (player1Orders && Array.isArray(player1Orders)) {
      event.payload.player1Orders = player1Orders.map(convertOrderToBackendFormat);
    }
    
    if (player2Orders && Array.isArray(player2Orders)) {
      event.payload.player2Orders = player2Orders.map(convertOrderToBackendFormat);
    }
    
    this.send(event);
  }

  /**
   * Envía evento de inicio de turno
   * @param {number} _playerId - ID del jugador (no usado actualmente)
   */
  sendStartTurn(_playerId) {
    const event = {
      type: 'START_TURN',
      payload: {}
    };
    
    this.send(event);
  }

  /**
   * Envía evento de movimiento
   * @param {number} playerId - ID del jugador
   * @param {Object} from - Posición inicial {row, col}
   * @param {Object} to - Posición final {row, col}
   * @param {string} ingredient - Ingrediente recogido
   * @param {number} movementCount - Contador de movimientos actual
   */
  sendMove(playerId, from, to, ingredient, movementCount = 0) {
    const event = {
      type: 'MOVE',
      payload: {
        playerId: playerId,  // ✅ Incluir el ID del jugador que hace el movimiento
        from: [from.row, from.col],
        to: [to.row, to.col],
        ingredient: ingredient,
        movementCount: movementCount
      }
    };
    
    this.send(event);
  }

  /**
   * Envía evento de canje (trade)
   * @param {number} playerId - ID del jugador
   * @param {Array} completedOrders - Array de órdenes completadas
   * @param {number} totalPoints - Puntos totales ganados
   * @param {Array} newOrders - Array de 1-3 nuevas órdenes generadas
   * @param {Object} updatedInventory - Inventario actualizado después del canje
   */
  sendTrade(playerId, completedOrders = [], totalPoints = 0, newOrders = [], updatedInventory = null) {
    // Mapeo de ingredientes para el backend
    const ingredientNameToCode = {
      'Café': 'CAFE',
      'Cafe': 'CAFE',
      'CAFÉ': 'CAFE',
      'Leche': 'LECHE',
      'Agua': 'AGUA',
      'Caramelo': 'CARAMELO'
    };
    
    // Convertir órdenes completadas al formato del backend
    const convertOrderToBackendFormat = (order) => {
      if (!order) return null;
      
      return {
        id: order.id,
        recipe: order.name,
        ingredients: order.ingredients.map(ingredient => 
          ingredientNameToCode[ingredient] || ingredient.toUpperCase()
        ),
        reward: order.points
      };
    };
    
    // Convertir nuevas órdenes al formato del backend
    const formattedNewOrders = newOrders.map(convertOrderToBackendFormat);
    const formattedCompletedOrders = completedOrders.map(convertOrderToBackendFormat);
    
    const event = {
      type: 'TRADE',
      payload: {
        playerId: playerId,
        completedOrders: formattedCompletedOrders,  // ⭐ Array de órdenes completadas
        totalPoints: totalPoints,                    // ⭐ Puntos totales ganados
        newOrders: formattedNewOrders,               // ⭐ Array de nuevas órdenes
        updatedInventory: updatedInventory           // ⭐ Inventario actualizado
      }
    };
    
    this.send(event);
  }

  /**
   * Envía evento de fin de turno (simplificado)
   * @param {number} playerId - ID del jugador
   * @param {Object} position - Posición final {row, col}
   * @param {Array} _inventory - OBSOLETO (no se usa)
   * @param {number} _score - OBSOLETO (no se usa)
   * @param {Array} _orders - OBSOLETO (no se usa)
   */
  sendEndTurn(playerId, position, _inventory = null, _score = null, _orders = null) {
    const event = {
      type: 'END_TURN',
      payload: {
        pos: [position.row, position.col]
        // ⭐ NO incluir inventory, score ni orders
        // El backend maneja todo mediante eventos MOVE y TRADE
      }
    };
    
    this.send(event);
  }

  /**
   * Envía evento de cambio de turno (sistema)
   * @param {number} currentPlayerId - ID del jugador actual (puede ser undefined)
   * @param {number} turnNumber - Número de turno (1 o 2) - REQUERIDO
   */
  sendTurnChanged(currentPlayerId, turnNumber) {
    // Validar que turnNumber sea válido
    if (!turnNumber || (turnNumber !== 1 && turnNumber !== 2)) {
      return;
    }
    
    const event = {
      type: 'TURN_CHANGED',
      payload: {
        currentPlayer: currentPlayerId || null,  // Puede ser null si no hay ID
        turnNumber: turnNumber  // SIEMPRE debe estar (1 o 2)
      }
    };
    
    this.send(event);
  }

  /**
   * Envía el estado completo del juego
   * @param {Object} gameState - Estado completo del juego
   */
  sendGameState(gameState) {
    const event = {
      type: 'GAME_STATE_UPDATE',
      payload: {
        gameState: gameState,
        grid: gameState.ingredientGrid,
        gridString: this.gridToString(gameState.ingredientGrid)
      }
    };
    
    this.send(event);
  }

  /**
   * Convierte la cuadrícula a string para almacenar
   * @param {Array} grid - Cuadrícula de ingredientes
   * @returns {string} - String de la cuadrícula (ej: "azucar|cafe|leche\ncaramelo|leche|cafe")
   */
  gridToString(grid) {
    if (!grid || grid.length === 0) return '';
    return grid.map(row => row.map(cell => cell.ingredient).join('|')).join('\n');
  }

  /**
   * Solicita sincronización del estado del juego
   */
  requestGameStateSync() {
    const event = {
      type: 'REQUEST_SYNC',
      payload: {}
    };
    
    this.send(event);
  }

  /**
   * Envía un mensaje al servidor
   */
  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = JSON.stringify(data);
      this.socket.send(message);
    }
  }

  /**
   * Registra un listener para un evento
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Elimina un listener
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emite un evento a todos los listeners
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          // Error en callback
        }
      });
    }
  }

  /**
   * Desconecta el WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners.clear();
    this.roomCode = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Verifica si está conectado
   */
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

// Exportar instancia singleton
export const gameWebSocketService = new GameWebSocketService();
export default gameWebSocketService;
