import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useAuth } from '../../controllers/AuthContext';
import { CustomModal, FormInput, PrimaryButton } from '../../components/common';
import { useCustomModal } from '../../hooks/useCustomModal';
import GoogleLogo from '../../components/GoogleLogo';
import styles from '../../styles/LoginScreen.styles';

// Constantes de configuración
const FORM_CONFIG = {
  EMAIL_MIN_LENGTH: 3,
  PASSWORD_MIN_LENGTH: 6,
  MAX_FORM_WIDTH: 400,
};

const EMAIL_REGEX = /\S+@\S+\.\S+/;

/**
 * Pantalla de Login 
 */
const LoginScreen = ({ navigation }) => {
  // Estados locales para los campos de entrada
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Usar el controlador de autenticación
  const { login, isLoading, error, clearError } = useAuth();

  // Hook para modales personalizados
  const { modalVisible, modalData, showErrorModal, hideModal } =
    useCustomModal();

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
        showErrorModal('Error', error || 'No se pudo iniciar sesión');
      }
    } catch (err) {
      showErrorModal('Error', 'Ocurrió un error inesperado');
    }
  };

  /**
   * Valida un campo de email
   * @param {string} value - Email a validar
   * @returns {string|null} - Mensaje de error o null si es válido
   */
  const validateEmail = (value) => {
    if (!value.trim()) return 'El email es requerido';
    if (!EMAIL_REGEX.test(value)) return 'El formato del email no es válido';
    return null;
  };

  /**
   * Valida un campo de contraseña
   * @param {string} value - Contraseña a validar
   * @returns {string|null} - Mensaje de error o null si es válido
   */
  const validatePassword = (value) => {
    if (!value.trim()) return 'La contraseña es requerida';
    if (value.length < FORM_CONFIG.PASSWORD_MIN_LENGTH) {
      return `La contraseña debe tener al menos ${FORM_CONFIG.PASSWORD_MIN_LENGTH} caracteres`;
    }
    return null;
  };

  /**
   * Valida los campos del formulario
   * @returns {Object} - Objeto con errores de validación
   */
  const validateForm = () => {
    const errors = {};
    
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;

    return errors;
  };

  /**
   * Maneja los cambios en el campo de email
   */
  const handleEmailChange = (text) => {
    setEmail(text);
    // Limpiar error del campo si existe
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: null }));
    }
  };

  /**
   * Maneja los cambios en el campo de contraseña
   */
  const handlePasswordChange = (text) => {
    setPassword(text);
    // Limpiar error del campo si existe
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: null }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* Logo de CoffeeCenfo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/images/logoSinFondo.png')}
              style={styles.logoImage}
              resizeMode='contain'
            />
            <Text style={styles.brandName}>CoffeeCenfo</Text>
          </View>

          {/* Eslogan */}
          <Text style={styles.tagline}>Conviértete en el mejor barista</Text>

          {/* Campo de Email */}
          <FormInput
            placeholder='Email'
            value={email}
            onChangeText={handleEmailChange}
            keyboardType='email-address'
            autoCapitalize='none'
            autoComplete='email'
            editable={!isLoading}
            error={fieldErrors.email}
          />

          {/* Campo de Contraseña */}
          <FormInput
            placeholder='Password'
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry
            autoComplete='password'
            editable={!isLoading}
            error={fieldErrors.password}
          />

          {/* Enlace de contraseña olvidada */}
          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          {/* Mensaje de error global */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Botón de Login */}
          <PrimaryButton
            title='Ingresar'
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
          />

          {/* Separador "O ingresa con" */}
          <Text style={styles.separatorText}>O ingresa con</Text>

          {/* Botón de Google */}
          <TouchableOpacity style={styles.googleButton}>
            <View style={styles.googleIconContainer}>
              <GoogleLogo size={18} />
            </View>
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </TouchableOpacity>

          {/* Enlace de registro */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No tiene cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal personalizado */}
      <CustomModal
        visible={modalVisible}
        title={modalData.title}
        message={modalData.message}
        type={modalData.type}
        onClose={hideModal}
        confirmText={modalData.confirmText}
      />
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
