import React from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';

/**
 * 📝 Componente FormInput Reutilizable
 * Input de formulario con label, error y estilos consistentes
 */
const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete = 'off',
  textContentType = 'none',
  editable = true,
  maxLength,
  style,
  inputStyle,
}) => {
  return (
    <View style={[styles.inputContainer, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          !editable && styles.inputDisabled,
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        textContentType={textContentType}
        editable={editable}
        maxLength={maxLength}
      />
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
    width: '100%',
  },
  
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  
  input: {
    width: '100%',
    height: Platform.OS === 'web' ? 48 : 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default FormInput;
