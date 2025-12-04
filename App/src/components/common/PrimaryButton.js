import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';

/**
 * Componente PrimaryButton Reutilizable
 * Botón principal con loading state y estilos consistentes
 */
const PrimaryButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
  fullWidth = true,
}) => {
  const isDisabled = disabled || loading;
  
  const buttonStyles = [
    styles.button,
    fullWidth && styles.buttonFullWidth,
    variant === 'secondary' && styles.buttonSecondary,
    variant === 'outline' && styles.buttonOutline,
    isDisabled && styles.buttonDisabled,
    style,
  ];
  
  const textStyles = [
    styles.buttonText,
    variant === 'secondary' && styles.buttonTextSecondary,
    variant === 'outline' && styles.buttonTextOutline,
    isDisabled && styles.buttonTextDisabled,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#2196F3' : '#fff'} size="small" />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: Platform.OS === 'web' ? 48 : 50,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  buttonFullWidth: {
    width: '100%',
  },
  
  buttonSecondary: {
    backgroundColor: '#4CAF50',
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  buttonTextSecondary: {
    color: '#fff',
  },
  
  buttonTextOutline: {
    color: '#2196F3',
  },
  
  buttonTextDisabled: {
    color: '#999',
  },
});

export default PrimaryButton;
