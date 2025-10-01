import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions
} from 'react-native';
import { useAuth } from '../../controllers/AuthContext';
import { theme } from '../../config/theme';

/**
 * Pantalla de Login - Parte "Vista" de la arquitectura MVC
 * Permite al usuario ingresar sus credenciales para autenticarse
 */
const LoginScreen = ({ navigation }) => {
  // Estados locales para los campos de entrada
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Usar el controlador de autenticación
  const { login, isLoading, error, clearError } = useAuth();

  /**
   * Maneja el proceso de login cuando se presiona el botón
   */
  const handleLogin = async () => {
    try {
      // Limpiar errores previos
      clearError();
      setFieldErrors({});

      // Validar campos localmente
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }

      // Intentar hacer login
      const success = await login(email.trim(), password);
      
      if (success) {
        // Navegar al Dashboard si el login fue exitoso
        navigation.replace('Dashboard');
      } else {
        // El error se maneja automáticamente por el controlador
        Alert.alert('Error', error || 'No se pudo iniciar sesión');
      }
    } catch (err) {
      Alert.alert('Error', 'Ocurrió un error inesperado');
    }
  };

  /**
   * Valida los campos del formulario
   * @returns {Object} - Objeto con errores de validación
   */
  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'El formato del email no es válido';
    }

    if (!password.trim()) {
      errors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    return errors;
  };

  /**
   * Maneja los cambios en el campo de email
   */
  const handleEmailChange = (text) => {
    setEmail(text);
    // Limpiar error del campo si existe
    if (fieldErrors.email) {
      setFieldErrors(prev => ({ ...prev, email: null }));
    }
  };

  /**
   * Maneja los cambios en el campo de contraseña
   */
  const handlePasswordChange = (text) => {
    setPassword(text);
    // Limpiar error del campo si existe
    if (fieldErrors.password) {
      setFieldErrors(prev => ({ ...prev, password: null }));
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
          {/* Logo de CoffeeCenfo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/images/logoSinFondo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.brandName}>CoffeeCenfo</Text>
          </View>

          {/* Eslogan */}
          <Text style={styles.tagline}>Conviértete en el mejor barista</Text>

          {/* Campo de Email */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
            />
          </View>

          {/* Campo de Contraseña */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry
              autoComplete="password"
              editable={!isLoading}
            />
          </View>

          {/* Enlace de contraseña olvidada */}
          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          {/* Mensaje de error global */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Botón de Login */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#F5F5F5" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Ingresar</Text>
            )}
          </TouchableOpacity>

          {/* Separador "O ingresa con" */}
          <Text style={styles.separatorText}>O ingresa con</Text>

          {/* Botón de Google */}
          <TouchableOpacity style={styles.googleButton}>
            <Text style={styles.googleText}>G</Text>
            <Text style={styles.googleButtonText}>Google</Text>
          </TouchableOpacity>

          {/* Enlace de registro */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No tiene cuenta? </Text>
            <TouchableOpacity>
              <Text style={styles.registerLink}>Regístrate</Text>
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
    backgroundColor: '#F5F5F5', // NEUTRO
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    alignItems: 'center', // Centrar en web
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
    width: Platform.OS === 'web' ? Math.min(400, Dimensions.get('window').width - 48) : '100%',
    maxWidth: Platform.OS === 'web' ? 400 : '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  brandName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6F4E37', // PRINCIPAL
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#FFD166', // SECUNDARIO
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#FFD166', // SECUNDARIO
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  errorContainer: {
    width: '100%',
    marginBottom: 16,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#6F4E37', // PRINCIPAL
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonDisabled: {
    backgroundColor: '#B8A196',
  },
  loginButtonText: {
    color: '#F5F5F5', // NEUTRO
    fontSize: 16,
    fontWeight: '600',
  },
  separatorText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  googleButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  googleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4285F4',
    marginRight: 12,
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
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
    color: '#FFD166', // SECUNDARIO
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;