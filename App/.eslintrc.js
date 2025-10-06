module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended'
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
  },
  rules: {
    // Reglas básicas para React Native
    'react-native/no-inline-styles': 'off',
    'react-native/no-color-literals': 'off',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off', // No necesario en React 17+
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'off', // Permitir console.log en desarrollo
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