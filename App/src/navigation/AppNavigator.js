import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../views/screens/LoginScreen';
import DashboardScreen from '../views/screens/DashboardScreen';
import RegisterScreen from '../views/screens/RegisterScreen';

// Crear instancia del stack navigator
const Stack = createStackNavigator();

/**
 * Navegador principal de la aplicación
 * Maneja la navegación entre las pantallas de Login y Dashboard
 */
const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF', // Color primario del tema
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
      }}
    >
      {/* Pantalla de Login */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Iniciar Sesión',
          headerShown: false, // Ocultar header en login para diseño más limpio
        }}
      />
      {/* Pantalla de Registro */}
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: 'Registro',
        }}
      />
      
      {/* Pantalla de Dashboard */}
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          headerLeft: null, // Evitar que puedan regresar al login
          gestureEnabled: false, // Deshabilitar gesto de volver en iOS
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;