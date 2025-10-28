import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Modal } from 'react-native';
import FriendCard from '../../components/FriendCard';
import { useFriendController } from '../../controllers/useFriendController';
import { useAuth } from '../../controllers/AuthContext';

const FriendsScreen = () => {
  const auth = useAuth();
  const friendCtrl = useFriendController(auth.user);
  const [email, setEmail] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sentToUser, setSentToUser] = useState(null);

  useEffect(() => {
    friendCtrl.loadFriends();
  }, []);

  const onSearch = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }
    
    setHasSearched(true);
    await friendCtrl.searchByEmail(email.trim());
  };

  const onEmailChange = (text) => {
    setEmail(text);
    // Solo limpiar si ya se había buscado
    if (hasSearched) {
      setHasSearched(false);
      friendCtrl.clearSearchResult();
    }
  };

  const onSend = async (user) => {
    // Validaciones antes de enviar
    if (!user || !user.id) {
      Alert.alert('Error', 'No se puede enviar solicitud. Datos de usuario incompletos.');
      return;
    }

    if (!auth.user || !auth.user.id) {
      Alert.alert('Error', 'Debes estar logueado para enviar solicitudes de amistad.');
      return;
    }

    if (user.id === auth.user.id) {
      Alert.alert('Error', 'No puedes enviarte una solicitud de amistad a ti mismo.');
      return;
    }

    try {
      const result = await friendCtrl.sendRequest(user.id);
      
      // Verificar que la solicitud se envió correctamente
      if (result) {
        setSentToUser(user);
        setShowSuccessModal(true);
        
        // Limpiar búsqueda después de enviar exitosamente
        setEmail('');
        setHasSearched(false);
        friendCtrl.clearSearchResult();
      } else {
        Alert.alert('Error', 'No se pudo enviar la solicitud. Intenta nuevamente.');
      }
    } catch (err) {
      console.error('Error enviando solicitud:', err);
      
      // Mensajes de error más específicos
      let errorMessage = 'Error enviando solicitud';
      if (err.message.includes('Ya son amigos')) {
        errorMessage = 'Ya son amigos';
      } else if (err.message.includes('solicitud pendiente')) {
        errorMessage = 'Ya existe una solicitud pendiente con este usuario';
      } else if (err.message.includes('no encontrado')) {
        errorMessage = 'Usuario no encontrado';
      } else {
        errorMessage = err.message || 'Error desconocido. Intenta nuevamente.';
      }
      
      Alert.alert('❌ Error', errorMessage);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setSentToUser(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.mainTitle}>🎮 Buscar Amigos</Text>
        <Text style={styles.subtitle}>Encuentra jugadores por su email</Text>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            value={email}
            onChangeText={onEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={[styles.searchBtn, !email.trim() && styles.searchBtnDisabled]} 
            onPress={onSearch}
            disabled={!email.trim()}
          >
            <Text style={styles.searchBtnText}>🔍 Buscar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Results */}
      <View style={styles.resultsSection}>
        {friendCtrl.isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>🔍 Buscando jugador...</Text>
          </View>
        ) : hasSearched && friendCtrl.searchResult ? (
          <View style={styles.searchResultContainer}>
            <Text style={styles.resultTitle}>� Jugador encontrado:</Text>
            <FriendCard user={friendCtrl.searchResult} onSendRequest={onSend} />
          </View>
        ) : hasSearched && !friendCtrl.searchResult && !friendCtrl.isLoading ? (
          <View style={styles.noResultContainer}>
            <Text style={styles.noResultIcon}>😕</Text>
            <Text style={styles.noResultText}>No se encontró ningún jugador</Text>
            <Text style={styles.noResultHint}>
              Verifica que el email esté escrito correctamente
            </Text>
          </View>
        ) : !hasSearched ? (
          <View style={styles.initialStateContainer}>
            <Text style={styles.initialStateIcon}>�</Text>
            <Text style={styles.initialStateText}>
              Ingresa un email para buscar jugadores
            </Text>
          </View>
        ) : null}
      </View>

      {/* Friends List */}
      <View style={styles.friendsSection}>
        <Text style={styles.sectionTitle}>👫 Tus Amigos ({friendCtrl.friends.length})</Text>
        <FlatList
          data={friendCtrl.friends}
          keyExtractor={(item) => item.id?.toString() || item.email}
          renderItem={({ item }) => <FriendCard user={item} showElo={true} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyFriendsContainer}>
              <Text style={styles.emptyFriendsIcon}>🤝</Text>
              <Text style={styles.emptyFriendsText}>No tienes amigos aún</Text>
              <Text style={styles.emptyFriendsHint}>
                ¡Busca jugadores por email y envía solicitudes!
              </Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeSuccessModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalIcon}>🎉</Text>
            <Text style={styles.modalTitle}>¡Solicitud Enviada Exitosamente!</Text>
            <Text style={styles.modalMessage}>
              Se ha enviado una solicitud de amistad a{'\n'}
              <Text style={styles.modalUserName}>
                {sentToUser?.name || sentToUser?.email || 'el usuario'}
              </Text>
              {'\n\n'}
              Recibirás una notificación cuando {sentToUser?.name ? 'responda' : 'el usuario responda'} a tu solicitud.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeSuccessModal}>
              <Text style={styles.modalButtonText}>¡Perfecto!</Text>
            </TouchableOpacity>
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
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  searchBtn: {
    backgroundColor: '#6F4E37',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  searchBtnDisabled: {
    backgroundColor: '#ccc',
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    fontSize: 16,
    color: '#6F4E37',
    fontWeight: '500',
  },
  searchResultContainer: {
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 12,
    textAlign: 'center',
  },
  noResultContainer: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noResultIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noResultText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 8,
  },
  noResultHint: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  initialStateContainer: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#FFD166',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  initialStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  initialStateText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  friendsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyFriendsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyFriendsIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyFriendsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyFriendsHint: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalUserName: {
    fontWeight: 'bold',
    color: '#6F4E37',
  },
  modalButton: {
    backgroundColor: '#6F4E37',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FriendsScreen;
