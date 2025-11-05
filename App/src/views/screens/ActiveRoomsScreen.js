import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../controllers/AuthContext';
import { useRoom } from '../../hooks/useRoom';
import { CustomModal, BackButton } from '../../components/common';
import { useCustomModal } from '../../hooks/useCustomModal';
import { copyToClipboard } from '../../utils/clipboard';
import { roomService } from '../../services/roomService';
import styles from '../../styles/ActiveRoomsScreen.styles';

const ActiveRoomsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { getUserRooms, loading, error, userRooms } = useRoom();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(false);

  // Hook para modales personalizados
  const {
    modalVisible,
    modalData,
    showSuccessModal,
    showErrorModal,
    hideModal,
  } = useCustomModal();

  /**
   * Carga las salas del usuario al montar el componente
   */
  useEffect(() => {
    loadUserRooms();
  }, []);

  /**
   * Carga las salas del usuario
   */
  const loadUserRooms = async () => {
    if (user?.id) {
      await getUserRooms(user.id);
    }
  };

  /**
   * Maneja el refresh de la lista
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserRooms();
    setRefreshing(false);
  };

  /**
   * Navega de vuelta al dashboard
   */
  const goBackToDashboard = () => {
    navigation.navigate('Dashboard');
  };

  /**
   * Copia el código de la sala al portapapeles
   */
  const copyRoomCodeToClipboard = async (code) => {
    const result = await copyToClipboard(code);
    if (result.success) {
      showSuccessModal('¡Copiado!', 'El código de la sala ha sido copiado');
    } else {
      showErrorModal('Error', result.error || 'No se pudo copiar el código');
    }
  };

  /**
   * Inicia el juego en una sala
   */
  const playInRoom = async (room) => {
    try {
      // Mostrar indicador de carga
      setLoadingRoom(true);

      // Obtener los detalles completos de la sala (incluyendo nombres de jugadores)
      const roomDetails = await roomService.getRoomByCode(room.code, user.id);
      
      if (!roomDetails.success) {
        throw new Error('No se pudo obtener los detalles de la sala');
      }

      const fullRoom = roomDetails.room;
      
      // Navegar a la pantalla de juego con la información completa
      navigation.navigate('Game', {
        roomId: fullRoom.id,
        roomCode: fullRoom.code,
        roomData: {
          id: fullRoom.id,
          code: fullRoom.code,
          creatorId: fullRoom.creatorId,
          creatorName: fullRoom.creatorName,
          opponentId: fullRoom.opponentId,
          opponentName: fullRoom.opponentName,
          status: fullRoom.status,
        }
      });
    } catch (error) {
      showErrorModal(
        'Error',
        'No se pudo cargar la sala: ' + error.message
      );
    } finally {
      setLoadingRoom(false);
    }
  };

  /**
   * Renderiza cada sala en la lista
   */
  const renderRoomItem = ({ item: room }) => (
    <View style={styles.roomCard}>
      <View style={styles.roomHeader}>
        <View style={styles.roomCodeContainer}>
          <Text style={styles.roomCodeLabel}>Código:</Text>
          <Text style={styles.roomCode}>{room.code}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(room.status) },
            ]}
          />
          <Text style={styles.statusText}>{room.getStatusInSpanish()}</Text>
        </View>
      </View>

      <View style={styles.roomInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Jugadores:</Text>
          <Text style={styles.infoValue}>{room.getPlayerCount()}/2</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Creada:</Text>
          <Text style={styles.infoValue}>{room.getFormattedCreatedAt()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Rol:</Text>
          <Text style={styles.infoValue}>
            {room.isCreator(user?.id) ? 'Creador' : 'Participante'}
          </Text>
        </View>
      </View>

      <View style={styles.roomActions}>
        {room.isPlaying() ? (
          <TouchableOpacity
            style={[styles.playButton, loadingRoom && styles.disabledButton]}
            onPress={() => playInRoom(room)}
            disabled={loadingRoom}
          >
            {loadingRoom ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.playButtonText}>🎮 Jugar</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyRoomCodeToClipboard(room.code)}
          >
            <Text style={styles.copyButtonText}>📋 Copiar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  /**
   * Obtiene el color del indicador de estado
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting':
        return '#FFD166'; // SECUNDARIO
      case 'playing':
        return '#28A745'; // Verde
      case 'finished':
        return '#6C757D'; // Gris
      default:
        return '#6C757D';
    }
  };

  /**
   * Renderiza el estado vacío
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎮</Text>
      <Text style={styles.emptyTitle}>No tienes salas activas</Text>
      <Text style={styles.emptyMessage}>
        Crea una nueva sala desde el dashboard para comenzar a jugar
      </Text>
      <TouchableOpacity
        style={styles.createRoomButton}
        onPress={goBackToDashboard}
      >
        <Text style={styles.createRoomButtonText}>🏠 Ir al Dashboard</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Renderiza el estado de error
   */
  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>⚠️</Text>
      <Text style={styles.emptyTitle}>Error al cargar las salas</Text>
      <Text style={styles.emptyMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadUserRooms}>
        <Text style={styles.retryButtonText}>🔄 Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton
          onPress={goBackToDashboard}
          text="← Volver"
        />

        <Image
          source={require('../../../assets/images/logoSinFondo.png')}
          style={styles.logo}
          resizeMode='contain'
        />

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Mis Salas Activas</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userRooms.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {userRooms.filter(room => room.isCreator(user?.id)).length}
            </Text>
            <Text style={styles.statLabel}>Creador</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {userRooms.filter(room => !room.isCreator(user?.id)).length}
            </Text>
            <Text style={styles.statLabel}>Oponente</Text>
          </View>
        </View>
      </View>

      {error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={userRooms}
          renderItem={renderRoomItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContainer,
            userRooms.length === 0 && styles.emptyListContainer,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6F4E37']} // PRINCIPAL
              tintColor='#6F4E37' // Para iOS
            />
          }
          ListEmptyComponent={!loading && !error ? renderEmptyState : null}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal personalizado */}
      <CustomModal
        visible={modalVisible}
        title={modalData.title}
        message={modalData.message}
        type={modalData.type}
        onClose={hideModal}
        confirmText={modalData.confirmText}
      />
    </SafeAreaView>
  );
};

export default ActiveRoomsScreen;
