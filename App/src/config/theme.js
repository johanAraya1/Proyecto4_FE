/**
 * Configuración de tema de la aplicación
 * Define colores, tipografías, espaciado y otros estilos globales
 */
export const theme = {
  // Paleta de colores
  colors: {
    // Colores primarios
    primary: '#007AFF',
    primaryDark: '#0056CC',
    primaryLight: '#66B3FF',

    // Colores secundarios
    secondary: '#5856D6',
    secondaryDark: '#3C3B94',
    secondaryLight: '#8F8EEA',

    // Colores de estado
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#5AC8FA',

    // Colores de texto
    text: '#1C1C1E',
    textSecondary: '#8E8E93',
    textLight: '#FFFFFF',

    // Colores de fondo
    background: '#F2F2F7',
    backgroundSecondary: '#FFFFFF',

    // Colores de superficie
    white: '#FFFFFF',
    black: '#000000',

    // Colores de interfaz
    border: '#C6C6C8',
    borderLight: '#E5E5EA',
    shadow: '#000000',
    disabled: '#C7C7CC',

    // Transparencias
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
  },

  // Sistema de tipografía
  typography: {
    sizes: {
      small: 12,
      medium: 16,
      large: 18,
      xlarge: 24,
      xxlarge: 32,
    },
    weights: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeights: {
      small: 16,
      medium: 20,
      large: 24,
      xlarge: 32,
      xxlarge: 40,
    },
  },

  // Sistema de espaciado
  spacing: {
    tiny: 4,
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
    xxlarge: 48,
  },

  // Radios de borde
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    xlarge: 24,
    round: 50,
  },

  // Sombras
  shadows: {
    small: {
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    large: {
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },

  // Dimensiones comunes
  dimensions: {
    buttonHeight: 50,
    inputHeight: 48,
    headerHeight: 56,
    tabBarHeight: 60,
    borderWidth: 1,
  },

  // Duraciones de animación
  animations: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};

/**
 * Estilos comunes reutilizables
 */
export const commonStyles = {
  // Contenedores
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Textos
  title: {
    fontSize: theme.typography.sizes.xlarge,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text,
  },

  subtitle: {
    fontSize: theme.typography.sizes.large,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
  },

  body: {
    fontSize: theme.typography.sizes.medium,
    color: theme.colors.text,
    lineHeight: theme.typography.lineHeights.medium,
  },

  // Botones
  button: {
    backgroundColor: theme.colors.primary,
    height: theme.dimensions.buttonHeight,
    borderRadius: theme.borderRadius.small,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.large,
  },

  buttonText: {
    color: theme.colors.white,
    fontSize: theme.typography.sizes.medium,
    fontWeight: theme.typography.weights.medium,
  },

  // Inputs
  input: {
    height: theme.dimensions.inputHeight,
    borderWidth: theme.dimensions.borderWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.small,
    paddingHorizontal: theme.spacing.medium,
    fontSize: theme.typography.sizes.medium,
    backgroundColor: theme.colors.white,
  },

  // Cards
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.large,
    ...theme.shadows.medium,
  },
};
