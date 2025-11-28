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

  /**
   * Carga la lista de amigos al abrir el modal
   */
  useEffect(() => {
    if (showFriendsModal) {
      loadFriends();
    }
  }, [showFriendsModal]);

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
      Alert.alert('Error', 'No se pudieron cargar tus amigos');
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
    if (!user?.id || !room?.id) {
      Alert.alert('Error', 'No se pudo enviar la invitación');
      return;
    }

    try {
      setSendingInvitation(true);
      await roomInvitationService.sendRoomInvitation(room.id, user.id, friend.id);
      
      Alert.alert(
        '¡Invitación Enviada!',
        `Se ha enviado una invitación a ${friend.name} para unirse a tu sala.`,
        [
          {
            text: 'OK',
            onPress: () => closeFriendsModal()
          }
        ]
      );
    } catch (err) {
      console.error('Error al enviar invitación:', err);
      
      let errorMessage = 'No se pudo enviar la invitación';
      if (err.message.includes('ya invitado') || err.message.includes('already invited')) {
        errorMessage = 'Ya has enviado una invitación a este amigo';
      } else if (err.message.includes('sala llena') || err.message.includes('room full')) {
        errorMessage = 'La sala ya está llena';
      }
      
      Alert.alert('Error', errorMessage);
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
      Alert.alert('¡Copiado!', 'El código de la sala ha sido copiado al portapapeles');
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
    Alert.alert('Compartir', 'Funcionalidad de compartir en desarrollo');
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
});

export default RoomCreatedScreen;