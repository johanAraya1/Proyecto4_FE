/**
 * Modelo de entidad Room - representa una sala de juego en el sistema
 * 
 */
export class Room {
  /**
   * Constructor de la clase Room
   * @param {string} id - ID único de la sala (UUID)
   * @param {string} code - Código de la sala (6 caracteres)
   * @param {number} creatorId - ID del usuario creador
   * @param {number|null} opponentId - ID del oponente (opcional)
   * @param {string} status - Estado de la sala ('waiting', 'playing', 'finished')
   * @param {string} createdAt - Fecha de creación
   * @param {string|null} startedAt - Fecha de inicio del juego (opcional)
   * @param {string|null} finishedAt - Fecha de finalización (opcional)
   * @param {string|null} creatorName - Nombre del usuario creador (opcional)
   * @param {string|null} opponentName - Nombre del oponente (opcional)
   */
  constructor(
    id,
    code,
    creatorId,
    opponentId = null,
    status = 'waiting',
    createdAt,
    startedAt = null,
    finishedAt = null,
    creatorName = null,
    opponentName = null
  ) {
    this.id = id;
    this.code = code;
    this.creatorId = creatorId;
    this.opponentId = opponentId;
    this.status = status;
    this.createdAt = createdAt;
    this.startedAt = startedAt;
    this.finishedAt = finishedAt;
    this.creatorName = creatorName;
    this.opponentName = opponentName;
  }

  /**
   * Valida si el código de la sala tiene un formato correcto
   * @returns {boolean} - Verdadero si el código es válido
   */
  isValidCode() {
    return this.code && 
           typeof this.code === 'string' && 
           this.code.length === 6 && 
           /^[A-F0-9]{6}$/.test(this.code);
  }

  /**
   * Valida si el estado de la sala es válido
   * @returns {boolean} - Verdadero si el estado es válido
   */
  isValidStatus() {
    const validStatuses = ['waiting', 'playing', 'finished'];
    return validStatuses.includes(this.status);
  }

  /**
   * Verifica si la sala está esperando jugadores
   * @returns {boolean} - Verdadero si la sala está en estado 'waiting'
   */
  isWaiting() {
    return this.status === 'waiting';
  }

  /**
   * Verifica si la sala está en juego
   * @returns {boolean} - Verdadero si la sala está en estado 'playing'
   */
  isPlaying() {
    return this.status === 'playing';
  }

  /**
   * Verifica si la sala ha terminado
   * @returns {boolean} - Verdadero si la sala está en estado 'finished'
   */
  isFinished() {
    return this.status === 'finished';
  }

  /**
   * Verifica si la sala está llena (tiene creador y oponente)
   * @returns {boolean} - Verdadero si la sala tiene ambos jugadores
   */
  isFull() {
    return this.creatorId && this.opponentId;
  }

  /**
   * Verifica si un usuario es el creador de la sala
   * @param {number} userId - ID del usuario a verificar
   * @returns {boolean} - Verdadero si el usuario es el creador
   */
  isCreator(userId) {
    return this.creatorId === userId;
  }

  /**
   * Verifica si un usuario es el oponente de la sala
   * @param {number} userId - ID del usuario a verificar
   * @returns {boolean} - Verdadero si el usuario es el oponente
   */
  isOpponent(userId) {
    return this.opponentId === userId;
  }

  /**
   * Verifica si un usuario es participante de la sala (creador u oponente)
   * @param {number} userId - ID del usuario a verificar
   * @returns {boolean} - Verdadero si el usuario participa en la sala
   */
  isParticipant(userId) {
    return this.isCreator(userId) || this.isOpponent(userId);
  }

  /**
   * Obtiene el número de jugadores en la sala
   * @returns {number} - Cantidad de jugadores (1 o 2)
   */
  getPlayerCount() {
    let count = 0;
    if (this.creatorId) count++;
    if (this.opponentId) count++;
    return count;
  }

  /**
   * Convierte la fecha de creación a un formato legible
   * @returns {string} - Fecha formateada
   */
  getFormattedCreatedAt() {
    try {
      const date = new Date(this.createdAt);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha no válida';
    }
  }

  /**
   * Obtiene el nombre del creador de la sala
   * @returns {string} - Nombre del creador o fallback
   */
  getCreatorName() {
    return this.creatorName || `Usuario ${this.creatorId}`;
  }

  /**
   * Obtiene el estado de la sala en español
   * @returns {string} - Estado traducido
   */
  getStatusInSpanish() {
    const statusMap = {
      'waiting': 'Esperando',
      'playing': 'Jugando',
      'finished': 'Terminado'
    };
    return statusMap[this.status] || 'Desconocido';
  }

  /**
   * Valida todos los campos requeridos de la sala
   * @returns {boolean} - Verdadero si todos los campos son válidos
   */
  isValid() {
    return this.id && 
           this.isValidCode() && 
           this.creatorId && 
           this.isValidStatus() && 
           this.createdAt;
  }

  /**
   * Convierte el objeto Room a un objeto plano para envío a API
   * @returns {Object} - Objeto con los datos de la sala
   */
  toApiObject() {
    return {
      id: this.id,
      code: this.code,
      creator_id: this.creatorId,
      opponent_id: this.opponentId,
      status: this.status,
      created_at: this.createdAt,
      started_at: this.startedAt,
      finished_at: this.finishedAt
    };
  }

  /**
   * Crea una instancia de Room desde un objeto de respuesta de API
   * @param {Object} apiResponse - Respuesta del servidor
   * @returns {Room} - Nueva instancia de Room
   */
  static fromApiResponse(apiResponse) {
    console.log('🏭 Room.fromApiResponse recibió:', {
      creator_id: apiResponse.creator_id,
      creator_name: apiResponse.creator_name,
      hasCreatorName: !!apiResponse.creator_name
    });
    
    const room = new Room(
      apiResponse.id,
      apiResponse.code,
      apiResponse.creator_id,
      apiResponse.opponent_id,
      apiResponse.status,
      apiResponse.created_at,
      apiResponse.started_at,
      apiResponse.finished_at,
      apiResponse.creator_name,
      apiResponse.opponent_name
    );
    
    console.log('🏭 Room creado con creatorName:', room.creatorName);
    return room;
  }

  /**
   * Crea una sala mock para testing o desarrollo
   * @returns {Room} - Instancia de Room con datos de prueba
   */
  static createMockRoom() {
    return new Room(
      'mock-id-123',
      'ABC123',
      1,
      null,
      'waiting',
      new Date().toISOString(),
      null,
      null
    );
  }
}