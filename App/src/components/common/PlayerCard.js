import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const PlayerCard = ({
  player,
  playerNumber,
  disabled,
  order,
  inventory,
  isOrderCardTouchable = false,
  isOrderCardSelected = false,
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
        { flexDirection: 'column', alignItems: 'center', gap: 10, width: isMobile ? '90%' : '100%', maxWidth: isMobile ? 340 : undefined, opacity: disabled ? 0.5 : 1, alignSelf: 'center' },
      ]}
    >
      <View
        style={[
          {
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'flex-start',
            gap: 10,
            width: '100%',
            justifyContent: 'center',
          },
        ]}
      >
        {/* Card del Jugador */}
        <View
          style={[
            {
              backgroundColor: '#FFFFFF',
              padding: isMobile ? 12 : 20,
              borderRadius: 12,
              marginBottom: isMobile ? 8 : 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              borderWidth: 2,
              borderColor: disabled ? '#E0E0E0' : highlightBorderColor,
              alignItems: 'center',
              minHeight: 100,
              width: isMobile ? '100%' : undefined,
              maxWidth: isMobile ? 320 : undefined,
              alignSelf: 'center',
            },
          ]}
        >
          <View style={[styles.playerAvatar, { backgroundColor: avatarColor }]}> 
            <Text style={styles.avatarText}>{playerNumber}</Text>
          </View>
          <View style={styles.playerDetails}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: cardTextColor, marginBottom: 6, textAlign: 'center' }}>
              {player.name || `Jugador ${playerNumber}`}
            </Text>
            <Text style={{ fontSize: 16, color: cardTextColor, textAlign: 'center', fontWeight: '500' }}>
              Puntaje: {player.score ?? 0}
            </Text>
          </View>
        </View>

        {/* Card de la Orden */}
        <TouchableOpacity
          activeOpacity={isOrderCardTouchable ? 0.7 : 1}
          disabled={!isOrderCardTouchable}
          onPress={onOrderCardPress}
          style={[
            {
              backgroundColor: isOrderCardSelected ? selectedBgColor : '#FFFFFF',
              padding: isMobile ? 10 : 15,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: isOrderCardSelected ? selectedBorderColor : '#E0E0E0',
              boxSizing: 'border-box',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
              minWidth: isMobile ? 120 : 150,
              maxWidth: isMobile ? 320 : undefined,
              width: isMobile ? '100%' : undefined,
              flex: 1,
              zIndex: 10,
              position: 'relative',
              alignSelf: 'center',
            },
          ]}
        >
          <Text style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: isOrderCardSelected ? '#222' : '#333',
            marginBottom: 8,
            textShadowColor: isOrderCardSelected ? 'rgba(255,255,255,0.7)' : 'transparent',
            textShadowOffset: isOrderCardSelected ? { width: 1, height: 1 } : { width: 0, height: 0 },
            textShadowRadius: isOrderCardSelected ? 2 : 0,
          }}>Orden:</Text>
          <Text style={{ fontSize: 15, fontWeight: '600', marginBottom: 5 }}>{order ? order.name : 'Sin orden'}</Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Puntos: {order ? order.points : '0'}</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 4 }}>Ingredientes:</Text>
          {order?.ingredients?.map((ing) => (
            <Text key={`player-${playerNumber}-ingredient-${ing}-${order?.name || ''}`} style={{ fontSize: 13, color: '#444', marginLeft: 8, marginBottom: 2 }}>• {ing}</Text>
          ))}
        </TouchableOpacity>
      </View>

      {/* Card del Inventario */}
      <View
        style={[
          {
            backgroundColor: '#FFFFFF',
            padding: isMobile ? 10 : 15,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: cardBorderColor,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3,
            width: isMobile ? '100%' : '100%',
            maxWidth: isMobile ? 320 : undefined,
            marginTop: isMobile ? 6 : 10,
            alignSelf: 'center',
          },
        ]}
      >
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: cardTextColor, marginBottom: 8 }}>Inventario:</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
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
                      backgroundColor: '#F0F0F0',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#DDD',
                      marginRight: 4,
                      marginBottom: 4,
                      minWidth: 60,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#333' }}>
                      {ingredientNames[ingredientType]} x{count}
                    </Text>
                  </View>
                );
              });
            return badges.length === 0 ? (
              <Text style={{ fontSize: 13, color: '#999', fontStyle: 'italic' }}>
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
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  playerDetails: {
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
  },
});

export default PlayerCard;
