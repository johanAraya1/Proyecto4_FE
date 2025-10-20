import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import { roomService } from '../../services/roomService';
import { generateRandomOrder } from '../../utils/orderGenerator';

/**
 * Pantalla principal del juego - Interfaz de partida en tiempo real
 * Muestra los jugadores, cartas objetivo y área de juego central
 */
const GameScreen = ({ navigation, route }) => {
  const { roomCode } = route.params || {};

  // Detectar si es móvil para layout responsivo
  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;

  // Estados del juego
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialOrder1 = generateRandomOrder();
  const initialOrder2 = generateRandomOrder();
  // Para debug - remover después
  console.log('Estado inicial - Orden 1:', initialOrder1);
  console.log('Estado inicial - Orden 2:', initialOrder2);

  const [gameState, setGameState] = useState({
    currentTurn: 1, // 1 o 2
    player1: {
      name: null,
      elo: null,
      order: initialOrder1, // Orden inicial para jugador 1
    },
    player2: {
      name: null,
      elo: null,
      order: initialOrder2, // Orden inicial para jugador 2
    },
    // Cuadrícula 3x3 con solo una pieza de cada jugador - 0: vacío, 1: jugador 1, 2: jugador 2
    grid: [
      [1, 0, 0],
      [0, 0, 0],
      [0, 0, 2],
    ],
  });

  // Estados para las posiciones actuales de los jugadores
  const [playerPositions, setPlayerPositions] = useState({
    player1: { row: 0, col: 0 }, // Jugador 1 empieza en esquina superior izquierda
    player2: { row: 2, col: 2 }, // Jugador 2 empieza en esquina inferior derecha
  });

  // Estados para el sistema de movimientos
  const [selectedPiece, setSelectedPiece] = useState(null); // {row, col} de la pieza seleccionada
  const [movementCount, setMovementCount] = useState(0); // Contador de movimientos en el turno actual
  const [possibleMoves, setPossibleMoves] = useState([]); // Array de movimientos posibles [{row, col}]

  // Estados para el modal personalizado
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({
    title: '',
    message: '',
    icon: '',
    type: 'success', // 'success' | 'error' | 'warning' | 'confirm'
    onConfirm: null,
    showCancel: false,
  });

  /**
   * Función para mostrar modal personalizado
   */
  const showCustomModal = (
    title,
    message,
    type = 'success',
    onConfirm = null,
    showCancel = false
  ) => {
    const iconMap = {
      success: '🎉',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      confirm: '❓',
    };

    const colorMap = {
      success: '#D4F6D4',
      error: '#FFE6E6',
      warning: '#FFF3CD',
      info: '#D1ECF1',
      confirm: '#E6F3FF',
    };

    const buttonColorMap = {
      success: '#28A745',
      error: '#DC3545',
      warning: '#FFC107',
      info: '#17A2B8',
      confirm: '#007BFF',
    };

    setModalData({
      title,
      message,
      icon: iconMap[type] || '🎉',
      type,
      onConfirm,
      showCancel,
      bgColor: colorMap[type] || '#D4F6D4',
      buttonColor: buttonColorMap[type] || '#28A745',
    });
    setModalVisible(true);
  };

  /**
   * Maneja el cierre del modal
   */
  const handleModalClose = (confirmed = false) => {
    setModalVisible(false);

    // Ejecutar callback si existe y se confirmó
    if (confirmed && modalData.onConfirm) {
      setTimeout(() => {
        modalData.onConfirm();
      }, 300); // Pequeña pausa para la animación
    }

    // Limpiar datos del modal
    setTimeout(() => {
      setModalData({
        title: '',
        message: '',
        icon: '',
        type: 'success',
        onConfirm: null,
        showCancel: false,
        bgColor: '#D4F6D4',
        buttonColor: '#28A745',
      });
    }, 300);
  };

  /**
   * Carga los datos de la sala desde el backend
   */
  useEffect(() => {
    loadGameData();
  }, [roomCode]);

  const loadGameData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await roomService.getRoomGameDetails(roomCode);

      if (response.success) {
        setGameState((prevState) => ({
          ...prevState,
          player1: {
            ...prevState.player1,
            name: response.room.creator.name,
            elo: response.room.creator.elo,
          },
          player2: {
            ...prevState.player2,
            name: response.room.opponent.name,
            elo: response.room.opponent.elo,
          },
        }));
      } else {
        throw new Error('No se pudieron cargar los datos del juego');
      }
    } catch (error) {
      setError(error.message);
      showCustomModal('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener nombre a mostrar
  const getPlayerDisplayName = (player, playerNumber) => {
    if (!player.name || player.name === null) {
      return `Jugador ${playerNumber}`;
    }
    return player.name;
  };

  // Función para obtener ELO a mostrar
  const getPlayerDisplayElo = (player) => {
    if (!player.elo || player.elo === null) {
      return 'Sin Elo';
    }
    return `Elo: ${player.elo}`;
  };

  /**
   * Maneja la salida del juego
   */
  const handleExitGame = () => {
    showCustomModal(
      'Salir del Juego',
      '¿Estás seguro de que quieres abandonar la partida?',
      'confirm',
      () => navigation.goBack(),
      true
    );
  };

  /**
   * Calcula los movimientos posibles para una pieza
   */
  const calculatePossibleMoves = (row, col) => {
    const moves = [];
    const directions = [
      [-1, 0], // arriba
      [1, 0], // abajo
      [0, -1], // izquierda
      [0, 1], // derecha
    ];

    const currentPlayer = gameState.grid[row][col];

    // Obtener la posición real del oponente
    const opponentPosition =
      currentPlayer === 1 ? playerPositions.player2 : playerPositions.player1;

    // Determinar si este será el último movimiento del turno
    const isThirdMovement = movementCount === 2;

    directions.forEach(([dRow, dCol]) => {
      const newRow = row + dRow;
      const newCol = col + dCol;

      // Verificar que esté dentro de los límites
      if (newRow >= 0 && newRow < 3 && newCol >= 0 && newCol < 3) {
        const targetCell = gameState.grid[newRow][newCol];

        // Verificar si esta casilla es donde está el oponente
        const isOpponentPosition =
          opponentPosition.row === newRow && opponentPosition.col === newCol;

        // En el tercer movimiento, NO permitir moverse a la casilla del oponente
        if (isThirdMovement) {
          // Solo permitir casillas vacías y que no sean la posición del oponente
          if (targetCell === 0 && !isOpponentPosition) {
            moves.push({ row: newRow, col: newCol });
          }
        } else {
          // En movimientos 1 y 2, permitir casillas vacías o del oponente
          if (targetCell === 0 || isOpponentPosition) {
            moves.push({ row: newRow, col: newCol });
          }
        }
      }
    });

    return moves;
  };

  /**
   * Ejecuta un movimiento
   */
  const executeMove = (fromRow, fromCol, toRow, toCol) => {
    const newGrid = gameState.grid.map((row) => [...row]);

    // Usar el jugador actual en lugar de leer de la cuadrícula
    // Esto evita confusión cuando las fichas están superpuestas
    const currentPlayer = gameState.currentTurn;

    // Actualizar las posiciones de los jugadores
    const newPositions = { ...playerPositions };
    if (currentPlayer === 1) {
      newPositions.player1 = { row: toRow, col: toCol };
    } else if (currentPlayer === 2) {
      newPositions.player2 = { row: toRow, col: toCol };
    }

    // Limpiar todas las celdas y volver a colocar las piezas según las nuevas posiciones
    // Esto asegura que la cuadrícula refleje las posiciones correctas
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        newGrid[r][c] = 0; // Limpiar
      }
    }

    // Colocar las piezas en sus nuevas posiciones
    // Si ambos están en la misma casilla, el último en moverse se muestra en la cuadrícula
    newGrid[newPositions.player1.row][newPositions.player1.col] = 1;
    newGrid[newPositions.player2.row][newPositions.player2.col] = 2;

    // Actualizar el estado
    setGameState((prev) => ({ ...prev, grid: newGrid }));
    setPlayerPositions(newPositions);
    setMovementCount((prev) => prev + 1);
    setSelectedPiece(null);
    setPossibleMoves([]);
  };

  /**
   * Reinicia el estado del juego
   */
  const resetGame = () => {
    setGameState((prev) => ({
      ...prev,
      currentTurn: 1,
      player1: {
        ...prev.player1,
        order: generateRandomOrder(),
      },
      player2: {
        ...prev.player2,
        order: null,
      },
      grid: [
        [1, 0, 0],
        [0, 0, 0],
        [0, 0, 2],
      ],
    }));

    setPlayerPositions({
      player1: { row: 0, col: 0 },
      player2: { row: 2, col: 2 },
    });

    setMovementCount(0);
    setSelectedPiece(null);
    setPossibleMoves([]);
  };

  /**
   * Verifica si las piezas de ambos jugadores están en la misma posición
   */
  const arePlayersOnSamePosition = () => {
    const samePosition =
      playerPositions.player1.row === playerPositions.player2.row &&
      playerPositions.player1.col === playerPositions.player2.col;

    return samePosition;
  };

  /**
   * Finaliza el turno del jugador
   */
  const finalizeTurn = () => {
    if (movementCount === 0) {
      showCustomModal(
        'Turno incompleto',
        'Debes realizar al menos un movimiento antes de finalizar el turno.',
        'warning'
      );
      return;
    }

    // Verificar si el jugador está en la misma posición que el oponente
    if (arePlayersOnSamePosition()) {
      showCustomModal(
        'Posición inválida',
        'No puedes finalizar tu turno en la misma casilla que tu oponente. Muévete a otra posición.',
        'error'
      );
      return;
    }

    showCustomModal(
      'Finalizar turno',
      `Has realizado ${movementCount} movimiento(s). ¿Quieres finalizar tu turno?`,
      'confirm',
      () => {
        setMovementCount(0);
        setSelectedPiece(null);
        setPossibleMoves([]);
        setGameState((prev) => ({
          ...prev,
          currentTurn: prev.currentTurn === 1 ? 2 : 1,
        }));
      },
      true
    );
  };

  /**
   * Maneja el click en una celda de la cuadrícula
   */
  const handleCellPress = (row, col) => {
    const cellValue = gameState.grid[row][col];

    // Verificar si es un turno válido (jugador 1 o 2)
    if (gameState.currentTurn !== 1 && gameState.currentTurn !== 2) {
      showCustomModal(
        'Error de turno',
        'Error en el sistema de turnos.',
        'error'
      );
      return;
    }

    // Si ya alcanzó el máximo de movimientos
    if (movementCount >= 3) {
      showCustomModal(
        'Máximo de movimientos',
        'Has alcanzado el máximo de 3 movimientos. Finaliza tu turno.',
        'warning'
      );
      return;
    }

    // Verificar si el jugador actual está en esta posición
    const currentPlayerPosition =
      gameState.currentTurn === 1
        ? playerPositions.player1
        : playerPositions.player2;
    const isCurrentPlayerHere =
      currentPlayerPosition.row === row && currentPlayerPosition.col === col;

    // Verificar si el oponente también está aquí
    const opponentPosition =
      gameState.currentTurn === 1
        ? playerPositions.player2
        : playerPositions.player1;
    const isOpponentHere =
      opponentPosition.row === row && opponentPosition.col === col;

    // Si hace click donde está su propia pieza (puede estar superpuesta con el oponente)
    if (isCurrentPlayerHere) {
      const moves = calculatePossibleMoves(row, col);
      setSelectedPiece({ row, col });
      setPossibleMoves(moves);
      // showPossibleMoves(moves); // Comentado - no mostrar alert de movimientos posibles
      return;
    }

    // Si hace click en una celda vacía o en la posición del oponente y tiene una pieza seleccionada
    const opponentPlayer = gameState.currentTurn === 1 ? 2 : 1;
    if ((cellValue === 0 || cellValue === opponentPlayer) && selectedPiece) {
      const isValidMove = possibleMoves.some(
        (move) => move.row === row && move.col === col
      );

      if (isValidMove) {
        executeMove(selectedPiece.row, selectedPiece.col, row, col);
      } else {
        // Mensaje específico según el tipo de movimiento
        const isThirdMovement = movementCount === 2;
        const opponentPosition =
          gameState.currentTurn === 1
            ? playerPositions.player2
            : playerPositions.player1;
        const isOpponentPosition =
          opponentPosition.row === row && opponentPosition.col === col;

        if (isThirdMovement && isOpponentPosition) {
          showCustomModal(
            'Movimiento inválido',
            'No puedes terminar tu turno en la misma casilla que el oponente.',
            'error'
          );
        } else {
          showCustomModal(
            'Movimiento inválido',
            'Solo puedes moverte horizontal o verticalmente a celdas adyacentes.',
            'error'
          );
        }
      }
      return;
    }

    // Si hace click en una casilla donde solo está el oponente (no superpuesta)
    if (isOpponentHere && !isCurrentPlayerHere && !selectedPiece) {
      showCustomModal(
        'Pieza del oponente',
        'No puedes seleccionar las piezas de tu oponente.',
        'warning'
      );
      return;
    }

    // Si hace click en una celda vacía sin tener pieza seleccionada
    if (cellValue === 0 && !selectedPiece) {
      showCustomModal(
        'Selecciona tu pieza',
        'Primero debes seleccionar tu pieza (círculo marrón) para moverte.',
        'warning'
      );
      return;
    }
  };

  /**
   * Renderiza la cuadrícula 3x3 del juego
   */
  const renderGameGrid = () => {
    return (
      <View style={styles.gameGrid}>
        {gameState.grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.gridRow}>
            {row.map((cell, colIndex) => {
              const isSelected =
                selectedPiece &&
                selectedPiece.row === rowIndex &&
                selectedPiece.col === colIndex;
              const isPossibleMove = possibleMoves.some(
                (move) => move.row === rowIndex && move.col === colIndex
              );

              // Verificar qué jugadores están en esta posición
              const player1Here =
                playerPositions.player1.row === rowIndex &&
                playerPositions.player1.col === colIndex;
              const player2Here =
                playerPositions.player2.row === rowIndex &&
                playerPositions.player2.col === colIndex;
              const bothPlayersHere = player1Here && player2Here;

              return (
                <TouchableOpacity
                  key={`${rowIndex}-${colIndex}`}
                  style={[
                    styles.gridCell,
                    isSelected && styles.selectedCell,
                    isPossibleMove && styles.possibleMoveCell,
                  ]}
                  onPress={() => handleCellPress(rowIndex, colIndex)}
                >
                  {/* Renderizar jugador 1 si está aquí */}
                  {player1Here && (
                    <View
                      style={[
                        styles.playerPiece,
                        styles.player1Piece,
                        isSelected && styles.selectedPiece,
                        bothPlayersHere && styles.overlappedPiece1,
                      ]}
                    >
                      <Text style={styles.pieceText}>1</Text>
                    </View>
                  )}

                  {/* Renderizar jugador 2 si está aquí */}
                  {player2Here && (
                    <View
                      style={[
                        styles.playerPiece,
                        styles.player2Piece,
                        bothPlayersHere && styles.overlappedPiece2,
                      ]}
                    >
                      <Text style={styles.pieceText}>2</Text>
                    </View>
                  )}

                  {isPossibleMove && (
                    <View style={styles.possibleMoveIndicator} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  /**
   * Renderiza la información de un jugador
   */
  const renderPlayerInfo = (player, playerNumber, isCurrentTurn) => {
    const avatarColor = playerNumber === 1 ? '#8B4513' : '#DC143C'; // Café para P1, Rojo para P2

    return (
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        {/* Card del Jugador */}
        <View
          style={[styles.playerCard, isCurrentTurn && styles.activePlayerCard]}
        >
          <View style={[styles.playerAvatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{playerNumber}</Text>
          </View>
          <View style={styles.playerDetails}>
            <Text style={styles.playerName}>
              {getPlayerDisplayName(player, playerNumber)}
            </Text>
            <Text style={styles.playerElo}>{getPlayerDisplayElo(player)}</Text>
          </View>
        </View>

        {/* Card de la Orden */}
        <View style={{
          backgroundColor: '#FFFFFF',
          padding: 15,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: avatarColor,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 3,
          minWidth: 150,
          flex: 1
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: avatarColor,
            marginBottom: 8
          }}>Orden:</Text>
          <Text style={{
            fontSize: 15,
            fontWeight: '600',
            marginBottom: 5
          }}>{player.order ? player.order.name : 'Sin orden'}</Text>
          <Text style={{
            fontSize: 14,
            color: '#666',
            marginBottom: 8
          }}>Puntos: {player.order ? player.order.points : '0'}</Text>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 4
          }}>Ingredientes:</Text>
          {player.order?.ingredients?.map((ing, idx) => (
            <Text key={`${playerNumber}-ing-${idx}`} style={{
              fontSize: 13,
              color: '#444',
              marginLeft: 8,
              marginBottom: 2
            }}>• {ing}</Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExitGame} style={styles.backButton}>
          <Text style={styles.backText}>← Salir</Text>
        </TouchableOpacity>
        <Text style={styles.roomCode}>Sala: {roomCode || 'XXXXXX'}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#6F4E37' />
          <Text style={styles.loadingText}>Cargando datos del juego...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadGameData}>
            <Text style={styles.retryButtonText}>🔄 Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.gameContainer}>
          {/* Layout responsivo - móvil vs web */}
          {isMobile ? (
            // Layout móvil: Jugador 1 arriba, cuadrícula al centro, Jugador 2 abajo
            <View style={styles.mobileGameLayout}>
              {/* Sección superior con Jugador 1 y órdenes */}
              <View style={styles.mobileTopSection}>
                {/* Información del Jugador 1 */}
                {renderPlayerInfo(
                  gameState.player1,
                  1,
                  gameState.currentTurn === 1
                )}
                
                {/* Sección de órdenes simplificada */}
                <View style={{
                  padding: 20,
                  backgroundColor: 'white',
                  margin: 10,
                  borderRadius: 10,
                }}>
                  <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 10}}>ÓRDENES ACTUALES:</Text>
                  <View style={{marginBottom: 20}}>
                    <Text style={{fontSize: 16, fontWeight: 'bold'}}>Orden Jugador 1:</Text>
                    <Text style={{fontSize: 14}}>{gameState.player1?.order ? JSON.stringify(gameState.player1.order, null, 2) : 'Sin orden'}</Text>
                  </View>
                  <View>
                    <Text style={{fontSize: 16, fontWeight: 'bold'}}>Orden Jugador 2:</Text>
                    <Text style={{fontSize: 14}}>{gameState.player2?.order ? JSON.stringify(gameState.player2.order, null, 2) : 'Sin orden'}</Text>
                  </View>
                </View>
              </View>

              {/* Cuadrícula central del juego */}
              <View style={styles.centerGameArea}>
                {renderGameGrid()}
              </View>

              {/* Jugador 2 - Abajo */}
              <View style={styles.mobileBottomSection}>
                {renderPlayerInfo(
                  gameState.player2,
                  2,
                  gameState.currentTurn === 2
                )}
              </View>
            </View>
          ) : (
            // Layout web: Jugadores a los lados, cuadrícula al centro
            <View style={styles.gamePlayArea}>
              {/* Jugador 1 - Lado izquierdo */}
              <View style={styles.leftPlayerContainer}>
                {renderPlayerInfo(
                  gameState.player1,
                  1,
                  gameState.currentTurn === 1
                )}
              </View>

              {/* Cuadrícula central del juego */}
              <View style={styles.centerGameArea}>{renderGameGrid()}</View>

              {/* Jugador 2 - Lado derecho */}
              <View style={styles.rightPlayerContainer}>
                {renderPlayerInfo(
                  gameState.player2,
                  2,
                  gameState.currentTurn === 2
                )}
              </View>
            </View>
          )}

          {/* Panel de control del turno */}
          {!loading &&
            !error &&
            (gameState.currentTurn === 1 || gameState.currentTurn === 2) && (
              <View style={styles.turnControlPanel}>
                <Text style={styles.movementCounter}>
                  Movimientos: {movementCount}/3
                </Text>
                <TouchableOpacity
                  style={[
                    styles.finalizeTurnButton,
                    (movementCount === 0 || arePlayersOnSamePosition()) &&
                      styles.finalizeTurnButtonDisabled,
                  ]}
                  onPress={finalizeTurn}
                  disabled={movementCount === 0 || arePlayersOnSamePosition()}
                >
                  <Text
                    style={[
                      styles.finalizeTurnButtonText,
                      (movementCount === 0 || arePlayersOnSamePosition()) &&
                        styles.finalizeTurnButtonTextDisabled,
                    ]}
                  >
                    Finalizar Turno
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          {/* Botones de depuración */}
          {!loading && !error && (
            <View style={styles.debugPanel}>
              <TouchableOpacity
                style={[styles.debugButton, styles.resetButton]}
                onPress={resetGame}
              >
                <Text style={styles.debugButtonText}>Reiniciar Juego</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Indicador de turno - solo mostrar si no hay loading ni error */}
      {!loading && !error && (
        <View style={styles.turnIndicator}>
          <Text style={styles.turnText}>
            Turno de{' '}
            {gameState.currentTurn === 1
              ? getPlayerDisplayName(gameState.player1, 1)
              : getPlayerDisplayName(gameState.player2, 2)}
          </Text>
        </View>
      )}

      {/* Modal Personalizado */}
      <Modal
        animationType='fade'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => handleModalClose(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              modalData.type &&
                styles[
                  `modal${modalData.type.charAt(0).toUpperCase() + modalData.type.slice(1)}`
                ],
            ]}
          >
            <Text style={styles.modalTitle}>{modalData.title}</Text>
            <Text style={styles.modalMessage}>{modalData.message}</Text>
            <View style={styles.modalButtonContainer}>
              {modalData.showCancel && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => handleModalClose(false)}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalConfirmButton,
                  modalData.type &&
                    styles[
                      `modal${modalData.type.charAt(0).toUpperCase() + modalData.type.slice(1)}Button`
                    ],
                ]}
                onPress={() => handleModalClose(true)}
              >
                <Text style={styles.modalConfirmText}>
                  {modalData.confirmText || 'OK'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#6F4E37',
    fontWeight: '600',
  },
  roomCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },

  // Estilos de loading y error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6F4E37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  gameContainer: {
    flex: 1,
    padding: 20,
  },

  // Layout principal del juego
  gamePlayArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 400,
    marginVertical: 20,
  },

  // Layout móvil - Vertical
  mobileGameLayout: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 30,
  },
  mobileTopSection: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
  },
  mobileBottomSection: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  ordersContainer: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#6F4E37',
    minHeight: 200,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6F4E37',
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  mobilePlayerContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },

  leftPlayerContainer: {
    flex: 1,
    maxWidth: 200,
    marginRight: 20,
  },
  rightPlayerContainer: {
    flex: 1,
    maxWidth: 200,
    marginLeft: 20,
  },
  centerGameArea: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Cuadrícula del juego
  gameGrid: {
    borderWidth: 3,
    borderColor: '#333',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    padding: 8,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridCell: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  selectedCell: {
    borderColor: '#FFD700',
    borderWidth: 3,
    backgroundColor: '#FFF8DC',
  },
  possibleMoveCell: {
    borderColor: '#32CD32',
    borderWidth: 3,
    backgroundColor: '#F0FFF0',
  },
  playerPiece: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  player1Piece: {
    backgroundColor: '#8B4513', // Marrón para jugador 1
  },
  player2Piece: {
    backgroundColor: '#DC143C', // Rojo para jugador 2
  },
  pieceText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  selectedPiece: {
    borderWidth: 3,
    borderColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOpacity: 0.6,
  },
  // Estilos para piezas superpuestas
  overlappedPiece1: {
    position: 'absolute',
    left: -10,
    top: -5,
    zIndex: 1,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  overlappedPiece2: {
    position: 'absolute',
    right: -10,
    bottom: -5,
    zIndex: 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  possibleMoveIndicator: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#32CD32',
    opacity: 0.7,
  },

  topSection: {
    marginBottom: 20,
  },
  bottomSection: {
    marginTop: 20,
  },

  // Estilos de jugador
  playerCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    minHeight: 120,
  },
  activePlayerCard: {
    borderColor: '#FFD166',
    backgroundColor: '#FFFBF0',
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  playerDetails: {
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
    textAlign: 'center',
  },
  playerElo: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Estilos del tablero central (obsoletos - mantenidos por compatibilidad)
  gameBoard: {
    backgroundColor: '#E5E5E5',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    minHeight: 120,
  },
  centralPiece: {
    alignItems: 'center',
  },
  pieceButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  brownPiece: {
    backgroundColor: '#8B4513',
  },
  redPiece: {
    backgroundColor: '#DC143C',
  },
  pieceNumber: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },

  // Indicador de turno
  turnIndicator: {
    backgroundColor: '#6F4E37',
    paddingVertical: 12,
    alignItems: 'center',
  },
  turnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Panel de control del turno
  turnControlPanel: {
    backgroundColor: '#F8F9FA',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6F4E37',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Panel de depuración
  debugPanel: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  debugButton: {
    backgroundColor: '#6C757D',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 200,
  },
  resetButton: {
    backgroundColor: '#DC3545',
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  movementCounter: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6F4E37',
    marginBottom: 12,
  },
  finalizeTurnButton: {
    backgroundColor: '#6F4E37',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  finalizeTurnButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  finalizeTurnButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  finalizeTurnButtonTextDisabled: {
    color: '#999999',
  },
  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    minWidth: 300,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalSuccess: {
    borderTopColor: '#4CAF50',
    borderTopWidth: 4,
  },
  modalError: {
    borderTopColor: '#F44336',
    borderTopWidth: 4,
  },
  modalWarning: {
    borderTopColor: '#FF9800',
    borderTopWidth: 4,
  },
  modalConfirm: {
    borderTopColor: '#2196F3',
    borderTopWidth: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  modalConfirmButton: {
    backgroundColor: '#6F4E37',
  },
  modalSuccessButton: {
    backgroundColor: '#4CAF50',
  },
  modalErrorButton: {
    backgroundColor: '#F44336',
  },
  modalWarningButton: {
    backgroundColor: '#FF9800',
  },
  modalConfirmButtonModal: {
    backgroundColor: '#2196F3',
  },
  modalCancelText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GameScreen;
