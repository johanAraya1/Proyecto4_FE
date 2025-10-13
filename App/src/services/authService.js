import axios from 'axios';
import { User } from '../models/User';
import { Platform } from 'react-native';

/**
 * Función para determinar la URL correcta según la plataforma
 */
const getBaseURL = () => {
  if (Platform.OS === 'web') {
    // Para web, usar localhost directo
    return 'http://localhost:3000';
  } else if (Platform.OS === 'android') {
    // Para Android emulador, usar IP especial que mapea a localhost de la máquina host
    return 'http://10.0.2.2:3000';
  } else if (Platform.OS === 'ios') {
    // Para iOS simulator, usar localhost
    return 'http://localhost:3000';
  } else {
    // Fallback para dispositivo físico (usar IP de la máquina)
    return 'http://192.168.100.55:3000';
  }
};

/**
 * Servicio de autenticación - maneja la comunicación con el backend
 * Capa de servicios para operaciones de autenticación
 */
class AuthService {
  /**
   * Constructor del servicio de autenticación
   * Configura la URL base del API
   */
  constructor() {
    this.baseURL = getBaseURL();
    this.apiClient = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Realiza el login del usuario enviando credenciales al backend
   * @param {User} user - Instancia del modelo User con email y password
   * @returns {Promise<Object>} - Promesa que resuelve con la respuesta del servidor
   * @throws {Error} - Lanza error si las credenciales son inválidas o hay problemas de red
   */
  async login(user) {
    try {
      // Validar datos antes de enviar
      if (!user.isValid()) {
        throw new Error('Email o contraseña inválidos');
      }

      // Realizar petición al endpoint de login
      const response = await this.apiClient.post('/auth/login', user.toApiObject());
      
      // Verificar respuesta exitosa
      if (response.status === 200 && response.data) {
        // Los datos vienen directamente en response.data según la estructura proporcionada
        const userData = response.data;
        
        return {
          success: true,
          data: response.data,
          user: User.fromApiResponse(userData),
          token: userData.token || null
        };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      // Manejo de errores específicos
      if (error.response) {
        // Error del servidor (4xx, 5xx)
        const status = error.response.status;
        const message = error.response.data?.message || 'Error del servidor';
        
        if (status === 401) {
          throw new Error('Credenciales incorrectas');
        } else if (status === 404) {
          throw new Error('Servicio no disponible');
        } else {
          throw new Error(message);
        }
      } else if (error.request) {
        // Error de red
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      } else {
        // Error de validación u otro
        throw new Error(error.message || 'Error desconocido');
      }
    }
  }

  /**
   * Cierra la sesión del usuario
   * @returns {Promise<boolean>} - Promesa que resuelve verdadero si el logout fue exitoso
   */
  async logout() {
    try {
      // Aquí puedes agregar lógica para invalidar token en el servidor
      // await this.apiClient.post('/auth/logout');
      
      // Por ahora solo limpiamos datos locales
      return true;
    } catch (error) {
      console.warn('Error al cerrar sesión:', error.message);
      return true; // Permitir logout local aunque falle el servidor
    }
  }

  /**
   * Verifica si hay una sesión activa válida
   * @param {string} token - Token de autenticación
   * @returns {Promise<boolean>} - Promesa que resuelve verdadero si la sesión es válida
   */
  async validateSession(token) {
    try {
      if (!token) return false;
      
      const response = await this.apiClient.get('/auth/validate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Registra un nuevo usuario en el backend
   * @param {User} user - Instancia del modelo User con name/email/password
   * @returns {Promise<Object>} - { success, user, token, message }
   */
  async register(user) {
    try {
      // Validar datos localmente
      if (!user || !user.email || !user.password || !user.name) {
        throw new Error('Datos incompletos para el registro');
      }

      const payload = {
        name: user.name,
        email: user.email,
        password: user.password
      };

      const response = await this.apiClient.post('/auth/register', payload);

      if (response.status === 201 && response.data) {
        const userData = response.data;
        return {
          success: true,
          user: User.fromApiResponse(userData),
          token: userData.token || null
        };
      }

      return { success: false, message: response.data?.message || 'Error en registro' };
    } catch (error) {
      if (error.response) {
        const message = error.response.data?.message || 'Error del servidor';
        return { success: false, message };
      } else if (error.request) {
        return { success: false, message: 'Error de conexión. Verifica tu red.' };
      } else {
        return { success: false, message: error.message || 'Error desconocido' };
      }
    }
  }
}

// Exportar instancia singleton del servicio
export const authService = new AuthService();
export default authService;