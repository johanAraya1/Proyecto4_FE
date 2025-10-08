import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../controllers/AuthContext';
import { useRoom } from '../../hooks/useRoom';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';
import TelemetryDashboard from '../../components/TelemetryDashboard';
import GlobalRanking from '../../components/GlobalRanking';

/**
 * Pantalla principal del dashboard - Hub central de la aplicación
 * Muestra diferentes tabs según el rol del usuario y feature flags activos
 */
const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { createRoom, loading: roomLoading, error: roomError } = useRoom();
  const { isFeatureEnabled, featureFlags, loading: featureFlagsLoading, refreshFeatureFlags } = useFeatureFlags();
  const [activeTab, setActiveTab] = useState('ranking');

  // Refresca feature flags cada vez que la pantalla recibe el foco
  useFocusEffect(
    useCallback(() => {
      refreshFeatureFlags();
    }, [refreshFeatureFlags])
  );

  // Determina si el botón Deck debe mostrarse según el feature flag
  const isDeckFeatureEnabled = !featureFlagsLoading && featureFlags.length > 0 && isFeatureEnabled('Deck');

  // Restringe acceso a tabs de admin para usuarios no-administradores
  useEffect(() => {
    if (user?.role !== 'admin' && (activeTab === 'telemetria' || activeTab === 'admin')) {
      setActiveTab('ranking');
    }
  }, [user, user?.role, activeTab]);

  /**
   * Cierra la sesión del usuario actual
   */
  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        // Navegar de vuelta al Login
        navigation.replace('Login');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  /**
   * Navega a la pantalla para unirse a una sala
   */
  const handleJoinRoom = () => {
    navigation.navigate('JoinRoom');
  };

  /**
   * Navega a la pantalla de salas activas
   */
  const handleViewActiveRooms = () => {
    navigation.navigate('ActiveRooms');
  };

  /**
   * Navega a la pantalla de administración de feature flags
   */
  const handleFeatureFlags = () => {
    navigation.navigate('FeatureFlags');
  };

  /**
   * Muestra modal de funcionalidad próximamente disponible
   */
  const handleViewDeck = () => {
    Alert.alert('Visualizar Deck', 'Funcionalidad próximamente disponible');
  };

  /**
   * Crea una nueva sala de juego para el usuario actual
   */
  const handleCreateRoom = async () => {
    try {
      if (!user?.id) {
        Alert.alert('Error', 'No se pudo obtener la información del usuario');
        return;
      }

      const room = await createRoom(user.id);
      
      if (room) {
        navigation.navigate('RoomCreated', { room });
      } else {
        Alert.alert('Error', roomError || 'No se pudo crear la sala');
      }
    } catch (error) {
      console.error('💥 Error al crear sala:', error);
      Alert.alert('Error', `Hubo un problema al crear la sala: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header con logo y usuario */}
        <View style={styles.header}>
          <Image 
            source={require('../../../assets/images/logoSinFondo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.userInitial}>{user?.name?.charAt(0) || 'J'}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name || 'Juan'}</Text>
              <View style={styles.userBadges}>
                <View style={styles.adminBadge}>
                  <Text style={styles.adminText}>{user?.role || 'admin'}</Text>
                </View>
                <Text style={styles.eloText}>ELO: {user?.elo || '0'}</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Navegación por tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'ranking' && styles.activeTab]}
            onPress={() => setActiveTab('ranking')}
          >
            <Text style={[styles.tabText, activeTab === 'ranking' && styles.activeTabText]}>
              🏆 Ranking Global
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'ordenes' && styles.activeTab]}
            onPress={() => setActiveTab('ordenes')}
          >
            <Text style={[styles.tabText, activeTab === 'ordenes' && styles.activeTabText]}>
              📝 Órdenes Activas
            </Text>
          </TouchableOpacity>
          
          {/* Solo mostrar Telemetría si el usuario es admin */}
          {user?.role === 'admin' && (
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'telemetria' && styles.activeTab]}
              onPress={() => setActiveTab('telemetria')}
            >
              <Text style={[styles.tabText, activeTab === 'telemetria' && styles.activeTabText]}>
                📄 Telemetría
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Solo mostrar Administración si el usuario es admin */}
          {user?.role === 'admin' && (
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'admin' && styles.activeTab]}
              onPress={() => setActiveTab('admin')}
            >
              <Text style={[styles.tabText, activeTab === 'admin' && styles.activeTabText]}>
                ⚙️ Administración
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Contenido del Ranking Global */}
        {activeTab === 'ranking' && (
          <View style={styles.content}>
            {/* Botones de salas */}
            <View style={styles.roomButtonsContainer}>
              <TouchableOpacity 
                style={[styles.roomButton, styles.createRoomButton]} 
                onPress={handleCreateRoom}
                disabled={roomLoading}
              >
                <Text style={styles.createRoomText}>
                  {roomLoading ? '🔄 Creando...' : '🎮 Crear Sala'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.roomButton, styles.joinRoomButton]} 
                onPress={handleJoinRoom}
              >
                <Text style={styles.joinRoomText}>🤝 Unirme a Sala</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.roomButton, styles.viewRoomsButton]} 
                onPress={handleViewActiveRooms}
              >
                <Text style={styles.viewRoomsText}>📋 Ver Salas Activas</Text>
              </TouchableOpacity>
              
              {isDeckFeatureEnabled && (
                <TouchableOpacity 
                  style={[styles.roomButton, styles.viewDeckButton]} 
                  onPress={handleViewDeck}
                >
                  <Text style={styles.viewDeckText}>🃏 Visualizar Deck</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <GlobalRanking />
          </View>
        )}

        {/* Contenido de Órdenes Activas */}
        {activeTab === 'ordenes' && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Órdenes Activas</Text>
            
            {/* Orden 1: Caramel Macchiato */}
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderName}>Caramel Macchiato</Text>
                <Text style={styles.orderTime}>2:40</Text>
              </View>
              
              <View style={styles.orderIngredients}>
                <View style={styles.ingredient}>
                  <Text style={styles.ingredientName}>Café</Text>
                </View>
                <View style={styles.ingredient}>
                  <Text style={styles.ingredientName}>Leche</Text>
                </View>
                <View style={styles.ingredient}>
                  <Text style={styles.ingredientName}>Agua</Text>
                </View>
              </View>
              
              <Text style={styles.rewardText}>Recompensa: 50 pts</Text>
            </View>
            
            {/* Orden 2: Classic Latte */}
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderName}>Classic Latte</Text>
                <Text style={styles.orderTime}>1:30</Text>
              </View>
              
              <View style={styles.orderIngredients}>
                <View style={styles.ingredient}>
                  <Text style={styles.ingredientName}>Café</Text>
                </View>
                <View style={styles.ingredient}>
                  <Text style={styles.ingredientName}>Leche</Text>
                </View>
              </View>
              
              <Text style={styles.rewardText}>Recompensa: 30 pts</Text>
            </View>
            
            {/* Botón Go to Ingredient Board */}
            <TouchableOpacity style={styles.ingredientBoardButton}>
              <Text style={styles.ingredientBoardText}>📋 Ir al Tablero de Ingredientes</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Contenido placeholder para otras tabs */}
        {activeTab === 'telemetria' && user?.role === 'admin' && (
          <TelemetryDashboard />
        )}
        
        {activeTab === 'admin' && user?.role === 'admin' && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>⚙️ Administración</Text>
            
            {/* Botones de administración */}
            <View style={styles.adminButtonsContainer}>
              <TouchableOpacity 
                style={[styles.adminButton, styles.featureFlagsButton]} 
                onPress={handleFeatureFlags}
              >
                <View style={styles.adminButtonContent}>
                  <Text style={styles.adminButtonIcon}>🚩</Text>
                  <View style={styles.adminButtonText}>
                    <Text style={styles.adminButtonTitle}>Feature Flags</Text>
                    <Text style={styles.adminButtonSubtitle}>Gestiona las características del sistema</Text>
                  </View>
                  <Text style={styles.adminButtonArrow}>▶</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.adminButton, styles.usersButton]}
                onPress={() => {
                  Alert.alert('Próximamente', 'La gestión de usuarios estará disponible pronto');
                }}
              >
                <View style={styles.adminButtonContent}>
                  <Text style={styles.adminButtonIcon}>👥</Text>
                  <View style={styles.adminButtonText}>
                    <Text style={styles.adminButtonTitle}>Gestión de Usuarios</Text>
                    <Text style={styles.adminButtonSubtitle}>Administra cuentas y permisos</Text>
                  </View>
                  <Text style={styles.adminButtonArrow}>▶</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.adminButton, styles.settingsButton]}
                onPress={() => {
                  Alert.alert('Próximamente', 'La configuración del sistema estará disponible pronto');
                }}
              >
                <View style={styles.adminButtonContent}>
                  <Text style={styles.adminButtonIcon}>⚙️</Text>
                  <View style={styles.adminButtonText}>
                    <Text style={styles.adminButtonTitle}>Configuración</Text>
                    <Text style={styles.adminButtonSubtitle}>Ajustes generales del sistema</Text>
                  </View>
                  <Text style={styles.adminButtonArrow}>▶</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // NEUTRO
  },
  scrollContainer: {
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
  logo: {
    width: 50,
    height: 50,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  userAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#6F4E37', // PRINCIPAL
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInitial: {
    color: '#F5F5F5',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userDetails: {
    alignItems: 'flex-start',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminBadge: {
    backgroundColor: '#FFD166', // SECUNDARIO
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  adminText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6F4E37',
  },
  eloText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#6F4E37', // PRINCIPAL
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: '#F5F5F5',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#6F4E37', // PRINCIPAL
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#F5F5F5',
    fontWeight: '600',
  },
  content: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6F4E37', // PRINCIPAL
    marginBottom: 16,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6F4E37', // PRINCIPAL
  },
  orderTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD166', // SECUNDARIO
  },
  orderIngredients: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  ingredient: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  ingredientName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  rewardText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  ingredientBoardButton: {
    backgroundColor: '#6F4E37', // PRINCIPAL
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  ingredientBoardText: {
    color: '#F5F5F5',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  createRoomButton: {
    backgroundColor: '#6F4E37', // PRINCIPAL
  },
  createRoomText: {
    color: '#F5F5F5',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  roomButtonsContainer: {
    marginBottom: 20,
  },
  roomButton: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
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
  joinRoomButton: {
    backgroundColor: '#28A745', // Verde
  },
  joinRoomText: {
    color: '#F5F5F5',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  viewRoomsButton: {
    backgroundColor: '#FFD166', // SECUNDARIO
  },
  viewRoomsText: {
    color: '#6F4E37', // PRINCIPAL
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  viewDeckButton: {
    backgroundColor: '#17A2B8', // Azul para el deck
  },
  viewDeckText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Estilos para los botones de administración
  adminButtonsContainer: {
    gap: 12,
  },
  adminButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  featureFlagsButton: {
    borderLeftColor: '#007BFF', // Azul para feature flags
  },
  usersButton: {
    borderLeftColor: '#28A745', // Verde para usuarios
  },
  settingsButton: {
    borderLeftColor: '#6C757D', // Gris para configuración
  },
  adminButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminButtonIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  adminButtonText: {
    flex: 1,
  },
  adminButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  adminButtonSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  adminButtonArrow: {
    fontSize: 16,
    color: '#CCC',
  },
});

export default DashboardScreen;