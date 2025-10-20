import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
} from 'react-native';

/**
 * Componente modal personalizado reutilizable
 * Compatible con el sistema de modales existente del proyecto
 */
const CustomModal = ({
  visible = false,
  title = '',
  message = '',
  type = 'success', // 'success' | 'error' | 'warning' | 'info'
  onClose = null,
  onConfirm = null,
  confirmText = 'OK',
  animationType = 'fade',
}) => {
  const iconMap = {
    success: '🎉',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const colorMap = {
    success: '#D4F6D4',
    error: '#FFE6E6',
    warning: '#FFF3CD',
    info: '#D1ECF1',
  };

  const textColorMap = {
    success: '#28A745',
    error: '#DC3545',
    warning: '#FFC107',
    info: '#17A2B8',
  };

  const buttonColorMap = {
    success: '#28A745',
    error: '#DC3545',
    warning: '#FFC107',
    info: '#17A2B8',
  };

  const handleClose = () => {
    if (onConfirm) {
      onConfirm();
    }
    if (onClose) {
      onClose();
    }
  };

  // Si no está visible, no renderizar nada
  if (!visible) {
    return null;
  }

  // Para web, usar una implementación completamente diferente
  if (Platform.OS === 'web') {
    if (!visible) {
      return null;
    }
    
    return (
      <View 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999999,
          width: '100%',
          height: '100%',
        }}
      >
        <View 
          style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 30,
            margin: 20,
            maxWidth: 350,
            width: '90%',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          {/* Icono */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
              backgroundColor: colorMap[type],
            }}
          >
            <Text style={{ fontSize: 40 }}>{iconMap[type]}</Text>
          </View>

          {/* Título */}
          {title && (
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 10,
              color: textColorMap[type],
            }}>
              {title}
            </Text>
          )}
          
          {/* Mensaje */}
          {message && (
            <Text style={{
              fontSize: 16,
              color: '#666',
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 25,
            }}>
              {message}
            </Text>
          )}
          
          {/* Botón */}
          <TouchableOpacity
            style={{
              backgroundColor: textColorMap[type],
              paddingHorizontal: 30,
              paddingVertical: 12,
              borderRadius: 25,
              minWidth: 120,
              shadowColor: textColorMap[type],
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={handleClose}
          >
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '600',
              textAlign: 'center',
            }}>
              {confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Para mobile, usar Modal nativo
  return (
    <Modal
      animationType={animationType}
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Icono */}
            <View
              style={[
                styles.modalIconContainer,
                { backgroundColor: colorMap[type] || '#D4F6D4' },
              ]}
            >
              <Text style={styles.modalIcon}>{iconMap[type] || '🎉'}</Text>
            </View>

            {/* Título */}
            {title && (
              <Text style={[styles.modalTitle, { color: textColorMap[type] }]}>
                {title}
              </Text>
            )}

            {/* Mensaje */}
            {message && (
              <Text style={styles.modalMessage}>{message}</Text>
            )}

            {/* Botón */}
            <TouchableOpacity
              style={[
                styles.modalButton,
                { backgroundColor: buttonColorMap[type] || '#28A745' },
              ]}
              onPress={handleClose}
            >
              <Text style={styles.modalButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20, // Padding consistente
    ...(Platform.OS === 'web' && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
    }),
  },
  modalContainer: {
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 30,
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: 350,
    width: '90%', // Más ancho en móviles
    minHeight: 220, // Altura mínima cómoda
    ...(Platform.OS === 'web' && {
      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.25)',
      position: 'relative',
      zIndex: 10000,
      margin: 20,
    }),
  },
  modalContent: {
    alignItems: 'center',
    width: '100%',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIcon: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 18, // Reduje ligeramente para móviles
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
    lineHeight: 24,
  },
  modalMessage: {
    fontSize: 15, // Reduje para mejor legibilidad
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30, // Más espacio antes del botón
    paddingHorizontal: 5, // Menos padding horizontal
  },
  modalButton: {
    paddingHorizontal: 35,
    paddingVertical: 15, // Más altura para el botón
    borderRadius: 25,
    minWidth: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CustomModal;
