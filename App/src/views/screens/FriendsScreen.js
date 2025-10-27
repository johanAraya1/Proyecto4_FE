import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import FriendCard from '../../components/FriendCard';
import { useFriendController } from '../../controllers/useFriendController';
import { useAuth } from '../../controllers/AuthContext';

const FriendsScreen = () => {
  const auth = useAuth();
  const friendCtrl = useFriendController(auth.user);
  const [email, setEmail] = useState('');

  useEffect(() => {
    friendCtrl.loadFriends();
  }, []);

  const onSearch = async () => {
    await friendCtrl.searchByEmail(email);
  };

  const onSend = async (user) => {
    try {
      await friendCtrl.sendRequest(user.id);
      Alert.alert('Solicitud enviada');
    } catch (err) {
      Alert.alert('Error', 'Error enviando solicitud: ' + (err.message || ''));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscar jugador por email</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="correo@ejemplo.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.btn} onPress={onSearch}>
          <Text style={styles.btnText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {friendCtrl.searchResult ? (
        <FriendCard user={friendCtrl.searchResult} onSendRequest={onSend} />
      ) : (
        <Text style={styles.hint}>Ningún resultado. Intenta buscar por correo.</Text>
      )}

      <Text style={[styles.title, { marginTop: 16 }]}>Tus amigos</Text>
      <FlatList
        data={friendCtrl.friends}
        keyExtractor={(i) => i.id?.toString() || i.email}
        renderItem={({ item }) => <FriendCard user={item} />}
        ListEmptyComponent={() => <Text style={styles.hint}>No tienes amigos aún</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f2f2f2' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  input: { flex: 1, backgroundColor: '#fff', padding: 10, borderRadius: 6 },
  row: { flexDirection: 'row', alignItems: 'center' },
  btn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 6, marginLeft: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  hint: { color: '#666', marginTop: 8 },
});

export default FriendsScreen;
