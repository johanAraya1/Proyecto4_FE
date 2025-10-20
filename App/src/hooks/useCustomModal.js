import { useState } from 'react';

/**
 * Hook personalizado para manejar modales
 * Proporciona funcionalidades para mostrar diferentes tipos de modales
 */
export const useCustomModal = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({
    title: '',
    message: '',
    type: 'success', // 'success' | 'error' | 'warning' | 'info'
    onConfirm: null,
    confirmText: 'OK',
  });

  /**
   * Muestra un modal personalizado
   * @param {string} title - Título del modal
   * @param {string} message - Mensaje del modal
   * @param {string} type - Tipo del modal ('success', 'error', 'warning', 'info')
   * @param {Function} onConfirm - Callback a ejecutar al confirmar
   * @param {string} confirmText - Texto del botón de confirmación
   */
  const showModal = (
    title,
    message,
    type = 'success',
    onConfirm = null,
    confirmText = 'OK'
  ) => {
    setModalData({
      title,
      message,
      type,
      onConfirm,
      confirmText,
    });
    setModalVisible(true);
  };

  /**
   * Muestra un modal de éxito
   * @param {string} title - Título del modal
   * @param {string} message - Mensaje del modal
   * @param {Function} onConfirm - Callback a ejecutar al confirmar
   */
  const showSuccessModal = (title, message, onConfirm = null) => {
    showModal(title, message, 'success', onConfirm);
  };

  /**
   * Muestra un modal de error
   * @param {string} title - Título del modal
   * @param {string} message - Mensaje del modal
   * @param {Function} onConfirm - Callback a ejecutar al confirmar
   */
  const showErrorModal = (title, message, onConfirm = null) => {
    showModal(title, message, 'error', onConfirm);
  };

  /**
   * Muestra un modal de advertencia
   * @param {string} title - Título del modal
   * @param {string} message - Mensaje del modal
   * @param {Function} onConfirm - Callback a ejecutar al confirmar
   */
  const showWarningModal = (title, message, onConfirm = null) => {
    showModal(title, message, 'warning', onConfirm);
  };

  /**
   * Muestra un modal informativo
   * @param {string} title - Título del modal
   * @param {string} message - Mensaje del modal
   * @param {Function} onConfirm - Callback a ejecutar al confirmar
   */
  const showInfoModal = (title, message, onConfirm = null) => {
    showModal(title, message, 'info', onConfirm);
  };

  /**
   * Cierra el modal
   */
  const hideModal = () => {
    setModalVisible(false);

    // Ejecutar callback si existe
    if (modalData.onConfirm) {
      setTimeout(() => {
        modalData.onConfirm();
      }, 300); // Pequeña pausa para la animación
    }

    // Limpiar datos del modal
    setTimeout(() => {
      setModalData({
        title: '',
        message: '',
        type: 'success',
        onConfirm: null,
        confirmText: 'OK',
      });
    }, 300);
  };

  return {
    modalVisible,
    modalData,
    showModal,
    showSuccessModal,
    showErrorModal,
    showWarningModal,
    showInfoModal,
    hideModal,
  };
};

export default useCustomModal;
