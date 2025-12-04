import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';

const OrderCard = ({ order, style, isSelected = false, onPress = null }) => {
  const { colors } = useTheme();

  const CardWrapper = onPress ? TouchableOpacity : View;
  const cardProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

  if (!order) {
    return (
      <View 
        testID="order-card-empty"
        data-testid="order-card-empty"
        style={[styles.container, style, { borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Sin orden asignada
        </Text>
      </View>
    );
  }
  
  return (
    <CardWrapper 
      {...cardProps}
      testID="order-card"
      data-testid="order-card"
      accessible={true}
      accessibilityLabel={`Orden de ${order.name}`}
      style={[
        styles.container, 
        style, 
        { borderColor: colors.border },
        isSelected && styles.selectedCard
      ]}>
      {/* Título de la bebida */}
      <Text style={[styles.title, { color: colors.text }]}>
        {order.name}
      </Text>
      
      {/* Lista de ingredientes */}
      <View 
        style={styles.ingredientsContainer}
        testID="ingredients-list"
        data-testid="ingredients-list">
        {order.ingredients && order.ingredients.map((ingredient, index) => (
          <View 
            key={`ingredient-${index}`}
            testID={`ingredient-${index}`}
            data-testid={`ingredient-${index}`}
            style={[styles.ingredientBadge, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.ingredientText}>{ingredient}</Text>
          </View>
        ))}
      </View>
      
      {/* Puntos */}
      <View 
        style={styles.pointsContainer}
        testID="points-container"
        data-testid="points-container">
        <Text style={[styles.pointsText, { color: colors.primary }]}>
          Recompensa: {order.points} pts
        </Text>
      </View>
    </CardWrapper>
  );
};

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: isSmallScreen ? 16 : 20,
    margin: 8,
    borderWidth: 2,
    borderColor: '#6F4E37',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    maxWidth: 400,
    width: '90%',
    alignSelf: 'center',
    minHeight: 150,
  },
  selectedCard: {
    borderColor: '#FFD700',
    borderWidth: 3,
    backgroundColor: '#FFF9E6',
    transform: [{ scale: 1.05 }],
    shadowColor: '#FFD700',
    shadowOpacity: 0.4,
    elevation: 8,
  },
  title: {
    fontSize: isSmallScreen ? 22 : 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#6F4E37',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ingredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginVertical: 12,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 15,
  },
  ingredientBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    marginHorizontal: 4,
    marginVertical: 4,
    backgroundColor: '#6F4E37',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ingredientText: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  pointsContainer: {
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  pointsText: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: '700',
    color: '#6F4E37',
  },
});

export default OrderCard;