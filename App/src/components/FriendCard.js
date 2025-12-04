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
    hasRequestData: !!requestData
  });

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

      {/* Botones de acción */}
      {(onSendRequest || onAccept || onReject) && (
        <View style={styles.actionSection}>
          {onSendRequest && (
            <TouchableOpacity style={styles.sendButton} onPress={() => onSendRequest(user)}>
              <Text style={styles.sendButtonText}>✉️ Enviar Solicitud</Text>
            </TouchableOpacity>
          )}

          {onAccept && (
            <TouchableOpacity style={styles.acceptButton} onPress={() => {
              console.log('🔍 DEBUG - Accept button clicked with:', { user, requestData });
              onAccept(requestData || user);
            }}>
              <Text style={styles.acceptButtonText}>✅ Aceptar</Text>
            </TouchableOpacity>
          )}

          {onReject && (
            <TouchableOpacity 
              style={styles.rejectButton} 
              onPress={() => {
                console.log('� FriendCard - Reject button pressed!');
                console.log('🔍 Available data:', { user, requestData });
                console.log('🔍 onReject function:', typeof onReject);
                
                try {
                  const dataToPass = requestData || user;
                  console.log('🚀 Calling onReject with:', dataToPass);
                  onReject(dataToPass);
                } catch (error) {
                  console.error('❌ Error calling onReject:', error);
                  Alert.alert('Error', 'Error al llamar función onReject: ' + error.message);
                }
              }}
            >
              <Text style={styles.rejectButtonText}>❌ Rechazar</Text>
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
