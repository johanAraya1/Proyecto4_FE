import { StyleSheet } from 'react-native';

/**
 * Estilos para DashboardScreen
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
  TEXTO_MUY_CLARO: '#888',
  SUCCESS: '#28A745',        // Verde éxito
  INFO: '#17A2B8',           // Azul info
  PRIMARY_BLUE: '#007BFF',   // Azul primario
  GRAY: '#6C757D',           // Gris
  BORDER: '#E0E0E0',
  LIGHT_GRAY: '#CCC',
};

export const styles = StyleSheet.create({
  // Contenedores principales
  container: {
    flex: 1,
    backgroundColor: COLORS.NEUTRO,
  },
  
  scrollContainer: {
    flex: 1,
  },

  // Header
  header: {
    backgroundColor: COLORS.BLANCO,
    paddingHorizontal: 20,
    paddingTop: 50,
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
    width: 50,
    height: 50,
  },
  
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  
  userAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: COLORS.PRINCIPAL,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  userInitial: {
    color: COLORS.NEUTRO,
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  userDetails: {
    alignItems: 'flex-start',
  },
  
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXTO_OSCURO,
    marginBottom: 4,
  },
  
  userBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  adminBadge: {
    backgroundColor: COLORS.SECUNDARIO,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  
  adminText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.PRINCIPAL,
  },
  
  eloText: {
    fontSize: 12,
    color: COLORS.TEXTO_CLARO,
    fontWeight: '500',
  },
  
  logoutButton: {
    backgroundColor: COLORS.PRINCIPAL,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  
  logoutText: {
    color: COLORS.NEUTRO,
    fontSize: 12,
    fontWeight: '600',
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.BLANCO,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  
  activeTab: {
    backgroundColor: COLORS.PRINCIPAL,
  },
  
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.TEXTO_CLARO,
    textAlign: 'center',
  },
  
  activeTabText: {
    color: COLORS.NEUTRO,
    fontWeight: '600',
  },

  // Contenido
  content: {
    margin: 16,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.PRINCIPAL,
    marginBottom: 16,
  },

  // Tarjetas de órdenes
  orderCard: {
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
  
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  orderName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.PRINCIPAL,
  },
  
  orderTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.SECUNDARIO,
  },
  
  orderIngredients: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  
  ingredient: {
    backgroundColor: COLORS.NEUTRO,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  
  ingredientName: {
    fontSize: 12,
    color: COLORS.TEXTO_CLARO,
    fontWeight: '500',
  },
  
  rewardText: {
    fontSize: 12,
    color: COLORS.TEXTO_MUY_CLARO,
    fontStyle: 'italic',
  },
  
  ingredientBoardButton: {
    backgroundColor: COLORS.PRINCIPAL,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  
  ingredientBoardText: {
    color: COLORS.NEUTRO,
    fontSize: 16,
    fontWeight: '600',
  },

  // Placeholder
  placeholderContent: {
    backgroundColor: COLORS.BLANCO,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  
  placeholderText: {
    fontSize: 14,
    color: COLORS.TEXTO_MUY_CLARO,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Botones de salas
  roomButtonsContainer: {
    marginBottom: 20,
  },
  
  roomButton: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  createRoomButton: {
    backgroundColor: COLORS.PRINCIPAL,
  },
  
  createRoomText: {
    color: COLORS.NEUTRO,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  joinRoomButton: {
    backgroundColor: COLORS.SUCCESS,
  },
  
  joinRoomText: {
    color: COLORS.NEUTRO,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  viewRoomsButton: {
    backgroundColor: COLORS.SECUNDARIO,
  },
  
  viewRoomsText: {
    color: COLORS.PRINCIPAL,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  viewDeckButton: {
    backgroundColor: COLORS.INFO,
  },
  
  viewDeckText: {
    color: COLORS.BLANCO,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Botones de administración
  adminButtonsContainer: {
    gap: 12,
  },
  
  adminButton: {
    backgroundColor: COLORS.BLANCO,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  
  featureFlagsButton: {
    borderLeftColor: COLORS.PRIMARY_BLUE,
  },
  
  usersButton: {
    borderLeftColor: COLORS.SUCCESS,
  },
  
  settingsButton: {
    borderLeftColor: COLORS.GRAY,
  },
  
  telemetryButton: {
    borderLeftColor: COLORS.INFO,
  },
  
  adminButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  adminButtonIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  
  adminButtonText: {
    flex: 1,
  },
  
  adminButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXTO_OSCURO,
    marginBottom: 4,
  },
  
  adminButtonSubtitle: {
    fontSize: 12,
    color: COLORS.TEXTO_CLARO,
  },
  
  adminButtonArrow: {
    fontSize: 16,
    color: COLORS.LIGHT_GRAY,
  },

  // Secciones de administración
  adminSection: {
    marginBottom: 20,
  },
  
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.PRINCIPAL,
    marginBottom: 16,
    textAlign: 'left',
  },
  
  sectionSeparator: {
    height: 1,
    backgroundColor: COLORS.BORDER,
    marginVertical: 24,
  },
});

export default styles;
