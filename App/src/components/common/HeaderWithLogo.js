import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import BackButton from './BackButton';

/**
 * Componente reutilizable para header con logo
 * Incluye botón de regreso, logo centrado y espaciador
 */
const HeaderWithLogo = ({
  navigation,
  onBackPress = null,
  backButtonText = '← Volver',
  logoSource = require('../../../assets/images/logoSinFondo.png'),
  style = {},
  logoStyle = {},
  showBackButton = true,
}) => {
  return (
    <View style={[styles.header, style]}>
      {/* Botón de regreso */}
      {showBackButton ? (
        <BackButton
          navigation={navigation}
          onPress={onBackPress}
          text={backButtonText}
        />
      ) : (
        <View style={styles.headerSpacer} />
      )}

      {/* Logo centrado */}
      <Image
        source={logoSource}
        style={[styles.logo, logoStyle]}
        resizeMode='contain'
      />

      {/* Espaciador para mantener logo centrado */}
      <View style={styles.headerSpacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'transparent',
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
  },
  headerSpacer: {
    width: 80, // Mismo ancho que el botón de regreso para mantener logo centrado
  },
});

export default HeaderWithLogo;
