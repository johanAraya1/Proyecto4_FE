import React, { useMemo, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';

import PlayerCard from '../../components/common/PlayerCard';
import GameGrid from '../../components/common/GameGrid';
import CustomModal from '../../components/common/CustomModal';
import OnboardingModal from '../../components/common/OnboardingModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGameLogic } from '../../hooks/useGameLogic';
import { useAuth } from '../../controllers/AuthContext';
import GameScreenStyles from '../../styles/GameScreenStyles';
import { gameWebSocketService } from '../../services/gameWebSocketService';

const MemoizedPlayerCard = React.memo(PlayerCard);
const MemoizedGameGrid = React.memo(GameGrid);

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
    selectedOrderCards,
    pickupEffect,
    modalVisible,
    modalData,
    hideModal,
  } = useGameLogic(roomCode, user?.id, roomData, navigation);

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
  
  // ✅ Determinar si es mi turno
  const isPlayer1 = user?.id === roomData?.creatorId;
  const isPlayer2 = user?.id === roomData?.opponentId;
  const myTurn = isPlayer1 ? 1 : isPlayer2 ? 2 : null;
  const isMyTurn = gameState.currentTurn === myTurn;

  // Estado para el modal de confirmación de salida
  const [showExitModal, setShowExitModal] = useState(false);

  // Maneja la salida del juego

  /**
   * Muestra el modal de confirmación antes de salir del juego.
   * @returns {void}
   */
  const handleExitGame = () => {
    setShowExitModal(true);
  };

  /**
   * Confirma la salida del juego y notifica al backend que el jugador se rindió.
   * @returns {void}
   */
  const confirmExitGame = () => {
    console.log('🚪 Jugador abandonando la partida...');
    console.log('👤 User ID:', user?.id);
    console.log('🔌 WebSocket conectado:', gameWebSocketService.isConnected());
    
    // 1. Desactivar reconexión ANTES de enviar el evento
    gameWebSocketService.shouldReconnect = false;
    
    // 2. Enviar evento de rendición al backend
    if (gameWebSocketService.isConnected() && user?.id) {
      console.log('📤 Enviando evento PLAYER_SURRENDER...');
      gameWebSocketService.sendPlayerSurrender(user.id);
      console.log('✅ Evento PLAYER_SURRENDER enviado');
    } else {
      console.warn('⚠️ No se pudo enviar PLAYER_SURRENDER - WebSocket no conectado o sin user ID');
    }
    
    setShowExitModal(false);
    
    // 3. Esperar un momento para que el servidor procese y cerrar permanentemente
    setTimeout(() => {
      console.log('🔌 Desconectando permanentemente...');
      gameWebSocketService.disconnectPermanently();
      
      console.log('🔄 Navegando al Dashboard...');
      navigation.navigate('Dashboard');
    }, 800);
  };

  /**
   * Cancela la salida del juego.
   * @returns {void}
   */
  const cancelExitGame = () => {
    setShowExitModal(false);
  };

  // Cleanup al desmontar el componente
  useEffect(() => {
    // Ref para rastrear si se usó el botón oficial de salida
    let didUseExitButton = false;
    
    // Cuando se confirma la salida, marcar que se usó el botón oficial
    const originalConfirmExitGame = confirmExitGame;
    
    return () => {
      // Si el componente se desmonta sin usar el botón de salir oficial,
      // enviar el evento de rendición de todos modos
      if (!didUseExitButton && gameWebSocketService.isConnected() && user?.id) {
        console.log('⚠️ Componente desmontado sin usar botón oficial - Enviando PLAYER_SURRENDER');
        gameWebSocketService.sendPlayerSurrender(user.id);
      }
      
      // El WebSocket se desconectará automáticamente en useGameLogic
    };
  }, [user?.id]);

  // Onboarding for the game screen (explain how to play) - show once per device/user
  const [showGameOnboarding, setShowGameOnboarding] = useState(false);
  useEffect(() => {
    const checkGameOnboarding = async () => {
      try {
        const idPart = roomData?.id || roomCode || 'unknownRoom';
        const userPart = user?.id || 'anonymous';
        const storageKey = `onboarding_seen_game_${idPart}_${userPart}`;
        let seen = null;
        if (typeof window !== 'undefined' && window.localStorage) {
          seen = window.localStorage.getItem(storageKey);
        } else {
          seen = await AsyncStorage.getItem(storageKey);
        }
        if (!seen) setShowGameOnboarding(true);
      } catch (e) {
        setShowGameOnboarding(true);
      }
    };

    // Only show onboarding when the grid is ready AND it's the logged-in player's turn
    if (ingredientGrid && isMyTurn) {
      checkGameOnboarding();
    }
  }, [ingredientGrid, isMyTurn]);

  const handleGameOnboardingClose = async () => {
    // Mark onboarding as seen for this specific room and user so it never shows again in this room
    setShowGameOnboarding(false);
    const idPart = roomData?.id || roomCode || 'unknownRoom';
    const userPart = user?.id || 'anonymous';
    const storageKey = `onboarding_seen_game_${idPart}_${userPart}`;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(storageKey, '1');
      } else {
        await AsyncStorage.setItem(storageKey, '1');
      }
    } catch (e) {
      // ignore storage errors
    }
  };

  // Steps specific to the gameplay onboarding
  const gameOnboardingSteps = [
    {
      title: 'Objetivo del juego',
      text: 'Reúne ingredientes y completa órdenes para ganar. Cada orden entregada suma puntos.',
    },
    {
      title: 'Moverse en la cuadrícula',
      text: 'Selecciona una pieza y toca una casilla válida para moverte. Tienes 3 movimientos por turno.',
    },
    {
      title: 'Órdenes e inventario',
      text: 'Las cartas de orden aparecen en tu panel. Recoge ingredientes en la cuadrícula para completar órdenes.',
    },
    {
      title: 'Finalizar turno',
      text: 'Cuando completes tus acciones pulsa "Finalizar turno". No puedes finalizar si estás en la misma casilla que el oponente.',
    },
    {
      title: 'Consejos rápidos',
      text: 'Usa canjes cuando sea necesario y prioriza órdenes con más puntos. ¡Buena suerte!',
    },
  ];

  // Animaciones de transición al cambiar el turno
  const turnAnim = useRef(new Animated.Value(1)).current; // escala
  const accentAnim = useRef(new Animated.Value(0)).current; // overlay opacity
  const waitAnim = useRef(new Animated.Value(0)).current; // for waiting overlay pulse

  useEffect(() => {
    // Ejecutar animación cada vez que cambie el turno
    if (gameState && typeof gameState.currentTurn !== 'undefined') {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(turnAnim, {
            toValue: 1.08,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(turnAnim, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(accentAnim, {
            toValue: 0.6,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(accentAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [gameState?.currentTurn, turnAnim, accentAnim]);

  // Pulse animation for waiting overlay when it's opponent's turn
  useEffect(() => {
    let loop;
    const shouldShowWaiting = !isMyTurn && !loading && !error && ingredientGrid && (myTurn !== null);
    if (shouldShowWaiting) {
      waitAnim.setValue(0);
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(waitAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(waitAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
        ])
      );
      loop.start();
    } else {
      waitAnim.stopAnimation();
      waitAnim.setValue(0);
    }
    return () => {
      if (loop) loop.stop();
    };
  }, [isMyTurn, loading, error, ingredientGrid, myTurn, waitAnim]);

  // Memoizar props de jugadores para móvil
  const playerPropsArr = useMemo(() => [
    {
      player: gameState.player1,
      playerNumber: 1,
      disabled: gameState.currentTurn !== 1,
      orders: gameState.player1.orders,
      inventory: gameState.player1.inventory,
      isOrderCardTouchable: isExchangeMode && gameState.currentTurn === 1,
      selectedOrderIds: selectedOrderCards,
      onOrderCardPress: handleOrderCardPress,
      isMobile: isMobile, // Agregar prop isMobile
    },
    {
      player: gameState.player2,
      playerNumber: 2,
      disabled: gameState.currentTurn !== 2,
      orders: gameState.player2.orders,
      inventory: gameState.player2.inventory,
      isOrderCardTouchable: isExchangeMode && gameState.currentTurn === 2,
      selectedOrderIds: selectedOrderCards,
      onOrderCardPress: handleOrderCardPress,
      isMobile: isMobile, // Agregar prop isMobile
    },
  ], [gameState, isExchangeMode, selectedOrderCards, handleOrderCardPress, isMobile]);





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
                  pickupEffect={pickupEffect}
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
                  orders={gameState.player1.orders}
                  inventory={gameState.player1.inventory}
                  isOrderCardTouchable={isExchangeMode && gameState.currentTurn === 1}
                  selectedOrderIds={selectedOrderCards}
                  onOrderCardPress={handleOrderCardPress}
                  isMobile={false}
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
                  pickupEffect={pickupEffect}
                  styles={GameScreenStyles}
                />
              </View>
              {/* Columna 3: Jugador 2 */}
              <View style={GameScreenStyles.rightPlayerContainer}>
                <MemoizedPlayerCard
                  player={gameState.player2}
                  playerNumber={2}
                  disabled={gameState.currentTurn !== 2}
                  orders={gameState.player2.orders}
                  inventory={gameState.player2.inventory}
                  isOrderCardTouchable={isExchangeMode && gameState.currentTurn === 2}
                  selectedOrderIds={selectedOrderCards}
                  onOrderCardPress={handleOrderCardPress}
                  isMobile={false}
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
          <Animated.View
            style={[
              GameScreenStyles.turnIndicator,
              { transform: [{ scale: turnAnim }] },
            ]}
          >
            {/* overlay para efecto de acento al cambiar turno */}
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                backgroundColor: '#FFD166',
                opacity: accentAnim,
                borderRadius: 0,
              }}
            />
            <Text style={GameScreenStyles.turnText}>
              Turno de{' '}
              {gameState.currentTurn === 1
                ? getPlayerDisplayName(gameState.player1, 1)
                : getPlayerDisplayName(gameState.player2, 2)}
            </Text>
          </Animated.View>
          <View style={{ alignItems: 'center', marginVertical: 10 }}>
            <Text style={{ marginBottom: 8, fontWeight: 'bold', color: '#6F4E37' }}>
              Movimientos: {movementCount}/3
            </Text>
            {isMyTurn ? (
              <>
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
              </>
            ) : (
              <Text style={{ marginTop: 8, color: '#888', fontSize: 14, textAlign: 'center', fontStyle: 'italic' }}>
                Turno del oponente
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

      {/* Modal de confirmación de salida */}
      <CustomModal
        visible={showExitModal}
        title="⚠️ ¿Abandonar partida?"
        message="Si sales ahora, se dará por terminada la partida y perderás automáticamente. ¿Estás seguro de que quieres abandonar?"
        type="warning"
        onClose={cancelExitGame}
        onConfirm={confirmExitGame}
        confirmText="Sí, abandonar"
        cancelText="No, continuar jugando"
        showCancel={true}
      />
      {/* Indicador de espera cuando no es tu turno */}
      {(!isMyTurn && !loading && !error && ingredientGrid && (myTurn !== null)) && (
        <Animated.View style={[GameScreenStyles.waitingOverlay, { opacity: waitAnim.interpolate({ inputRange: [0,1], outputRange: [0.9,1] }) }]} pointerEvents="none">
          <Animated.View style={[GameScreenStyles.waitingBox, { transform: [{ scale: waitAnim.interpolate({ inputRange: [0,1], outputRange: [0.98,1.02] }) }] }] }>
            <ActivityIndicator size="small" color="#6F4E37" style={{ marginRight: 8 }} />
            <Text style={GameScreenStyles.waitingText}>Esperando al oponente...</Text>
          </Animated.View>
        </Animated.View>
      )}
      {/* Onboarding específico de la sala de juego */}
      <OnboardingModal
        visible={showGameOnboarding}
        onClose={handleGameOnboardingClose}
        steps={gameOnboardingSteps}
      />
    </SafeAreaView>
  );
};

export default GameScreen;
