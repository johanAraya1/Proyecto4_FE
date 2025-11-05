import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { navigateBack } from '../../utils/navigation';

/**
 * Componente reutilizable para botón de regreso
 * Estándar para todas las pantallas
 */
const BackButton = ({
  navigation,
  onPress = null,
  text = '← Volver',
  style = {},
  textStyle = {},
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigateBack(navigation);
    }
  };

  return (
    <TouchableOpacity style={[styles.backButton, style]} onPress={handlePress}>
      <Text style={[styles.backButtonText, textStyle]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#6C757D',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default BackButton;
