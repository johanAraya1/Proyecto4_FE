import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../controllers/AuthContext';
import { useRoom } from '../../hooks/useRoom';

const ActiveRoomsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { getUserRooms, loading, error, userRooms } = useRoom();
  const [refreshing, setRefreshing] = useState(false);

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
  const copyRoomCode = (code) => {
    // En React Native Web no tenemos Clipboard, usamos navigator.clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      Alert.alert('¡Copiado!', 'El código de la sala ha sido copiado');
    } else {
      Alert.alert('Código de Sala', code);
    }
  };

  /**
   * Inicia el juego en una sala
   */
  const playInRoom = (room) => {
    Alert.alert(
      'Entrar al Juego',
      `¿Deseas entrar a la sala ${room.code}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Jugar', 
          style: 'default',
          onPress: () => {
            // TODO: Implementar navegación al juego
            Alert.alert('¡A Jugar!', `Entrando a la sala ${room.code}...`);
          }
        }
      ]
    );
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
            <Text style={styles.copyButtonText}>� Copiar</Text>
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
      case 'waiting': return '#FFD166'; // SECUNDARIO
      case 'playing': return '#28A745'; // Verde
      case 'finished': return '#6C757D'; // Gris
      default: return '#6C757D';
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
      <TouchableOpacity style={styles.createRoomButton} onPress={goBackToDashboard}>
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

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Mis Salas Activas</Text>
        <Text style={styles.subtitle}>
          {userRooms.length} {userRooms.length === 1 ? 'sala' : 'salas'}
        </Text>
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
            userRooms.length === 0 && styles.emptyListContainer
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6F4E37']} // PRINCIPAL
              tintColor="#6F4E37" // Para iOS
            />
          }
          ListEmptyComponent={!loading && !error ? renderEmptyState : null}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
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
});

export default ActiveRoomsScreen;