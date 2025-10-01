import { useState } from 'react';
import { User } from '../models/User';
import authService from '../services/authService';

/**
 * Hook controlador para la autenticación - Parte "Controller" de MVC
 * Maneja la lógica de negocio entre el modelo User y las vistas de autenticación
 * @returns {Object} - Objeto con estado y funciones para manejar autenticación
 */
export const useAuthController = () => {
  // Estados del controlador
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Realiza el proceso de login
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<boolean>} - Promesa que resuelve verdadero si el login fue exitoso
   */
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);

      // Crear instancia del modelo User
      const userModel = new User(email, password);
      
      // Validar datos antes de enviar
      if (!userModel.isValid()) {
        throw new Error('Por favor ingresa un email y contraseña válidos');
      }

      // Llamar al servicio de autenticación
      const response = await authService.login(userModel);
      
      if (response.success) {
        // Actualizar estado con datos del usuario autenticado
        setUser(response.user);
        setIsAuthenticated(true);
        
        console.log('✅ Usuario autenticado:', response.user);
        console.log('✅ Rol del usuario:', response.user?.role);
        
        // Aquí puedes guardar el token en AsyncStorage si es necesario
        // await AsyncStorage.setItem('authToken', response.token);
        
        return true;
      } else {
        throw new Error('Error en la autenticación');
      }
    } catch (err) {
      console.log('❌ Error en login:', err.message);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Realiza el proceso de logout
   * @returns {Promise<boolean>} - Promesa que resuelve verdadero si el logout fue exitoso
   */
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Llamar al servicio de logout
      await authService.logout();
      
      // Limpiar estado local
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      // Limpiar token almacenado
      // await AsyncStorage.removeItem('authToken');
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Limpia el mensaje de error actual
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Valida los campos de email y contraseña
   * @param {string} email - Email a validar
   * @param {string} password - Contraseña a validar
   * @returns {Object} - Objeto con errores de validación
   */
  const validateFields = (email, password) => {
    const errors = {};
    
    if (!email || !email.trim()) {
      errors.email = 'El email es requerido';
    } else {
      const tempUser = new User(email, password);
      if (!tempUser.isValidEmail()) {
        errors.email = 'El formato del email no es válido';
      }
    }
    
    if (!password || !password.trim()) {
      errors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    return errors;
  };

  /**
   * Restaurar sesión desde token almacenado (para persistencia)
   * @returns {Promise<boolean>} - Promesa que resuelve verdadero si se restauró la sesión
   */
  const restoreSession = async () => {
    try {
      setIsLoading(true);
      
      // Aquí recuperarías el token de AsyncStorage
      // const token = await AsyncStorage.getItem('authToken');
      // if (token && await authService.validateSession(token)) {
      //   setIsAuthenticated(true);
      //   return true;
      // }
      
      return false;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Retornar API pública del controlador
  return {
    // Estados
    isLoading,
    error,
    user,
    isAuthenticated,
    
    // Acciones
    login,
    logout,
    clearError,
    validateFields,
    restoreSession
  };
};