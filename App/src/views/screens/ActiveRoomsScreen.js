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
import { CustomModal, BackButton } from '../../components/common';
import { useCustomModal } from '../../hooks/useCustomModal';
import { copyToClipboard } from '../../utils/clipboard';
import { roomService } from '../../services/roomService';
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
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { useAuth } from '../../controllers/AuthContext';
import { useRoom } from '../../hooks/useRoom';
import roomInvitationService from '../../services/roomInvitationService';
import { Room } from '../../models/Room';

const ActiveRoomsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { getUserRooms, loading, error, userRooms } = useRoom();
  const [refreshing, setRefreshing] = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState('Todas');
  const [filteredRooms, setFilteredRooms] = useState(userRooms);
  const debouncedSearch = useDebounce(searchText, 400);

  // Hook para modales personalizados
  const {
    modalVisible,
    modalData,
    showSuccessModal,
    showErrorModal,
    hideModal,
  } = useCustomModal();
  const [activeTab, setActiveTab] = useState('all'); // 'all' o 'invited'
  const [invitedRooms, setInvitedRooms] = useState([]);
  const [processingInvitationId, setProcessingInvitationId] = useState(null);

  // Estados para el modal de alerta personalizado
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertModalData, setAlertModalData] = useState({
    title: '',
    message: '',
    icon: '',
    type: 'success',
    onConfirm: null,
    bgColor: '#D4F6D4',
    buttonColor: '#28A745'
  });

  /**
   * Carga las salas del usuario al montar el componente
   */
  useEffect(() => {
    loadUserRooms();
    loadInvitedRooms();
  }, []);


  /**
   * Función para mostrar modal personalizado
   */
  const showCustomAlert = (title, message, type = 'success', onConfirm = null) => {
    const iconMap = {
      success: '🎉',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const colorMap = {
      success: '#D4F6D4',
      error: '#FFE6E6', 
      warning: '#FFF3CD',
      info: '#D1ECF1'
    };

    const buttonColorMap = {
      success: '#28A745',
      error: '#DC3545',
      warning: '#FFC107',
      info: '#17A2B8'
    };

    setAlertModalData({
      title,
      message,
      icon: iconMap[type] || '🎉',
      type,
      onConfirm,
      bgColor: colorMap[type] || '#D4F6D4',
      buttonColor: buttonColorMap[type] || '#28A745'
    });
    setAlertModalVisible(true);
  };

  /**
   * Maneja el cierre del modal de alerta
   */
  const handleAlertModalClose = () => {
    setAlertModalVisible(false);
    
    // Ejecutar callback si existe
    if (alertModalData.onConfirm) {
      setTimeout(() => {
        alertModalData.onConfirm();
      }, 300);
    }
    
    // Limpiar datos del modal
    setTimeout(() => {
      setAlertModalData({
        title: '',
        message: '',
        icon: '',
        type: 'success',
        onConfirm: null,
        bgColor: '#D4F6D4',
        buttonColor: '#28A745'
      });
    }, 300);
  };

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
        const invitations = await roomInvitationService.getReceivedInvitations(user.id);
        // Filtrar solo las invitaciones pendientes y convertir a formato de sala
        const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
        setInvitedRooms(pendingInvitations);
      } catch (err) {
        console.error('Error al cargar salas invitadas:', err);
      }
    }
  };

  /**
   * Maneja el refresh de la lista
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserRooms();
    await loadInvitedRooms();
    setRefreshing(false);
  };

  /**
   * Acepta una invitación a sala
   */
  const handleAcceptInvitation = async (invitation) => {
    console.log('🎯 handleAcceptInvitation llamada con:', invitation);
    console.log('📊 Datos:', { userId: user?.id, invitationId: invitation.id, roomCode: invitation.room.code });
    
    if (!user?.id) {
      console.error('❌ Error: usuario no encontrado');
      return;
    }

    try {
      console.log('⏳ Procesando aceptación...');
      setProcessingInvitationId(invitation.id);
      const result = await roomInvitationService.acceptInvitation(invitation.id, user.id);
      console.log('✅ Invitación aceptada exitosamente:', result);
      
      // Mostrar alerta de éxito y redirigir automáticamente
      console.log('🔔 Mostrando alerta de éxito...');
      
      showCustomAlert(
        'Invitación Aceptada',
        `Has aceptado la invitación a la sala ${invitation.room.code}`,
        'success',
        () => {
          console.log('🚀 Navegando a JoinRoom con código:', invitation.room.code);
          navigation.navigate('JoinRoom', {
            prefilledCode: invitation.room.code
          });
          console.log('✅ Navegación ejecutada');
        }
      );
      console.error('Error al aceptar invitación:', err);
      Alert.alert('❌ Error', err.message || 'No se pudo aceptar la invitación');
    } finally {
      setProcessingInvitationId(null);
    }
  };

  /**
   * Rechaza una invitación a sala
   */
  const handleRejectInvitation = async (invitation) => {
    if (!user?.id) return;

    // Mostrar confirmación primero
    showCustomAlert(
      'Rechazar Invitación',
      `¿Estás seguro de rechazar la invitación a la sala ${invitation.room.code}?`,
      'warning',
      async () => {
        try {
          setProcessingInvitationId(invitation.id);
          await roomInvitationService.rejectInvitation(invitation.id, user.id);
          
          // Mostrar alerta de confirmación
          showCustomAlert(
            'Invitación Rechazada',
            'Has rechazado la invitación correctamente',
            'success'
          );
          
          // Recargar las invitaciones
          loadInvitedRooms();
        } catch (err) {
          console.error('Error al rechazar invitación:', err);
          showCustomAlert('Error', err.message || 'No se pudo rechazar la invitación', 'error');
        } finally {
          setProcessingInvitationId(null);
        }
      }
    );
  };

  /**
   * Navega de vuelta al dashboard
   */
  const goBackToDashboard = () => {
    navigation.navigate('Dashboard');
  };



  // Memoized callbacks to avoid re-creating functions on each render
  const copyRoomCodeToClipboardCb = useCallback(async (code) => {
    const result = await copyToClipboard(code);
    if (result.success) {
      showSuccessModal('¡Copiado!', 'El código de la sala ha sido copiado');
    } else {
      showErrorModal('Error', result.error || 'No se pudo copiar el código');
  /**
   * Copia el código de la sala al portapapeles
   */
  const copyRoomCode = (code) => {
    // En React Native Web no tenemos Clipboard, usamos navigator.clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      showCustomAlert('¡Copiado!', 'El código de la sala ha sido copiado', 'success');
    } else {
      showCustomAlert('Código de Sala', code, 'info');
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
  /**
   * Inicia el juego en una sala
   */
  const playInRoom = (room) => {
    showCustomAlert(
      'Entrar al Juego',
      `¿Deseas entrar a la sala ${room.code}?`,
      'info',
      () => {
        // TODO: Implementar navegación al juego
        showCustomAlert('¡A Jugar!', `Entrando a la sala ${room.code}...`, 'success');
      }
    );
  };

  /**
   * Renderiza cada sala en la lista
   */
  const renderRoomItem = ({ item }) => {
    const isInvitedTab = activeTab === 'invited';
    const isProcessing = processingInvitationId === item.id;
    
    // Si es la pestaña de invitados, item es una invitación
    if (isInvitedTab) {
      const invitation = item;
      return (
        <View style={styles.roomCard}>
          <View style={styles.roomHeader}>
            <View style={styles.roomCodeContainer}>
              <Text style={styles.roomCodeLabel}>Código:</Text>
              <Text style={styles.roomCode}>{invitation.room.code}</Text>
            </View>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: '#FFD166' }]} />
              <Text style={styles.statusText}>Invitación Pendiente</Text>
            </View>
          </View>

          <View style={styles.roomInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Invitado por:</Text>
              <Text style={styles.infoValue}>{invitation.fromUser.name}</Text>
            </View>
            {invitation.room.creatorName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Creador:</Text>
                <Text style={styles.infoValue}>{invitation.room.creatorName}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estado sala:</Text>
              <Text style={styles.infoValue}>
                {invitation.room.status === 'waiting' ? 'Esperando' : 
                 invitation.room.status === 'playing' ? 'Jugando' : 
                 'Finalizada'}
              </Text>
            </View>
          </View>

          <View style={styles.roomActions}>
            <TouchableOpacity 
              style={[styles.rejectButton, isProcessing && styles.disabledButton]} 
              onPress={() => handleRejectInvitation(invitation)}
              disabled={isProcessing}
            >
              <Text style={styles.rejectButtonText}>
                {isProcessing ? '...' : '❌ Rechazar'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.acceptButton, isProcessing && styles.disabledButton]} 
              onPress={() => handleAcceptInvitation(invitation)}
              disabled={isProcessing}
            >
              <Text style={styles.acceptButtonText}>
                {isProcessing ? '...' : '✅ Aceptar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    // Pestaña "Todas" - mostrar salas normales
    const room = item;
    return (
      <View style={styles.roomCard}>
        <View style={styles.roomHeader}>
          <View style={styles.roomCodeContainer}>
            <Text style={styles.roomCodeLabel}>Código:</Text>
            <Text style={styles.roomCode}>{room.code}</Text>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(room.status) }]} />
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
              style={styles.playButton} 
              onPress={() => playInRoom(room)}
            >
              <Text style={styles.playButtonText}>🎮 Jugar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.copyButton} 
              onPress={() => copyRoomCode(room.code)}
            >
              <Text style={styles.copyButtonText}>📋 Copiar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  /**
   * Obtiene el color del indicador de estado
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return '#FFD166'; // SECUNDARIO
      case 'playing': return '#28A745'; // Verde
      case 'finished': return '#6C757D'; // Gris
      default: return '#6C757D';
    }
  }, [navigation, user?.id, showErrorModal]);

  /**
   * Renderiza cada sala en la lista utilizando el componente memoizado RoomCard
   */
  const renderRoomItem = useCallback(({ item: room }) => (
    <RoomCard
      room={room}
      onPlay={playInRoomCb}
      onCopy={copyRoomCodeToClipboardCb}
      loadingRoom={loadingRoom}
      currentUserId={user?.id}
    />
  ), [playInRoomCb, copyRoomCodeToClipboardCb, loadingRoom, user?.id]);

  

  

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
  const renderEmptyState = () => {
    const isInvitedTab = activeTab === 'invited';
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎮</Text>
        <Text style={styles.emptyTitle}>
          {isInvitedTab ? 'No tienes invitaciones' : 'No tienes salas activas'}
        </Text>
        <Text style={styles.emptyMessage}>
          {isInvitedTab 
            ? 'Cuando un amigo te invite a una sala, aparecerá aquí'
            : 'Crea una nueva sala desde el dashboard para comenzar a jugar'
          }
        </Text>
        {!isInvitedTab && (
          <TouchableOpacity style={styles.createRoomButton} onPress={goBackToDashboard}>
            <Text style={styles.createRoomButtonText}>🏠 Ir al Dashboard</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  /**
   * Renderiza el estado de error
   */
  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>⚠️</Text>
      <Text style={styles.emptyTitle}>Error al cargar las salas</Text>
      <Text style={styles.emptyMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => {
        loadUserRooms();
        loadInvitedRooms();
      }}>
        <Text style={styles.retryButtonText}>🔄 Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Función para filtrar las salas
   */
  const filterRooms = (tab) => {
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
      default:
        setFilteredRooms(userRooms);
    }
  };

  // Aplicar filtros automáticamente cuando cambien las salas o la pestaña seleccionada
  useEffect(() => {
    filterRooms(selectedTab);
  }, [userRooms, selectedTab]);

   * Obtiene las salas a mostrar según la pestaña activa
   */
  const getRoomsToDisplay = () => {
    if (activeTab === 'invited') {
      return invitedRooms;
    }
    return userRooms;
  };

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
        <Text style={styles.subtitle}>
          {userRooms.length} {userRooms.length === 1 ? 'sala' : 'salas'}
        </Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.smallButton} onPress={() => navigation.navigate('Friends')}>
            <Text style={styles.smallButtonText}>👥 Amigos</Text>
        
        {/* Pestañas de filtrado */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              Todas ({userRooms.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'invited' && styles.activeTab]}
            onPress={() => setActiveTab('invited')}
          >
            <Text style={[styles.tabText, activeTab === 'invited' && styles.activeTabText]}>
              Invitado ({invitedRooms.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs funcionales para filtrar */}
      <View style={[
        styles.tabsContainerImproved,
        Platform.OS === 'web' && styles.tabsContainerWeb,
      ]}>
        {['Todas', 'Finalizadas', 'Jugando', 'En espera'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButtonImproved,
              selectedTab === tab && styles.activeTabButtonImproved,
            ]}
            onPress={() => {
              setSelectedTab(tab);
              filterRooms(tab);
            }}
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
          data={getRoomsToDisplay()}
          renderItem={renderRoomItem}
          keyExtractor={useCallback((item) => item.id, [])}
          initialNumToRender={8}
          windowSize={10}
          contentContainerStyle={[
            styles.listContainer,
            userRooms.length === 0 && styles.emptyListContainer,
            getRoomsToDisplay().length === 0 && styles.emptyListContainer
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
      {/* Modal de alerta personalizado */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={alertModalVisible}
        onRequestClose={handleAlertModalClose}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Icono */}
              <View style={[
                styles.modalIconContainer,
                { backgroundColor: alertModalData.bgColor || '#D4F6D4' }
              ]}>
                <Text style={styles.modalIcon}>{alertModalData.icon}</Text>
              </View>

              {/* Título */}
              <Text style={styles.modalTitle}>{alertModalData.title}</Text>

              {/* Mensaje */}
              <Text style={styles.modalMessage}>{alertModalData.message}</Text>

              {/* Botón OK */}
              <TouchableOpacity 
                style={[
                  styles.modalButton,
                  { backgroundColor: alertModalData.buttonColor || '#28A745' }
                ]}
                onPress={handleAlertModalClose}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ActiveRoomsScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // NEUTRO
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#6F4E37', // PRINCIPAL
    fontSize: 16,
    fontWeight: '600',
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerSpacer: {
    width: 44, // Mismo ancho que el botón de refrescar para mantener centrado el logo
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  refreshButtonText: {
    fontSize: 20,
  },
  titleContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6F4E37', // PRINCIPAL
    marginBottom: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#6F4E37',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  actionsRow: {
    marginTop: 10,
    flexDirection: 'row',
  },
  smallButton: {
    backgroundColor: '#6F4E37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  ghostButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#6F4E37',
  },
  smallButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  ghostButtonText: {
    color: '#6F4E37',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
  },
  roomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomCodeLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  roomCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6F4E37', // PRINCIPAL
    backgroundColor: '#FFD166', // SECUNDARIO
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  roomInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  roomActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  copyButton: {
    backgroundColor: '#FFD166', // SECUNDARIO
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#6F4E37', // PRINCIPAL
    fontSize: 12,
    fontWeight: '600',
  },
  playButton: {
    backgroundColor: '#28A745', // Verde para jugar
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#DC3545',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#28A745',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6F4E37', // PRINCIPAL
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createRoomButton: {
    backgroundColor: '#6F4E37', // PRINCIPAL
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createRoomButtonText: {
    color: '#F5F5F5',
    fontSize: 14,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#FFD166', // SECUNDARIO
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#6F4E37', // PRINCIPAL
    fontSize: 14,
    fontWeight: '600',
  },

  // Estilos del Modal de alerta personalizado
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 0,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContent: {
    padding: 24,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIcon: {
    fontSize: 40,
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ActiveRoomsScreen;
