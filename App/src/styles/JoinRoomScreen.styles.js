import { StyleSheet } from 'react-native';

/**
 * Estilos para JoinRoomScreen
 * Separados en archivo independiente para mejor organización
 */

// Paleta de colores
const COLORS = {
  PRINCIPAL: '#6F4E37',      // Café oscuro
  SECUNDARIO: '#FFD166',     // Amarillo dorado
  NEUTRO: '#F5F5F5',         // Gris claro
  BLANCO: '#FFFFFF',
  TEXTO_OSCURO: '#6F4E37',
  TEXTO_CLARO: '#666',
  BORDE: '#E0E0E0',
  SUCCESS: '#28A745',        // Verde éxito
  ERROR: '#FF6B6B',          // Rojo error
  DISABLED: '#CCCCCC',       // Gris deshabilitado
};

export const styles = StyleSheet.create({
  // Contenedores principales
  container: {
    flex: 1,
    backgroundColor: COLORS.NEUTRO,
  },
  
  keyboardAvoidingView: {
    flex: 1,
  },

  // Header
  header: {
    backgroundColor: COLORS.BLANCO,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  logo: {
    width: 40,
    height: 40,
  },
  
  headerSpacer: {
    width: 60,
  },

  // 📜 Contenido scrollable
  content: {
    flex: 1,
  },
  
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
    flexGrow: 1,
  },

  // Título y subtítulo
  titleContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.PRINCIPAL,
    textAlign: 'center',
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 14,
    color: COLORS.TEXTO_CLARO,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },

  // Input del código
  inputContainer: {
    marginBottom: 30,
  },
  
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.PRINCIPAL,
    marginBottom: 12,
  },
  
  inputWrapper: {
    position: 'relative',
  },
  
  input: {
    backgroundColor: COLORS.BLANCO,
    borderWidth: 2,
    borderColor: COLORS.BORDE,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 4,
    color: COLORS.PRINCIPAL,
  },
  
  clearButton: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -12 }],
    backgroundColor: COLORS.ERROR,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Barra de progreso
  progressContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  
  progressText: {
    fontSize: 12,
    color: COLORS.TEXTO_CLARO,
    marginBottom: 5,
  },
  
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.BORDE,
    borderRadius: 2,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.PRINCIPAL,
    borderRadius: 2,
  },

  // Acciones rápidas
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  
  quickActionButton: {
    backgroundColor: COLORS.SECUNDARIO,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  
  quickActionText: {
    color: COLORS.PRINCIPAL,
    fontSize: 14,
    fontWeight: '600',
  },

  // Información
  infoContainer: {
    backgroundColor: COLORS.BLANCO,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.PRINCIPAL,
    marginBottom: 12,
  },
  
  infoText: {
    fontSize: 14,
    color: COLORS.TEXTO_CLARO,
    lineHeight: 20,
  },

  // Botón de búsqueda
  searchButton: {
    backgroundColor: COLORS.PRINCIPAL,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  
  searchButtonDisabled: {
    backgroundColor: COLORS.DISABLED,
  },
  
  searchButtonText: {
    color: COLORS.BLANCO,
    fontSize: 16,
    fontWeight: '600',
  },

  // Sala encontrada
  roomFoundContainer: {
    backgroundColor: COLORS.BLANCO,
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.SUCCESS,
  },
  
  roomFoundTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.SUCCESS,
    textAlign: 'center',
    marginBottom: 20,
  },
  
  roomInfoContainer: {
    marginBottom: 20,
  },
  
  roomInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  roomInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.PRINCIPAL,
  },
  
  roomInfoValue: {
    fontSize: 14,
    color: COLORS.TEXTO_CLARO,
    fontWeight: '500',
  },

  // Botón de unirse
  joinButton: {
    backgroundColor: COLORS.SUCCESS,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  
  joinButtonDisabled: {
    backgroundColor: COLORS.DISABLED,
  },
  
  joinButtonText: {
    color: COLORS.BLANCO,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default styles;
