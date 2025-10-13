import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useAuth } from '../../controllers/AuthContext';
import { Dimensions } from 'react-native';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [feedback, setFeedback] = useState({ visible: false, message: '', type: '' });
  const feedbackTimer = useRef(null);

  const { register, isLoading, error, clearError } = useAuth();

  const validateForm = () => {
    const errors = {};
    if (!name.trim()) errors.name = 'El nombre es requerido';
    if (!email.trim()) errors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email inválido';
    if (!password.trim()) errors.password = 'La contraseña es requerida';
    else if (password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres';
    return errors;
  };

  const handleRegister = async () => {
    console.log('Register button pressed');
    clearError();
    setFieldErrors({});

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      console.log('Validation errors:', errors);
      return;
    }

    // Llamada al controlador
    const result = await register(name.trim(), email.trim(), password);
    console.log('Register result:', result);

    if (result && result.success) {
      // Mostrar banner verde y redirigir a Login tras 2.5s
      setFeedback({ visible: true, message: 'Cuenta creada correctamente', type: 'success' });
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
      feedbackTimer.current = setTimeout(() => {
        setFeedback({ visible: false, message: '', type: '' });
        navigation.replace('Login');
      }, 2500);
    } else {
      const message = result?.message || error || 'No se pudo registrar';
      // Mostrar banner rojo
      setFeedback({ visible: true, message, type: 'error' });
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
      feedbackTimer.current = setTimeout(() => {
        setFeedback({ visible: false, message: '', type: '' });
      }, 3000);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {feedback.visible && (
            <View style={[styles.feedback, feedback.type === 'success' ? styles.feedbackSuccess : styles.feedbackError]}>
              <Text style={styles.feedbackText}>{feedback.message}</Text>
            </View>
          )}
          <Text style={styles.title}>Crear cuenta</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={name}
              onChangeText={(t) => { setName(t); if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: null })); }}
              editable={!isLoading}
            />
            {fieldErrors.name && <Text style={styles.fieldError}>{fieldErrors.name}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(t) => { setEmail(t); if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: null })); }}
              editable={!isLoading}
            />
            {fieldErrors.email && <Text style={styles.fieldError}>{fieldErrors.email}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={(t) => { setPassword(t); if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: null })); }}
              editable={!isLoading}
            />
            {fieldErrors.password && <Text style={styles.fieldError}>{fieldErrors.password}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#F5F5F5" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.replace('Login')}>
              <Text style={styles.registerLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
    width: Platform.OS === 'web' ? Math.min(400, Dimensions.get('window').width - 48) : '100%',
    maxWidth: Platform.OS === 'web' ? 400 : '100%',
  },
  title: {
    fontSize: 22,
    color: '#6F4E37',
    fontWeight: '700',
    marginBottom: 16,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#333',
  },
  fieldError: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 6,
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#6F4E37',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#B8A196',
  },
  loginButtonText: {
    color: '#F5F5F5',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLink: {
    color: '#FFD166',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  feedback: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  feedbackSuccess: {
    backgroundColor: '#2ecc71',
  },
  feedbackError: {
    backgroundColor: '#e74c3c',
  },
  feedbackText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default RegisterScreen;
