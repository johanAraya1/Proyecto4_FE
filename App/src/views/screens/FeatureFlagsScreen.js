import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  Switch,
  RefreshControl
} from 'react-native';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';
import { FeatureFlag } from '../../models/FeatureFlag';

/**
 * Pantalla de administración de Feature Flags
 * Permite a los administradores gestionar las banderas de características
 */
const FeatureFlagsScreen = ({ navigation }) => {
  const {
    featureFlags,
    loading,
    error,
    successMessage,
    getAllFeatureFlags,
    createFeatureFlag,
    updateFeatureFlag,
    toggleFeatureFlag,
    deleteFeatureFlag,
    clearMessages
  } = useFeatureFlags();

  // Estados locales para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFeatureFlag, setEditingFeatureFlag] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: false
  });

  // Estados para alertas personalizadas
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [alertData, setAlertData] = useState({
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  });

  // Estado local de carga para acciones
  const [isPerformingAction, setIsPerformingAction] = useState(false);

  useEffect(() => {
    loadFeatureFlags();
  }, []);

  useEffect(() => {
    if (error) {
      showAlert('Error', error, 'error');
      clearMessages();
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      showAlert('Éxito', successMessage, 'success');
      clearMessages();
    }
  }, [successMessage]);

  /**
   * Carga todos los feature flags
   */
  const loadFeatureFlags = async () => {
    try {
      setIsPerformingAction(true);
      await getAllFeatureFlags();
    } catch (error) {
      console.error('Error al cargar feature flags:', error);
      // No mostrar alert aquí ya que el hook ya maneja los errores
    } finally {
      setIsPerformingAction(false);
    }
  };

  /**
   * Muestra un alert personalizado
   */
  const showAlert = (title, message, type = 'info', onConfirm = null) => {
    setAlertData({ title, message, type, onConfirm });
    setAlertModalVisible(true);
  };

  /**
   * Maneja el cierre del alert
   */
  const handleAlertClose = async () => {
    setAlertModalVisible(false);
    
    if (alertData.onConfirm) {
      try {
        await alertData.onConfirm();
      } catch (error) {
        console.error('Error en acción de confirmación:', error);
        // Si hay error, al menos refrescar la lista para mantener sincronización
        await loadFeatureFlags();
      }
    }
  };

  /**
   * Abre el modal para crear nuevo feature flag
   */
  const handleCreateNew = () => {
    setEditingFeatureFlag(null);
    setFormData({
      name: '',
      description: '',
      value: false
    });
    setModalVisible(true);
  };

  /**
   * Abre el modal para editar feature flag
   */
  const handleEdit = (featureFlag) => {
    setEditingFeatureFlag(featureFlag);
    setFormData({
      name: featureFlag.name,
      description: featureFlag.description || '',
      value: featureFlag.value
    });
    setModalVisible(true);
  };

  /**
   * Maneja el toggle de un feature flag
   */
  const handleToggle = async (featureFlag) => {
    if (isPerformingAction) return; // Prevenir múltiples acciones simultáneas
    
    const newValue = !featureFlag.value;
    const action = newValue ? 'habilitar' : 'deshabilitar';
    
    showAlert(
      'Confirmar Cambio',
      `¿Estás seguro de que quieres ${action} el feature flag "${featureFlag.getDisplayName()}"?`,
      'warning',
      async () => {
        try {
          setIsPerformingAction(true);
          const result = await toggleFeatureFlag(featureFlag.id);
          if (result) {
            // Refrescar la lista después del toggle
            await loadFeatureFlags();
          }
        } catch (error) {
          console.error('Error en toggle:', error);
          showAlert('Error', 'No se pudo cambiar el estado del feature flag', 'error');
        } finally {
          setIsPerformingAction(false);
        }
      }
    );
  };

  /**
   * Maneja la eliminación de un feature flag
   */
  const handleDelete = (featureFlag) => {
    if (isPerformingAction) return; // Prevenir múltiples acciones simultáneas
    
    showAlert(
      'Confirmar Eliminación',
      `¿Estás seguro de que quieres eliminar el feature flag "${featureFlag.getDisplayName()}"?\n\nEsta acción no se puede deshacer.`,
      'error',
      async () => {
        try {
          setIsPerformingAction(true);
          const result = await deleteFeatureFlag(featureFlag.id);
          if (result !== null && result !== false) {
            // Refrescar la lista después de eliminar
            await loadFeatureFlags();
          }
        } catch (error) {
          console.error('Error en delete:', error);
          showAlert('Error', 'No se pudo eliminar el feature flag', 'error');
        } finally {
          setIsPerformingAction(false);
        }
      }
    );
  };

  /**
   * Valida el formulario
   */
  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) {
      errors.push('El nombre es requerido');
    } else if (!FeatureFlag.isValidFeatureName(formData.name.trim())) {
      errors.push('El nombre debe tener entre 3-50 caracteres y solo letras, números, guiones y guiones bajos');
    }
    
    if (formData.description && formData.description.length > 255) {
      errors.push('La descripción no puede exceder 255 caracteres');
    }
    
    return errors;
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = async () => {
    if (isPerformingAction) return; // Prevenir múltiples envíos
    
    const errors = validateForm();
    
    if (errors.length > 0) {
      showAlert('Datos Inválidos', errors.join('\n'), 'error');
      return;
    }

    try {
      setIsPerformingAction(true);
      
      const featureFlagData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        value: formData.value
      };

      let success = false;

      if (editingFeatureFlag) {
        // Actualizar existing
        const result = await updateFeatureFlag(editingFeatureFlag.id, featureFlagData);
        success = !!result;
      } else {
        // Crear nuevo
        const result = await createFeatureFlag(featureFlagData);
        success = !!result;
      }

      if (success) {
        setModalVisible(false);
        setFormData({ name: '', description: '', value: false });
        setEditingFeatureFlag(null);
        
        // Refrescar la lista después de crear o actualizar
        await loadFeatureFlags();
      }
    } catch (error) {
      console.error('Error en submit:', error);
      showAlert('Error', 'No se pudo guardar el feature flag', 'error');
    } finally {
      setIsPerformingAction(false);
    }
  };

  /**
   * Maneja la cancelación del formulario
   */
  const handleCancel = () => {
    setModalVisible(false);
    setFormData({ name: '', description: '', value: false });
    setEditingFeatureFlag(null);
  };

  /**
   * Renderiza una fila de la tabla
   */
  const renderFeatureFlagRow = (featureFlag, index) => (
    <View key={featureFlag.id} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
      <View style={styles.tableCell}>
        <Text style={styles.featureName}>{featureFlag.getDisplayName()}</Text>
        <Text style={styles.featureDescription} numberOfLines={2}>
          {featureFlag.description || 'Sin descripción'}
        </Text>
      </View>
      
      <View style={styles.statusCell}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: featureFlag.isEnabled() ? '#28A745' : '#6C757D' }
        ]}>
          <Text style={styles.statusText}>
            {featureFlag.getStatusInSpanish()}
          </Text>
        </View>
      </View>
      
      <View style={styles.actionsCell}>
        <TouchableOpacity
          style={[
            styles.actionButton, 
            styles.toggleButton,
            (loading || isPerformingAction) && styles.disabledButton
          ]}
          onPress={() => handleToggle(featureFlag)}
          disabled={loading || isPerformingAction}
        >
          <Text style={styles.actionButtonText}>
            {featureFlag.isEnabled() ? '🔴' : '🟢'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.actionButton, 
            styles.editButton,
            (loading || isPerformingAction) && styles.disabledButton
          ]}
          onPress={() => handleEdit(featureFlag)}
          disabled={loading || isPerformingAction}
        >
          <Text style={styles.actionButtonText}>✏️</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.actionButton, 
            styles.deleteButton,
            (loading || isPerformingAction) && styles.disabledButton
          ]}
          onPress={() => handleDelete(featureFlag)}
          disabled={loading || isPerformingAction}
        >
          <Text style={styles.actionButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🚩 Feature Flags</Text>
          <Text style={styles.headerSubtitle}>Gestiona las características del sistema</Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.createButton,
            (loading || isPerformingAction) && styles.disabledButton
          ]}
          onPress={handleCreateNew}
          disabled={loading || isPerformingAction}
        >
          <Text style={styles.createButtonText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {/* Mensaje de advertencia para modo mock */}
      {error && error.includes('datos de prueba') && (
        <View style={styles.mockWarning}>
          <Text style={styles.mockWarningIcon}>⚠️</Text>
          <View style={styles.mockWarningText}>
            <Text style={styles.mockWarningTitle}>Modo de Prueba</Text>
            <Text style={styles.mockWarningSubtitle}>
              Backend no disponible. Mostrando datos de ejemplo.
            </Text>
          </View>
        </View>
      )}

      {/* Tabla */}
      <ScrollView 
        style={styles.tableContainer}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={loadFeatureFlags}
            colors={['#007BFF']}
          />
        }
      >
        {/* Header de la tabla */}
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Feature Flag</Text>
          <Text style={styles.tableHeaderText}>Estado</Text>
          <Text style={styles.tableHeaderText}>Acciones</Text>
        </View>

        {/* Filas de la tabla */}
        {featureFlags.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🚩</Text>
            <Text style={styles.emptyStateTitle}>No hay Feature Flags</Text>
            <Text style={styles.emptyStateSubtitle}>
              Crea tu primer feature flag para empezar
            </Text>
          </View>
        ) : (
          featureFlags.map(renderFeatureFlagRow)
        )}
      </ScrollView>

      {/* Modal de formulario */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingFeatureFlag ? 'Editar Feature Flag' : 'Nuevo Feature Flag'}
              </Text>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Nombre */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nombre *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="ej: new_game_mode"
                  editable={!editingFeatureFlag} // No permitir editar nombre
                />
                <Text style={styles.formHelp}>
                  Solo letras, números, guiones y guiones bajos
                </Text>
              </View>

              {/* Descripción */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Descripción</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  placeholder="Describe para qué sirve este feature flag"
                  multiline={true}
                  numberOfLines={3}
                />
              </View>

              {/* Valor/Estado */}
              <View style={styles.formGroup}>
                <View style={styles.switchContainer}>
                  <Text style={styles.formLabel}>Estado Inicial</Text>
                  <Switch
                    value={formData.value}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, value }))}
                    trackColor={{ false: '#767577', true: '#28A745' }}
                    thumbColor={formData.value ? '#ffffff' : '#f4f3f4'}
                  />
                  <Text style={styles.switchLabel}>
                    {formData.value ? 'Habilitado' : 'Deshabilitado'}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[
                  styles.cancelButton,
                  (loading || isPerformingAction) && styles.disabledButton
                ]}
                onPress={handleCancel}
                disabled={loading || isPerformingAction}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  (loading || isPerformingAction) && styles.disabledButton
                ]}
                onPress={handleSubmit}
                disabled={loading || isPerformingAction}
              >
                <Text style={styles.submitButtonText}>
                  {isPerformingAction ? 'Guardando...' : (editingFeatureFlag ? 'Actualizar' : 'Crear')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de alerta personalizada */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={alertModalVisible}
        onRequestClose={handleAlertClose}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertContainer}>
            <View style={styles.alertContent}>
              <View style={[
                styles.alertIconContainer,
                { backgroundColor: getAlertColor(alertData.type) }
              ]}>
                <Text style={styles.alertIcon}>{getAlertIcon(alertData.type)}</Text>
              </View>

              <Text style={styles.alertTitle}>{alertData.title}</Text>
              <Text style={styles.alertMessage}>{alertData.message}</Text>

              <TouchableOpacity 
                style={[
                  styles.alertButton,
                  { backgroundColor: getAlertButtonColor(alertData.type) }
                ]}
                onPress={handleAlertClose}
              >
                <Text style={styles.alertButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Funciones auxiliares para alertas
const getAlertIcon = (type) => {
  switch (type) {
    case 'success': return '✅';
    case 'error': return '❌';
    case 'warning': return '⚠️';
    default: return 'ℹ️';
  }
};

const getAlertColor = (type) => {
  switch (type) {
    case 'success': return '#D4F6D4';
    case 'error': return '#FFE6E6';
    case 'warning': return '#FFF3CD';
    default: return '#D1ECF1';
  }
};

const getAlertButtonColor = (type) => {
  switch (type) {
    case 'success': return '#28A745';
    case 'error': return '#DC3545';
    case 'warning': return '#FFC107';
    default: return '#17A2B8';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#6C757D',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  createButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#007BFF',
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  mockWarning: {
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mockWarningIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  mockWarningText: {
    flex: 1,
  },
  mockWarningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 2,
  },
  mockWarningSubtitle: {
    fontSize: 12,
    color: '#856404',
  },
  tableContainer: {
    flex: 1,
    padding: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#343A40',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableRowEven: {
    backgroundColor: '#F8F9FA',
  },
  tableCell: {
    flex: 2,
    paddingRight: 8,
  },
  featureName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
  },
  statusCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButton: {
    backgroundColor: '#F8F9FA',
  },
  editButton: {
    backgroundColor: '#FFC107',
  },
  deleteButton: {
    backgroundColor: '#DC3545',
  },
  actionButtonText: {
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: '#FFFFFF',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  // Estilos del modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
    width: '90%',
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    fontSize: 20,
    color: '#666',
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formHelp: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#6C757D',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#007BFF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Estilos de alerta personalizada
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 0,
    maxWidth: 400,
    width: '100%',
  },
  alertContent: {
    padding: 24,
    alignItems: 'center',
  },
  alertIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertIcon: {
    fontSize: 30,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  alertMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  alertButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 100,
  },
  alertButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default FeatureFlagsScreen;