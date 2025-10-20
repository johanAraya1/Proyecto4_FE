import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {
  HeaderWithLogo,
  ErrorMessage,
  CustomModal,
} from '../../components/common';
import { copyRoomCode, navigateToDashboard } from '../../utils';
import { containers, text, buttons, spacing } from '../../styles/common';
import { useCustomModal } from '../../hooks/useCustomModal';

const RoomCreatedScreen = ({ navigation, route }) => {
  // Hook para manejar modales
  const {
    modalVisible,
    modalData,
    showSuccessModal,
    showInfoModal,
    hideModal,
  } = useCustomModal();

  // Obtener los datos de la sala desde los parámetros de navegación
  const { room } = route.params || {};

  /**
   * Copia el código de la sala al portapapeles
   */
  const handleCopyRoomCode = async () => {
    if (room?.code) {
      const success = await copyRoomCode(room.code);
      if (success) {
        showSuccessModal(
          '¡Copiado!',
          'El código de la sala ha sido copiado al portapapeles'
        );
      }
    }
  };

  /**
   * Navega de vuelta al dashboard
   */
  const goBackToDashboard = () => {
    navigateToDashboard(navigation);
  };

  /**
   * Comparte el código de la sala (funcionalidad futura)
   */
  const shareRoomCode = () => {
    showInfoModal('Compartir', 'Funcionalidad de compartir en desarrollo');
  };

  // Si no hay datos de la sala, mostrar error
  if (!room) {
    return (
      <SafeAreaView style={containers.safeArea}>
        <HeaderWithLogo navigation={navigation} />
        <View style={containers.centered}>
          <ErrorMessage
            visible={true}
            title='¡Oops!'
            message='No se pudieron cargar los datos de la sala'
            type='warning'
            onRetry={goBackToDashboard}
            retryText='Volver al Dashboard'
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containers.safeArea}>
      <HeaderWithLogo 
        navigation={navigation} 
        onBackPress={goBackToDashboard}
        showBackButton={false}
      />

      <ScrollView 
        style={containers.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mensaje de éxito */}
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={[text.h1, text.center]}>¡Sala Creada Exitosamente!</Text>
          <Text
            style={[text.bodySecondary, text.center, { marginTop: spacing.sm }]}
          >
            Tu sala está lista para recibir oponentes
          </Text>
        </View>

        {/* Información de la sala */}
        <View style={[containers.card, styles.roomCard]}>
          <Text style={[text.h3, text.center]}>Código de la Sala</Text>
          <Text style={[text.roomCode, { marginVertical: spacing.md }]}>
            {room.code}
          </Text>

          <TouchableOpacity
            style={[buttons.primary, { marginTop: spacing.md }]}
            onPress={handleCopyRoomCode}
          >
            <Text style={buttons.primaryText}>📋 Copiar Código</Text>
          </TouchableOpacity>
        </View>

        {/* Información adicional */}
        <View style={[containers.card, styles.infoCard]}>
          <Text style={[text.h4, { marginBottom: spacing.sm }]}>
            💡 Información
          </Text>
          <Text style={text.caption}>
            • Comparte este código con tu oponente{'\n'}• La sala permanecerá
            activa hasta que se complete el juego{'\n'}• Máximo 2 jugadores por
            sala
          </Text>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[buttons.secondary, { flex: 1, marginRight: spacing.sm }]}
            onPress={shareRoomCode}
          >
            <Text style={buttons.secondaryText}>🔗 Compartir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttons.success, { flex: 1, marginLeft: spacing.sm }]}
            onPress={goBackToDashboard}
          >
            <Text style={buttons.successText}>✅ Continuar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  roomCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
});

export default RoomCreatedScreen;
