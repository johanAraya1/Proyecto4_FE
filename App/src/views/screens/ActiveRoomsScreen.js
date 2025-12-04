import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useAuth } from '../../controllers/AuthContext';
import { useRoom } from '../../hooks/useRoom';
import { Room } from '../../models/Room';
import { CustomModal, BackButton } from '../../components/common';
import { useCustomModal } from '../../hooks/useCustomModal';
import { copyToClipboard } from '../../utils/clipboard';
import { roomService } from '../../services/roomService';
import roomInvitationService from '../../services/roomInvitationService';
import useDebounce from '../../hooks/useDebounce';
import styles from '../../styles/ActiveRoomsScreen.styles';
// Platform is already imported from 'react-native' above

/**
 * RoomCard: componente memoizado para tarjetas de sala.
 * Usamos React.memo con una comparación personalizada para evitar re-render
 * cuando las propiedades principales no cambian.
 */
const RoomCard = memo(({ room, onPlay, onCopy, loadingRoom, currentUserId }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting':
        return '#FFD166';
      case 'playing':
        return '#28A745';
      case 'finished':
        return '#6C757D';
      default:
        return '#6C757D';
    }
  };

  return (
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
            {room.isCreator(currentUserId) ? 'Creador' : 'Participante'}
          </Text>
        </View>
      </View>

      <View style={styles.roomActions}>
        {room.isPlaying() ? (
          <TouchableOpacity
            style={[styles.playButton, loadingRoom && styles.disabledButton]}
            onPress={() => onPlay(room)}
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
            onPress={() => onCopy(room.code)}
          >
            <Text style={styles.copyButtonText}>📋 Copiar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}, (prev, next) => {
  // Comparación ligera: re-render solo si cambian campos relevantes
  return (
    prev.room.id === next.room.id &&
    prev.room.code === next.room.code &&
    prev.room.status === next.room.status &&
    prev.room.getPlayerCount() === next.room.getPlayerCount() &&
    prev.loadingRoom === next.loadingRoom
  );
});
RoomCard.displayName = 'RoomCard';

/**
 * InvitationCard: componente para mostrar tarjetas de invitaciones con botones de aceptar/rechazar
 */
const InvitationCard = memo(({ room, onAccept, onReject, processingInvitationId }) => {
  const isProcessing = processingInvitationId === room.invitationId;
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting':
        return '#FFD166';
      case 'playing':
        return '#28A745';
      case 'finished':
        return '#6C757D';
      default:
        return '#6C757D';
    }
  };

  return (
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
          <Text style={styles.infoLabel}>Creador:</Text>
          <Text style={styles.infoValue}>{room.getCreatorName()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Jugadores:</Text>
          <Text style={styles.infoValue}>{room.getPlayerCount()}/2</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Creada:</Text>
          <Text style={styles.infoValue}>{room.getFormattedCreatedAt()}</Text>
        </View>
      </View>

      <View style={styles.invitationActions}>
        <TouchableOpacity
          style={[styles.acceptButton, isProcessing && styles.disabledButton]}
          onPress={() => onAccept(room)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.acceptButtonText}>✓ Aceptar</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rejectButton, isProcessing && styles.disabledButton]}
          onPress={() => onReject(room)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.rejectButtonText}>✕ Rechazar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}, (prev, next) => {
  return (
    prev.room.id === next.room.id &&
    prev.room.code === next.room.code &&
    prev.room.status === next.room.status &&
    prev.processingInvitationId === next.processingInvitationId
  );
});
InvitationCard.displayName = 'InvitationCard';

const ActiveRoomsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { getUserRooms, loading, error, userRooms } = useRoom();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState('Todas');
  const [filteredRooms, setFilteredRooms] = useState(userRooms);
  const [invitedRooms, setInvitedRooms] = useState([]);
  const [processingInvitationId, setProcessingInvitationId] = useState(null);
  const debouncedSearch = useDebounce(searchText, 400);

  // Hook para modales personalizados
  const {
    modalVisible,
    modalData,
    showSuccessModal,
    showErrorModal,
    hideModal,
  } = useCustomModal();

  /**
   * Carga las salas del usuario y las invitaciones al montar el componente
   */
  useEffect(() => {
    loadUserRooms();
    loadInvitedRooms();
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
   * Carga las salas a las que el usuario fue invitado
   */
  const loadInvitedRooms = async () => {
    if (user?.id) {
      try {
        const rooms = await roomInvitationService.getInvitedRooms(user.id);
        // Convertir los objetos planos a instancias de Room y agregar invitationId
        const roomInstances = rooms.map(room => {
          const roomInstance = new Room(
            room.id,
            room.code,
            room.creator_id,
            user.id, // El usuario invitado es el oponente
            room.status,
            room.created_at,
            null,
            null,
            room.creator_name,
            null
          );
          // Agregar el invitationId como propiedad adicional
          roomInstance.invitationId = room.invitationId;
          return roomInstance;
        });
        setInvitedRooms(roomInstances);
      } catch (error) {
        // Error silencioso para no interrumpir la carga
      }
    }
  };

  /**
   * Maneja el refresh de la lista
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadUserRooms(), loadInvitedRooms()]);
    setRefreshing(false);
  };

  /**
   * Navega de vuelta al dashboard
   */
  const goBackToDashboard = () => {
    navigation.navigate('Dashboard');
  };

  /**
   * Acepta una invitación a una sala
   */
  const handleAcceptInvitation = useCallback(async (room) => {
    // eslint-disable-next-line no-console
    console.log('🎯 Intentando aceptar invitación:', { room, userId: user?.id, invitationId: room.invitationId });
    
    if (!user?.id) {
      showErrorModal('No se pudo obtener la información del usuario');
      return;
    }
    
    if (!room.invitationId) {
      showErrorModal('No se encontró el ID de la invitación');
      return;
    }

    try {
      setProcessingInvitationId(room.invitationId);
      await roomInvitationService.acceptInvitation(room.invitationId, user.id);
      setProcessingInvitationId(null);

      // Recargar invitaciones primero
      await loadInvitedRooms();
      
      // Navegar directamente a JoinRoom con el código prefijado
      // eslint-disable-next-line no-console
      console.log('✅ Navegando a JoinRoom con código:', room.code);
      navigation.navigate('JoinRoom', {
        prefilledCode: room.code
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Error al aceptar invitación:', error);
      showErrorModal(error.message || 'No se pudo aceptar la invitación');
      setProcessingInvitationId(null);
    }
  }, [user, navigation, loadInvitedRooms, showErrorModal]);

  /**
   * Rechaza una invitación a una sala
   */
  const handleRejectInvitation = useCallback(async (room) => {
    // eslint-disable-next-line no-console
    console.log('🚫 Intentando rechazar invitación:', { room, userId: user?.id, invitationId: room.invitationId });
    
    if (!user?.id) {
      showErrorModal('No se pudo obtener la información del usuario');
      return;
    }
    
    if (!room.invitationId) {
      showErrorModal('No se encontró el ID de la invitación');
      return;
    }

    try {
      setProcessingInvitationId(room.invitationId);
      // eslint-disable-next-line no-console
      console.log('🗑️ Rechazando invitación:', room.invitationId);
      await roomInvitationService.rejectInvitation(room.invitationId, user.id);
      
      showSuccessModal('Has rechazado la invitación exitosamente');
      
      // Recargar la lista de invitaciones
      await loadInvitedRooms();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('❌ Error al rechazar invitación:', error);
      showErrorModal(error.message || 'No se pudo rechazar la invitación');
    } finally {
      setProcessingInvitationId(null);
    }
  }, [user, loadInvitedRooms, showErrorModal, showSuccessModal]);



  // Memoized callbacks to avoid re-creating functions on each render
  const copyRoomCodeToClipboardCb = useCallback(async (code) => {
    const result = await copyToClipboard(code);
    if (result.success) {
      showSuccessModal('¡Copiado!', 'El código de la sala ha sido copiado');
    } else {
      showErrorModal('Error', result.error || 'No se pudo copiar el código');
    }
  }, [showSuccessModal, showErrorModal]);

  const playInRoomCb = useCallback(async (room) => {
    try {
      setLoadingRoom(true);
      const roomDetails = await roomService.getRoomByCode(room.code, user.id);
      if (!roomDetails.success) {
        throw new Error('No se pudo obtener los detalles de la sala');
      }
      const fullRoom = roomDetails.room;
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
      showErrorModal('Error', 'No se pudo cargar la sala: ' + error.message);
    } finally {
      setLoadingRoom(false);
    }
  }, [navigation, user?.id, showErrorModal]);

  /**
   * Renderiza cada sala en la lista utilizando el componente memoizado RoomCard o InvitationCard
   */
  const renderRoomItem = useCallback(({ item: room }) => {
    // Si estamos en la pestaña de Invitaciones, usar InvitationCard
    if (selectedTab === 'Invitaciones') {
      return (
        <InvitationCard
          room={room}
          onAccept={handleAcceptInvitation}
          onReject={handleRejectInvitation}
          processingInvitationId={processingInvitationId}
        />
      );
    }
    
    // Para las demás pestañas, usar RoomCard
    return (
      <RoomCard
        room={room}
        onPlay={playInRoomCb}
        onCopy={copyRoomCodeToClipboardCb}
        loadingRoom={loadingRoom}
        currentUserId={user?.id}
      />
    );
  }, [selectedTab, playInRoomCb, copyRoomCodeToClipboardCb, loadingRoom, processingInvitationId, user?.id, handleAcceptInvitation, handleRejectInvitation]);

  

  

  /**
   * Renderiza el estado vacío
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎮</Text>
      <Text style={styles.emptyTitle}>
        {selectedTab === 'Invitaciones' 
          ? 'No tienes invitaciones pendientes' 
          : selectedTab === 'Todas'
          ? 'No tienes salas activas'
          : `No tienes salas ${selectedTab.toLowerCase()}`}
      </Text>
      <Text style={styles.emptyMessage}>
        {selectedTab === 'Invitaciones'
          ? 'Cuando alguien te invite a una sala, aparecerá aquí'
          : 'Crea una nueva sala desde el dashboard o únete con un código'}
      </Text>
      <View style={styles.emptyButtonsContainer}>
        <TouchableOpacity
          style={styles.createRoomButton}
          onPress={goBackToDashboard}
        >
          <Text style={styles.createRoomButtonText}>🏠 Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.createRoomButton, { backgroundColor: '#FFD166', marginLeft: 12 }]}
          onPress={() => navigation.navigate('JoinRoom')}
        >
          <Text style={[styles.createRoomButtonText, { color: '#6F4E37' }]}>🔍 Buscar Sala</Text>
        </TouchableOpacity>
      </View>
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

  /**
   * Función para filtrar las salas
   */
  const filterRooms = useCallback((tab) => {
    switch (tab) {
      case 'Finalizadas':
        setFilteredRooms(userRooms.filter(room => room.status === 'finished'));
        break;
      case 'Jugando':
        setFilteredRooms(userRooms.filter(room => room.status === 'playing'));
        break;
      case 'En espera':
        setFilteredRooms(userRooms.filter(room => room.status === 'waiting'));
        break;
      case 'Invitaciones':
        setFilteredRooms(invitedRooms);
        break;
      default:
        setFilteredRooms(userRooms);
    }
  }, [userRooms, invitedRooms]);

  // Aplicar filtros automáticamente cuando cambien las salas o la pestaña seleccionada
  useEffect(() => {
    filterRooms(selectedTab);
  }, [userRooms, invitedRooms, selectedTab, filterRooms]);

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
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{invitedRooms.length}</Text>
            <Text style={styles.statLabel}>Invitaciones</Text>
          </View>
        </View>
      </View>

      {/* Tabs funcionales para filtrar */}
      <View style={[
        styles.tabsContainerImproved,
        Platform.OS === 'web' && styles.tabsContainerWeb,
      ]}>
        {['Todas', 'Finalizadas', 'Jugando', 'En espera', 'Invitaciones'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButtonImproved,
              selectedTab === tab && styles.activeTabButtonImproved,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabTextImproved,
                Platform.OS === 'web' && styles.tabTextWeb,
                selectedTab === tab && styles.activeTabTextImproved,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Botón de refrescar salas */}
      <View style={styles.refreshButtonContainer}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Text style={styles.refreshButtonText}>
            {refreshing ? '⏳ Actualizando...' : '🔄 Refrescar Salas'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Campo de búsqueda mejorado */}
      <View style={styles.searchContainerImproved}>
        <TextInput
          style={[
            styles.searchInputImproved,
            Platform.OS === 'web' && styles.searchInputWeb,
          ]}
          placeholder={Platform.OS === 'web' ? 'Buscar salas por código' : '🔍 Buscar salas por código'}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={useMemo(() => filteredRooms.filter(room => {
            if (!debouncedSearch) return true;
            const search = debouncedSearch.toLowerCase();
            return (
              room.code?.toLowerCase().includes(search) ||
              room.creatorName?.toLowerCase().includes(search) ||
              room.opponentName?.toLowerCase().includes(search) ||
              room.status?.toLowerCase().includes(search)
            );
          }), [filteredRooms, debouncedSearch])}
          renderItem={renderRoomItem}
          keyExtractor={useCallback((item) => item.id, [])}
          initialNumToRender={8}
          windowSize={10}
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
      {/* Onboarding moved to GameScreen: not shown here anymore */}
    </SafeAreaView>
  );
};

export default ActiveRoomsScreen;
