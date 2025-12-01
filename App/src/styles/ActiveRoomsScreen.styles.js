import { StyleSheet } from 'react-native';

/**
 * Estilos para ActiveRoomsScreen
 * Separados en archivo independiente para mejor organización
 */

// Paleta de colores
const COLORS = {
  PRINCIPAL: '#6F4E37',      // Café oscuro
  SECUNDARIO: '#FFD166',     // Amarillo dorado
  NEUTRO: '#F5F5F5',         // Gris claro
  BLANCO: '#FFFFFF',
  TEXTO_OSCURO: '#333',
  TEXTO_CLARO: '#666',
  BORDE: '#E5E5E5',
  SUCCESS: '#28A745',        // Verde éxito
  ERROR: '#DC3545',          // Rojo error
  DISABLED: '#A0A0A0',       // Gris deshabilitado
};

export const styles = StyleSheet.create({
  // Contenedores principales
  container: {
    flex: 1,
    backgroundColor: COLORS.NEUTRO,
  },

  // Header
  header: {
    backgroundColor: COLORS.BLANCO,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  
  logo: {
    width: 40,
    height: 40,
    marginTop: 24,
  },
  
  headerSpacer: {
    width: 44,
  },

  // Título y estadísticas
  titleContainer: {
    backgroundColor: COLORS.BLANCO,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDE,
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.PRINCIPAL,
    marginBottom: 12,
    textAlign: 'center',
  },
  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
  },
  
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.PRINCIPAL,
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    color: COLORS.TEXTO_CLARO,
    fontWeight: '500',
  },
  
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.BORDE,
    marginHorizontal: 8,
  },

  // Lista
  listContainer: {
    padding: 16,
  },
  
  emptyListContainer: {
    flex: 1,
  },

  // Tarjeta de sala
  roomCard: {
    backgroundColor: COLORS.BLANCO,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  roomCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  roomCodeLabel: {
    fontSize: 14,
    color: COLORS.TEXTO_CLARO,
    marginRight: 8,
  },
  
  roomCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRINCIPAL,
    backgroundColor: COLORS.SECUNDARIO,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  
  statusText: {
    fontSize: 12,
    color: COLORS.TEXTO_CLARO,
    fontWeight: '500',
  },

  // Información de la sala
  roomInfo: {
    marginBottom: 12,
  },
  
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  
  infoLabel: {
    fontSize: 12,
    color: COLORS.TEXTO_CLARO,
    fontWeight: '500',
  },
  
  infoValue: {
    fontSize: 12,
    color: COLORS.TEXTO_OSCURO,
    fontWeight: '600',
  },

  // Acciones de la sala
  roomActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  
  copyButton: {
    backgroundColor: COLORS.SECUNDARIO,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  
  copyButtonText: {
    color: COLORS.PRINCIPAL,
    fontSize: 12,
    fontWeight: '600',
  },
  
  playButton: {
    backgroundColor: COLORS.SUCCESS,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  
  disabledButton: {
    backgroundColor: COLORS.DISABLED,
    opacity: 0.6,
  },
  
  playButtonText: {
    color: COLORS.BLANCO,
    fontSize: 12,
    fontWeight: '600',
  },

  // Acciones de invitación
  invitationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  acceptButton: {
    backgroundColor: COLORS.SUCCESS,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
    marginRight: 8,
  },

  acceptButtonText: {
    color: COLORS.BLANCO,
    fontSize: 13,
    fontWeight: '600',
  },

  rejectButton: {
    backgroundColor: COLORS.ERROR,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },

  rejectButtonText: {
    color: COLORS.BLANCO,
    fontSize: 13,
    fontWeight: '600',
  },

  // Estado vacío
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.PRINCIPAL,
    textAlign: 'center',
    marginBottom: 12,
  },
  
  emptyMessage: {
    fontSize: 14,
    color: COLORS.TEXTO_CLARO,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  
  createRoomButton: {
    backgroundColor: COLORS.PRINCIPAL,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  createRoomButtonText: {
    color: COLORS.NEUTRO,
    fontSize: 14,
    fontWeight: '600',
  },
  
  retryButton: {
    backgroundColor: COLORS.SECUNDARIO,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  retryButtonText: {
    color: COLORS.PRINCIPAL,
    fontSize: 14,
    fontWeight: '600',
  },
  // Tabs mejorados
  tabsContainerImproved: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.NEUTRO,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  tabButtonImproved: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: 'transparent',
  },

  activeTabButtonImproved: {
    backgroundColor: COLORS.BLANCO,
    borderWidth: 1,
    borderColor: COLORS.BORDE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  tabTextImproved: {
    fontSize: 13,
    color: COLORS.TEXTO_CLARO,
    fontWeight: '600',
  },

  activeTabTextImproved: {
    color: COLORS.PRINCIPAL,
    fontWeight: '700',
  },
  
  // Ajustes específicos para Web
  tabsContainerWeb: {
    justifyContent: 'center',
  },

  tabTextWeb: {
    fontSize: 16,
  },

  searchInputWeb: {
    fontSize: 16,
    paddingVertical: 12,
    textAlign: 'center',
  },

  // Buscador mejorado
  searchContainerImproved: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },

  searchInputImproved: {
    backgroundColor: COLORS.BLANCO,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    textAlign: 'center',
  },
});

export default styles;
