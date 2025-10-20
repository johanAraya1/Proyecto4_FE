import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../controllers/AuthContext';
import { useRoom } from '../../hooks/useRoom';
import { CustomModal, BackButton } from '../../components/common';
import { useCustomModal } from '../../hooks/useCustomModal';
import { navigateToDashboard } from '../../utils';

const JoinRoomScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { getRoomByCode, joinRoomById } = useRoom();
  const [roomCode, setRoomCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundRoom, setFoundRoom] = useState(null);
  const [isJoining, setIsJoining] = useState(false);

  // Hook para manejar modales
  const {
    modalVisible,
    modalData,
    showSuccessModal,
    showErrorModal,
    showWarningModal,
    hideModal,
  } = useCustomModal();

  /**
   * Navega de vuelta al dashboard
   */
  const goBackToDashboard = () => {
    navigateToDashboard(navigation);
  };

  /**
   * Formatea el código mientras el usuario escribe
   */
  const formatRoomCode = (text) => {
    // Remover espacios y convertir a mayúsculas
    const formatted = text.replace(/\s/g, '').toUpperCase();

    // Limitar a 6 caracteres alfanuméricos
    const alphanumeric = formatted.replace(/[^A-Z0-9]/g, '');

    return alphanumeric.substring(0, 6);
  };

  /**
   * Maneja el cambio de texto en el input
   */
  const handleCodeChange = (text) => {
    const formattedCode = formatRoomCode(text);
    setRoomCode(formattedCode);
  };

  /**
   * Valida si el código tiene el formato correcto
   */
  const isValidRoomCode = (code) => {
    return /^[A-Z0-9]{6}$/.test(code);
  };

  /**
   * Busca una sala por su código
   */
  const handleSearchRoom = async () => {
    if (!roomCode.trim()) {
      showErrorModal('Error', 'Por favor ingresa un código de sala');
      return;
    }

    if (!isValidRoomCode(roomCode)) {
      showErrorModal(
        'Error',
        'El código debe tener exactamente 6 caracteres alfanuméricos'
      );
      return;
    }

    try {
      setIsSearching(true);
      setFoundRoom(null);

      const response = await getRoomByCode(roomCode, user.id);

      if (response) {
        const { room, isUserInRoom, isRoomFull, message, userRole } = response;

        // Caso 1: Usuario ya está en la sala
        if (isUserInRoom) {
          showErrorModal(
            'Ya eres miembro',
            message || `Ya formas parte de esta sala como ${userRole}`
          );
          return; // Detener el flujo
        }

        // Caso 2: Sala está llena
        if (isRoomFull) {
          // Determinar el título apropiado basado en el mensaje
          let title = 'Sala No Disponible';
          const displayMessage = message || 'Esta sala ya está completa. ¡Busca otra sala para jugar!';
          
          // Si el mensaje indica que la sala ha terminado, usar un título más apropiado
          if (message && (message.includes('terminado') || message.includes('finalizado'))) {
            title = 'Sala Terminada';
          } else if (message && message.includes('llena')) {
            title = 'Sala Llena';
          }
          
          showErrorModal(title, displayMessage);
          return; // Detener el flujo
        }

        // Caso 3: Sala disponible - continuar normalmente
        setFoundRoom(room);
        showSuccessModal(
          'Sala Encontrada',
          `Sala creada por ${room.creatorName || 'Usuario desconocido'}`
        );
      } else {
        showErrorModal(
          'Sala No Encontrada',
          'No se encontró ninguna sala con ese código. Verifica que el código sea correcto.'
        );
      }
    } catch (err) {
      if (err.message.includes('conexión') || err.message.includes('network')) {
        showErrorModal(
          '🌐 Error de Conexión',
          'Hay problemas con tu conexión a internet.\n\nVerifica tu conexión e inténtalo nuevamente.'
        );
      } else {
        showErrorModal(
          'Error al Buscar',
          err.message || 'No se pudo buscar la sala. Inténtalo nuevamente.'
        );
      }
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Se une a una sala encontrada
   */
  const handleJoinRoom = async (room) => {
    if (!user) {
      showErrorModal(
        'Error',
        'No se pudo obtener la información del usuario',
        () => {
          goBackToDashboard();
        }
      );
      return;
    }

    try {
      setIsJoining(true);

      const updatedRoom = await joinRoomById(room.id, user.id);

      if (updatedRoom) {
        const creatorName = updatedRoom.creatorName || 'Usuario desconocido';
        showSuccessModal(
          '¡Éxito!',
          `Te has unido exitosamente a la sala de ${creatorName}`,
          () => {
            goBackToDashboard();
          }
        );
      } else {
        showErrorModal(
          'Error al Unirse',
          'No se pudo unir a la sala. Inténtalo nuevamente.',
          () => {
            goBackToDashboard();
          }
        );
      }
    } catch (err) {
      showErrorModal(
        'Error',
        err.message || 'Error desconocido al unirse a la sala',
        () => {
          goBackToDashboard();
        }
      );
    } finally {
      setIsJoining(false);
    }
  };

  /**
   * Limpia el input del código
   */
  const handleClearCode = () => {
    setRoomCode('');
  };

  /**
   * Maneja pegar código desde el portapapeles
   */
  const handlePasteCode = async () => {
    try {
      // En React Native Web
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        const formattedCode = formatRoomCode(text);
        setRoomCode(formattedCode);
      }
    } catch (error) {
      showWarningModal('Pegar', 'No se pudo pegar desde el portapapeles');
    }
  };

  /**
   * Formatea fecha para mostrar
   */

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
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

        {/* Contenido scrollable */}
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
          overScrollMode="auto"
        >
          {/* Título */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Unirse a Sala</Text>
            <Text style={styles.subtitle}>
              Ingresa el código de 6 caracteres que te compartió el creador de
              la sala
            </Text>
          </View>

          {/* Input del código */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Código de la Sala</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={roomCode}
                onChangeText={handleCodeChange}
                placeholder='Ej: F75A34'
                placeholderTextColor='#999'
                maxLength={6}
                autoCapitalize='characters'
                autoCorrect={false}
                keyboardType='default'
              />

              {roomCode.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearCode}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Indicador de progreso */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {roomCode.length}/6 caracteres
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(roomCode.length / 6) * 100}%` },
                  ]}
                />
              </View>
            </View>

            {/* Botones de acción rápida */}
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={handlePasteCode}
              >
                <Text style={styles.quickActionText}>📋 Pegar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Información */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>💡 Información</Text>
            <Text style={styles.infoText}>
              • El código debe tener exactamente 6 caracteres{'\n'}• Solo
              contiene letras mayúsculas y números{'\n'}• El código es único
              para cada sala{'\n'}• Asegúrate de escribirlo correctamente
            </Text>
          </View>

          {/* Botón de búsqueda */}
          <TouchableOpacity
            style={[
              styles.searchButton,
              (!roomCode.trim() || !isValidRoomCode(roomCode)) &&
                styles.searchButtonDisabled,
            ]}
            onPress={handleSearchRoom}
            disabled={
              !roomCode.trim() || !isValidRoomCode(roomCode) || isSearching
            }
          >
            <Text style={styles.searchButtonText}>
              {isSearching ? '🔍 Buscando...' : '🔍 Buscar Sala'}
            </Text>
          </TouchableOpacity>

          {/* Sala encontrada */}
          {foundRoom && (
            <View style={styles.roomFoundContainer}>
              <Text style={styles.roomFoundTitle}>✅ Sala Encontrada</Text>

              <View style={styles.roomInfoContainer}>
                <View style={styles.roomInfoRow}>
                  <Text style={styles.roomInfoLabel}>Código:</Text>
                  <Text style={styles.roomInfoValue}>{foundRoom.code}</Text>
                </View>

                <View style={styles.roomInfoRow}>
                  <Text style={styles.roomInfoLabel}>Creada por:</Text>
                  <Text style={styles.roomInfoValue}>
                    {foundRoom.creatorName || 'Usuario desconocido'}
                  </Text>
                </View>

                <View style={styles.roomInfoRow}>
                  <Text style={styles.roomInfoLabel}>Estado:</Text>
                  <Text style={styles.roomInfoValue}>
                    {foundRoom.getStatusInSpanish()}
                  </Text>
                </View>

                <View style={styles.roomInfoRow}>
                  <Text style={styles.roomInfoLabel}>Creada:</Text>
                  <Text style={styles.roomInfoValue}>
                    {foundRoom.getFormattedCreatedAt()}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.joinButton,
                  isJoining && styles.joinButtonDisabled,
                ]}
                onPress={() => handleJoinRoom(foundRoom)}
                disabled={isJoining}
              >
                <Text style={styles.joinButtonText}>
                  {isJoining ? '🚀 Uniéndose...' : '🚀 Unirse a la Sala'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60, // Más espacio al final para scroll cómodo en móviles
    flexGrow: 1, // Permite que el contenido crezca si es necesario
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6F4E37',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6F4E37',
    marginBottom: 12,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 4,
    color: '#6F4E37',
  },
  clearButton: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -12 }],
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6F4E37',
    borderRadius: 2,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  quickActionButton: {
    backgroundColor: '#FFD166',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  quickActionText: {
    color: '#6F4E37',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6F4E37',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  searchButton: {
    backgroundColor: '#6F4E37',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  roomFoundContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#28A745',
  },
  roomFoundTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28A745',
    textAlign: 'center',
    marginBottom: 20,
  },
  roomInfoContainer: {
    marginBottom: 20,
  },
  roomInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6F4E37',
  },
  roomInfoValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: '#28A745',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  joinButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default JoinRoomScreen;
