// Importar polyfills ANTES que cualquier otra cosa
import './polyfills';

// Importar React Native core modules para asegurar inicialización
import 'react-native-gesture-handler';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/controllers/AuthContext';

/**
 * Componente principal de la aplicación React Native
 * Configura la navegación global de la app con contexto de autenticación
 */
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}