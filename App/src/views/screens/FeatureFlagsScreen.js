import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  Switch,
  Platform,
  Dimensions,
} from 'react-native';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';
import { FeatureFlag } from '../../models/FeatureFlag';
import { BackButton, CustomModal } from '../../components/common';
import { useCustomModal } from '../../hooks/useCustomModal';
import { styles } from '../../styles/FeatureFlagsScreen.styles';

/**
 * Pantalla de administración de Feature Flags
 * Permite a los administradores gestionar las banderas de características
 */
const FeatureFlagsScreen = ({ navigation }) => {
  // Hook para obtener dimensiones de pantalla
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });

    return () => {
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, []);

  // Calcular número de columnas basado en el ancho de pantalla
  const getCardWidth = () => {
    if (Platform.OS !== 'web') return '100%';
    
    const minCardWidth = 300;
    const gap = 16;
    const padding = 40; // 20px cada lado
    const availableWidth = screenWidth - padding;
    const columns = Math.floor(availableWidth / (minCardWidth + gap));
    const cardWidth = (availableWidth - (gap * (columns - 1))) / columns;
    
    return Math.max(cardWidth, minCardWidth);
  };

  const {
    featureFlags,
    loading,
    error,
    successMessage,
    getAllFeatureFlags,
    createFeatureFlag,
    updateFeatureFlag,
    deleteFeatureFlag,
    clearMessages,
  } = useFeatureFlags();

  // Hook para manejo de alertas/confirmaciones
  const {
    modalVisible: alertModalVisible,
    modalData: alertConfig,
    showModal: showAlert,
    hideModal: hideAlert,
  } = useCustomModal();

  // Estados locales para el modal de edición
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFeatureFlag, setEditingFeatureFlag] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    value: false,
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
  }, [successMessage, showAlert]);

  /**
   * Carga todos los feature flags
   */
  const loadFeatureFlags = async () => {
    try {
      setIsPerformingAction(true);
      await getAllFeatureFlags();
    } catch (error) {
      // No mostrar alert aquí ya que el hook ya maneja los errores
    } finally {
      setIsPerformingAction(false);
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
      value: false,
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
      value: featureFlag.value,
    });
    setModalVisible(true);
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
          // Cerrar el modal de confirmación primero
          hideAlert();
          
          const result = await deleteFeatureFlag(featureFlag.id);
          if (result !== null && result !== false) {
            // Refrescar la lista después de eliminar
            await loadFeatureFlags();
          }
        } catch (error) {
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
      errors.push(
        'El nombre debe tener entre 3-50 caracteres y solo letras, números, guiones y guiones bajos'
      );
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
        value: formData.value,
      };

      let success = false;

      if (editingFeatureFlag) {
        // Actualizar existing
        const result = await updateFeatureFlag(
          editingFeatureFlag.id,
          featureFlagData
        );
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

        // NO llamar loadFeatureFlags() porque limpia el successMessage
        // El hook updateFeatureFlag ya actualiza la lista correctamente
      }
    } catch (error) {
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
  const renderFeatureFlagCard = (featureFlag, _index) => {
    const cardWidth = getCardWidth();
    
    return (
      <View 
        key={featureFlag.id} 
        style={[
          styles.card, 
          { width: cardWidth }
        ]}
      >
        {/* Header del card con icono y estado */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardIcon}>🚩</Text>
            <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
              {featureFlag.getDisplayName()}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              featureFlag.isEnabled() ? styles.enabledBadge : styles.disabledBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                featureFlag.isEnabled() ? styles.enabledText : styles.disabledText,
              ]}
            >
              {featureFlag.getStatusInSpanish()}
            </Text>
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.cardContent}>
          <Text style={styles.cardDescription} numberOfLines={3}>
            {featureFlag.description || 'Sin descripción'}
          </Text>
        </View>

        {/* Footer con botones de acción */}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={[
              styles.cardActionButton,
              styles.editButton,
              (loading || isPerformingAction) && styles.disabledButton,
            ]}
            onPress={() => handleEdit(featureFlag)}
            disabled={loading || isPerformingAction}
          >
            <Text style={styles.cardActionIcon}>✏️</Text>
            <Text style={styles.cardActionText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cardActionButton,
              styles.deleteButton,
              (loading || isPerformingAction) && styles.disabledButton,
            ]}
            onPress={() => handleDelete(featureFlag)}
            disabled={loading || isPerformingAction}
          >
            <Text style={styles.cardActionIcon}>🗑️</Text>
            <Text style={styles.cardActionText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          {/* Barra superior con botones */}
          <View style={styles.topButtonBar}>
            <BackButton
              navigation={navigation}
              text="← Volver"
            />

            <TouchableOpacity
              style={[
                styles.createButton,
                (loading || isPerformingAction) && styles.disabledButton,
              ]}
              onPress={handleCreateNew}
              disabled={loading || isPerformingAction}
            >
              <Text style={styles.createButtonText}>+ Nuevo</Text>
            </TouchableOpacity>
          </View>

          {/* Título centrado */}
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>🚩 Feature Flags</Text>
            <Text style={styles.headerSubtitle}>
              Gestiona las características del sistema
            </Text>
          </View>
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

        {/* Contenedor de cards */}
        <View style={styles.cardsContainer}>
          {featureFlags.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📋</Text>
              <Text style={styles.emptyStateTitle}>Sin Feature Flags</Text>
              <Text style={styles.emptyStateSubtitle}>
                No hay feature flags configurados. Crea uno nuevo para comenzar.
              </Text>
            </View>
          ) : (
            featureFlags.map((featureFlag, index) =>
              renderFeatureFlagCard(featureFlag, index)
            )
          )}
        </View>
      </ScrollView>

      {/* Modal de formulario */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingFeatureFlag
                  ? 'Editar Feature Flag'
                  : 'Nuevo Feature Flag'}
              </Text>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Nombre */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Nombre *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, name: text }))
                  }
                  placeholder='ej: new_game_mode'
                  editable={!editingFeatureFlag} // No permitir editar nombre
                />
                <Text style={styles.formHelp}>
                  Solo letras, números, guiones y guiones bajos
                </Text>
              </View>

              {/* Descripción */}
              <View style={styles.formField}>
                <Text style={styles.fieldLabel}>Descripción</Text>
                <TextInput
                  style={[styles.textInput, styles.textInputMultiline]}
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, description: text }))
                  }
                  placeholder='Describe para qué sirve este feature flag'
                  multiline={true}
                  numberOfLines={3}
                />
              </View>

              {/* Valor/Estado */}
              <View style={styles.formField}>
                <View style={styles.switchContainer}>
                  <Text style={styles.fieldLabel}>Estado Inicial</Text>
                  <Switch
                    value={formData.value}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, value }))
                    }
                    trackColor={{ false: '#767577', true: '#28A745' }}
                    thumbColor={formData.value ? '#ffffff' : '#f4f3f4'}
                  />
                  <Text style={styles.switchLabel}>
                    {formData.value ? 'Habilitado' : 'Deshabilitado'}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  (loading || isPerformingAction) && styles.disabledButton,
                ]}
                onPress={handleCancel}
                disabled={loading || isPerformingAction}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.saveButton,
                  (loading || isPerformingAction) && styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={loading || isPerformingAction}
              >
                <Text style={styles.modalButtonText}>
                  {isPerformingAction
                    ? 'Guardando...'
                    : editingFeatureFlag
                      ? 'Actualizar'
                      : 'Crear'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de alerta personalizada usando CustomModal */}
      <CustomModal
        visible={alertModalVisible}
        onClose={hideAlert}
        title={alertConfig?.title}
        message={alertConfig?.message}
        type={alertConfig?.type}
        onConfirm={alertConfig?.onConfirm}
      />
    </SafeAreaView>
  );
};

export default FeatureFlagsScreen;
