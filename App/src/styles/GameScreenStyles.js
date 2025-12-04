import { StyleSheet } from 'react-native';

const GameScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  gameContainer: {
    flex: 1,
    padding: 20,
  },
  gamePlayArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 400,
    marginVertical: 20,
    width: '100%',
  },
  mobileGameLayout: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 30,
  },
  mobileTopSection: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  turnIndicator: {
    backgroundColor: '#6F4E37',
    paddingVertical: 12,
    alignItems: 'center',
  },
  turnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  finalizeTurnButton: {
    backgroundColor: '#6F4E37',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  finalizeTurnButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  finalizeTurnButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inventoryCard: {
    width: '100%', // Ajustar el tamaño para que sea igual para ambos jugadores
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1, // Agregar borde para que ambos sean iguales
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  waitingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
    zIndex: 50,
  },
  waitingBox: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  waitingText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
  },

});

export default GameScreenStyles;