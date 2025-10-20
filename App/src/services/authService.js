import { User } from '../models/User';
import { ApiClient } from './ApiClient';

/**
 * Servicio de autenticación - maneja la comunicación con el backend
 * Capa de servicios para operaciones de autenticación
 */
class AuthService {
  /**
   * Constructor del servicio de autenticación
   * Configura el cliente API
   */
  constructor() {
    this.apiClient = new ApiClient();
  }

  /**
   * Realiza el login del usuario enviando credenciales al backend
   * @param {User} user - Instancia del modelo User con email y password
   * @returns {Promise<Object>} - Promesa que resuelve con la respuesta del servidor
   * @throws {Error} - Lanza error si las credenciales son inválidas o hay problemas de red
   */
  async login(user) {
    // Validar datos antes de enviar
    if (!user.isValid()) {
      throw new Error('Email o contraseña inválidos');
    }

    // Realizar petición al endpoint de login
    const response = await this.apiClient.post(
      '/auth/login',
      user.toApiObject()
    );

    // Verificar respuesta exitosa
    if (response.status === 200 && response.data) {
      // Los datos vienen directamente en response.data según la estructura proporcionada
      const userData = response.data;

      return {
        success: true,
        data: response.data,
        user: User.fromApiResponse(userData),
        token: userData.token || null,
      };
    } else {
      throw new Error('Respuesta inválida del servidor');
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
    } catch (error) {
      // Permitir logout local aunque falle el servidor
    }
    return true;
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
          Authorization: `Bearer ${token}`,
        },
      });

      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

// Exportar instancia singleton del servicio
export const authService = new AuthService();
export default authService;
