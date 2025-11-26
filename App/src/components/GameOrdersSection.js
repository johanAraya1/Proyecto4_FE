import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import OrderCard from './OrderCard';

const GameOrdersSection = ({ player1Orders = [], player2Orders = [], currentTurn, onOrderPress = null, selectedOrderId = null }) => {
  // Obtener dimensiones de la pantalla para diseño responsivo
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  // Validar si las órdenes son válidas
  const validateOrder = (order) => {
    if (!order) return false;
    return order.name && Array.isArray(order.ingredients) && typeof order.points === 'number';
  };

  // Solo mostrar órdenes válidas
  const validPlayer1Orders = player1Orders.filter(validateOrder);
  const validPlayer2Orders = player2Orders.filter(validateOrder);

  return (
    <View 
      testID="game-orders-section"
      style={[
        styles.container,
        isMobile ? styles.containerMobile : styles.containerDesktop
      ]}>
      {/* Órdenes del Jugador 1 */}
      <View 
        testID="player1-orders-section"
        data-testid="player1-orders-section"
        style={[
          styles.orderSection,
          isMobile ? styles.orderSectionMobile : styles.orderSectionDesktop,
          currentTurn === 1 && styles.activeOrderSection
        ]}>
        {validPlayer1Orders.length > 0 ? (
          validPlayer1Orders.map((order, index) => (
            <OrderCard 
              key={order.id || index}
              testID={`player1-order-card-${index}`}
              data-testid={`player1-order-card-${index}`}
              order={order}
              isSelected={selectedOrderId === order.id}
              onPress={onOrderPress ? () => onOrderPress(order.id) : null}
              style={[
                styles.orderCard,
                isMobile && styles.orderCardMobile,
                currentTurn === 1 && styles.activeOrderCard
              ]}
            />
          ))
        ) : (
          <OrderCard 
            testID="player1-order-card-empty"
            order={null}
            style={[styles.orderCard, isMobile && styles.orderCardMobile]}
          />
        )}
      </View>

      {/* Órdenes del Jugador 2 */}
      <View 
        testID="player2-orders-section"
        data-testid="player2-orders-section"
        style={[
          styles.orderSection,
          isMobile ? styles.orderSectionMobile : styles.orderSectionDesktop,
          currentTurn === 2 && styles.activeOrderSection
        ]}>
        {validPlayer2Orders.length > 0 ? (
          validPlayer2Orders.map((order, index) => (
            <OrderCard 
              key={order.id || index}
              testID={`player2-order-card-${index}`}
              data-testid={`player2-order-card-${index}`}
              order={order}
              isSelected={selectedOrderId === order.id}
              onPress={onOrderPress ? () => onOrderPress(order.id) : null}
              style={[
                styles.orderCard,
                isMobile && styles.orderCardMobile,
                currentTurn === 2 && styles.activeOrderCard
              ]}
            />
          ))
        ) : (
          <OrderCard 
            testID="player2-order-card-empty"
            order={null}
            style={[styles.orderCard, isMobile && styles.orderCardMobile]}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#6F4E37',
  },
  containerMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },
  containerDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  orderSection: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderSectionMobile: {
    width: '100%',
    maxWidth: 350,
  },
  orderSectionDesktop: {
    flex: 1,
    maxWidth: 400,
    margin: 10,
  },
  orderCard: {
    width: '100%',
  },
  orderCardMobile: {
    marginHorizontal: 20,
  },
  activeOrderSection: {
    transform: [{ scale: 1.02 }],
    backgroundColor: '#FFF9E6',
  },
  activeOrderCard: {
    borderColor: '#FFD700',
    borderWidth: 2,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default GameOrdersSection;