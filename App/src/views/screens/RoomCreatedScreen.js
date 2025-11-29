import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Clipboard,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useAuth } from '../../controllers/AuthContext';
import friendService from '../../services/friendService';
import roomInvitationService from '../../services/roomInvitationService';

const RoomCreatedScreen = ({ navigation, route }) => {
  // Obtener los datos de la sala desde los parámetros de navegación
  const { room } = route.params || {};
  const { user } = useAuth();
  
  // Estados para el modal de selección de amigos
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [sendingInvitation, setSendingInvitation] = useState(false);

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
   * Carga la lista de amigos al abrir el modal
   */
  useEffect(() => {
    if (showFriendsModal) {
      loadFriends();
    }
  }, [showFriendsModal]);

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
   * Carga los amigos del usuario
   */
  const loadFriends = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingFriends(true);
      const friendsList = await friendService.getFriends(user.id);
      setFriends(friendsList);
    } catch (err) {
      console.error('Error al cargar amigos:', err);
      showCustomAlert('Error', 'No se pudieron cargar tus amigos', 'error');
    } finally {
      setLoadingFriends(false);
    }
  };

  /**
   * Abre el modal de selección de amigos
   */
  const openFriendsModal = () => {
    setShowFriendsModal(true);
  };

  /**
   * Cierra el modal de selección de amigos
   */
  const closeFriendsModal = () => {
    setShowFriendsModal(false);
  };

  /**
   * Envía una invitación a un amigo
   */
  const sendInvitationToFriend = async (friend) => {
    console.log('🎯 sendInvitationToFriend llamada con:', friend);
    console.log('📊 Datos:', { userId: user?.id, roomId: room?.id, friendId: friend.id });
    
    if (!user?.id || !room?.id) {
      console.error('❌ Error: faltan datos', { user: user?.id, room: room?.id });
      showCustomAlert('Error', 'No se pudo enviar la invitación', 'error');
      return;
    }

    try {
      console.log('📤 Enviando invitación...');
      setSendingInvitation(true);
      const result = await roomInvitationService.sendRoomInvitation(room.id, user.id, friend.id);
      console.log('✅ Invitación enviada exitosamente:', result);
      
      // Cerrar modal primero
      console.log('🚪 Cerrando modal...');
      closeFriendsModal();
      
      // Mostrar notificación de éxito
      console.log('🔔 Mostrando alerta de éxito...');
      
      // Usar setTimeout para asegurar que el modal se cierre primero
      setTimeout(() => {
        showCustomAlert(
          '¡Invitación Enviada!',
          `Se ha enviado la invitación a ${friend.name} para unirse a tu sala.\n\nTu amigo recibirá la invitación y podrá aceptarla desde la sección "Invitado" en Ver Salas Activas.`,
          'success'
        );
        console.log('✅ Alerta mostrada correctamente');
      }, 300);
    } catch (err) {
      console.error('💥 Error al enviar invitación:', err);
      
      let errorMessage = 'No se pudo enviar la invitación';
      if (err.message.includes('ya invitado') || err.message.includes('already invited')) {
        errorMessage = 'Ya has enviado una invitación a este amigo para esta sala';
      } else if (err.message.includes('sala llena') || err.message.includes('room full')) {
        errorMessage = 'La sala ya está llena. No se pueden enviar más invitaciones';
      } else if (err.message.includes('sala no encontrada')) {
        errorMessage = 'La sala ya no existe';
      }
      
      showCustomAlert('Error', errorMessage, 'error');
    } finally {
      setSendingInvitation(false);
    }
  };

  /**
   * Copia el código de la sala al portapapeles
   */
  const copyRoomCode = () => {
    if (room?.code) {
      Clipboard.setString(room.code);
      showCustomAlert('¡Copiado!', 'El código de la sala ha sido copiado al portapapeles', 'success');
    }
  };

  /**
   * Navega de vuelta al dashboard
   */
  const goBackToDashboard = () => {
    navigation.navigate('Dashboard');
  };

  /**
   * Comparte el código de la sala (funcionalidad futura)
   */
  const shareRoomCode = () => {
    // TODO: Implementar funcionalidad de compartir
    showCustomAlert('Compartir', 'Funcionalidad en desarrollo', 'info');
  };

  // Si no hay datos de la sala, mostrar error
  if (!room) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>¡Oops!</Text>
          <Text style={styles.errorMessage}>
            No se pudieron cargar los datos de la sala
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={goBackToDashboard}>
            <Text style={styles.backButtonText}>Volver al Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/images/logoSinFondo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Mensaje de éxito */}
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>¡Sala Creada Exitosamente!</Text>
          <Text style={styles.successMessage}>
            Tu sala de juego está lista. Comparte este código con tu oponente:
          </Text>
        </View>

        {/* Código de la sala */}
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Código de la Sala</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{room.code}</Text>
          </View>
          <TouchableOpacity style={styles.copyButton} onPress={copyRoomCode}>
            <Text style={styles.copyButtonText}>📋 Copiar Código</Text>
          </TouchableOpacity>
        </View>

        {/* Información adicional */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estado:</Text>
            <Text style={styles.infoValue}>{room.getStatusInSpanish()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Jugadores:</Text>
            <Text style={styles.infoValue}>
              {room.getPlayerCount()}/2
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Creada:</Text>
            <Text style={styles.infoValue}>
              {room.getFormattedCreatedAt()}
            </Text>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.inviteButton} onPress={openFriendsModal}>
            <Text style={styles.inviteButtonText}>👥 Invitar a Amigo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.shareButton} onPress={shareRoomCode}>
            <Text style={styles.shareButtonText}>📤 Compartir Código</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.backButton} onPress={goBackToDashboard}>
            <Text style={styles.backButtonText}>🏠 Volver al Dashboard</Text>
          </TouchableOpacity>
        </View>

        {/* Instrucciones */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>¿Qué hacer ahora?</Text>
          <Text style={styles.instructionsText}>
            • Comparte el código {room.code} con tu oponente{'\n'}
            • Espera a que se una a la sala{'\n'}
            • El juego comenzará automáticamente cuando ambos estén listos
          </Text>
        </View>
      </View>

      {/* Modal de selección de amigos */}
      <Modal
        visible={showFriendsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeFriendsModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.friendsModalContainer}>
            <View style={styles.friendsModalHeader}>
              <Text style={styles.friendsModalTitle}>Invitar a Amigo</Text>
              <TouchableOpacity onPress={closeFriendsModal}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {loadingFriends ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6F4E37" />
                <Text style={styles.loadingText}>Cargando amigos...</Text>
              </View>
            ) : friends.length === 0 ? (
              <View style={styles.emptyFriendsContainer}>
                <Text style={styles.emptyFriendsIcon}>👥</Text>
                <Text style={styles.emptyFriendsText}>No tienes amigos aún</Text>
                <Text style={styles.emptyFriendsHint}>
                  Agrega amigos desde la sección de Amigos
                </Text>
              </View>
            ) : (
              <FlatList
                data={friends}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.friendItem}
                    onPress={() => sendInvitationToFriend(item)}
                    disabled={sendingInvitation}
                  >
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{item.name}</Text>
                      <Text style={styles.friendEmail}>{item.email}</Text>
                      {item.elo && (
                        <Text style={styles.friendElo}>ELO: {item.elo}</Text>
                      )}
                    </View>
                    <View style={styles.inviteIcon}>
                      <Text style={styles.inviteIconText}>📨</Text>
                    </View>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.friendsList}
              />
            )}

            {sendingInvitation && (
              <View style={styles.sendingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.sendingText}>Enviando invitación...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // NEUTRO
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
  successContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6F4E37', // PRINCIPAL
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  codeContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  codeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6F4E37', // PRINCIPAL
    marginBottom: 16,
  },
  codeBox: {
    backgroundColor: '#FFD166', // SECUNDARIO
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#6F4E37',
  },
  codeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6F4E37', // PRINCIPAL
    letterSpacing: 4,
    textAlign: 'center',
  },
  copyButton: {
    backgroundColor: '#6F4E37', // PRINCIPAL
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  copyButtonText: {
    color: '#F5F5F5',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6F4E37', // PRINCIPAL
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  actionContainer: {
    marginVertical: 20,
  },
  inviteButton: {
    backgroundColor: '#28A745', // Verde para invitación
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#FFD166', // SECUNDARIO
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButtonText: {
    color: '#6F4E37', // PRINCIPAL
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#6F4E37', // PRINCIPAL
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    color: '#F5F5F5',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6F4E37', // PRINCIPAL
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6F4E37', // PRINCIPAL
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  // Estilos del modal de amigos
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  friendsModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  friendsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  friendsModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6F4E37',
  },
  closeButton: {
    fontSize: 28,
    color: '#6C757D',
    fontWeight: '300',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyFriendsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyFriendsIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyFriendsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyFriendsHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  friendsList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  friendEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  friendElo: {
    fontSize: 12,
    color: '#6F4E37',
    fontWeight: '500',
  },
  inviteIcon: {
    marginLeft: 12,
  },
  inviteIconText: {
    fontSize: 24,
  },
  sendingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sendingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 12,
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

export default RoomCreatedScreen;