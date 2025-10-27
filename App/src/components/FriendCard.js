import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const FriendCard = ({ user, onSendRequest, onAccept }) => {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{user?.name || user?.email}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {onSendRequest && (
        <TouchableOpacity style={styles.button} onPress={() => onSendRequest(user)}>
          <Text style={styles.buttonText}>Enviar</Text>
        </TouchableOpacity>
      )}

      {onAccept && (
        <TouchableOpacity style={[styles.button, styles.accept]} onPress={() => onAccept(user)}>
          <Text style={styles.buttonText}>Aceptar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  name: { fontSize: 16, fontWeight: '600' },
  email: { fontSize: 12, color: '#666' },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  accept: { backgroundColor: '#28a745' },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default FriendCard;
