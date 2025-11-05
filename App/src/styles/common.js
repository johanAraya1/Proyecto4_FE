import { StyleSheet, Platform } from 'react-native';

/**
 * Estilos comunes reutilizables para toda la aplicación
 * Mantiene consistencia visual y reduce duplicación
 */

// Colores del tema
export const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',

  // Grises
  gray100: '#F2F2F7',
  gray200: '#E5E5EA',
  gray300: '#D1D1D6',
  gray400: '#C7C7CC',
  gray500: '#AEAEB2',
  gray600: '#8E8E93',
  gray700: '#636366',
  gray800: '#48484A',
  gray900: '#1C1C1E',

  // Texto
  textPrimary: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',

  // Fondos
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  backgroundTertiary: '#FFFFFF',

  // Específicos de la app
  roomCode: '#FF6B6B',
  successAlt: '#51CF66',
  info: '#339AF0',
};

// Tipografía
export const typography = {
  // Tamaños
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  h4: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: 'normal' },
  caption: { fontSize: 14, fontWeight: 'normal' },
  small: { fontSize: 12, fontWeight: 'normal' },

  // Familias (si usas fuentes personalizadas)
  fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
};

// Espaciado
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Estilos de contenedores comunes
export const containers = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.sm,
    shadowColor: colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginBottom: spacing.lg,
  },
});

// Estilos de botones comunes
export const buttons = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  ghost: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  success: {
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  successText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  warning: {
    backgroundColor: colors.warning,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  warningText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  errorText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    backgroundColor: colors.gray300,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  disabledText: {
    color: colors.gray600,
    fontSize: 16,
    fontWeight: '600',
  },
});

// Estilos de inputs comunes
export const inputs = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    backgroundColor: colors.background,
    minHeight: 48,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

// Estilos de texto comunes
export const text = StyleSheet.create({
  h1: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  h2: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  h3: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  h4: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  bodySecondary: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  caption: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  small: {
    ...typography.small,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  center: {
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
  },
  semibold: {
    fontWeight: '600',
  },
  roomCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.roomCode,
    textAlign: 'center',
    letterSpacing: 2,
  },
});

// Utilidades de layout
export const layout = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  columnCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  selfCenter: {
    alignSelf: 'center',
  },
  selfStart: {
    alignSelf: 'flex-start',
  },
  selfEnd: {
    alignSelf: 'flex-end',
  },
});

// Exportación por defecto con todos los estilos
export default {
  colors,
  typography,
  spacing,
  containers,
  buttons,
  inputs,
  text,
  layout,
};
