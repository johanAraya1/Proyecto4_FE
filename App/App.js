// Importar polyfills ANTES que cualquier otra cosa
import './polyfills';

// Importar React Native core modules para asegurar inicialización
import 'react-native-gesture-handler';

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/controllers/AuthContext';

/**
 * Componente principal de la aplicación React Native
 * Configura la navegación global de la app con contexto de autenticación
 */
export default function App() {
  useEffect(() => {

    // Solo en WEB: cambiar título y manipular DOM
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      /* eslint-disable no-undef */
      document.title = 'CoffeeCenfo';
      
      // Función para eliminar el header
      const obliterateHeader = () => {
        // Buscar TODOS los divs
        const allDivs = document.querySelectorAll('div');
        
        allDivs.forEach(div => {
          const computedStyle = window.getComputedStyle(div);
          const height = div.offsetHeight;
          const width = div.offsetWidth;
          const textContent = div.textContent?.trim() || '';
          const position = computedStyle.position;
          
          // Detectar el header por múltiples características:
          const isHeader = (
            // 1. Tiene texto "Dashboard"
            textContent === 'Dashboard' ||
            // 2. Es un div horizontal en la parte superior con altura pequeña
            (height > 20 && height < 80 && width > 200 && 
             (position === 'fixed' || position === 'absolute' || position === 'sticky')) ||
            // 3. Contiene clase relacionada con navegación
            (div.className && (
              div.className.includes('navigation') ||
              div.className.includes('header') ||
              div.className.includes('navbar')
            ))
          );
          
          if (isHeader) {
            // DESTRUCCIÓN TOTAL
            div.style.display = 'none !important';
            div.style.height = '0px !important';
            div.style.width = '0px !important';
            div.style.overflow = 'hidden !important';
            div.style.visibility = 'hidden !important';
            div.style.opacity = '0 !important';
            div.style.position = 'absolute !important';
            div.style.top = '-9999px !important';
            
            // Remover del DOM
            try {
              div.remove();
            } catch (e) {
              // Si falla, al menos está oculto
            }
          }
        });
      };
      
      // Inyectar CSS global para máxima efectividad
      const style = document.createElement('style');
      style.textContent = `
        /* Ocultar header con fuerza bruta */
        body > div:first-child > div:first-child {
          display: none !important;
          height: 0 !important;
          min-height: 0 !important;
          max-height: 0 !important;
        }
        
        /* Asegurar que el contenido empiece desde arriba */
        #root,
        #root > div,
        body > div {
          padding-top: 0 !important;
          margin-top: 0 !important;
        }
      `;
      document.head.appendChild(style);
      
      // Ejecutar múltiples veces
      obliterateHeader();
      setTimeout(obliterateHeader, 50);
      setTimeout(obliterateHeader, 100);
      setTimeout(obliterateHeader, 200);
      setTimeout(obliterateHeader, 500);
      setTimeout(obliterateHeader, 1000);
      
      // Observador persistente
      const observer = new MutationObserver(() => {
        obliterateHeader();
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
      });
      
      // Cleanup
      return () => observer.disconnect();
      /* eslint-enable no-undef */
    }
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}