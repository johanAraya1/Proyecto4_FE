import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Modal, TouchableOpacity } from 'react-native';
import FriendCard from '../../components/FriendCard';
import { useFriendController } from '../../controllers/useFriendController';
import { useAuth } from '../../controllers/AuthContext';

const FriendRequestsScreen = () => {
  const auth = useAuth();
  const friendCtrl = useFriendController(auth.user);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);

  useEffect(() => {
    console.log('🔍 FriendRequestsScreen - Loading requests...');
    friendCtrl.loadRequests().then((requests) => {
      console.log('🔍 FriendRequestsScreen - Requests loaded:', requests);
    });
  }, []);

  const onAccept = async (request) => {
    // Validaciones antes de aceptar
    if (!request || !request.id) {
      Alert.alert('❌ Error', 'No se puede aceptar la solicitud. Datos incompletos.');
      return;
    }

    if (!auth.user || !auth.user.id) {
      Alert.alert('❌ Error', 'Debes estar logueado para aceptar solicitudes.');
      return;
    }

    try {
      const result = await friendCtrl.acceptRequest(request.id);
      
      console.log('🔍 DEBUG - Resultado de acceptRequest:', result);
      
      // Verificar que la solicitud se aceptó correctamente
      if (result && (result.success || result.message || result.id)) {
        const userName = request.fromUser?.name || request.fromUser?.email || 'el usuario';
        const userElo = request.fromUser?.elo;
        
        let message = `🎉 ${userName} ahora es tu amigo. ¡Pueden jugar juntos!`;
        if (userElo) {
          message += `\n\n📊 ELO de ${userName}: ${userElo.toLocaleString()}`;
        }
        message += '\n\n👫 Ahora aparecerá en tu lista de amigos y en el ranking de amigos.';
        
        Alert.alert(
          '✅ ¡Solicitud Aceptada!', 
          message,
          [{ 
            text: '¡Genial!', 
            style: 'default',
            onPress: () => {
              // Opcional: Navegar a la lista de amigos
              console.log('Solicitud aceptada exitosamente');
            }
          }]
        );
      } else {
        console.error('❌ Respuesta inesperada del backend:', result);
        Alert.alert('❌ Error', 'No se pudo aceptar la solicitud. Respuesta inesperada del servidor.');
      }
    } catch (err) {
      console.error('❌ Error aceptando solicitud:', err);
      
      let errorMessage = 'Error aceptando solicitud';
      if (err.message.includes('no encontrada') || err.message.includes('not found')) {
        errorMessage = '🔍 La solicitud ya no está disponible o fue eliminada';
      } else if (err.message.includes('no válida') || err.message.includes('invalid')) {
        errorMessage = '❌ La solicitud no es válida o ya fue procesada';
      } else if (err.message.includes('expirada') || err.message.includes('expired')) {
        errorMessage = '⏰ La solicitud ha expirado';
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        errorMessage = '📡 Error de conexión. Verifica tu internet e intenta nuevamente.';
      } else {
        errorMessage = err.message || 'Error desconocido. Intenta nuevamente.';
      }
      
      Alert.alert('❌ Error', errorMessage);
    }
  };

  const onReject = async (request) => {
    console.log('🔍 DEBUG - onReject called with:', request);
    
    // Validaciones antes de rechazar
    if (!request || !request.id) {
      console.error('❌ Error: request o request.id es null/undefined:', request);
      Alert.alert('❌ Error', 'No se puede rechazar la solicitud. Datos incompletos.');
      return;
    }

    if (!auth.user || !auth.user.id) {
      console.error('❌ Error: auth.user o auth.user.id es null/undefined:', auth.user);
      Alert.alert('❌ Error', 'Debes estar logueado para rechazar solicitudes.');
      return;
    }

    // En lugar de Alert.alert, usar modal personalizado
    const userName = request.fromUser?.name || request.fromUser?.email || 'este usuario';
    const userElo = request.fromUser?.elo;
    
    console.log('🔍 DEBUG - Showing confirmation for:', { userName, userElo, requestId: request.id });
    
    // Guardar la request pendiente y mostrar modal
    setPendingRequest(request);
    setShowConfirmModal(true);
  };

  const handleConfirmReject = async () => {
    console.log('🔍 DEBUG - User confirmed reject, proceeding...');
    setShowConfirmModal(false);
    
    if (!pendingRequest) {
      console.error('❌ Error: No pending request');
      return;
    }

    try {
      const result = await friendCtrl.rejectRequest(pendingRequest.id);
      
      console.log('🔍 DEBUG - FriendRequestsScreen resultado de rejectRequest:', {
        result,
        type: typeof result,
        hasMessage: !!result?.message,
        message: result?.message,
        truthyCheck: !!(result && (result.success || result.message || result.id))
      });
      
      // Mostrar siempre el alert de éxito primero para debug
      Alert.alert(
        '🧪 DEBUG - Respuesta del Backend', 
        `Tipo: ${typeof result}\nMessage: ${result?.message || 'No message'}\nSuccess: ${result?.success || 'No success'}\nID: ${result?.id || 'No ID'}\nKeys: ${result ? Object.keys(result).join(', ') : 'No keys'}`,
        [{ text: 'Continuar', onPress: () => {
          // Ahora hacer la validación normal
          if (result && (result.success || result.message || result.id)) {
            Alert.alert(
              '❌ Solicitud Rechazada', 
              `La solicitud de ${pendingRequest.fromUser?.name || 'el usuario'} ha sido rechazada.`,
              [{ text: 'Entendido', style: 'default' }]
            );
          } else {
            console.error('❌ Respuesta inesperada del backend:', result);
            Alert.alert('❌ Error', 'No se pudo rechazar la solicitud. Respuesta inesperada del servidor.');
          }
        }}]
      );
    } catch (err) {
      console.error('❌ Error rechazando solicitud:', err);
      
      let errorMessage = 'Error rechazando solicitud';
      if (err.message.includes('no encontrada') || err.message.includes('not found')) {
        errorMessage = '🔍 La solicitud ya no está disponible o fue eliminada';
      } else if (err.message.includes('no válida') || err.message.includes('invalid')) {
        errorMessage = '❌ La solicitud no es válida o ya fue procesada';
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        errorMessage = '📡 Error de conexión. Verifica tu internet e intenta nuevamente.';
      } else {
        errorMessage = err.message || 'Error desconocido. Intenta nuevamente.';
      }
      
      Alert.alert('❌ Error', errorMessage);
    } finally {
      setPendingRequest(null);
    }
  };

  const handleCancelReject = () => {
    console.log('🔍 DEBUG - Reject cancelled by user');
    setShowConfirmModal(false);
    setPendingRequest(null);
  };

  console.log('🔍 FriendRequestsScreen render - Current state:', {
    requestsCount: friendCtrl.requests.length,
    requests: friendCtrl.requests,
    hasAuth: !!auth.user,
    userId: auth.user?.id
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.mainTitle}>📥 Solicitudes de Amistad</Text>
        <Text style={styles.subtitle}>
          {friendCtrl.requests.length > 0 
            ? `Tienes ${friendCtrl.requests.length} solicitud${friendCtrl.requests.length > 1 ? 'es' : ''} pendiente${friendCtrl.requests.length > 1 ? 's' : ''}`
            : 'No tienes solicitudes pendientes'
          }
        </Text>
      </View>

      {/* Requests List */}
      <View style={styles.requestsSection}>
        <FlatList
          data={friendCtrl.requests}
          keyExtractor={(item) => item.id?.toString() || item.email}
          renderItem={({ item }) => (
            <FriendCard 
              user={item.fromUser} 
              requestData={item}
              onAccept={() => onAccept(item)}
              onReject={() => onReject(item)}
              showElo={true}
            />
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No hay solicitudes pendientes</Text>
              <Text style={styles.emptyHint}>
                Las solicitudes que recibas aparecerán aquí
              </Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Modal de confirmación personalizado */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelReject}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>🤔 Confirmar Rechazo</Text>
            <Text style={styles.modalMessage}>
              {pendingRequest ? (
                `¿Estás seguro de que quieres rechazar la solicitud de ${
                  pendingRequest.fromUser?.name || pendingRequest.fromUser?.email || 'este usuario'
                }?`
              ) : (
                '¿Estás seguro de que quieres rechazar esta solicitud?'
              )}
            </Text>
            {pendingRequest?.fromUser?.elo && (
              <Text style={styles.modalElo}>
                ELO: {pendingRequest.fromUser.elo.toLocaleString()}
              </Text>
            )}
            <Text style={styles.modalWarning}>
              Esta acción no se puede deshacer.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={handleCancelReject}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.rejectButton]} 
                onPress={handleConfirmReject}
              >
                <Text style={styles.rejectButtonText}>Rechazar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#6F4E37',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  requestsSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    maxWidth: 350,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6F4E37',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  modalElo: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  modalWarning: {
    fontSize: 14,
    color: '#dc3545',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FriendRequestsScreen;
