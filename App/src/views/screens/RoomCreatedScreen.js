import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Clipboard,
  Alert,
} from 'react-native';

const RoomCreatedScreen = ({ navigation, route }) => {
  // Obtener los datos de la sala desde los parámetros de navegación
  const { room } = route.params || {};

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
});

export default RoomCreatedScreen;