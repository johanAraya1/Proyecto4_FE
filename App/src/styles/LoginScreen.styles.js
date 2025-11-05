import { StyleSheet, Platform, Dimensions } from 'react-native';

/**
 * Estilos para LoginScreen
 * Separados en archivo independiente para mejor organización
 */

// Paleta de colores
const COLORS = {
  PRINCIPAL: '#6F4E37',      // Café oscuro
  SECUNDARIO: '#FFD166',     // Amarillo dorado
  NEUTRO: '#F5F5F5',         // Gris claro
  BLANCO: '#FFFFFF',
  TEXTO_OSCURO: '#333',
  TEXTO_CLARO: '#666',
  ERROR: '#E74C3C',
  BORDE: '#E0E0E0',
  GOOGLE_BORDER: '#DADCE0',
  GOOGLE_TEXT: '#3c4043',
};

// Dimensiones
const FORM_WIDTH = Platform.OS === 'web' 
  ? Math.min(400, Dimensions.get('window').width - 48)
  : '100%';

const FORM_MAX_WIDTH = Platform.OS === 'web' ? 400 : '100%';

export const styles = StyleSheet.create({
  // Contenedores principales
  container: {
    flex: 1,
    backgroundColor: COLORS.NEUTRO,
  },
  
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  
  formContainer: {
    backgroundColor: COLORS.BLANCO,
    padding: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
    width: FORM_WIDTH,
    maxWidth: FORM_MAX_WIDTH,
  },

  // Logo y Branding
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  
  brandName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.PRINCIPAL,
    marginBottom: 8,
  },
  
  tagline: {
    fontSize: 16,
    color: COLORS.SECUNDARIO,
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },

  // Contraseña olvidada
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  
  forgotPasswordText: {
    color: COLORS.SECUNDARIO,
    fontSize: 14,
    textDecorationLine: 'underline',
  },

  // Errores
  errorContainer: {
    width: '100%',
    marginBottom: 16,
  },
  
  errorText: {
    color: COLORS.ERROR,
    fontSize: 14,
    textAlign: 'center',
  },

  // Botones
  loginButton: {
    marginBottom: 24,
    backgroundColor: COLORS.PRINCIPAL,
  },
  
  separatorText: {
    color: COLORS.TEXTO_CLARO,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  
  googleButton: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.BLANCO,
    borderWidth: 1,
    borderColor: COLORS.GOOGLE_BORDER,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  googleIconContainer: {
    width: 18,
    height: 18,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  googleButtonText: {
    color: COLORS.GOOGLE_TEXT,
    fontSize: 16,
    fontWeight: 'normal',
  },

  // Registro
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  registerText: {
    color: COLORS.TEXTO_CLARO,
    fontSize: 14,
  },
  
  registerLink: {
    color: COLORS.SECUNDARIO,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default styles;
