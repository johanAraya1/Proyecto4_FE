import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const FriendCard = ({ user, onSendRequest, onAccept, onReject, showElo = true, rank = null, requestData = null }) => {
  // Obtener nombre para mostrar, con fallback a email si no hay nombre
  const displayName = user?.name || user?.email?.split('@')[0] || 'Usuario';
  const userElo = user?.elo || 0;
  const userEmail = user?.email || 'Sin email';

  // Debug para ver qué datos estamos recibiendo
  console.log('🎯 DEBUG FriendCard user data:', {
    user,
    requestData,
    displayName,
    userElo,
    userEmail,
    hasName: !!user?.name,
    hasEmail: !!user?.email,
    hasElo: !!user?.elo,
    hasRequestData: !!requestData,
    hasOnReject: !!onReject,
    hasOnAccept: !!onAccept
  });

  // Función de prueba para el botón de rechazar
  const handleRejectPress = () => {
    console.log('🔴 REJECT BUTTON PRESSED!');
    console.log('🔍 Data available:', { user, requestData });
    
    // Mostrar alert simple primero para confirmar que el botón funciona
    Alert.alert(
      '🧪 Test Debug', 
      'El botón de rechazar SÍ está funcionando!\n\nDatos:\n' + 
      `Usuario: ${displayName}\n` +
      `Request ID: ${requestData?.id || 'No disponible'}\n` +
      `Has onReject function: ${!!onReject}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Continuar con rechazo', 
          onPress: () => {
            if (onReject) {
              console.log('🚀 Calling onReject with:', requestData || user);
              onReject(requestData || user);
            } else {
              console.error('❌ onReject function is not available!');
              Alert.alert('Error', 'Función onReject no disponible');
            }
          }
        }
      ]
    );
  };

  // Función de prueba para el botón de aceptar
  const handleAcceptPress = () => {
    console.log('🟢 ACCEPT BUTTON PRESSED!');
    console.log('🔍 Data available:', { user, requestData });
    
    if (onAccept) {
      console.log('🚀 Calling onAccept with:', requestData || user);
      onAccept(requestData || user);
    } else {
      console.error('❌ onAccept function is not available!');
      Alert.alert('Error', 'Función onAccept no disponible');
    }
  };

  return (
    <View style={styles.card}>
      {/* Sección principal del usuario */}
      <View style={styles.userMainSection}>
        {/* Avatar o ranking position */}
        <View style={styles.avatarContainer}>
          {rank ? (
            <View style={styles.rankContainer}>
              <Text style={styles.rankText}>{rank}</Text>
            </View>
          ) : (
            <View style={styles.playerIcon}>
              <Text style={styles.playerIconText}>👤</Text>
            </View>
          )}
        </View>

        {/* Información del usuario */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
          {showElo && (
            <View style={styles.eloRow}>
              <Text style={styles.eloLabel}>ELO:</Text>
              <Text style={styles.eloValue}>{userElo.toLocaleString()}</Text>
            </View>
          )}
        </View>

        {/* ELO Badge grande */}
        {showElo && userElo > 0 && (
          <View style={styles.eloBadge}>
            <Text style={styles.eloBadgeNumber}>{userElo.toLocaleString()}</Text>
            <Text style={styles.eloBadgeLabel}>ELO</Text>
          </View>
        )}
      </View>

      {/* Debug info visible */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          🧪 DEBUG: requestData={requestData ? 'SÍ' : 'NO'}, 
          onReject={onReject ? 'SÍ' : 'NO'}, 
          requestId={requestData?.id || 'N/A'}
        </Text>
      </View>

      {/* Botones de acción */}
      {(onSendRequest || onAccept || onReject) && (
        <View style={styles.actionSection}>
          {onSendRequest && (
            <TouchableOpacity style={styles.sendButton} onPress={() => onSendRequest(user)}>
              <Text style={styles.sendButtonText}>✉️ Enviar Solicitud</Text>
            </TouchableOpacity>
          )}

          {onAccept && (
            <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptPress}>
              <Text style={styles.acceptButtonText}>✅ Aceptar</Text>
            </TouchableOpacity>
          )}

          {onReject && (
            <TouchableOpacity style={styles.rejectButton} onPress={handleRejectPress}>
              <Text style={styles.rejectButtonText}>❌ Rechazar (DEBUG)</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  userMainSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
  },
  rankContainer: {
    backgroundColor: '#6F4E37',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  playerIcon: {
    backgroundColor: '#FFD166',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerIconText: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  eloRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eloLabel: {
    fontSize: 14,
    color: '#6F4E37',
    fontWeight: '600',
    marginRight: 4,
  },
  eloValue: {
    fontSize: 16,
    color: '#6F4E37',
    fontWeight: 'bold',
  },
  eloBadge: {
    backgroundColor: '#6F4E37',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 80,
  },
  eloBadgeNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  eloBadgeLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    opacity: 0.9,
  },
  debugInfo: {
    backgroundColor: '#e8f5e8',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#c3e6c3',
  },
  debugText: {
    fontSize: 12,
    color: '#2d5a2d',
    fontFamily: 'monospace',
  },
  actionSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  sendButton: {
    backgroundColor: '#6F4E37',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FriendCard;