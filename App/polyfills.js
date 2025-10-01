/**
 * Polyfill robusto para PlatformConstants y TurboModuleRegistry
 * Soluciona el error "PlatformConstants could not be found" en Expo SDK 54
 */

import { Platform, Dimensions } from 'react-native';

// Polyfill para PlatformConstants
const PlatformConstants = {
  platform: Platform.OS,
  osVersion: Platform.Version,
  model: 'emulator',
  brand: Platform.OS === 'android' ? 'google' : 'apple',
  
  // Usar dimensiones reales del dispositivo
  screen: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
    scale: Dimensions.get('screen').scale,
    fontScale: Dimensions.get('screen').fontScale || 1
  },
  
  // Información de red básica
  network: {
    type: 'wifi',
    effectiveType: '4g'
  },
  
  // Información adicional para React Native
  Version: Platform.Version,
  constants: {
    platform: Platform.OS,
    osVersion: Platform.Version
  }
};

// Polyfill para TurboModuleRegistry
if (typeof global !== 'undefined') {
  // Asegurar que TurboModuleRegistry existe
  if (!global.TurboModuleRegistry) {
    global.TurboModuleRegistry = {
      get: function(name) {
        if (name === 'PlatformConstants') {
          return PlatformConstants;
        }
        return null;
      },
      getEnforcing: function(name) {
        if (name === 'PlatformConstants') {
          return PlatformConstants;
        }
        throw new Error(`TurboModule ${name} not found`);
      }
    };
  } else {
    // Si ya existe, extender sus métodos
    const originalGet = global.TurboModuleRegistry.get;
    const originalGetEnforcing = global.TurboModuleRegistry.getEnforcing;
    
    global.TurboModuleRegistry.get = function(name) {
      if (name === 'PlatformConstants') {
        return PlatformConstants;
      }
      return originalGet ? originalGet.call(this, name) : null;
    };
    
    global.TurboModuleRegistry.getEnforcing = function(name) {
      if (name === 'PlatformConstants') {
        return PlatformConstants;
      }
      if (originalGetEnforcing) {
        return originalGetEnforcing.call(this, name);
      }
      throw new Error(`TurboModule ${name} not found`);
    };
  }
  
  // También registrar directamente como global
  global.PlatformConstants = PlatformConstants;
}

// Mock para react-native-reanimated si causa problemas
if (typeof global !== 'undefined' && !global._WORKLET) {
  global._WORKLET = false;
}

// Log para debugging
console.log('PlatformConstants polyfill loaded:', PlatformConstants);