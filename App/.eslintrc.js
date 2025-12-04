module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'prettier', // Debe ir al final para desactivar reglas conflictivas
  ],
  plugins: ['react', 'react-native'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    'react-native/react-native': true,
    es6: true,
    node: true,
    jest: true, // Añadir soporte para Jest
  },
  rules: {
    // Reglas básicas para React Native
    'react-native/no-inline-styles': 'off',
    'react-native/no-color-literals': 'off',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off', // No necesario en React 17+

    // Reglas de calidad de código
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'warn', // Advertir sobre console.log
    'no-debugger': 'error',
    'no-alert': 'warn',
    'no-var': 'error',
    'prefer-const': 'error',
    'no-duplicate-imports': 'error',

    // Reglas específicas de React
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-pascal-case': 'error',
    'react/no-unused-state': 'warn',
    'react/no-array-index-key': 'warn',
    'react/jsx-key': 'error',

    // Reglas de React Native
    'react-native/no-unused-styles': 'warn',
    'react-native/split-platform-components': 'warn',
  },
  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    '.expo/',
    'dist/',
    'web-build/',
  ],
};
