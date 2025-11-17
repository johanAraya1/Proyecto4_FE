import { useState, useEffect } from 'react';
import { generateGrid } from '../utils/gridGenerator';
import { generateRandomOrder, generateUniqueOrders } from '../utils/orderGenerator';
import useCustomModal from './useCustomModal';
import { gameWebSocketService } from '../services/gameWebSocketService';
import { roomService } from '../services/roomService';

export function useGameLogic(roomCode, userId, roomData = null) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ingredientGrid, setIngredientGrid] = useState(null);
  
  // Generar 3 órdenes únicas iniciales para cada jugador
  const generateInitialOrders = () => generateUniqueOrders(3);
  
  const [gameState, setGameState] = useState({
    currentTurn: 1,
    player1: {
      name: null,
      score: 0,
      orders: generateInitialOrders(),
      inventory: { AGUA: 0, CAFE: 0, LECHE: 0, CARAMELO: 0 }
    },
    player2: {
      name: null,
      score: 0,
      orders: generateInitialOrders(),
      inventory: { AGUA: 0, CAFE: 0, LECHE: 0, CARAMELO: 0 }
    }
  });

  const [playerPositions, setPlayerPositions] = useState({
    player1: { row: 0, col: 0 },
    player2: { row: 2, col: 2 }
  });
  
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [movementCount, setMovementCount] = useState(0);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [isExchangeMode, setIsExchangeMode] = useState(false);
  const [selectedOrderCards, setSelectedOrderCards] = useState([]);
  
  const { modalVisible, modalData, showModal, hideModal } = useCustomModal();
  
  // ============ WEBSOCKET CONNECTION ============
  useEffect(() => {
    if (roomCode && roomData?.id && userId) {




      
      gameWebSocketService.connect(roomCode, roomData.id, userId);
      
      // Listeners para eventos del servidor
      gameWebSocketService.on('connected', () => {
        // Conectado exitosamente
      });
      
      // SINCRONIZACIÓN EN TIEMPO REAL: Actualizar estado del juego
      gameWebSocketService.on('gameStateUpdate', (payload) => {
        if (payload.gameState) {
          // Solo actualizar posiciones y movementCount
          // NO actualizar currentTurn aquí para evitar conflictos con turnChanged
          
          if (payload.gameState.playerPositions) {
            setPlayerPositions(payload.gameState.playerPositions);
          }
          
          if (payload.gameState.movementCount !== undefined) {
            setMovementCount(payload.gameState.movementCount);
          }
        }
      });
      
      // SINCRONIZACIÓN EN TIEMPO REAL: Ver movimientos del oponente
      gameWebSocketService.on('playerMove', (payload) => {
        if (!payload) return;
        
        // Solo actualizar si el movimiento es del OTRO jugador
        const isMyMove = payload.playerId === userId;
        if (isMyMove) return; // No actualizar mis propios movimientos
        
        // Actualizar posición del oponente
        if (payload.to && Array.isArray(payload.to)) {
          const newRow = payload.to[0];
          const newCol = payload.to[1];
          
          setPlayerPositions((prev) => {
            // Determinar si el movimiento es del jugador 1 o 2
            const isPlayer1Move = payload.playerId === roomData?.creatorId;
            
            return {
              ...prev,
              [isPlayer1Move ? 'player1' : 'player2']: { row: newRow, col: newCol }
            };
          });
        }
        
        // Actualizar inventario del oponente si el backend lo envía
        if (payload.ingredient) {
          setGameState((prev) => {
            const isPlayer1Move = payload.playerId === roomData?.creatorId;
            const playerKey = isPlayer1Move ? 'player1' : 'player2';
            
            return {
              ...prev,
              [playerKey]: {
                ...prev[playerKey],
                inventory: {
                  ...prev[playerKey].inventory,
                  [payload.ingredient]: (prev[playerKey].inventory[payload.ingredient] || 0) + 1
                }
              }
            };
          });
        }
        
        // Actualizar contador de movimientos
        if (payload.movementCount !== undefined) {
          setMovementCount(payload.movementCount);
        }
      });
      
      // SINCRONIZACIÓN EN TIEMPO REAL: Ver canje de orden (propio o del oponente)
      gameWebSocketService.on('trade', (payload) => {
        if (!payload) return;
        
        setGameState((prev) => {
          const isPlayer1Trade = payload.playerId === roomData?.creatorId;
          const playerKey = isPlayer1Trade ? 'player1' : 'player2';
          
          const updatedState = { ...prev };
          
          // ⭐ Actualizar score con el valor que viene del backend (NO sumar localmente)
          if (payload.totalPoints !== undefined || payload.pointsEarned !== undefined) {
            const points = payload.totalPoints || payload.pointsEarned;
            updatedState[playerKey] = {
              ...prev[playerKey],
              score: prev[playerKey].score + points  // El backend envía los puntos a sumar
            };
          }
          
          // ⭐ Actualizar órdenes con el array completo que viene del backend
          if (payload.newOrders && Array.isArray(payload.newOrders)) {
            // Convertir órdenes del backend al formato del frontend si es necesario
            const convertOrderFromBackendFormat = (backendOrder) => {
              if (!backendOrder) return null;
              
              if (backendOrder.name && backendOrder.points !== undefined) {
                return backendOrder;
              }
              
              if (backendOrder.recipe && backendOrder.reward !== undefined) {
                return {
                  id: backendOrder.id,
                  name: backendOrder.recipe,
                  points: backendOrder.reward,
                  ingredients: backendOrder.ingredients
                };
              }
              
              return backendOrder;
            };
            
            const formattedOrders = payload.newOrders.map(convertOrderFromBackendFormat);
            
            updatedState[playerKey] = {
              ...updatedState[playerKey],
              orders: formattedOrders
            };
          }
          
          // ⭐ Actualizar inventario con el valor que viene del backend
          if (payload.updatedInventory) {
            updatedState[playerKey] = {
              ...updatedState[playerKey],
              inventory: payload.updatedInventory
            };
          }
          
          return updatedState;
        });
      });
      
      // SINCRONIZACIÓN EN TIEMPO REAL: Ver cambio de turno
      gameWebSocketService.on('turnChanged', (payload) => {
        if (payload && payload.turnNumber) {
          // Solo actualizar si el turno cambió al OTRO jugador
          // No actualizar si soy yo quien acaba de finalizar el turno
          setGameState((prev) => {
            // Si el turno ya es el correcto, no hacer nada (evitar loop)
            if (prev.currentTurn === payload.turnNumber) {
              return prev;
            }
            
            return {
              ...prev,
              currentTurn: payload.turnNumber
            };
          });
        }
      });
      
      return () => {

        gameWebSocketService.disconnect();
      };
    }
  }, [roomCode, roomData?.id, userId]);
  
  useEffect(() => {
    loadGameData();
  }, [roomCode]);
  
  const loadGameData = async () => {
    try {
      setLoading(true);
      setError(null);
      

      
      // Intentar cargar estado guardado del backend
      let loadedState = null;
      if (roomCode) {

        const stateResponse = await roomService.loadGameState(roomCode);
        
        if (stateResponse.success && stateResponse.gameState) {
          loadedState = stateResponse.gameState;
        }
      }
      
      // Si hay estado guardado, usarlo
      if (loadedState) {

        
        // Restaurar cuadr�cula guardada (ingredientGrid viene directamente)
        if (loadedState.ingredientGrid) {
          setIngredientGrid(loadedState.ingredientGrid);

        }
        
        // Restaurar posiciones de jugadores
        if (loadedState.playerPositions) {
          setPlayerPositions(loadedState.playerPositions);

        }
        
        // Restaurar contador de movimientos
        if (loadedState.movementCount !== undefined) {
          setMovementCount(loadedState.movementCount);

        }
        
        // Restaurar turno actual
        const currentTurn = loadedState.currentTurn || 1;

        
        // Funci�n auxiliar para convertir orden del backend al formato del frontend
        const convertOrderFromBackendFormat = (backendOrder) => {
          if (!backendOrder) return null;
          
          // Si ya tiene el formato del frontend (name, points), devolverlo tal como est�
          if (backendOrder.name && backendOrder.points !== undefined) {
            return backendOrder;
          }
          
          // Si tiene formato del backend (recipe, reward), convertir al formato del frontend
          if (backendOrder.recipe && backendOrder.reward !== undefined) {
            return {
              id: backendOrder.id,
              name: backendOrder.recipe,     // recipe ? name
              points: backendOrder.reward,   // reward ? points
              ingredients: backendOrder.ingredients
            };
          }
          
          // Si no tiene ning�n formato reconocido, generar una nueva
          return generateRandomOrder();
        };
        
        // Funci�n para sanitizar inventario (eliminar claves inv�lidas)
        const sanitizeInventory = (inventory) => {
          if (!inventory) return { AGUA: 0, CAFE: 0, LECHE: 0, CARAMELO: 0 };
          
          const validKeys = ['AGUA', 'CAFE', 'LECHE', 'CARAMELO'];
          const sanitized = { AGUA: 0, CAFE: 0, LECHE: 0, CARAMELO: 0 };
          
          // Solo copiar claves v�lidas, garantizando valores num�ricos no negativos
          validKeys.forEach(key => {
            if (inventory[key] !== undefined) {
              sanitized[key] = Math.max(0, Number(inventory[key]) || 0);
            }
          });
          
          return sanitized;
        };
        
        // Restaurar datos de jugadores
        const player1Name = roomData?.creatorName || loadedState.player1?.name || 'Jugador 1';
        const player2Name = roomData?.opponentName || loadedState.player2?.name || 'Jugador 2';
        
        setGameState({
          currentTurn: currentTurn,
          player1: {
            name: player1Name,
            score: loadedState.player1?.score || 0,
            orders: loadedState.player1?.orders ? loadedState.player1.orders.map(convertOrderFromBackendFormat) : generateUniqueOrders(3),
            inventory: sanitizeInventory(loadedState.player1?.inventory),
            elo: 1500
          },
          player2: {
            name: player2Name,
            score: loadedState.player2?.score || 0,
            orders: loadedState.player2?.orders ? loadedState.player2.orders.map(convertOrderFromBackendFormat) : generateUniqueOrders(3),
            inventory: sanitizeInventory(loadedState.player2?.inventory),
            elo: 1500
          }
        });
        





      } else {
        // No hay estado guardado, iniciar juego nuevo
        const newGrid = generateGrid();
        setIngredientGrid(newGrid);
        
        // Posiciones iniciales de los jugadores
        const initialPositions = {
          player1: { row: 0, col: 0 },
          player2: { row: 2, col: 2 }
        };
        
        // Establecer las posiciones iniciales
        setPlayerPositions(initialPositions);
        
        // Enviar cuadr�cula inicial Y posiciones por WebSocket
        if (gameWebSocketService.isConnected()) {




          
          // ? Incluir las órdenes de ambos jugadores en GRID_INITIALIZED
          gameWebSocketService.sendGridInitialization(
            newGrid, 
            initialPositions,
            gameState.player1.orders,  // Array de órdenes del jugador 1
            gameState.player2.orders   // Array de órdenes del jugador 2
          );
        }
        
        const player1Name = roomData?.creatorName || 'Jugador 1';
        const player2Name = roomData?.opponentName || 'Jugador 2';
        



        
        setGameState((prevState) => ({
          ...prevState,
          player1: { ...prevState.player1, name: player1Name, elo: 1500 },
          player2: { ...prevState.player2, name: player2Name, elo: 1500 }
        }));
        

      }
      
      setLoading(false);

    } catch (error) {

      setError(error.message);
      setLoading(false);
    }
  };

  const calculatePossibleMoves = (row, col) => {
    const moves = [];
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    let currentPlayer = null;
    if (playerPositions.player1.row === row && playerPositions.player1.col === col) {
      currentPlayer = 1;
    } else if (playerPositions.player2.row === row && playerPositions.player2.col === col) {
      currentPlayer = 2;
    }
    if (!currentPlayer) return moves;
    const opponentPosition = currentPlayer === 1 ? playerPositions.player2 : playerPositions.player1;
    const isThirdMovement = movementCount === 2;
    directions.forEach(([dRow, dCol]) => {
      const newRow = row + dRow;
      const newCol = col + dCol;
      if (newRow >= 0 && newRow < 3 && newCol >= 0 && newCol < 3) {
        const isOpponentPosition = opponentPosition.row === newRow && opponentPosition.col === newCol;
        if (isThirdMovement) {
          if (!isOpponentPosition) {
            moves.push({ row: newRow, col: newCol });
          }
        } else {
          moves.push({ row: newRow, col: newCol });
        }
      }
    });
    return moves;
  };

  const arePlayersOnSamePosition = () => {
    return playerPositions.player1.row === playerPositions.player2.row &&
           playerPositions.player1.col === playerPositions.player2.col;
  };

  const executeMove = (fromRow, fromCol, toRow, toCol) => {
    const currentPlayer = gameState.currentTurn;
    const newPositions = { ...playerPositions };
    
    // Obtener el jugador actual
    const currentPlayerId = currentPlayer === 1 ? roomData?.creatorId : roomData?.opponentId;
    
    if (currentPlayer === 1) {
      newPositions.player1 = { row: toRow, col: toCol };
    } else if (currentPlayer === 2) {
      newPositions.player2 = { row: toRow, col: toCol };
    }
    
    const ingredient = ingredientGrid[toRow][toCol];
    const ingredientType = ingredient.type;
    
    // Calcular el nuevo contador de movimientos
    const newMovementCount = movementCount + 1;
    
    // Enviar movimiento por WebSocket (CRÍTICO para actualizar inventario)
    if (gameWebSocketService.isConnected() && currentPlayerId) {




      
      gameWebSocketService.sendMove(
        currentPlayerId,
        { row: fromRow, col: fromCol },
        { row: toRow, col: toCol },
        ingredientType,
        newMovementCount
      );
    }
    
    const newGameState = { ...gameState, playerPositions: newPositions };
    if (currentPlayer === 1) {
      newGameState.player1 = {
        ...gameState.player1,
        inventory: {
          ...gameState.player1.inventory,
          [ingredientType]: (gameState.player1.inventory[ingredientType] || 0) + 1
        }
      };
    } else if (currentPlayer === 2) {
      newGameState.player2 = {
        ...gameState.player2,
        inventory: {
          ...gameState.player2.inventory,
          [ingredientType]: (gameState.player2.inventory[ingredientType] || 0) + 1
        }
      };
    }
    
    // newMovementCount ya est� calculado arriba
    setMovementCount(newMovementCount);
    setGameState(newGameState);
    setPlayerPositions(newPositions);
  };

  const resetGame = () => {
    setGameState((prev) => ({
      ...prev,
      currentTurn: 1,
      player1: { ...prev.player1, order: generateRandomOrder() },
      player2: { ...prev.player2, order: null },
      grid: [[1, 0, 0], [0, 0, 0], [0, 0, 2]]
    }));
    setPlayerPositions({ player1: { row: 0, col: 0 }, player2: { row: 2, col: 2 } });
    setMovementCount(0);
    setSelectedPiece(null);
    setPossibleMoves([]);
  };

  const handleCellPress = (row, col) => {
    if (gameState.currentTurn !== 1 && gameState.currentTurn !== 2) return;
    
    // ✅ VALIDACIÓN 1: Solo el jugador logueado puede jugar
    const isPlayer1 = userId === roomData?.creatorId;
    const isPlayer2 = userId === roomData?.opponentId;
    const myTurn = isPlayer1 ? 1 : isPlayer2 ? 2 : null;
    
    if (myTurn === null) {
      showModal('Error', 'No se pudo identificar tu jugador.', 'error');
      return;
    }
    
    // ✅ VALIDACIÓN 2: Solo puedes jugar en TU turno
    if (gameState.currentTurn !== myTurn) {
      showModal('No es tu turno', 'Espera a que tu oponente termine su turno.', 'warning');
      return;
    }
    
    if (movementCount >= 3) {
      showModal('Límite de movimientos alcanzado', 'No puedes realizar más movimientos. Por favor, termina tu turno.', 'warning');
      return;
    }
    
    const currentPlayerPosition = gameState.currentTurn === 1 ? playerPositions.player1 : playerPositions.player2;
    const opponentPosition = gameState.currentTurn === 1 ? playerPositions.player2 : playerPositions.player1;
    const isCurrentPlayerHere = currentPlayerPosition.row === row && currentPlayerPosition.col === col;
    const isOpponentHere = opponentPosition.row === row && opponentPosition.col === col;
    
    // ✅ VALIDACIÓN 3: Si toca su propia ficha, mostrar movimientos posibles
    if (isCurrentPlayerHere) {
      const moves = calculatePossibleMoves(row, col);
      setSelectedPiece({ row, col });
      setPossibleMoves(moves);
      return;
    }
    
    // ✅ VALIDACIÓN 4: Si ya tiene una ficha seleccionada, validar el movimiento
    if (selectedPiece) {
      const rowDiff = Math.abs(row - selectedPiece.row);
      const colDiff = Math.abs(col - selectedPiece.col);
      const isDiagonalMove = rowDiff > 0 && colDiff > 0;
      if (isDiagonalMove) {
        showModal('Movimiento diagonal no permitido', 'Solo puedes moverte horizontal o verticalmente, no en diagonal.', 'warning');
        setSelectedPiece(null);
        setPossibleMoves([]);
        return;
      }
      const isThirdMovement = movementCount === 2;
      if (isThirdMovement && isOpponentHere) {
        showModal('Movimiento no permitido', 'No puedes terminar tu turno en la misma posición que tu oponente.', 'warning');
        setSelectedPiece(null);
        setPossibleMoves([]);
        return;
      }
      const isValidMove = possibleMoves.some((move) => move.row === row && move.col === col);
      if (isValidMove) {
        executeMove(selectedPiece.row, selectedPiece.col, row, col);
        setSelectedPiece(null);
        setPossibleMoves([]);
      }
      return;
    }
  };

  const handleOrderCardPress = (orderId) => {
    if (isExchangeMode) {
      setSelectedOrderCards((prev) => {
        if (prev.includes(orderId)) {
          // Si ya está seleccionada, la deseleccionamos
          return prev.filter(id => id !== orderId);
        } else {
          // Si no está seleccionada, la agregamos
          return [...prev, orderId];
        }
      });
    }
  };

  const validateIngredientsForOrders = () => {
    if (selectedOrderCards.length === 0) {
      showModal('Selecciona órdenes', 'Debes marcar al menos una orden en tu tarjeta para canjear.', 'warning', null, 'OK');
      return { valid: false, missingOrders: [] };
    }
    
    const currentPlayer = gameState.currentTurn === 1 ? gameState.player1 : gameState.player2;
    const selectedOrders = currentPlayer.orders.filter(o => selectedOrderCards.includes(o.id));
    const inventory = { ...currentPlayer.inventory }; // Copia para simular consumo
    
    // Mapeo SIN acentos - los ingredientes pueden venir con o sin acento
    const ingredientMap = { 
      'Café': 'CAFE', 
      'Cafe': 'CAFE',
      'CAFÉ': 'CAFE',
      'CAFE': 'CAFE',
      'Leche': 'LECHE',
      'LECHE': 'LECHE',
      'Agua': 'AGUA',
      'AGUA': 'AGUA',
      'Caramelo': 'CARAMELO',
      'CARAMELO': 'CARAMELO'
    };
    
    const missingOrders = [];
    
    // Validar cada orden seleccionada
    for (const order of selectedOrders) {
      const orderMissing = [];
      
      for (const ingredient of order.ingredients) {
        const ingredientType = ingredientMap[ingredient] || ingredient.toUpperCase();
        if (!inventory[ingredientType] || inventory[ingredientType] <= 0) {
          orderMissing.push(ingredient);
        } else {
          // Simular consumo para validación de siguientes órdenes
          inventory[ingredientType] -= 1;
        }
      }
      
      if (orderMissing.length > 0) {
        missingOrders.push({ orderName: order.name, missing: orderMissing });
      }
    }
    
    return { valid: missingOrders.length === 0, missingOrders };
  };

  const handleFinalizeTurn = () => {
    const currentPlayerNum = gameState.currentTurn;
    const currentPlayerPosition = currentPlayerNum === 1 ? playerPositions.player1 : playerPositions.player2;
    const currentPlayerId = currentPlayerNum === 1 ? roomData?.creatorId : roomData?.opponentId;
    
    const newTurn = currentPlayerNum === 1 ? 2 : 1;
    const newPlayerId = newTurn === 1 ? roomData?.creatorId : roomData?.opponentId;
    
    // ACTUALIZACIÓN LOCAL INMEDIATA (antes de enviar al servidor)
    // Esto previene el "lag" y hace que la UI responda inmediatamente
    setGameState((prev) => ({
      ...prev,
      currentTurn: newTurn
    }));
    
    setMovementCount(0);
    setSelectedPiece(null);
    setPossibleMoves([]);
    setIsExchangeMode(false);
    setSelectedOrderCards([]);
    
    // 1️⃣ Enviar END_TURN primero
    if (gameWebSocketService.isConnected() && currentPlayerId) {
      gameWebSocketService.sendEndTurn(
        currentPlayerId,
        currentPlayerPosition,
        null,
        null,
        null
      );
    }
    
    // 2️⃣ Enviar TURN_CHANGED para notificar al otro jugador
    if (gameWebSocketService.isConnected()) {
      gameWebSocketService.sendTurnChanged(newPlayerId, newTurn);
    }
    
    // 3️⃣ Enviar GAME_STATE_UPDATE con el nuevo estado
    if (gameWebSocketService.isConnected()) {
      const stateToSend = {
        currentTurn: newTurn,  // El NUEVO turno
        movementCount: 0,      // Resetear contador
        ingredientGrid: ingredientGrid,
        playerPositions: playerPositions
      };
      
      gameWebSocketService.sendGameState(stateToSend);
    }
  };

  const handleMainButtonPress = () => {
    if (isExchangeMode) {
      if (selectedOrderCards.length === 0) {
        showModal('Selecciona órdenes', 'Debes marcar al menos una orden en tu tarjeta para canjear tus ingredientes por puntos.', 'info', () => {}, 'OK', () => { handleFinalizeTurn(); }, 'Finalizar turno');
        return;
      }
      
      const validation = validateIngredientsForOrders();
      
      if (!validation.valid) {
        // Mostrar mensaje de error con detalles de qué órdenes no se pueden completar
        const errorMessages = validation.missingOrders.map(item => 
          `${item.orderName}: Faltan ${item.missing.join(', ')}`
        ).join('\n');
        
        showModal(
          'Ingredientes insuficientes', 
          `No puedes completar las siguientes órdenes:\n\n${errorMessages}\n\nDeselecciona las órdenes que no puedes completar o consigue más ingredientes.`, 
          'error',
          null,
          'OK'
        );
        return;
      }
      
      // Si la validación pasó, procesar todas las órdenes seleccionadas
      const currentPlayerKey = gameState.currentTurn === 1 ? 'player1' : 'player2';
      const currentPlayer = gameState[currentPlayerKey];
      const currentPlayerId = gameState.currentTurn === 1 ? roomData?.creatorId : roomData?.opponentId;
      
      // Mapeo SIN acentos
      const ingredientMap = { 
        'Café': 'CAFE', 
        'Cafe': 'CAFE',
        'CAFÉ': 'CAFE',
        'CAFE': 'CAFE',
        'Leche': 'LECHE',
        'LECHE': 'LECHE',
        'Agua': 'AGUA',
        'AGUA': 'AGUA',
        'Caramelo': 'CARAMELO',
        'CARAMELO': 'CARAMELO'
      };
      
      // Obtener las órdenes seleccionadas
      const selectedOrders = currentPlayer.orders.filter(o => selectedOrderCards.includes(o.id));
      
      // Calcular puntos totales y actualizar inventario
      let totalPoints = 0;
      const updatedInventory = { ...currentPlayer.inventory };
      
      selectedOrders.forEach(order => {
        totalPoints += order.points;
        order.ingredients.forEach(ingredient => {
          const ingredientType = ingredientMap[ingredient] || ingredient.toUpperCase();
          updatedInventory[ingredientType] -= 1;
        });
      });
      
      // Generar órdenes únicas para reemplazar las completadas (mantener siempre 3)
      const remainingOrders = currentPlayer.orders.filter(o => !selectedOrderCards.includes(o.id));
      const ordersNeeded = 3 - remainingOrders.length;
      const newOrders = generateUniqueOrders(ordersNeeded);
        
      // Enviar evento TRADE con todas las órdenes completadas
      if (gameWebSocketService.isConnected() && currentPlayerId) {
        gameWebSocketService.sendTrade(
          currentPlayerId,
          selectedOrders,      // Array de todas las órdenes completadas
          totalPoints,         // Puntos totales ganados (para que el backend lo procese)
          newOrders,           // Array de nuevas órdenes generadas
          updatedInventory     // Inventario actualizado
        );
      }
      
      // Actualizar estado local SOLO con inventario y órdenes
      // El score lo actualizará el backend y llegará por WebSocket
      setGameState((prev) => {
        const updatedPlayer = {
          ...prev[currentPlayerKey],
          // NO actualizar score aquí - dejar que el backend lo haga
          orders: [...remainingOrders, ...newOrders],
          inventory: updatedInventory,
        };
        
        return {
          ...prev,
          [currentPlayerKey]: updatedPlayer,
        };
      });
      
      setSelectedOrderCards([]);
      setIsExchangeMode(false);
      
      const orderNames = selectedOrders.map(o => o.name).join(', ');
      showModal(
        '¡Órdenes completadas!', 
        `¡Has completado ${selectedOrders.length} orden(es): "${orderNames}" y ganado ${totalPoints} puntos en total!`, 
        'success', 
        () => { handleFinalizeTurn(); }, 
        'Finalizar turno'
      );
    } else {
      showModal('¿Deseas canjear tus ingredientes?', 'Puedes canjear tus ingredientes por puntos o finalizar tu turno directamente.', 'info', () => { setIsExchangeMode(true); }, 'OK', () => { handleFinalizeTurn(); }, 'Finalizar turno');
    }
  };

  return {
    loading,
    error,
    gameState,
    setGameState,
    playerPositions,
    setPlayerPositions,
    selectedPiece,
    setSelectedPiece,
    movementCount,
    setMovementCount,
    possibleMoves,
    setPossibleMoves,
    ingredientGrid,
    loadGameData,
    calculatePossibleMoves,
    executeMove,
    resetGame,
    handleCellPress,
    arePlayersOnSamePosition,
    handleMainButtonPress,
    isExchangeMode,
    handleOrderCardPress,
    selectedOrderCards,
    modalVisible,
    modalData,
    hideModal
  };
}
