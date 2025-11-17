import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const PlayerCard = ({
  player,
  playerNumber,
  disabled,
  orders = [],
  inventory,
  isOrderCardTouchable = false,
  selectedOrderIds = [],
  onOrderCardPress = () => {},
  isMobile = false,
}) => {
  const isPlayer2 = playerNumber === 2;
  const avatarColor = isPlayer2 ? '#32CD32' : '#8B4513';
  const cardTextColor = isPlayer2 ? '#32CD32' : '#6F4E37';
  const highlightBorderColor = isPlayer2 ? '#32CD32' : '#FFD166';
  const selectedBgColor = isPlayer2 ? '#D4F4DD' : 'rgb(255, 251, 234)';
  const selectedBorderColor = playerNumber === 2 ? '#7FD99F' : '#FFE9A0';
  const cardBorderColor = isPlayer2 ? '#32CD32' : '#FFD166';

  return (
    <View
      style={[
        { 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 10, 
          width: isMobile ? '90%' : '100%', 
          maxWidth: isMobile ? 340 : undefined, 
          opacity: disabled ? 0.5 : 1, 
          alignSelf: 'center' 
        },
      ]}
    >
      {/* Layout: en móvil horizontal (row), en web vertical (column) */}
      <View
        style={[
          {
            flexDirection: isMobile ? 'row' : 'row',
            alignItems: 'flex-start',
            gap: isMobile ? 8 : 10,
            width: '100%',
            justifyContent: 'flex-start',
          },
        ]}
      >
        {/* Card del Jugador - Compacto */}
        <View
          style={[
            {
              backgroundColor: '#FFFFFF',
              padding: 8,
              borderRadius: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
              borderWidth: 1.5,
              borderColor: disabled ? '#E0E0E0' : highlightBorderColor,
              alignItems: 'center',
              justifyContent: 'center',
              // Móvil: card pequeño y fijo a la izquierda
              width: isMobile ? 80 : undefined,
              minHeight: isMobile ? 100 : 80,
              maxHeight: isMobile ? 120 : undefined,
              alignSelf: 'flex-start',
              flexShrink: 0, // No se encoge
            },
          ]}
        >
          <View style={[styles.playerAvatar, { backgroundColor: avatarColor }]}> 
            <Text style={styles.avatarText}>{playerNumber}</Text>
          </View>
          <View style={styles.playerDetails}>
            <Text style={{ 
              fontSize: isMobile ? 12 : 14, 
              fontWeight: '700', 
              color: cardTextColor, 
              marginBottom: 2, 
              textAlign: 'center',
              lineHeight: 14,
            }}>
              {player.name || `J${playerNumber}`}
            </Text>
            <Text style={{ 
              fontSize: isMobile ? 11 : 13, 
              color: cardTextColor, 
              textAlign: 'center', 
              fontWeight: '600',
              lineHeight: 13,
            }}>
              Puntaje:
            </Text>
            <Text style={{ 
              fontSize: isMobile ? 11 : 13, 
              color: cardTextColor, 
              textAlign: 'center', 
              fontWeight: '600',
            }}>
              {player.score ?? 0}
            </Text>
          </View>
        </View>

        {/* Cards de Órdenes Individuales */}
        <View style={{
          flex: 1,
          alignSelf: 'flex-start',
          gap: 6,
        }}>
          {orders.length === 0 ? (
            <View style={{
              backgroundColor: '#FFFFFF',
              padding: 8,
              borderRadius: 8,
              borderWidth: 1.5,
              borderColor: '#E0E0E0',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 50,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}>
              <Text style={{ fontSize: 12, color: '#999', fontStyle: 'italic' }}>Sin órdenes</Text>
            </View>
          ) : (
            orders.map((order, index) => (
              <TouchableOpacity
                key={`order-${order.id}-${index}`}
                activeOpacity={isOrderCardTouchable ? 0.7 : 1}
                disabled={!isOrderCardTouchable}
                onPress={() => onOrderCardPress(order.id)}
                style={{
                  backgroundColor: selectedOrderIds.includes(order.id) ? selectedBgColor : '#FFFFFF',
                  padding: 8,
                  borderRadius: 8,
                  borderWidth: selectedOrderIds.includes(order.id) ? 2 : 1.5,
                  borderColor: selectedOrderIds.includes(order.id) ? selectedBorderColor : '#E0E0E0',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.15,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                {/* Header: Orden # y Puntos en una línea */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: selectedOrderIds.includes(order.id) ? '#222' : '#444',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}>Orden {index + 1}</Text>
                  <View style={{
                    backgroundColor: '#FFD166',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 6,
                  }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#6F4E37' }}>+{order.points}</Text>
                  </View>
                </View>

                {/* Nombre de la bebida */}
                <Text style={{ 
                  fontSize: 13, 
                  fontWeight: '600', 
                  color: '#333',
                  marginBottom: 6,
                  lineHeight: 16,
                }}>{order.name}</Text>

                {/* Ingredientes en horizontal con badges compactos */}
                <View style={{ 
                  flexDirection: 'row', 
                  flexWrap: 'wrap', 
                  gap: 4,
                  alignItems: 'center',
                }}>
                  {order?.ingredients?.map((ing, ingIndex) => (
                    <View 
                      key={`p${playerNumber}-o${index}-i${ingIndex}`}
                      style={{
                        backgroundColor: '#F5F5F5',
                        paddingHorizontal: 6,
                        paddingVertical: 3,
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: '#DDD',
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: '600', color: '#555' }}>{ing}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>

      {/* Card del Inventario */}
      <View
        style={[
          {
            backgroundColor: '#FFFFFF',
            padding: 8,
            borderRadius: 8,
            borderWidth: 1.5,
            borderColor: cardBorderColor,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 2,
            elevation: 2,
            width: isMobile ? '100%' : '100%',
            maxWidth: isMobile ? 320 : undefined,
            marginTop: isMobile ? 4 : 6,
            alignSelf: 'center',
          },
        ]}
      >
        <Text style={{ fontSize: 13, fontWeight: 'bold', color: cardTextColor, marginBottom: 6 }}>Inventario:</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
          {(() => {
            const ingredientNames = {
              AGUA: 'Agua',
              CAFE: 'Café',
              LECHE: 'Leche',
              CARAMELO: 'Caramelo',
            };
            const badges = ['AGUA', 'CAFE', 'LECHE', 'CARAMELO']
              .filter((ingredientType) => (inventory?.[ingredientType] || 0) > 0)
              .map((ingredientType) => {
                const count = inventory?.[ingredientType] || 0;
                return (
                  <View
                    key={ingredientType}
                    style={{
                      backgroundColor: '#F5F5F5',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: '#DDD',
                      marginRight: 2,
                      marginBottom: 2,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#333' }}>
                      {ingredientNames[ingredientType]} x{count}
                    </Text>
                  </View>
                );
              });
            return badges.length === 0 ? (
              <Text style={{ fontSize: 11, color: '#999', fontStyle: 'italic' }}>
                Sin ingredientes recolectados
              </Text>
            ) : badges;
          })()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  playerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  playerDetails: {
    alignItems: 'center',
    marginTop: 2,
    paddingHorizontal: 2,
  },
});

export default PlayerCard;
