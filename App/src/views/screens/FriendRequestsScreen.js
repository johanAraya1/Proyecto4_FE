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
    try {
      await friendCtrl.acceptRequest(request.id);
      Alert.alert('Solicitud aceptada');
    } catch (err) {
      Alert.alert('Error', 'Error aceptando solicitud: ' + (err.message || ''));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solicitudes entrantes</Text>
      <FlatList
        data={friendCtrl.requests}
        keyExtractor={(i) => i.id?.toString() || i.email}
        renderItem={({ item }) => <FriendCard user={item.fromUser} onAccept={() => onAccept(item)} />}
        ListEmptyComponent={() => <Text style={styles.hint}>No hay solicitudes</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f2f2f2' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  hint: { color: '#666', marginTop: 8 },
});

export default FriendRequestsScreen;
