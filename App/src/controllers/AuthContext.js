import React, { createContext, useContext } from 'react';
import { useAuthController } from './useAuthController';

/**
 * Context de autenticación - Compartir estado del usuario globalmente
 */
const AuthContext = createContext(undefined);

/**
 * Provider del contexto de autenticación
 * @param {Object} children - Componentes hijos
 */
export const AuthProvider = ({ children }) => {
  const authState = useAuthController();
  
  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar el contexto de autenticación
 * @returns {Object} - Estado y funciones de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};

export default AuthContext;