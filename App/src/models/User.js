/**
 * Modelo de entidad User - representa un usuario en el sistema
 * Parte del "Modelo" en la arquitectura MVC
 */
export class User {
  /**
   * Constructor de la clase User
   * @param {string} email - Correo electrónico del usuario
   * @param {string} password - Contraseña del usuario
   * @param {string} id - ID único del usuario (opcional)
   * @param {string} name - Nombre del usuario (opcional)
   * @param {string} role - Rol del usuario (opcional)
   * @param {number} elo - ELO del usuario (opcional)
   */
  constructor(email, password, id = null, name = null, role = null, elo = null) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.name = name;
    this.role = role;
    this.elo = elo;
  }

  /**
   * Valida si el email tiene un formato correcto
   * @returns {boolean} - Verdadero si el email es válido
   */
  isValidEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  /**
   * Valida si la contraseña cumple con los requisitos mínimos
   * @returns {boolean} - Verdadero si la contraseña es válida
   */
  isValidPassword() {
    return this.password && this.password.length >= 6;
  }

  /**
   * Valida todos los campos requeridos del usuario
   * @returns {boolean} - Verdadero si todos los campos son válidos
   */
  isValid() {
    return this.isValidEmail() && this.isValidPassword();
  }

  /**
   * Convierte el objeto User a un objeto plano para envío a API
   * @returns {Object} - Objeto con los datos del usuario sin propiedades sensibles
   */
  toApiObject() {
    return {
      email: this.email,
      password: this.password
    };
  }

  /**
   * Crea una instancia de User desde un objeto de respuesta de API
   * @param {Object} apiResponse - Respuesta del servidor
   * @returns {User} - Nueva instancia de User
   */
  static fromApiResponse(apiResponse) {
    return new User(
      apiResponse.email,
      null, // No incluimos la contraseña en la respuesta
      apiResponse.id,
      apiResponse.name,
      apiResponse.role,
      apiResponse.elo
    );
  }
}