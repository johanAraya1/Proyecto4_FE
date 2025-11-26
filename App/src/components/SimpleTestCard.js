import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const SimpleTestCard = ({ user, onReject, requestData }) => {
  const displayName = user?.name || user?.email || 'Usuario Test';

  const testReject = () => {
    console.log('🟥 BOTÓN DE PRUEBA PRESIONADO');
    Alert.alert('🧪 Prueba', `Botón funcionando!\nUsuario: ${displayName}`);
  };

  const actualReject = () => {
    console.log('🔴 BOTÓN REAL PRESIONADO');
    console.log('Datos:', { user, requestData });
    
    if (onReject) {
      console.log('Llamando onReject...');
      onReject(requestData || user);
    } else {
      Alert.alert('Error', 'onReject no está definido');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 TEST CARD</Text>
      <Text style={styles.subtitle}>{displayName}</Text>
      
      {/* Botón de prueba simple */}
      <TouchableOpacity style={styles.testButton} onPress={testReject}>
        <Text style={styles.buttonText}>🟥 BOTÓN DE PRUEBA</Text>
      </TouchableOpacity>
      
      {/* Botón real */}
      {onReject && (
        <TouchableOpacity style={styles.realButton} onPress={actualReject}>
          <Text style={styles.buttonText}>🔴 BOTÓN REAL - RECHAZAR</Text>
        </TouchableOpacity>
      )}
      
      {!onReject && (
        <Text style={styles.error}>❌ onReject no está definido</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ff0000',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  testButton: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  realButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: '#ff0000',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default SimpleTestCard;