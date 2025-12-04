import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

/**
 * Componente reutilizable para indicador de carga
 * Muestra spinner con mensaje opcional
 */
const LoadingSpinner = ({
  visible = true,
  message = 'Cargando...',
  size = 'large',
  color = '#007AFF',
  overlay = false,
  style = {},
  textStyle = {},
}) => {
  if (!visible) return null;

  const containerStyle = overlay
    ? [styles.overlay, style]
    : [styles.container, style];

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} style={styles.spinner} />
      {message && <Text style={[styles.message, textStyle]}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  spinner: {
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default LoadingSpinner;
