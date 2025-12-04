import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFriendsRanking } from '../hooks/useFriendsRanking';
import { useAuth } from '../controllers/AuthContext';

/**
 * Componente que muestra el ranking de amigos
 */
const FriendsRanking = () => {
  const { ranking, loading, error, refreshing, refresh, clearError } = useFriendsRanking();
  const { user } = useAuth(); // Obtener el usuario logueado

  /**
   * Renderiza cada amigo en la lista
   */
  const renderFriend = ({ item }) => {
    // Solo resaltar si el nombre del jugador coincide exactamente con el usuario logueado
    const isCurrentUser = user && item.name.toLowerCase() === user.name.toLowerCase();
    
    return (
      <View key={item.rank} style={[styles.playerItem, isCurrentUser && styles.currentUserItem]}>
        <View style={[styles.rankContainer, isCurrentUser && styles.currentUserRank]}>
          <Text style={[styles.rankText, isCurrentUser && styles.currentUserRankText]}>
            {item.rank}
          </Text>
        </View>
        
        <View style={styles.playerInfo}>
          <Text style={[styles.playerName, isCurrentUser && styles.currentUserName]}>
            {item.name}
          </Text>
          <Text style={styles.playerElo}>
            ELO: {item.elo.toLocaleString()}
          </Text>
        </View>

        {item.rank <= 3 && (
          <View style={styles.medalContainer}>
            <Text style={styles.medal}>
              {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'}
            </Text>
          </View>
        )}

        {/* Icono de amistad */}
        <View style={styles.friendshipIcon}>
          <Text style={styles.friendIcon}>👫</Text>
        </View>
      </View>
    );
  };

  /**
   * Componente de loading
   */
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6F4E37" />
        <Text style={styles.loadingText}>Cargando ranking de amigos...</Text>
      </View>
    );
  }

  /**
   * Componente de error
   */
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>❌ Error al cargar el ranking</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => {
          clearError();
          refresh();
        }}>
          <Text style={styles.retryButtonText}>🔄 Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /**
   * Componente de lista vacía
   */
  if (ranking.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>👥</Text>
        <Text style={styles.emptyTitle}>No tienes amigos aún</Text>
        <Text style={styles.emptyMessage}>
          Agrega amigos para ver cómo se comparan contigo en el ranking
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={refresh}>
          <Text style={styles.refreshButtonText}>
            {refreshing ? '🔄 Actualizando...' : '🔄 Actualizar'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👫 Ranking de Amigos</Text>
        <Text style={styles.subtitle}>
          Compite con tus amigos y ve quién es el mejor
        </Text>
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={refresh}>
        <Text style={styles.refreshButtonText}>
          {refreshing ? '🔄 Actualizando...' : '🔄 Actualizar Ranking'}
        </Text>
      </TouchableOpacity>

      <View style={styles.listContainer}>
        {ranking.map((item) => renderFriend({ item }))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6F4E37', // PRINCIPAL
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#6F4E37',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  playerItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    borderRadius: 12,
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
  currentUserItem: {
    backgroundColor: '#FFF8E1', // Fondo especial para el usuario actual
    borderWidth: 2,
    borderColor: '#FFD166', // SECUNDARIO
  },
  rankContainer: {
    backgroundColor: '#6F4E37', // PRINCIPAL
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  currentUserRank: {
    backgroundColor: '#FFD166', // SECUNDARIO
  },
  rankText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  currentUserRankText: {
    color: '#6F4E37',
  },
  playerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  currentUserName: {
    color: '#6F4E37',
    fontWeight: 'bold',
  },
  playerElo: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  medalContainer: {
    marginLeft: 8,
  },
  medal: {
    fontSize: 24,
  },
  friendshipIcon: {
    marginLeft: 8,
  },
  friendIcon: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#6F4E37',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6F4E37',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
});

export default FriendsRanking;