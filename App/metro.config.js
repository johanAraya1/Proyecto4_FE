const { getDefaultConfig } = require('expo/metro-config');

/**
 * Configuración de Metro para resolver problemas de módulos nativos
 * Especialmente importante para PlatformConstants y otros módulos de Expo
 */
const config = getDefaultConfig(__dirname);

// Configuración básica para resolver módulos nativos
config.resolver.sourceExts.push('cjs');
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Configurar resolver para módulos
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Asegurar que los módulos de Expo se resuelvan correctamente
config.resolver.nodeModulesPaths = [
  require('path').resolve(__dirname, 'node_modules'),
];

// Configuración adicional para resolver dependencias
config.resolver.unstable_enableSymlinks = false;
config.resolver.unstable_enablePackageExports = false;

// Configurar transformer para manejar mejor los módulos nativos
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    ...config.transformer.minifierConfig,
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = config;