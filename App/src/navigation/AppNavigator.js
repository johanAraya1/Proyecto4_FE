import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../views/screens/LoginScreen';
import DashboardScreen from '../views/screens/DashboardScreen';
import RoomCreatedScreen from '../views/screens/RoomCreatedScreen';
import ActiveRoomsScreen from '../views/screens/ActiveRoomsScreen';
import JoinRoomScreen from '../views/screens/JoinRoomScreen';
import FeatureFlagsScreen from '../views/screens/FeatureFlagsScreen';
import FriendsScreen from '../views/screens/FriendsScreen';
import FriendRequestsScreen from '../views/screens/FriendRequestsScreen';

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
      
      {/* Pantalla de Sala Creada */}
      <Stack.Screen
        name="RoomCreated"
        component={RoomCreatedScreen}
        options={{
          title: 'Sala Creada',
          headerStyle: {
            backgroundColor: '#6F4E37', // PRINCIPAL
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      
      {/* Pantalla de Salas Activas */}
      <Stack.Screen
        name="ActiveRooms"
        component={ActiveRoomsScreen}
        options={{
          title: 'Salas Activas',
          headerStyle: {
            backgroundColor: '#6F4E37', // PRINCIPAL
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShown: false, // Ocultamos el header porque la pantalla tiene su propio header personalizado
        }}
      />
      
      {/* Pantalla de Unirse a Sala */}
      <Stack.Screen
        name="JoinRoom"
        component={JoinRoomScreen}
        options={{
          title: 'Unirse a Sala',
          headerStyle: {
            backgroundColor: '#28A745', // Verde
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShown: false, // Ocultamos el header porque la pantalla tiene su propio header personalizado
        }}
      />
      
      {/* Pantalla de Feature Flags */}
      <Stack.Screen
        name="FeatureFlags"
        component={FeatureFlagsScreen}
        options={{
          title: 'Feature Flags',
          headerStyle: {
            backgroundColor: '#6F4E37', // PRINCIPAL
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShown: false, // Ocultamos el header porque la pantalla tiene su propio header personalizado
        }}
      />

      {/* Pantalla de Amigos */}
      <Stack.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          title: 'Amigos',
          headerStyle: { backgroundColor: '#6F4E37' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />

      {/* Pantalla de Solicitudes de Amistad */}
      <Stack.Screen
        name="FriendRequests"
        component={FriendRequestsScreen}
        options={{
          title: 'Solicitudes',
          headerStyle: { backgroundColor: '#6F4E37' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;