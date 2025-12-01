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
import GoogleLogo from '../../components/GoogleLogo';

/**
 * Pantalla de Registro - Parte "Vista" de la arquitectura MVC
 * Permite al usuario crear una nueva cuenta
 */
const RegisterScreen = ({ navigation }) => {
  // Estados locales para los campos de entrada
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Usar el controlador de autenticación
  const { register, isLoading, error, clearError } = useAuth();

  /**
   * Maneja el proceso de registro cuando se presiona el botón
   */
  const handleRegister = async () => {
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

      // Intentar hacer registro
      const success = await register(email.trim(), password, username.trim());
      
      if (success) {
        // Mostrar mensaje de éxito
        Alert.alert(
          'Registro exitoso',
          'Tu cuenta ha sido creada. Por favor inicia sesión.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        // El error se maneja automáticamente por el controlador
        Alert.alert('Error', error || 'No se pudo completar el registro');
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

    if (!username.trim()) {
      errors.username = 'El nombre de usuario es requerido';
    } else if (username.trim().length < 3) {
      errors.username = 'El nombre debe tener al menos 3 caracteres';
    }

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

    if (!confirmPassword.trim()) {
      errors.confirmPassword = 'Debes confirmar la contraseña';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    return errors;
  };

  /**
   * Maneja los cambios en los campos
   */
  const handleFieldChange = (field, value) => {
    switch(field) {
      case 'username':
        setUsername(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }
    
    // Limpiar error del campo si existe
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: null }));
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

          {/* Título */}
          <Text style={styles.tagline}>Crea tu cuenta</Text>

          {/* Campo de Nombre de Usuario */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                fieldErrors.username && styles.inputError
              ]}
              placeholder="Nombre de usuario"
              placeholderTextColor="#999"
              value={username}
              onChangeText={(text) => handleFieldChange('username', text)}
              autoCapitalize="none"
              editable={!isLoading}
            />
            {fieldErrors.username && (
              <Text style={styles.fieldErrorText}>{fieldErrors.username}</Text>
            )}
          </View>

          {/* Campo de Email */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                fieldErrors.email && styles.inputError
              ]}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(text) => handleFieldChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
            />
            {fieldErrors.email && (
              <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
            )}
          </View>

          {/* Campo de Contraseña */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                fieldErrors.password && styles.inputError
              ]}
              placeholder="Contraseña"
              placeholderTextColor="#999"
              value={password}
              onChangeText={(text) => handleFieldChange('password', text)}
              secureTextEntry
              autoComplete="password-new"
              editable={!isLoading}
            />
            {fieldErrors.password && (
              <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
            )}
          </View>

          {/* Campo de Confirmar Contraseña */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                fieldErrors.confirmPassword && styles.inputError
              ]}
              placeholder="Confirmar contraseña"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={(text) => handleFieldChange('confirmPassword', text)}
              secureTextEntry
              autoComplete="password-new"
              editable={!isLoading}
            />
            {fieldErrors.confirmPassword && (
              <Text style={styles.fieldErrorText}>{fieldErrors.confirmPassword}</Text>
            )}
          </View>

          {/* Mensaje de error global */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Botón de Registro */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              isLoading && styles.registerButtonDisabled
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#F5F5F5" size="small" />
            ) : (
              <Text style={styles.registerButtonText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>

          {/* Separador "O regístrate con" */}
          <Text style={styles.separatorText}>O regístrate con</Text>

          {/* Botón de Google */}
          <TouchableOpacity style={styles.googleButton}>
            <View style={styles.googleIconContainer}>
              <GoogleLogo size={18} />
            </View>
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </TouchableOpacity>

          {/* Enlace de login */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
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
    paddingVertical: 32,
    alignItems: 'center',
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
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  brandName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6F4E37', // PRINCIPAL
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
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
  inputError: {
    borderColor: '#E74C3C',
  },
  fieldErrorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
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
  registerButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#6F4E37', // PRINCIPAL
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  registerButtonDisabled: {
    backgroundColor: '#B8A196',
  },
  registerButtonText: {
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
    borderColor: '#DADCE0',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleIconContainer: {
    width: 18,
    height: 18,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#3c4043',
    fontSize: 16,
    fontWeight: 'normal',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#FFD166', // SECUNDARIO
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;
