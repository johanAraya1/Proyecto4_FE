# CodeRoom - Proyecto Frontend

Una aplicación React Native para juegos interactivos en tiempo real con arquitectura MVC limpia.

## 🏗️ Arquitectura del Proyecto

Este proyecto sigue una **arquitectura MVC limpia** con separación clara de responsabilidades:

```
src/
├── components/          # Componentes reutilizables
│   ├── common/         # Componentes comunes (CustomModal, LoadingSpinner, etc.)
│   └── ...             # Componentes específicos
├── controllers/        # Lógica de control (AuthContext, etc.)
├── hooks/              # Custom hooks reutilizables
├── models/             # Modelos de datos
├── navigation/         # Configuración de navegación
├── services/           # Servicios API y comunicación
├── styles/             # Estilos comunes y temas
├── utils/              # Utilidades y helpers
├── views/              # Pantallas y vistas
│   └── screens/        # Pantallas principales
└── constants/          # Constantes de la aplicación
```

## 🚀 Tecnologías Utilizadas

- **React Native** con Expo
- **React Navigation** para navegación
- **Axios** para peticiones HTTP
- **ESLint** + **Prettier** para calidad de código
- **Jest** para testing

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) (versión 16 o superior)
- [npm](https://www.npmjs.com/) o [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

## 🔧 Instalación

1. **Clona el repositorio:**
```bash
git clone <repository-url>
cd CodeRoom/Proyecto4_FE/App
```

2. **Instala las dependencias:**
```bash
npm install
```

3. **Configura las variables de entorno** (si es necesario):
```bash
cp .env.example .env
# Edita el archivo .env con tus configuraciones
```

## 🎯 Scripts Disponibles

### Desarrollo
```bash
# Iniciar el servidor de desarrollo
npm start

# Iniciar en modo web
npm run web

# Iniciar con túnel (para dispositivos físicos)
npm run tunnel

# Limpiar caché y reiniciar
npm run clear
```

### Calidad de Código
```bash
# Verificar formato con Prettier
npm run prettier

# Corregir formato automáticamente
npm run prettier:fix

# Verificar errores de ESLint
npm run lint

# Corregir errores de ESLint automáticamente
npm run lint:fix

# Aplicar formato completo (Prettier + ESLint)
npm run format
```

### Testing
```bash
# Ejecutar tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage
```

### Build
```bash
# Build para Android
npm run build:android

# Build para iOS
npm run build:ios
```

## 🎨 ESLint y Prettier

### Configuración de ESLint

Este proyecto utiliza ESLint con reglas específicas para React Native:

**Reglas principales:**
- ✅ Detección de variables no utilizadas
- ✅ Reglas específicas de React y React Native
- ✅ Integración con Prettier
- ✅ Detección de imports duplicados
- ✅ Validación de JSX

**Archivo de configuración:** `.eslintrc.js`

### Configuración de Prettier

Prettier está configurado para mantener un estilo de código consistente:

**Configuraciones principales:**
- 🔹 Comillas simples (`'`)
- 🔹 Punto y coma al final
- 🔹 Ancho máximo de línea: 80 caracteres
- 🔹 Indentación: 2 espacios
- 🔹 Trailing commas en ES5

**Archivo de configuración:** `.prettierrc`

### VSCode Setup

Para una mejor experiencia de desarrollo, instala estas extensiones:

1. **ESLint** (`dbaeumer.vscode-eslint`)
2. **Prettier** (`esbenp.prettier-vscode`)
3. **React Native Tools** (`ms-vscode.vscode-react-native`)

El proyecto incluye configuración automática en `.vscode/settings.json` que:
- ✅ Formatea automáticamente al guardar
- ✅ Ejecuta ESLint al guardar
- ✅ Organiza imports automáticamente

### Comandos de Calidad de Código

```bash
# Verificar todo el código
npm run format

# Solo verificar sin corregir
npm run prettier && npm run lint

# Verificar un archivo específico
npx prettier --check src/path/to/file.js
npx eslint src/path/to/file.js
```

## 📁 Estructura de Componentes

### Componentes Comunes
```javascript
// Importar componentes reutilizables
import { CustomModal, LoadingSpinner, ErrorMessage } from '../components/common';

// Hook para modales
import { useCustomModal } from '../hooks/useCustomModal';
```

### Sistema de Modales
```javascript
const { modalVisible, modalData, showSuccessModal, showErrorModal, hideModal } = useCustomModal();

// Mostrar modal de éxito
showSuccessModal('¡Éxito!', 'Operación completada correctamente');

// Mostrar modal de error
showErrorModal('Error', 'Algo salió mal');

// Componente en JSX
<CustomModal
  visible={modalVisible}
  title={modalData.title}
  message={modalData.message}
  type={modalData.type}
  onClose={hideModal}
/>
```

## 🔒 Buenas Prácticas

### Estructura de Archivos
- ✅ Un componente por archivo
- ✅ Nombres de archivos en PascalCase para componentes
- ✅ Nombres de archivos en camelCase para utilidades
- ✅ Organización por dominio/funcionalidad

### Código Limpio
- ✅ Funciones pequeñas y específicas
- ✅ Nombres descriptivos para variables y funciones
- ✅ Comentarios JSDoc para funciones complejas
- ✅ Manejo consistente de errores
- ✅ Sin código duplicado

### React Native Específico
- ✅ Uso de hooks personalizados
- ✅ Separación de lógica y presentación
- ✅ Manejo de estado consistente
- ✅ Navegación centralizada

## 📱 Ejecución en Dispositivos

### Web
```bash
npm run web
# Abrir http://localhost:19006
```

### Dispositivo Móvil
1. Instala Expo Go en tu dispositivo
2. Ejecuta `npm start`
3. Escanea el código QR

### Emulador
```bash
# Android
npm run android

# iOS (solo en macOS)
npm run ios
```

## 🐛 Resolución de Problemas

### Cache Issues
```bash
# Limpiar caché de Expo
npm run clear

# Limpiar node_modules
rm -rf node_modules
npm install
```

### ESLint/Prettier Issues
```bash
# Reinstalar dependencias de linting
npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-prettier

# Verificar configuración
npm run lint -- --print-config src/App.js
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Asegúrate de que el código pase todas las verificaciones:
   ```bash
   npm run format
   npm test
   ```
4. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
5. Push a la rama (`git push origin feature/AmazingFeature`)
6. Abre un Pull Request

## 📝 License

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**¿Necesitas ayuda?** Revisa la documentación de [React Native](https://reactnative.dev/docs/getting-started) y [Expo](https://docs.expo.dev/).