# 📡 Documentación de Endpoints - CodeRoom App

## 🌐 Configuración de URLs Base

### URLs por Plataforma
- **Web**: `http://localhost:3000`
- **Android**: `https://fruitily-preexceptional-lacresha.ngrok-free.dev`
- **iOS**: `https://fruitily-preexceptional-lacresha.ngrok-free.dev`
- **Dispositivo Físico**: `http://192.168.100.55:3000`

### Archivos de Configuración
- **Configuración API**: `src/config/api.js`
- **Cliente Base**: `src/services/ApiClient.js`

---

## 🔐 ENDPOINTS DE AUTENTICACIÓN

### AuthService (`src/services/authService.js`)

#### 1. Login
- **Endpoint**: `POST /auth/login`
- **Clase donde está**: `AuthService`
- **Método**: `login(user)`
- **Body**: 
  ```json
  {
    "email": "usuario@ejemplo.com",
    "password": "password123"
  }
  ```
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "user": { "id": 1, "email": "usuario@ejemplo.com", "name": "Usuario" },
    "token": "jwt_token_aqui"
  }
  ```

#### 2. Validar Sesión
- **Endpoint**: `GET /auth/validate`
- **Clase donde está**: `AuthService`
- **Método**: `validateSession(token)`
- **Headers**: 
  ```json
  {
    "Authorization": "Bearer {token}"
  }
  ```
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "valid": true,
    "user": { "id": 1, "email": "usuario@ejemplo.com", "name": "Usuario" }
  }
  ```

#### 3. Logout (Comentado)
- **Endpoint**: `POST /auth/logout`
- **Clase donde está**: `AuthService`
- **Método**: `logout()`
- **Body**: 
  ```json
  {
    "token": "jwt_token_aqui"
  }
  ```
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "message": "Sesión cerrada exitosamente"
  }
  ```

---

## 🏠 ENDPOINTS DE SALAS

### RoomService (`src/services/roomService.js`)

#### 1. Crear Sala
- **Endpoint**: `POST /rooms`
- **Clase donde está**: `RoomService`
- **Método**: `createRoom(userId)`
- **Body**: 
  ```json
  {
    "user_id": 123
  }
  ```
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "room": {
      "id": "room_id",
      "code": "ABC123",
      "status": "waiting",
      "creator_id": 123,
      "created_at": "2025-10-19T10:30:00Z"
    }
  }
  ```

#### 2. Buscar Sala por Código
- **Endpoint**: `GET /rooms/code/{roomCode}?user_id={userId}`
- **Clase donde está**: `RoomService`
- **Método**: `getRoomByCode(roomCode, userId)`
- **Ejemplo**: `GET /rooms/code/ABC123?user_id=456`
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "room": { "id": "room_id", "code": "ABC123", "status": "waiting" },
    "isUserInRoom": false,
    "isRoomFull": false,
    "message": "Sala encontrada",
    "userRole": null
  }
  ```

#### 3. Obtener Salas del Usuario
- **Endpoint**: `GET /rooms/user/{userId}`
- **Clase donde está**: `RoomService`
- **Método**: `getUserRooms(userId)`
- **Ejemplo**: `GET /rooms/user/123`
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "rooms": [
      {
        "id": "room1",
        "code": "ABC123",
        "status": "waiting",
        "creator_id": 123,
        "players": 1
      }
    ]
  }
  ```

#### 4. Unirse a Sala por Código
- **Endpoint**: `POST /rooms/join`
- **Clase donde está**: `RoomService`
- **Método**: `joinRoom(roomCode, userId)`
- **Body**: 
  ```json
  {
    "code": "ABC123",
    "user_id": 456
  }
  ```
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "room": {
      "id": "room_id",
      "code": "ABC123",
      "status": "playing",
      "players": 2
    },
    "message": "Te has unido a la sala exitosamente"
  }
  ```

#### 5. Unirse a Sala por ID
- **Endpoint**: `POST /rooms/{roomId}/join`
- **Clase donde está**: `RoomService`
- **Método**: `joinRoomById(roomId, userId)`
- **Body**: 
  ```json
  {
    "user_id": 456
  }
  ```
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "room": {
      "id": "room_id",
      "code": "ABC123",
      "status": "playing",
      "players": 2
    },
    "message": "Te has unido a la sala exitosamente"
  }
  ```

#### 6. Detalles de Juego de Sala
- **Endpoint**: `GET /rooms/{roomCode}/game-details`
- **Clase donde está**: `RoomService`
- **Método**: `getRoomGameDetails(roomCode)`
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "room": {
      "id": "room_id",
      "code": "ABC123",
      "status": "playing",
      "creator": { "id": 1, "name": "Jugador1", "elo": 1200 },
      "opponent": { "id": 2, "name": "Jugador2", "elo": 1150 }
    }
  }
  ```

---

## 🚩 ENDPOINTS DE FEATURE FLAGS

### FeatureFlagService (`src/services/featureFlagService.js`)

#### 1. Obtener Todos los Feature Flags
- **Endpoint**: `GET /feature-flags`
- **Clase donde está**: `FeatureFlagService`
- **Método**: `getAllFeatureFlags()`
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "featureFlags": [
      {
        "id": 1,
        "name": "nueva_caracteristica",
        "description": "Descripción de la característica",
        "enabled": true,
        "created_at": "2025-10-19T10:30:00Z"
      }
    ]
  }
  ```

#### 2. Obtener Feature Flag por ID
- **Endpoint**: `GET /feature-flags/{id}`
- **Clase donde está**: `FeatureFlagService`
- **Método**: `getFeatureFlagById(id)`
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "featureFlag": {
      "id": 1,
      "name": "nueva_caracteristica",
      "description": "Descripción de la característica",
      "enabled": true,
      "created_at": "2025-10-19T10:30:00Z"
    }
  }
  ```

#### 3. Obtener Feature Flag por Nombre
- **Endpoint**: `GET /feature-flags/name/{name}`
- **Clase donde está**: `FeatureFlagService`
- **Método**: `getFeatureFlagByName(name)`
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "featureFlag": {
      "id": 1,
      "name": "nueva_caracteristica",
      "description": "Descripción de la característica",
      "enabled": true
    }
  }
  ```

#### 4. Crear Feature Flag
- **Endpoint**: `POST /feature-flags`
- **Método**: `createFeatureFlag(featureFlagData)`
- **Body**: 
  ```json
  {
    "name": "nueva_caracteristica",
    "description": "Descripción de la característica",
    "enabled": true
  }
  ```
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "featureFlag": {
      "id": 2,
      "name": "nueva_caracteristica",
      "description": "Descripción de la característica",
      "enabled": true,
      "created_at": "2025-10-19T10:30:00Z"
    }
  }
  ```

#### 5. Actualizar Feature Flag
- **Endpoint**: `PUT /feature-flags/{id}`
- **Método**: `updateFeatureFlag(id, updateData)`
- **Body**: 
  ```json
  {
    "name": "caracteristica_actualizada",
    "description": "Nueva descripción",
    "enabled": false
  }
  ```
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "featureFlag": {
      "id": 1,
      "name": "caracteristica_actualizada",
      "description": "Nueva descripción",
      "enabled": false,
      "updated_at": "2025-10-19T11:30:00Z"
    }
  }
  ```

#### 6. Alternar Estado de Feature Flag
- **Endpoint**: `PATCH /feature-flags/{id}/toggle`
- **Método**: `toggleFeatureFlag(id)`
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "featureFlag": {
      "id": 1,
      "name": "nueva_caracteristica",
      "enabled": false,
      "message": "Feature flag toggled successfully"
    }
  }
  ```

#### 7. Eliminar Feature Flag
- **Endpoint**: `DELETE /feature-flags/{id}`
- **Método**: `deleteFeatureFlag(id)`
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "message": "Feature flag eliminado exitosamente"
  }
  ```

---

## 📊 ENDPOINTS DE TELEMETRÍA

### TelemetryAPI (`src/services/telemetryApi.js`)

#### 1. Obtener Todas las Métricas
- **Endpoint**: `GET /telemetry/metrics`
- **Método**: `getAllMetrics()`
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "metrics": {
      "totalUsers": 150,
      "activeRooms": 12,
      "completedGames": 89,
      "systemUptime": "72h 30m",
      "averageResponseTime": "120ms"
    }
  }
  ```

#### 2. Obtener Estado de Salud
- **Endpoint**: `GET /telemetry/health`
- **Método**: `getHealthStatus()`
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "health": {
      "status": "healthy",
      "database": "connected",
      "redis": "connected",
      "lastCheck": "2025-10-19T11:30:00Z",
      "uptime": "72h 30m"
    }
  }
  ```

#### 3. Obtener Métricas Específicas
- **Endpoint**: `GET /telemetry/metrics/{type}`
- **Método**: `getSpecificMetrics(type)`
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "metrics": {
      "type": "users",
      "data": {
        "totalRegistered": 150,
        "activeToday": 45,
        "newThisWeek": 12
      }
    }
  }
  ```

#### 4. Resetear Métricas
- **Endpoint**: `POST /telemetry/reset`
- **Método**: `resetMetrics()`
- **Body**: 
  ```json
  {
    "resetType": "all",
    "confirmReset": true
  }
  ```
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "message": "Métricas reseteadas exitosamente",
    "resetAt": "2025-10-19T11:30:00Z"
  }
  ```

---

## 🏆 ENDPOINTS DE RANKING

### RankingService (`src/services/rankingService.js`)

#### 1. Obtener Top 10 Jugadores
- **Endpoint**: `GET /ranking`
- **Método**: `getTop10Players()`
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "ranking": [
      { "rank": 1, "name": "Magnus", "elo": 2830, "gamesPlayed": 156 },
      { "rank": 2, "name": "Fabiano", "elo": 2795, "gamesPlayed": 142 },
      { "rank": 3, "name": "Ding", "elo": 2780, "gamesPlayed": 128 }
    ]
  }
  ```

#### 2. Obtener Ranking de Usuario Específico
- **Endpoint**: `GET /ranking/user/{userId}`
- **Método**: `getUserRanking(userId)`
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "userRanking": {
      "userId": 123,
      "name": "JugadorEjemplo",
      "rank": 45,
      "elo": 1250,
      "gamesPlayed": 28,
      "winRate": 65.2
    }
  }
  ```

#### 3. Obtener Top N Jugadores
- **Endpoint**: `GET /ranking/top/{limit}`
- **Método**: `getTopRanking(limit)`
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "ranking": [
      { "rank": 1, "name": "Magnus", "elo": 2830 },
      { "rank": 2, "name": "Fabiano", "elo": 2795 },
      { "rank": 3, "name": "Ding", "elo": 2780 }
    ],
    "totalPlayers": 150
  }
  ```

#### 4. Actualizar ELO de Jugador
- **Endpoint**: `PUT /ranking/{playerId}`
- **Método**: `updatePlayerElo(playerId, newElo)`
- **Body**: 
  ```json
  {
    "elo": 1250,
    "gameResult": "win",
    "opponentElo": 1200
  }
  ```
- **Respuesta Esperada**:
  ```json
  {
    "success": true,
    "player": {
      "id": 123,
      "name": "JugadorEjemplo",
      "oldElo": 1220,
      "newElo": 1250,
      "eloChange": +30,
      "newRank": 42
    }
  }
  ```

---

## 🧪 CÓMO PROBAR LOS ENDPOINTS

### 1. Usando Postman o Thunder Client

#### Configuración Base:
- **Base URL**: Según tu plataforma (ver arriba)
- **Headers Comunes**:
  ```
  Content-Type: application/json
  Accept: application/json
  ```

#### Para endpoints autenticados:
```
Authorization: Bearer {token_obtenido_del_login}
```

### 2. Desde el Código del Proyecto

#### Ejemplo de prueba en el hook useRoom:
```javascript
const { getRoomByCode } = useRoom();

// Probar buscar sala
const testRoom = await getRoomByCode('ABC123', 456);
console.log('Resultado:', testRoom);
```

### 3. Usando cURL

#### Ejemplo - Login:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

#### Ejemplo - Crear Sala:
```bash
curl -X POST http://localhost:3000/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{"user_id": 123}'
```

### 4. En el Navegador (para GET endpoints)

```
http://localhost:3000/telemetry/health
http://localhost:3000/feature-flags
http://localhost:3000/ranking
```

---

## 📝 NOTAS IMPORTANTES

### ⚠️ URLs Dinámicas:
- La aplicación cambia automáticamente la URL base según la plataforma
- En Android/iOS usa ngrok: `https://fruitily-preexceptional-lacresha.ngrok-free.dev`
- En web usa: `http://localhost:3000`

### 🔧 Manejo de Errores:
- Todos los servicios implementan manejo de errores estándar
- Status codes comunes: 200, 201, 400, 401, 404, 500

### 🔄 Reintentos:
- El ApiClient está configurado con timeout de 10 segundos
- 3 intentos de reintento configurados

### 🏗️ Estructura de Respuesta Estándar:
```json
{
  "success": boolean,
  "data": object,
  "message": string,
  "error": string (opcional)
}
```

---

## 🛠️ HERRAMIENTAS DE TESTING RECOMENDADAS

1. **Postman** - Para testing manual de APIs
2. **Thunder Client** (VS Code) - Extension ligera para testing
3. **cURL** - Para testing desde terminal
4. **Browser DevTools** - Para monitorear requests desde la app

### Archivos de Testing:
- Puedes crear un archivo `api-tests.http` usando la extensión REST Client de VS Code
- Ejemplo de contenido:
```http
### Login
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

### Get Rooms
GET http://localhost:3000/rooms/user/123
Authorization: Bearer {{token}}
```