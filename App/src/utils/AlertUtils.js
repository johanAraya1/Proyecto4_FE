import { Alert } from 'react-native';

/**
 * Utilidades para mostrar mensajes de éxito y error más consistentes
 */
export const AlertUtils = {
  /**
   * Muestra un alert de éxito para solicitud enviada
   */
  showFriendRequestSent: (userName, userElo) => {
    let message = `Se ha enviado una solicitud de amistad a ${userName}.`;
    if (userElo) {
      message += `\n\nELO: ${userElo.toLocaleString()}`;
    }
    message += '\n\n📩 Recibirás una notificación cuando responda a tu solicitud.';
    message += '\n💡 Puedes revisar el estado en Solicitudes de Amistad';
    
    Alert.alert('🎉 ¡Solicitud Enviada!', message, [
      { text: '¡Perfecto!', style: 'default' }
    ]);
  },

  /**
   * Muestra un alert de éxito para solicitud aceptada
   */
  showFriendRequestAccepted: (userName, userElo) => {
    let message = `🎉 ${userName} ahora es tu amigo. ¡Pueden jugar juntos!`;
    if (userElo) {
      message += `\n\n📊 ELO de ${userName}: ${userElo.toLocaleString()}`;
    }
    message += '\n\n👫 Ahora aparecerá en tu lista de amigos y en el ranking de amigos.';
    
    Alert.alert('✅ ¡Solicitud Aceptada!', message, [
      { text: '¡Genial!', style: 'default' }
    ]);
  },

  /**
   * Muestra un alert de confirmación para rechazar solicitud
   */
  showRejectConfirmation: (userName, userElo, onConfirm) => {
    let message = `¿Estás seguro de que quieres rechazar la solicitud de ${userName}?`;
    if (userElo) {
      message += `\n\nELO: ${userElo.toLocaleString()}`;
    }
    message += '\n\nEsta acción no se puede deshacer.';
    
    Alert.alert('🤔 Confirmar Rechazo', message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Rechazar', style: 'destructive', onPress: onConfirm }
    ]);
  },

  /**
   * Muestra un alert de éxito para solicitud rechazada
   */
  showFriendRequestRejected: (userName) => {
    Alert.alert(
      '❌ Solicitud Rechazada', 
      `La solicitud de ${userName} ha sido rechazada.`,
      [{ text: 'Entendido', style: 'default' }]
    );
  },

  /**
   * Muestra alertas de error más específicos basados en el tipo de error
   */
  showFriendError: (error, context = 'general') => {
    let title = '❌ Error';
    let message = 'Ha ocurrido un error inesperado';

    // Mensajes específicos según el contexto
    const contextMessages = {
      send: 'Error enviando solicitud',
      accept: 'Error aceptando solicitud', 
      reject: 'Error rechazando solicitud',
      load: 'Error cargando datos'
    };

    if (error.message) {
      const errorMsg = error.message.toLowerCase();
      
      if (errorMsg.includes('ya son amigos') || errorMsg.includes('already friends')) {
        title = '👫 Ya son amigos';
        message = 'Ya tienes una amistad con este usuario.';
      } else if (errorMsg.includes('solicitud pendiente') || errorMsg.includes('pending request') || errorMsg.includes('already sent')) {
        title = '⏳ Solicitud pendiente';
        message = 'Ya existe una solicitud pendiente con este usuario.';
      } else if (errorMsg.includes('no encontrado') || errorMsg.includes('not found')) {
        title = '🔍 No encontrado';
        message = context === 'send' ? 'Usuario no encontrado.' : 'La solicitud ya no está disponible o fue eliminada.';
      } else if (errorMsg.includes('mismo usuario') || errorMsg.includes('same user')) {
        title = '🚫 Usuario inválido';
        message = 'No puedes enviarte una solicitud a ti mismo.';
      } else if (errorMsg.includes('no válida') || errorMsg.includes('invalid')) {
        title = '❌ Solicitud inválida';
        message = 'La solicitud no es válida o ya fue procesada.';
      } else if (errorMsg.includes('expirada') || errorMsg.includes('expired')) {
        title = '⏰ Solicitud expirada';
        message = 'La solicitud ha expirado.';
      } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('conexión')) {
        title = '📡 Error de conexión';
        message = 'Verifica tu internet e intenta nuevamente.';
      } else {
        message = error.message || contextMessages[context] || message;
      }
    } else {
      message = contextMessages[context] || message;
    }

    Alert.alert(title, message);
  }
};