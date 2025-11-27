import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../controllers/AuthContext';
import { useRoom } from '../../hooks/useRoom';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';
import { CustomModal } from '../../components/common';
import { useCustomModal } from '../../hooks/useCustomModal';
import TelemetryDashboard from '../../components/TelemetryDashboard';
import GlobalRanking from '../../components/GlobalRanking';
import styles from '../../styles/DashboardScreen.styles';
import FriendsRanking from '../../components/FriendsRanking';

/**
 * Pantalla principal del dashboard - Hub central de la aplicación
 * Muestra diferentes tabs según el rol del usuario y feature flags activos
 */
const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { createRoom, loading: roomLoading, error: roomError } = useRoom();
  const {
    isFeatureEnabled,
    featureFlags,
    loading: featureFlagsLoading,
    refreshFeatureFlags,
  } = useFeatureFlags();
  const [activeTab, setActiveTab] = useState('ranking');

  // Hook para modales personalizados
  const { modalVisible, modalData, showErrorModal, showInfoModal, hideModal } =
    useCustomModal();

  // Refresca feature flags cada vez que la pantalla recibe el foco
  useFocusEffect(
    useCallback(() => {
      refreshFeatureFlags();
    }, [refreshFeatureFlags])
  );

  // Determina si el botón Deck debe mostrarse según el feature flag
  const isDeckFeatureEnabled =
    !featureFlagsLoading && featureFlags.length > 0 && isFeatureEnabled('Deck');

  // Restringe acceso a tabs de admin para usuarios no-administradores
  useEffect(() => {
    if (
      user?.role !== 'admin' &&
      (activeTab === 'telemetria' || activeTab === 'admin')
    ) {
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
      // Error manejado silenciosamente o se puede usar un sistema de logging apropiado
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
    showInfoModal('Visualizar Deck', 'Funcionalidad próximamente disponible');
  };

  /**
   * Crea una nueva sala de juego para el usuario actual
   */
  const handleCreateRoom = async () => {
    try {
      if (!user?.id) {
        showErrorModal(
          'Error',
          'No se pudo obtener la información del usuario'
        );
        return;
      }

      const room = await createRoom(user.id);

      if (room) {
        navigation.navigate('RoomCreated', { room });
      } else {
        showErrorModal('Error', roomError || 'No se pudo crear la sala');
      }
    } catch (error) {
      showErrorModal(
        'Error',
        `Hubo un problema al crear la sala: ${error.message}`
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con logo y usuario */}
        <View style={styles.header}>
          <Image
            source={require('../../../assets/images/logoSinFondo.png')}
            style={styles.logo}
            resizeMode='contain'
          />

          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.userInitial}>
                {user?.name?.charAt(0) || 'J'}
              </Text>
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
            <Text
              style={[
                styles.tabText,
                activeTab === 'ranking' && styles.activeTabText,
              ]}
            >
              🏆 Ranking Global
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'amigos' && styles.activeTab]}
            onPress={() => setActiveTab('amigos')}
          >
            <Text style={[styles.tabText, activeTab === 'amigos' && styles.activeTabText]}>
              🏆 Ranking Amigos
            </Text>
          </TouchableOpacity>

          {/* Solo mostrar Administración si el usuario es admin */}
          {user?.role === 'admin' && (
            <TouchableOpacity
              style={[styles.tab, activeTab === 'admin' && styles.activeTab]}
              onPress={() => setActiveTab('admin')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'admin' && styles.activeTabText,
                ]}
              >
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

        {/* Contenido del Ranking de Amigos */}
        {activeTab === 'amigos' && (
          <View style={styles.content}>
            {/* Botones de gestión de amigos */}
            <View style={styles.friendButtonsContainer}>
              <TouchableOpacity 
                style={[styles.roomButton, styles.createRoomButton]} 
                onPress={() => navigation.navigate('Friends')}
              >
                <Text style={styles.createRoomText}>👥 Gestionar Amigos</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.roomButton, styles.joinRoomButton]} 
                onPress={() => navigation.navigate('FriendRequests')}
              >
                <Text style={styles.joinRoomText}>📨 Solicitudes de Amistad</Text>
              </TouchableOpacity>
            </View>
            
            {/* Ranking de Amigos */}
            <FriendsRanking />
          </View>
        )}

        {/* Contenido placeholder para otras tabs */}
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
                    <Text style={styles.adminButtonSubtitle}>
                      Gestiona las características del sistema
                    </Text>
                  </View>
                  <Text style={styles.adminButtonArrow}>▶</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.adminButton, styles.usersButton]}
                onPress={() => {
                  showInfoModal(
                    'Próximamente',
                    'La gestión de usuarios estará disponible pronto'
                  );
                }}
              >
                <View style={styles.adminButtonContent}>
                  <Text style={styles.adminButtonIcon}>👥</Text>
                  <View style={styles.adminButtonText}>
                    <Text style={styles.adminButtonTitle}>
                      Gestión de Usuarios
                    </Text>
                    <Text style={styles.adminButtonSubtitle}>
                      Administra cuentas y permisos
                    </Text>
                  </View>
                  <Text style={styles.adminButtonArrow}>▶</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.adminButton, styles.settingsButton]}
                onPress={() => {
                  showInfoModal(
                    'Próximamente',
                    'La configuración estará disponible pronto'
                  );
                }}
              >
                <View style={styles.adminButtonContent}>
                  <Text style={styles.adminButtonIcon}>⚙️</Text>
                  <View style={styles.adminButtonText}>
                    <Text style={styles.adminButtonTitle}>Configuración</Text>
                    <Text style={styles.adminButtonSubtitle}>
                      Ajustes generales del sistema
                    </Text>
                  </View>
                  <Text style={styles.adminButtonArrow}>▶</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.adminButton, styles.telemetryButton]}
                onPress={() => setActiveTab('telemetria')}
              >
                <View style={styles.adminButtonContent}>
                  <Text style={styles.adminButtonIcon}>📊</Text>
                  <View style={styles.adminButtonText}>
                    <Text style={styles.adminButtonTitle}>Telemetría</Text>
                    <Text style={styles.adminButtonSubtitle}>
                      Ajustes generales del sistema
                    </Text>
                  </View>
                  <Text style={styles.adminButtonArrow}>▶</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Contenido de Telemetría */}
        {activeTab === 'telemetria' && user?.role === 'admin' && (
          <TelemetryDashboard />
        )}
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

export default DashboardScreen;
