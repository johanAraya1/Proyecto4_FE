const MemoizedPlayerCard = React.memo(PlayerCard);
const MemoizedGameGrid = React.memo(GameGrid);

import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Dimensions
} from 'react-native';

import PlayerCard from '../../components/common/PlayerCard';
import GameGrid from '../../components/common/GameGrid';
import CustomModal from '../../components/common/CustomModal';
import { useGameLogic } from '../../hooks/useGameLogic';
import { useAuth } from '../../controllers/AuthContext';
import GameScreenStyles from '../../styles/GameScreenStyles';

/**
 * Pantalla principal del juego - Interfaz de partida en tiempo real
 * Muestra los jugadores, cartas objetivo y área de juego central
 *
 * @component
 * @param {object} props
 * @param {object} props.navigation - React Navigation object
 * @param {object} props.route - Route object con params
 * @returns {JSX.Element}
 */

/**
 * Componente principal de la pantalla de juego.
 * @param {{ navigation: any, route: { params: { roomCode: string, roomData: object } } }} props
 * @returns {JSX.Element}
 */
const GameScreen = ({ navigation, route }) => {
  const { roomCode, roomData } = route.params || {};
  const { user } = useAuth();
  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;
  const {
    loading,
    error,
    gameState,
    playerPositions,
    selectedPiece,
    movementCount,
    possibleMoves,
    ingredientGrid,
    loadGameData,
    resetGame,
    handleCellPress,
    arePlayersOnSamePosition,
    handleMainButtonPress,
    isExchangeMode,
    handleOrderCardPress,
    selectedOrderCard,
    modalVisible,
    modalData,
    hideModal,
  } = useGameLogic(roomCode, user?.id, roomData);

  // Función para obtener nombre a mostrar

  /**
   * Devuelve el nombre a mostrar para un jugador.
   * @param {object} player - Objeto jugador
   * @param {number} playerNumber - Número de jugador (1 o 2)
   * @returns {string}
   */
  const getPlayerDisplayName = (player, playerNumber) => {
    if (!player.name || player.name === null) {
      return `Jugador ${playerNumber}`;
    }
    return player.name;
  };

  // Maneja la salida del juego

  /**
   * Maneja la salida del juego y regresa a la pantalla anterior.
   * El estado se guarda automáticamente vía WebSocket.
   * @returns {void}
   */
  const handleExitGame = () => {
    // El estado ya está guardado vía WebSocket, solo navegamos de vuelta
    navigation.goBack();
  };

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      // El WebSocket se desconectará automáticamente en useGameLogic
    };
  }, []);

  // Memoizar props de jugadores para móvil
  const playerPropsArr = useMemo(() => [
    {
      player: gameState.player1,
      playerNumber: 1,
      disabled: gameState.currentTurn !== 1,
      order: gameState.player1.order,
      inventory: gameState.player1.inventory,
      isOrderCardTouchable: isExchangeMode && gameState.currentTurn === 1,
      isOrderCardSelected: selectedOrderCard === 'player1',
      onOrderCardPress: () => handleOrderCardPress(1),
    },
    {
      player: gameState.player2,
      playerNumber: 2,
      disabled: gameState.currentTurn !== 2,
      order: gameState.player2.order,
      inventory: gameState.player2.inventory,
      isOrderCardTouchable: isExchangeMode && gameState.currentTurn === 2,
      isOrderCardSelected: selectedOrderCard === 'player2',
      onOrderCardPress: () => handleOrderCardPress(2),
    },
  ], [gameState, isExchangeMode, selectedOrderCard]);





  return (
    <SafeAreaView style={GameScreenStyles.container}>
      {/* Header */}
      <View style={GameScreenStyles.header}>
        <TouchableOpacity onPress={handleExitGame} style={GameScreenStyles.backButton}>
          <Text style={GameScreenStyles.backText}>← Salir</Text>
        </TouchableOpacity>
        <Text style={GameScreenStyles.roomCode}>Sala: {roomCode || 'XXXXXX'}</Text>
      </View>

      {loading || !ingredientGrid ? (
        <View style={GameScreenStyles.loadingContainer}>
          <ActivityIndicator size='large' color='#6F4E37' />
          <Text style={GameScreenStyles.loadingText}>Cargando datos del juego...</Text>
        </View>
      ) : error ? (
        <View style={GameScreenStyles.errorContainer}>
          <Text style={GameScreenStyles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={GameScreenStyles.retryButton} onPress={loadGameData}>
            <Text style={GameScreenStyles.retryButtonText}>🔄 Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={GameScreenStyles.gameContainer}>
          {/* Layout responsivo - móvil vs web */}
          {isMobile ? (
            // Layout móvil: Jugador 1 arriba, cuadrícula al centro, Jugador 2 abajo
            <View style={GameScreenStyles.mobileGameLayout}>
              {/* Jugador 1 arriba */}
              <View style={GameScreenStyles.mobileTopSection}>
                <MemoizedPlayerCard {...playerPropsArr[0]} />
              </View>
              {/* Cuadrícula central */}
              <View style={GameScreenStyles.centerGameArea}>
                <MemoizedGameGrid
                  ingredientGrid={ingredientGrid}
                  playerPositions={playerPositions}
                  selectedPiece={selectedPiece}
                  possibleMoves={possibleMoves}
                  handleCellPress={handleCellPress}
                  styles={GameScreenStyles}
                />
              </View>
              {/* Jugador 2 abajo */}
              <View style={GameScreenStyles.mobileBottomSection}>
                <MemoizedPlayerCard {...playerPropsArr[1]} />
              </View>
            </View>
          ) : (
            // Layout web: Jugadores a los lados, cuadrícula al centro
            <View style={GameScreenStyles.gamePlayArea}>
              {/* Columna 1: Jugador 1 */}
              <View style={GameScreenStyles.leftPlayerContainer}>
                <MemoizedPlayerCard
                  player={gameState.player1}
                  playerNumber={1}
                  disabled={gameState.currentTurn !== 1}
                  order={gameState.player1.order}
                  inventory={gameState.player1.inventory}
                  isOrderCardTouchable={isExchangeMode && gameState.currentTurn === 1}
                  isOrderCardSelected={selectedOrderCard === 'player1'}
                  onOrderCardPress={() => handleOrderCardPress(1)}
                />
              </View>
              {/* Columna 2: Cuadrícula */}
              <View style={GameScreenStyles.centerGameArea}>
                <MemoizedGameGrid
                  ingredientGrid={ingredientGrid}
                  playerPositions={playerPositions}
                  selectedPiece={selectedPiece}
                  possibleMoves={possibleMoves}
                  handleCellPress={handleCellPress}
                  styles={GameScreenStyles}
                />
              </View>
              {/* Columna 3: Jugador 2 */}
              <View style={GameScreenStyles.rightPlayerContainer}>
                <MemoizedPlayerCard
                  player={gameState.player2}
                  playerNumber={2}
                  disabled={gameState.currentTurn !== 2}
                  order={gameState.player2.order}
                  inventory={gameState.player2.inventory}
                  isOrderCardTouchable={isExchangeMode && gameState.currentTurn === 2}
                  isOrderCardSelected={selectedOrderCard === 'player2'}
                  onOrderCardPress={() => handleOrderCardPress(2)}
                />
              </View>
            </View>

          )}


          {/* Botones de depuración */}
          {!loading && !error && (
            <View style={GameScreenStyles.debugPanel}>
              <TouchableOpacity
                style={[GameScreenStyles.debugButton, GameScreenStyles.resetButton]}
                onPress={resetGame}
              >
                <Text style={GameScreenStyles.debugButtonText}>Reiniciar Juego</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Indicador de turno - solo mostrar si no hay loading ni error */}
      {!loading && !error && (
        <>
          <View style={GameScreenStyles.turnIndicator}>
            <Text style={GameScreenStyles.turnText}>
              Turno de{' '}
              {gameState.currentTurn === 1
                ? getPlayerDisplayName(gameState.player1, 1)
                : getPlayerDisplayName(gameState.player2, 2)}
            </Text>
          </View>
          <View style={{ alignItems: 'center', marginVertical: 10 }}>
            <Text style={{ marginBottom: 8, fontWeight: 'bold', color: '#6F4E37' }}>
              Movimientos: {movementCount}/3
            </Text>
            <TouchableOpacity
              style={[
                GameScreenStyles.finalizeTurnButton,
                (movementCount === 0 || arePlayersOnSamePosition()) && GameScreenStyles.finalizeTurnButtonDisabled,
              ]}
              disabled={movementCount === 0 || arePlayersOnSamePosition()}
              onPress={handleMainButtonPress}
            >
              <Text style={[
                GameScreenStyles.finalizeTurnButtonText,
                (movementCount === 0 || arePlayersOnSamePosition()) && GameScreenStyles.finalizeTurnButtonTextDisabled,
              ]}>
                {isExchangeMode ? 'Canjear ingredientes' : 'Finalizar turno'}
              </Text>
            </TouchableOpacity>
            {arePlayersOnSamePosition() && (
              <Text style={{ marginTop: 8, color: '#DC3545', fontSize: 12, textAlign: 'center' }}>
                No puedes terminar tu turno en la misma posición que tu oponente
              </Text>
            )}
          </View>
        </>
      )}
      
      {/* Modal personalizado */}
      <CustomModal
        visible={modalVisible}
        title={modalData.title}
        message={modalData.message}
        type={modalData.type}
        onClose={() => {
          if (modalData.onClose) {
            modalData.onClose();
          }
          hideModal();
        }}
        onConfirm={() => {
          if (modalData.onConfirm) {
            modalData.onConfirm();
          }
          hideModal();
        }}
        confirmText={modalData.confirmText}
        showCancel={modalData.showCancel}
        cancelText={modalData.cancelText}
      />
    </SafeAreaView>
  );
};

export default GameScreen;
