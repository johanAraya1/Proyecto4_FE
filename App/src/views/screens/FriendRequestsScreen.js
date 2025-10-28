import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import FriendCard from '../../components/FriendCard';
import { useFriendController } from '../../controllers/useFriendController';
import { useAuth } from '../../controllers/AuthContext';

const FriendRequestsScreen = () => {
  const auth = useAuth();
  const friendCtrl = useFriendController(auth.user);

  useEffect(() => {
    friendCtrl.loadRequests();
  }, []);

  const onAccept = async (request) => {
    // Validaciones antes de aceptar
    if (!request || !request.id) {
      Alert.alert('Error', 'No se puede aceptar la solicitud. Datos incompletos.');
      return;
    }

    if (!auth.user || !auth.user.id) {
      Alert.alert('Error', 'Debes estar logueado para aceptar solicitudes.');
      return;
    }

    try {
      const result = await friendCtrl.acceptRequest(request.id);
      
      if (result) {
        const userName = request.fromUser?.name || request.fromUser?.email || 'el usuario';
        Alert.alert(
          '✅ ¡Solicitud Aceptada!', 
          `${userName} ahora es tu amigo. ¡Pueden jugar juntos!`,
          [{ text: 'Genial', style: 'default' }]
        );
      } else {
        Alert.alert('Error', 'No se pudo aceptar la solicitud. Intenta nuevamente.');
      }
    } catch (err) {
      console.error('Error aceptando solicitud:', err);
      
      let errorMessage = 'Error aceptando solicitud';
      if (err.message.includes('no encontrada')) {
        errorMessage = 'La solicitud ya no está disponible';
      } else if (err.message.includes('no válida')) {
        errorMessage = 'La solicitud no es válida';
      } else {
        errorMessage = err.message || 'Error desconocido. Intenta nuevamente.';
      }
      
      Alert.alert('❌ Error', errorMessage);
    }
  };

  const onReject = async (request) => {
    // Validaciones antes de rechazar
    if (!request || !request.id) {
      Alert.alert('Error', 'No se puede rechazar la solicitud. Datos incompletos.');
      return;
    }

    if (!auth.user || !auth.user.id) {
      Alert.alert('Error', 'Debes estar logueado para rechazar solicitudes.');
      return;
    }

    // Confirmación antes de rechazar
    const userName = request.fromUser?.name || request.fromUser?.email || 'este usuario';
    
    Alert.alert(
      '🤔 Confirmar Rechazo',
      `¿Estás seguro de que quieres rechazar la solicitud de ${userName}?`,
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
              const result = await friendCtrl.rejectRequest(request.id);
              
              if (result) {
                Alert.alert(
                  '❌ Solicitud Rechazada', 
                  `La solicitud de ${userName} ha sido rechazada.`,
                  [{ text: 'Entendido', style: 'default' }]
                );
              } else {
                Alert.alert('Error', 'No se pudo rechazar la solicitud. Intenta nuevamente.');
              }
            } catch (err) {
              console.error('Error rechazando solicitud:', err);
              
              let errorMessage = 'Error rechazando solicitud';
              if (err.message.includes('no encontrada')) {
                errorMessage = 'La solicitud ya no está disponible';
              } else if (err.message.includes('no válida')) {
                errorMessage = 'La solicitud no es válida';
              } else {
                errorMessage = err.message || 'Error desconocido. Intenta nuevamente.';
              }
              
              Alert.alert('❌ Error', errorMessage);
            }
          }
        }
      ]
    );
  };

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
});

export default FriendRequestsScreen;
