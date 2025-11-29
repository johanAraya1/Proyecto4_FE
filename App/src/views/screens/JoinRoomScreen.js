import React, { useState, useEffect } from 'react';
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
  Modal,
  Animated
} from 'react-native';
import { useAuth } from '../../controllers/AuthContext';
import { useRoom } from '../../hooks/useRoom';

const JoinRoomScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { getRoomByCode, joinRoomById, loading, error } = useRoom();
  const [roomCode, setRoomCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundRoom, setFoundRoom] = useState(null);
  const [isJoining, setIsJoining] = useState(false);

  // Obtener código prellenado de los parámetros de navegación (si viene de invitación)
  const prefilledCode = route.params?.prefilledCode;

  // Estados para el modal personalizado
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({
    title: '',
    message: '',
    icon: '',
    type: 'success', // 'success' | 'error'
    onConfirm: null
  });

  /**
   * Efecto para código prellenado - buscar automáticamente
   */
  useEffect(() => {
    if (prefilledCode) {
      const formattedCode = formatRoomCode(prefilledCode);
      setRoomCode(formattedCode);
      // Buscar automáticamente después de un pequeño delay
      setTimeout(() => {
        handleSearchRoom(formattedCode);
      }, 500);
    }
  }, [prefilledCode]);

  /**
   * Función para mostrar modal personalizado
   */
  const showCustomAlert = (title, message, type = 'success', onConfirm = null) => {
    console.log('🚨 showCustomAlert llamada:', title);
    
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

    setModalData({
      title,
      message,
      icon: iconMap[type] || '🎉',
      type,
      onConfirm,
      bgColor: colorMap[type] || '#D4F6D4',
      buttonColor: buttonColorMap[type] || '#28A745'
    });
    setModalVisible(true);
  };

  /**
   * Maneja el cierre del modal
   */
  const handleModalClose = () => {
    console.log('🔄 Cerrando modal...');
    setModalVisible(false);
    
    // Ejecutar callback si existe
    if (modalData.onConfirm) {
      console.log('🔄 Ejecutando callback del modal...');
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
        bgColor: '#D4F6D4',
        buttonColor: '#28A745'
      });
    }, 300);
  };

  /**
   * Navega de vuelta al dashboard
   */
  const goBackToDashboard = () => {
    navigation.navigate('Dashboard');
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
  const isValidCode = (code) => {
    return /^[A-Z0-9]{6}$/.test(code);
  };

  /**
   * Busca la sala por código
   */
  const handleSearchRoom = async (codeToSearch = null) => {
    // Si codeToSearch es un evento (tiene target), usar roomCode en su lugar
    const searchCode = (codeToSearch && typeof codeToSearch === 'string') ? codeToSearch : roomCode;
    console.log('🔍 Buscando sala con código:', searchCode);

    // Validar código
    if (!searchCode || !searchCode.trim()) {
      showCustomAlert('Error', 'Por favor ingresa un código de sala', 'error');
      return;
    }

    if (!isValidCode(searchCode)) {
      showCustomAlert('Error', 'El código debe tener exactamente 6 caracteres alfanuméricos', 'error');
      return;
    }

    try {
      setIsSearching(true);
      setFoundRoom(null);
      
      // Buscar la sala
      const room = await getRoomByCode(searchCode);
      
      if (room) {
        console.log('✅ Sala encontrada:', room);
        console.log('📊 Datos del creador:', {
          creatorId: room.creatorId,
          creatorName: room.creatorName,
          getCreatorName: room.getCreatorName()
        });
        console.log('📅 Datos de fecha:', {
          createdAt: room.createdAt,
          formatted: formatCreatedDate(room.createdAt)
        });
        
        // Verificar si la sala puede aceptar jugadores
        if (room.isFull()) {
          showCustomAlert(
            'Sala Completa',
            'Esta sala ya tiene 2 jugadores. No puedes unirte.',
            'warning'
          );
          return;
        }

        if (room.status !== 'waiting') {
          showCustomAlert(
            'Sala No Disponible',
            `Esta sala está en estado "${room.getStatusInSpanish()}". Solo puedes unirte a salas en espera.`,
            'warning'
          );
          return;
        }

        // Verificar si el usuario no es ya parte de la sala
        if (room.isParticipant(user?.id)) {
          showCustomAlert(
            'Ya Participas',
            'Ya eres parte de esta sala.',
            'info'
          );
          return;
        }

        // Mostrar la sala encontrada
        setFoundRoom(room);
      } else {
        // Sala no encontrada
        showCustomAlert(
          'Sala No Encontrada',
          'No se encontró ninguna sala con ese código. Verifica que el código sea correcto.',
          'error'
        );
      }
    } catch (err) {
      console.error('💥 Error al buscar sala:', err);
      showCustomAlert(
        'Error',
        err.message || 'Hubo un problema al buscar la sala. Inténtalo de nuevo.',
        'error'
      );
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Se une a la sala encontrada
   */
  const handleJoinRoom = async (room) => {
    console.log('🚀 handleJoinRoom iniciado con sala:', room);
    
    if (!user?.id) {
      console.log('❌ Error: usuario no encontrado:', user);
      showCustomAlert('Error', 'No se pudo obtener la información del usuario', 'error', () => {
        navigation.navigate('Dashboard');
      });
      return;
    }

    try {
      console.log('🤝 Iniciando proceso de unión a la sala:', room.code, 'Usuario ID:', user.id);
      setIsJoining(true);
      
      // Llamar al endpoint para unirse
      console.log('📞 Llamando a joinRoomById...');
      const updatedRoom = await joinRoomById(room.id, user.id);
      console.log('📥 Respuesta de joinRoomById:', updatedRoom);
      console.log('🔍 Evaluando condición updatedRoom:', !!updatedRoom, typeof updatedRoom, updatedRoom);
      
      // SIEMPRE mostrar un mensaje, sin importar la condición
      console.log('🚨 Ejecutando Alert SIEMPRE...');
      
      if (updatedRoom && typeof updatedRoom === 'object') {
        console.log('✅ Unido exitosamente a la sala - Ejecutando Alert de éxito');
        console.log('🔍 Debug updatedRoom completo:', {
          code: updatedRoom.code,
          creatorId: updatedRoom.creatorId,
          creatorName: updatedRoom.creatorName,
          getCreatorName: updatedRoom.getCreatorName()
        });
        
        // Usar el nombre del creador de la sala encontrada (foundRoom) que sí tiene el nombre
        const creatorName = foundRoom?.getCreatorName() || updatedRoom.getCreatorName();
        console.log('👤 Usando nombre del creador:', creatorName);
        
        showCustomAlert(
          '¡Unión Exitosa!',
          `Te has unido exitosamente a la sala juego.\n\nAhora debes esperar a que el creador "${creatorName}" inicie la partida.\n\n¡Buena suerte!`,
          'success',
          () => {
            console.log('🏠 Navegando al Dashboard...');
            setRoomCode('');
            setFoundRoom(null);
            navigation.navigate('Dashboard');
          }
        );
      } else {
        console.log('❌ Ejecutando Alert de error porque updatedRoom es falsy');
        
        showCustomAlert(
          'Proceso Completado',
          'El proceso se ejecutó. Verifica tu estado en el dashboard.',
          'info',
          () => {
            console.log('🏠 Navegando al Dashboard (error genérico)...');
            navigation.navigate('Dashboard');
          }
        );
      }
      console.log('🚨 Alert.alert completado');
    } catch (err) {
      console.error('💥 Error al unirse a la sala:', err);
      console.error('💥 Stack trace:', err.stack);
      
      // Determinar mensaje de error más específico
      let errorTitle = '❌ Error al Unirse';
      let errorMessage = 'No se pudo unir a la sala.';
      
      if (err.message.includes('completa') || err.message.includes('llena')) {
        errorTitle = '🚫 Sala Completa';
        errorMessage = 'Esta sala ya tiene 2 jugadores y está completa.\n\nBusca otra sala o crea una nueva.';
      } else if (err.message.includes('no encontrada')) {
        errorTitle = '🔍 Sala No Encontrada';
        errorMessage = 'La sala ya no existe o fue eliminada.\n\nVerifica el código e inténtalo nuevamente.';
      } else if (err.message.includes('conexión')) {
        errorTitle = '🌐 Error de Conexión';
        errorMessage = 'Hay problemas con tu conexión a internet.\n\nVerifica tu conexión e inténtalo nuevamente.';
      } else {
        errorMessage = err.message || 'Hubo un problema inesperado.\n\nInténtalo nuevamente o contacta soporte.';
      }
      
      console.log('🚨 Mostrando alert de error:', errorTitle, errorMessage);
      showCustomAlert(
        errorTitle.replace(/❌|🚫|🔍|🌐/g, '').trim(),
        errorMessage,
        'error',
        () => {
          console.log('🏠 Navegando al Dashboard (error catch)...');
          // Siempre regresar al dashboard en caso de error
          navigation.navigate('Dashboard');
        }
      );
    } finally {
      console.log('🔄 Finalizando handleJoinRoom, setIsJoining(false)');
      setIsJoining(false);
    }
  };

  /**
   * Cancela la selección de sala y vuelve a la búsqueda
   */
  const handleCancelSelection = () => {
    setFoundRoom(null);
    setRoomCode('');
  };
  const handlePasteCode = async () => {
    try {
      // En React Native Web usamos navigator.clipboard
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        const formattedCode = formatRoomCode(text);
        if (formattedCode.length > 0) {
          setRoomCode(formattedCode);
        }
      }
    } catch (err) {
      console.log('No se pudo pegar desde el portapapeles');
    }
  };

  /**
   * Formatea la fecha de creación de manera más robusta
   */
  const formatCreatedDate = (dateString) => {
    try {
      if (!dateString) return 'Fecha no disponible';
      
      const date = new Date(dateString);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      
      // Formatear fecha y hora en español
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false // Usar formato 24 horas
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Error en fecha';
    }
  };

  /**
   * Limpia el input
   */
  const handleClearCode = () => {
    setRoomCode('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={goBackToDashboard}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          
          <Image 
            source={require('../../../assets/images/logoSinFondo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          {/* Título */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>🤝 Unirse a Sala</Text>
            <Text style={styles.subtitle}>
              {foundRoom ? 'Sala encontrada' : 'Ingresa el código de 6 dígitos de la sala a la que deseas unirte'}
            </Text>
          </View>

          {!foundRoom ? (
            <>
              {/* Input de código */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Código de la Sala</Text>
                
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.codeInput}
                    value={roomCode}
                    onChangeText={handleCodeChange}
                    placeholder="Ej: F75A34"
                    placeholderTextColor="#999"
                    maxLength={6}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    autoFocus={true}
                  />
                  
                  {roomCode.length > 0 && (
                    <TouchableOpacity style={styles.clearButton} onPress={handleClearCode}>
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
                        { width: `${(roomCode.length / 6) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>

                {/* Botones de acción rápida */}
                <View style={styles.quickActionsContainer}>
                  <TouchableOpacity style={styles.quickActionButton} onPress={handlePasteCode}>
                    <Text style={styles.quickActionText}>📋 Pegar</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Información */}
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>💡 Información</Text>
                <Text style={styles.infoText}>
                  • El código debe tener exactamente 6 caracteres{'\n'}
                  • Solo letras (A-Z) y números (0-9){'\n'}
                  • Solo puedes unirte a salas en estado &quot;Esperando&quot;{'\n'}
                  • Las salas solo pueden tener 2 jugadores máximo
                </Text>
              </View>

              {/* Botón de búsqueda */}
              <TouchableOpacity 
                style={[
                  styles.searchButton,
                  (!isValidCode(roomCode) || isSearching || loading) && styles.searchButtonDisabled
                ]}
                onPress={handleSearchRoom}
                disabled={!isValidCode(roomCode) || isSearching || loading}
              >
                <Text style={styles.searchButtonText}>
                  {isSearching || loading ? '🔍 Buscando...' : '🔍 Buscar Sala'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Sala encontrada */}
              <View style={styles.roomFoundContainer}>
                <View style={styles.roomFoundHeader}>
                  <Text style={styles.roomFoundIcon}>🎯</Text>
                  <Text style={styles.roomFoundTitle}>¡Sala Encontrada!</Text>
                </View>

                <View style={styles.roomCard}>
                  <View style={styles.roomCodeDisplay}>
                    <Text style={styles.roomCodeLabel}>Código</Text>
                    <Text style={styles.roomCodeValue}>{foundRoom.code}</Text>
                  </View>

                  <View style={styles.roomDetails}>
                    <View style={styles.roomDetailRow}>
                      <Text style={styles.roomDetailLabel}>Creador:</Text>
                      <Text style={styles.roomDetailValue}>{foundRoom.getCreatorName()}</Text>
                    </View>
                    <View style={styles.roomDetailRow}>
                      <Text style={styles.roomDetailLabel}>Estado:</Text>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusBadgeText}>{foundRoom.getStatusInSpanish()}</Text>
                      </View>
                    </View>
                    <View style={styles.roomDetailRow}>
                      <Text style={styles.roomDetailLabel}>Jugadores:</Text>
                      <Text style={styles.roomDetailValue}>1/2</Text>
                    </View>
                    <View style={styles.roomDetailRow}>
                      <Text style={styles.roomDetailLabel}>Creada:</Text>
                      <Text style={styles.roomDetailValue}>
                        {formatCreatedDate(foundRoom.createdAt)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Botones de acción */}
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={handleCancelSelection}
                    disabled={isJoining}
                  >
                    <Text style={styles.cancelButtonText}>❌ Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.joinButton, isJoining && styles.joinButtonDisabled]} 
                    onPress={() => handleJoinRoom(foundRoom)}
                    disabled={isJoining}
                  >
                    <Text style={styles.joinButtonText}>
                      {isJoining ? '🔄 Uniéndose...' : '🎮 ¡Unirme a la Sala!'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {/* Estado de error */}
          {error && !foundRoom && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Modal personalizado */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Icono */}
              <View style={[
                styles.modalIconContainer,
                { backgroundColor: modalData.bgColor || '#D4F6D4' }
              ]}>
                <Text style={styles.modalIcon}>{modalData.icon}</Text>
              </View>

              {/* Título */}
              <Text style={styles.modalTitle}>{modalData.title}</Text>

              {/* Mensaje */}
              <Text style={styles.modalMessage}>{modalData.message}</Text>

              {/* Botón OK */}
              <TouchableOpacity 
                style={[
                  styles.modalButton,
                  { backgroundColor: modalData.buttonColor || '#28A745' }
                ]}
                onPress={handleModalClose}
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
  keyboardAvoidingView: {
    flex: 1,
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
    width: 60, // Para centrar el logo
  },
  content: {
    flex: 1,
    padding: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6F4E37', // PRINCIPAL
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6F4E37', // PRINCIPAL
    marginBottom: 12,
  },
  inputWrapper: {
    position: 'relative',
  },
  codeInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 4,
    color: '#6F4E37', // PRINCIPAL
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6C757D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6F4E37', // PRINCIPAL
    borderRadius: 2,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  quickActionButton: {
    backgroundColor: '#FFD166', // SECUNDARIO
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  quickActionText: {
    color: '#6F4E37', // PRINCIPAL
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
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
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6F4E37', // PRINCIPAL
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  searchButton: {
    backgroundColor: '#6F4E37', // PRINCIPAL
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  searchButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  searchButtonText: {
    color: '#F5F5F5',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FFF3F3',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#DC3545',
  },
  errorText: {
    color: '#DC3545',
    fontSize: 14,
    textAlign: 'center',
  },
  roomFoundContainer: {
    flex: 1,
  },
  roomFoundHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  roomFoundIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  roomFoundTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28A745', // Verde
    textAlign: 'center',
  },
  roomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#28A745', // Verde
  },
  roomCodeDisplay: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  roomCodeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  roomCodeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#28A745', // Verde
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    letterSpacing: 3,
  },
  roomDetails: {
    gap: 12,
  },
  roomDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6F4E37', // PRINCIPAL
  },
  roomDetailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: '#FFD166', // SECUNDARIO
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6F4E37', // PRINCIPAL
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6C757D', // Gris
    paddingVertical: 14,
    borderRadius: 12,
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
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  joinButton: {
    flex: 2,
    backgroundColor: '#28A745', // Verde
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  joinButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Estilos del Modal personalizado
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

export default JoinRoomScreen;