import { useState, useEffect } from 'react';
import { generateGrid } from '../utils/gridGenerator';
import { generateRandomOrder, generateUniqueOrders } from '../utils/orderGenerator';
import useCustomModal from './useCustomModal';
import { gameWebSocketService } from '../services/gameWebSocketService';
import { roomService } from '../services/roomService';

export function useGameLogic(roomCode, userId, roomData = null, navigation = null) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ingredientGrid, setIngredientGrid] = useState(null);
  const [isGameInitialized, setIsGameInitialized] = useState(false);  // ⭐ Nuevo flag
  
  const [gameState, setGameState] = useState({
    currentTurn: 1,
    player1: {
      name: null,
      score: 0,
      orders: generateUniqueOrders(1),  // ⭐ Jugador 1 empieza con 1 orden
      inventory: { AGUA: 0, CAFE: 0, LECHE: 0, CARAMELO: 0 },
      turnsCompleted: 1  // ⭐ Jugador 1 ya está en su turno 1
    },
    player2: {
      name: null,
      score: 0,
      orders: [],  // ⭐ Jugador 2 empieza sin órdenes (aún no ha jugado)
      inventory: { AGUA: 0, CAFE: 0, LECHE: 0, CARAMELO: 0 },
      turnsCompleted: 0  // ⭐ Jugador 2 aún no ha completado turnos
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
  const [pickupEffect, setPickupEffect] = useState(null); // { row, col, type }
  
  const { modalVisible, modalData, showModal, hideModal } = useCustomModal();
  
  // ============ WEBSOCKET CONNECTION ============
  useEffect(() => {
    if (!roomCode || !roomData?.id || !userId) {
      return;
    }
    
    // Conectar al WebSocket
    gameWebSocketService.connect(roomCode, roomData.id, userId);
    
    // Handler para conexión exitosa
    const handleConnected = async () => {
      console.log('✅ WebSocket conectado a sala:', roomCode);
    };
    
    // Handler para actualización del estado del juego
    const handleGameStateUpdate = (payload) => {
      if (!payload.gameState) return;
      
      const backendState = payload.gameState;
      
      if (payload.penalty && payload.penalty.playerId === userId) {
        showModal(
          '⚠️ Penalización',
          `${payload.penalty.message}\n\nSe han deducido ${payload.penalty.amount} puntos de tu marcador.`,
          'warning',
          null,
          'Entendido'
        );
      }
      
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
      
      if (backendState.playerPositions) {
        setPlayerPositions(backendState.playerPositions);
      }
      
      if (backendState.movementCount !== undefined) {
        setMovementCount(backendState.movementCount);
      }
      
      if (backendState.ingredientGrid) {
        setIngredientGrid(backendState.ingredientGrid);
      }
      
      setGameState((prev) => {
        const newState = { ...prev };
        
        if (backendState.currentTurn !== undefined) {
          newState.currentTurn = backendState.currentTurn;
        }
        
        if (backendState.player1) {
          const convertedOrders = backendState.player1.orders ? backendState.player1.orders.map(convertOrderFromBackendFormat) : prev.player1.orders;
          
          newState.player1 = {
            ...prev.player1,
            name: backendState.player1.name || prev.player1.name,
            score: backendState.player1.score !== undefined ? backendState.player1.score : prev.player1.score,
            inventory: backendState.player1.inventory || prev.player1.inventory,
            turnsCompleted: backendState.player1.turnsCompleted !== undefined ? backendState.player1.turnsCompleted : prev.player1.turnsCompleted,
            orders: convertedOrders
          };
        }
        
        if (backendState.player2) {
          const convertedOrders = backendState.player2.orders ? backendState.player2.orders.map(convertOrderFromBackendFormat) : prev.player2.orders;
          
          newState.player2 = {
            ...prev.player2,
            name: backendState.player2.name || prev.player2.name,
            score: backendState.player2.score !== undefined ? backendState.player2.score : prev.player2.score,
            inventory: backendState.player2.inventory || prev.player2.inventory,
            turnsCompleted: backendState.player2.turnsCompleted !== undefined ? backendState.player2.turnsCompleted : prev.player2.turnsCompleted,
            orders: convertedOrders
          };
        }
        
        return newState;
      });
    };
    
    // Registrar todos los handlers
    gameWebSocketService.on('connected', handleConnected);
    gameWebSocketService.on('gameStateUpdate', handleGameStateUpdate);
    
    // Handler para movimientos del oponente
    const handlePlayerMove = (payload) => {
      if (!payload) return;
      
      const isMyMove = payload.playerId === userId;
      if (isMyMove) return;
      
      if (payload.to && Array.isArray(payload.to)) {
        const newRow = payload.to[0];
        const newCol = payload.to[1];
        
        setPlayerPositions((prev) => {
          const isPlayer1Move = payload.playerId === roomData?.creatorId;
          return {
            ...prev,
            [isPlayer1Move ? 'player1' : 'player2']: { row: newRow, col: newCol }
          };
        });
      }
      
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
      
      if (payload.movementCount !== undefined) {
        setMovementCount(payload.movementCount);
      }
    };
    
    gameWebSocketService.on('playerMove', handlePlayerMove);
    
    // Handler para canje de órdenes (trade)
    const handleTrade = (payload) => {
      if (!payload) return;
      
      setGameState((prev) => {
        const isPlayer1Trade = payload.playerId === roomData?.creatorId;
        const playerKey = isPlayer1Trade ? 'player1' : 'player2';
        
        const updatedState = { ...prev };
        
        if (payload.totalPoints !== undefined || payload.pointsEarned !== undefined) {
          const points = payload.totalPoints || payload.pointsEarned;
          updatedState[playerKey] = {
            ...prev[playerKey],
            score: prev[playerKey].score + points
          };
        }
        
        if (payload.newOrders && Array.isArray(payload.newOrders)) {
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
        
        if (payload.updatedInventory) {
          updatedState[playerKey] = {
            ...updatedState[playerKey],
            inventory: payload.updatedInventory
          };
        }
        
        return updatedState;
      });
    };
    
    gameWebSocketService.on('trade', handleTrade);
    
    // Handler para cambio de turno
    const handleTurnChanged = (payload) => {
      if (payload && payload.turnNumber) {
        setGameState((prev) => {
          if (prev.currentTurn === payload.turnNumber) {
            return prev;
          }
          return {
            ...prev,
            currentTurn: payload.turnNumber
          };
        });
      }
    };
    
    gameWebSocketService.on('turnChanged', handleTurnChanged);
    
    // Handler para fin de juego
    const handleGameEnded = (payload) => {
      if (!payload) return;
      
      console.log('🏁 Evento GAME_ENDED recibido - Partida terminada');
      
      // Desactivar reconexión automática
      gameWebSocketService.shouldReconnect = false;
      
      const isWinner = payload.winnerId === userId;
      const eloChange = isWinner ? payload.eloChanges.winner : payload.eloChanges.loser;
      const eloSign = eloChange > 0 ? '+' : '';
      
      if (isWinner) {
        showModal(
          '🏆 ¡Victoria!',
          `¡Felicidades! Has ganado la partida con ${payload.winnerScore} puntos.\n\nTu oponente obtuvo ${payload.loserScore} puntos.\n\nELO: ${eloSign}${eloChange}`,
          'success',
          () => {
            hideModal();
            
            // Desconectar permanentemente
            console.log('🔌 Desconectando permanentemente después de victoria...');
            gameWebSocketService.disconnectPermanently();
            
            if (navigation) {
              navigation.navigate('Dashboard');
            }
          },
          'Volver al menú'
        );
      } else {
        showModal(
          '😔 Derrota',
          `Tu oponente ha ganado la partida con ${payload.winnerScore} puntos.\n\nObtuviste ${payload.loserScore} puntos.\n\nELO: ${eloSign}${eloChange}`,
          'error',
          () => {
            hideModal();
            
            // Desconectar permanentemente
            console.log('🔌 Desconectando permanentemente después de derrota...');
            gameWebSocketService.disconnectPermanently();
            
            if (navigation) {
              navigation.navigate('Dashboard');
            }
          },
          'Volver al menú'
        );
      }
    };
    
    gameWebSocketService.on('gameEnded', handleGameEnded);
    
    // Handler para cuando un jugador se rinde
    const handlePlayerSurrendered = (payload) => {
      if (!payload) return;
      
      console.log('🏳️ Evento PLAYER_SURRENDERED recibido:', payload);
      
      const didISurrender = payload.playerId === userId;
      
      if (didISurrender) {
        // Yo me rendí, simplemente salgo (el modal ya se mostró)
        console.log('✅ Confirmación de mi rendición recibida del servidor');
        return;
      }
      
      // El oponente se rindió - desactivar reconexión
      console.log('🏆 El oponente se rindió - desactivando reconexión');
      gameWebSocketService.shouldReconnect = false;
      
      // Mostrar notificación de victoria
      showModal(
        '🎉 ¡Victoria por Abandono!',
        `Tu oponente ha abandonado la partida.\n\n¡Has ganado por rendición!\n\nELO: +${payload.eloChanges?.winner || 25}`,
        'success',
        () => {
          hideModal();
          
          // Desconectar permanentemente antes de navegar
          console.log('🔌 Desconectando permanentemente después de victoria...');
          gameWebSocketService.disconnectPermanently();
          
          if (navigation) {
            navigation.navigate('Dashboard');
          }
        },
        'Volver al menú'
      );
    };
    
    gameWebSocketService.on('playerSurrendered', handlePlayerSurrendered);
    
    // Handler para errores del servidor
    const handleError = (payload) => {
      console.log('❌ Error del WebSocket:', payload);
      
      // Si el error indica que la sala está terminada, redirigir al Dashboard
      if (payload && payload.message && 
          (payload.message.includes('terminada') || 
           payload.message.includes('finished') || 
           payload.message.includes('completed'))) {
        console.log('🚫 Sala terminada - Redirigiendo al Dashboard');
        
        // Desactivar reconexión
        gameWebSocketService.shouldReconnect = false;
        
        showModal(
          '⚠️ Sala Terminada',
          'Esta sala ya ha finalizado. Serás redirigido al Dashboard.',
          'warning',
          () => {
            hideModal();
            gameWebSocketService.disconnectPermanently();
            if (navigation) {
              navigation.navigate('Dashboard');
            }
          },
          'Entendido'
        );
      }
    };
    
    gameWebSocketService.on('error', handleError);
    
    // Cleanup function
    return () => {
      // Remover todos los event listeners
      gameWebSocketService.off('connected', handleConnected);
      gameWebSocketService.off('gameStateUpdate', handleGameStateUpdate);
      gameWebSocketService.off('playerMove', handlePlayerMove);
      gameWebSocketService.off('trade', handleTrade);
      gameWebSocketService.off('turnChanged', handleTurnChanged);
      gameWebSocketService.off('gameEnded', handleGameEnded);
      gameWebSocketService.off('playerSurrendered', handlePlayerSurrendered);
      gameWebSocketService.off('error', handleError);
      
      // Desconectar WebSocket
      gameWebSocketService.disconnect();
    };
  }, [roomCode, roomData?.id, userId]);
  
  // ============ ENVIAR GRID_INITIALIZED CUANDO EL JUEGO ESTÉ LISTO ============
  useEffect(() => {
    // Solo enviar si:
    // 1. El WebSocket está conectado
    // 2. Tenemos un grid generado
    // 3. Aún no hemos inicializado el juego
    // 4. No estamos cargando
    if (
      gameWebSocketService.isConnected() && 
      ingredientGrid && 
      !isGameInitialized && 
      !loading
    ) {
      console.log('🎲 Enviando GRID_INITIALIZED al backend...');
      
      // Convertir grid a string
      const gridToString = (grid) => {
        if (!grid || grid.length === 0) return '';
        return grid.map(row => row.map(cell => cell.ingredient).join('|')).join('\n');
      };
      
      const initEvent = {
        type: 'GRID_INITIALIZED',
        payload: {
          grid: ingredientGrid,
          gridString: gridToString(ingredientGrid),
          playerPositions: playerPositions,
          player1Orders: gameState.player1.orders,  // Array de 1 orden inicial
          player2Orders: gameState.player2.orders   // Array vacío o con órdenes
        }
      };
      
      console.log('📤 Enviando GRID_INITIALIZED:', initEvent);
      gameWebSocketService.send(initEvent);
      
      // Marcar como inicializado para no enviar múltiples veces
      setIsGameInitialized(true);
    }
  }, [ingredientGrid, isGameInitialized, loading, gameState.player1.orders, gameState.player2.orders, playerPositions]);
  
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

        
        // Restaurar cuadrícula guardada (ingredientGrid viene directamente)
        if (loadedState.ingredientGrid) {
          setIngredientGrid(loadedState.ingredientGrid);

        }
        
        // ⭐ Marcar como inicializado para no enviar GRID_INITIALIZED
        setIsGameInitialized(true);
        
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
            orders: loadedState.player1?.orders ? loadedState.player1.orders.map(convertOrderFromBackendFormat) : generateUniqueOrders(1),
            inventory: sanitizeInventory(loadedState.player1?.inventory),
            turnsCompleted: loadedState.player1?.turnsCompleted !== undefined ? loadedState.player1.turnsCompleted : 1,  // ⭐ Default 1 para player1
            elo: 1500
          },
          player2: {
            name: player2Name,
            score: loadedState.player2?.score || 0,
            orders: loadedState.player2?.orders ? loadedState.player2.orders.map(convertOrderFromBackendFormat) : [],
            inventory: sanitizeInventory(loadedState.player2?.inventory),
            turnsCompleted: loadedState.player2?.turnsCompleted !== undefined ? loadedState.player2.turnsCompleted : 0,  // ⭐ Default 0 para player2
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
        
        // ⭐ NOTA: GRID_INITIALIZED ahora se envía en el handler 'connected' del WebSocket
        // No es necesario enviarlo aquí porque puede causar duplicados
        
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
    const ingredientType = ingredient?.type;
    
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

    // Trigger pickup effect if there was an ingredient (visual feedback)
    if (ingredientType) {
      setPickupEffect({ row: toRow, col: toCol, type: ingredientType });
      // Clear the effect after animation duration
      setTimeout(() => setPickupEffect(null), 900);
    }
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
    
    const currentPlayerKey = currentPlayerNum === 1 ? 'player1' : 'player2';
    const currentPlayer = gameState[currentPlayerKey];
    
    // ⭐ REGLA: Si hay órdenes sin completar, se descartan al finalizar el turno
    const uncompletedOrders = currentPlayer.orders || [];
    const hasUncompletedOrders = uncompletedOrders.length > 0;
    
    // ⭐ PENALIZACIÓN: Calcular puntos perdidos por órdenes sin completar
    let penaltyPoints = 0;
    if (hasUncompletedOrders) {
      penaltyPoints = uncompletedOrders.reduce((sum, order) => sum + (order.points || 0), 0);
      console.log(`⚠️ ${uncompletedOrders.length} orden(es) sin completar - Penalización: -${penaltyPoints} puntos`);
    }
    
    // ⭐ ACTUALIZACIÓN LOCAL: Cambiar turno, incrementar turnsCompleted, limpiar órdenes y restar puntos
    setGameState((prev) => ({
      ...prev,
      currentTurn: newTurn,
      [currentPlayerKey]: {
        ...prev[currentPlayerKey],
        turnsCompleted: prev[currentPlayerKey].turnsCompleted + 1,
        orders: [], // ⭐ Limpiar todas las órdenes sin completar
        score: Math.max(0, prev[currentPlayerKey].score - penaltyPoints) // ⭐ Restar puntos (mínimo 0)
      }
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
        const currentPlayerKey = gameState.currentTurn === 1 ? 'player1' : 'player2';
        const currentPlayer = gameState[currentPlayerKey];
        const hasOrders = currentPlayer.orders && currentPlayer.orders.length > 0;
        
        if (hasOrders) {
          const totalPenalty = currentPlayer.orders.reduce((sum, order) => sum + (order.points || 0), 0);
          showModal(
            '⚠️ Órdenes sin completar', 
            `No has seleccionado ninguna orden para canjear. Si finalizas el turno ahora:\n\n❌ Perderás ${currentPlayer.orders.length} orden(es)\n💔 Penalización: -${totalPenalty} puntos\n\n¿Deseas continuar?`, 
            'warning', 
            () => {}, 
            'Cancelar', 
            () => { handleFinalizeTurn(); }, 
            'Sí, finalizar'
          );
        } else {
          showModal('Selecciona órdenes', 'Debes marcar al menos una orden en tu tarjeta para canjear tus ingredientes por puntos.', 'info', () => {}, 'OK', () => { handleFinalizeTurn(); }, 'Finalizar turno');
        }
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
      
      // ⭐ El backend calculará cuántas órdenes generar según turnsCompleted
      // Aquí solo preparamos los datos para enviar
      const remainingOrders = currentPlayer.orders.filter(o => !selectedOrderCards.includes(o.id));
        
      // ⭐ Enviar evento TRADE - el backend generará las nuevas órdenes
      if (gameWebSocketService.isConnected() && currentPlayerId) {
        gameWebSocketService.sendTrade(
          currentPlayerId,
          selectedOrders,      // Array de todas las órdenes completadas
          totalPoints,         // Puntos totales ganados
          [],                  // ⭐ No enviar newOrders - el backend las genera
          updatedInventory     // Inventario actualizado
        );
      }
      
      // ⭐ Actualizar estado local SOLO con inventario
      // Las órdenes y score llegarán del backend por WebSocket
      setGameState((prev) => ({
        ...prev,
        [currentPlayerKey]: {
          ...prev[currentPlayerKey],
          orders: remainingOrders,  // Solo quitar las completadas
          inventory: updatedInventory,
        }
      }));
      
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
      // No está en modo canje - verificar si tiene órdenes pendientes
      const currentPlayerKey = gameState.currentTurn === 1 ? 'player1' : 'player2';
      const currentPlayer = gameState[currentPlayerKey];
      const hasOrders = currentPlayer.orders && currentPlayer.orders.length > 0;
      
      if (hasOrders) {
        const totalPenalty = currentPlayer.orders.reduce((sum, order) => sum + (order.points || 0), 0);
        showModal(
          '¿Deseas canjear tus ingredientes?', 
          `Tienes ${currentPlayer.orders.length} orden(es) pendiente(s). Puedes canjear tus ingredientes por puntos o finalizar tu turno directamente.\n\n⚠️ Si finalizas sin canjear:\n❌ Perderás las órdenes pendientes\n💔 Penalización: -${totalPenalty} puntos`, 
          'info', 
          () => { setIsExchangeMode(true); }, 
          'Canjear ingredientes', 
          () => { handleFinalizeTurn(); }, 
          'Finalizar sin canjear'
        );
      } else {
        showModal(
          '¿Finalizar turno?', 
          'No tienes órdenes pendientes. ¿Deseas finalizar tu turno?', 
          'info', 
          () => { handleFinalizeTurn(); }, 
          'Finalizar turno'
        );
      }
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
    pickupEffect,
    modalVisible,
    modalData,
    hideModal
  };
}
