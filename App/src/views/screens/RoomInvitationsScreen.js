import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../controllers/AuthContext';
import roomInvitationService from '../../services/roomInvitationService';

const RoomInvitationsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  /**
   * Carga las invitaciones al montar el componente
   */
  useEffect(() => {
    loadInvitations();
  }, []);

  /**
   * Carga las invitaciones recibidas
   */
  const loadInvitations = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await roomInvitationService.getReceivedInvitations(user.id);
      // Filtrar solo las invitaciones pendientes
      const pendingInvitations = data.filter(inv => inv.status === 'pending');
      setInvitations(pendingInvitations);
    } catch (err) {
      console.error('Error al cargar invitaciones:', err);
      Alert.alert('Error', 'No se pudieron cargar las invitaciones');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja el refresh de la lista
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await loadInvitations();
    setRefreshing(false);
  };

  /**
   * Acepta una invitación
   */
  const handleAcceptInvitation = async (invitation) => {
    if (!user?.id) return;

    try {
      setProcessingId(invitation.id);
      await roomInvitationService.acceptInvitation(invitation.id, user.id);

      Alert.alert(
        '¡Invitación Aceptada!',
        `Has aceptado la invitación a la sala ${invitation.room.code}.\n\n¿Deseas unirte ahora?`,
        [
          {
            text: 'Más tarde',
            style: 'cancel',
            onPress: () => {
              // Recargar lista
              loadInvitations();
            }
          },
          {
            text: 'Unirme',
            onPress: () => {
              // Navegar a la pantalla de unirse con el código de la sala
              navigation.navigate('JoinRoom', {
                prefilledCode: invitation.room.code
              });
            }
          }
        ]
      );
    } catch (err) {
      console.error('Error al aceptar invitación:', err);
      Alert.alert('Error', err.message || 'No se pudo aceptar la invitación');
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Rechaza una invitación
   */
  const handleRejectInvitation = async (invitation) => {
    if (!user?.id) return;

    Alert.alert(
      'Rechazar Invitación',
      `¿Estás seguro de rechazar la invitación a la sala ${invitation.room.code}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingId(invitation.id);
              await roomInvitationService.rejectInvitation(invitation.id, user.id);
              
              Alert.alert('Invitación Rechazada', 'Has rechazado la invitación');
              loadInvitations();
            } catch (err) {
              console.error('Error al rechazar invitación:', err);
              Alert.alert('Error', err.message || 'No se pudo rechazar la invitación');
            } finally {
              setProcessingId(null);
            }
          }
        }
      ]
    );
  };

  /**
   * Renderiza cada invitación en la lista
   */
  const renderInvitationItem = ({ item: invitation }) => {
    const isProcessing = processingId === invitation.id;

    return (
      <View style={styles.invitationCard}>
        <View style={styles.invitationHeader}>
          <Text style={styles.roomCode}>{invitation.room.code}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Pendiente</Text>
          </View>
        </View>

        <View style={styles.invitationInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>De:</Text>
            <Text style={styles.infoValue}>{invitation.fromUser.name}</Text>
          </View>
          {invitation.room.creatorName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Creador:</Text>
              <Text style={styles.infoValue}>{invitation.room.creatorName}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estado sala:</Text>
            <Text style={styles.infoValue}>
              {invitation.room.status === 'waiting' ? 'Esperando' : 
               invitation.room.status === 'playing' ? 'Jugando' : 
               'Finalizada'}
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.rejectButton, isProcessing && styles.disabledButton]}
            onPress={() => handleRejectInvitation(invitation)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.rejectButtonText}>❌ Rechazar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.acceptButton, isProcessing && styles.disabledButton]}
            onPress={() => handleAcceptInvitation(invitation)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.acceptButtonText}>✅ Aceptar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /**
   * Renderiza el estado vacío
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyTitle}>No tienes invitaciones</Text>
      <Text style={styles.emptyMessage}>
        Cuando alguien te invite a una sala, aparecerá aquí
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invitaciones a Salas</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Invitaciones Recibidas</Text>
        <Text style={styles.subtitle}>
          {invitations.length} {invitations.length === 1 ? 'invitación' : 'invitaciones'}
        </Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6F4E37" />
          <Text style={styles.loadingText}>Cargando invitaciones...</Text>
        </View>
      ) : (
        <FlatList
          data={invitations}
          renderItem={renderInvitationItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.listContainer,
            invitations.length === 0 && styles.emptyListContainer
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6F4E37']}
              tintColor="#6F4E37"
            />
          }
          ListEmptyComponent={!loading ? renderEmptyState : null}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    color: '#6F4E37',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6F4E37',
  },
  headerSpacer: {
    width: 60,
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
    color: '#6F4E37',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
  },
  invitationCard: {
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
  invitationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  roomCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6F4E37',
    backgroundColor: '#FFD166',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadge: {
    backgroundColor: '#FFD166',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6F4E37',
  },
  invitationInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#DC3545',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#28A745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
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
    color: '#6F4E37',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default RoomInvitationsScreen;
