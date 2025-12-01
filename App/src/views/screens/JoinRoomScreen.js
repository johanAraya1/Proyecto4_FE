import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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
import styles from '../../styles/JoinRoomScreen.styles';

const JoinRoomScreen = ({ navigation, route }) => {
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

      const response = await getRoomByCode(roomCode, user.id);

      if (response) {
        const { room, isUserInRoom, isRoomFull, message, userRole } = response;

        // Caso 1: Usuario ya está en la sala
        if (isUserInRoom) {
          showErrorModal(
            'Ya eres miembro',
            message || `Ya formas parte de esta sala como ${userRole}`
      
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

export default JoinRoomScreen;
