import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * Componente reutilizable para mostrar mensajes de error
 * Con opciones de retry y diferentes tipos de error
 */
const ErrorMessage = ({
  visible = true,
  message = 'Ha ocurrido un error',
  title = null,
  type = 'default', // 'default', 'network', 'warning', 'critical'
  onRetry = null,
  retryText = 'Reintentar',
  onDismiss = null,
  dismissText = 'Cerrar',
  style = {},
  titleStyle = {},
  messageStyle = {},
}) => {
  if (!visible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'network':
        return {
          container: styles.networkContainer,
          title: styles.networkTitle,
          message: styles.networkMessage,
          icon: '🌐',
        };
      case 'warning':
        return {
          container: styles.warningContainer,
          title: styles.warningTitle,
          message: styles.warningMessage,
          icon: '⚠️',
        };
      case 'critical':
        return {
          container: styles.criticalContainer,
          title: styles.criticalTitle,
          message: styles.criticalMessage,
          icon: '❌',
        };
      default:
        return {
          container: styles.defaultContainer,
          title: styles.defaultTitle,
          message: styles.defaultMessage,
          icon: 'ℹ️',
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <View style={[styles.container, typeStyles.container, style]}>
      {/* Icono y título */}
      <View style={styles.headerRow}>
        <Text style={styles.icon}>{typeStyles.icon}</Text>
        {title && (
          <Text style={[styles.title, typeStyles.title, titleStyle]}>
            {title}
          </Text>
        )}
      </View>

      {/* Mensaje */}
      <Text style={[styles.message, typeStyles.message, messageStyle]}>
        {message}
      </Text>

      {/* Botones de acción */}
      {(onRetry || onDismiss) && (
        <View style={styles.buttonRow}>
          {onRetry && (
            <TouchableOpacity
              style={[styles.button, styles.retryButton]}
              onPress={onRetry}
            >
              <Text style={styles.retryButtonText}>{retryText}</Text>
            </TouchableOpacity>
          )}

          {onDismiss && (
            <TouchableOpacity
              style={[styles.button, styles.dismissButton]}
              onPress={onDismiss}
            >
              <Text style={styles.dismissButtonText}>{dismissText}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 16,
    margin: 16,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  dismissButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dismissButtonText: {
    color: '#666',
    fontWeight: '500',
  },

  // Estilos por tipo
  defaultContainer: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6',
  },
  defaultTitle: {
    color: '#495057',
  },
  defaultMessage: {
    color: '#6c757d',
  },

  networkContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
  },
  networkTitle: {
    color: '#856404',
  },
  networkMessage: {
    color: '#856404',
  },

  warningContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffd93d',
  },
  warningTitle: {
    color: '#856404',
  },
  warningMessage: {
    color: '#856404',
  },

  criticalContainer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  criticalTitle: {
    color: '#721c24',
  },
  criticalMessage: {
    color: '#721c24',
  },
});

export default ErrorMessage;
