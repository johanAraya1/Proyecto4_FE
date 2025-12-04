# 🔧 Checklist para Desarrollador Backend - WebSocket NO Funciona

## 📊 Diagnóstico del Problema

### ✅ Lo que SÍ funciona:
- REST API en `http://localhost:3000` funciona perfectamente
- Endpoints funcionando:
  - `GET /rooms/code/{roomCode}?user_id={id}` ✅
  - `GET /rooms/{roomCode}/load-state` ✅

### ❌ Lo que NO funciona:
- **WebSocket devuelve 400 Bad Request**
- **NO hay logs de conexión WebSocket en el backend**
- Frontend intenta conectar a: `ws://localhost:3000/game/EA37DA?userId=8`
- Error: `WebSocket handshake: Unexpected response code: 400`

---

## 🔍 Verificaciones Requeridas

### 1. ¿Existe el servidor WebSocket?

**Buscar en el código del backend:**

```javascript
// ¿Hay algo como esto?
const WebSocket = require('ws');
const wss = new WebSocket.Server({ ... });

// O con Express:
const expressWs = require('express-ws');
expressWs(app);

// O con Socket.IO:
const io = require('socket.io')(server);
```

**❓ PREGUNTA:** ¿Está inicializado un servidor WebSocket? ¿En qué archivo?

---

### 2. ¿Cuál es la ruta del WebSocket?

**Frontend está intentando conectar a:**
```
ws://localhost:3000/game/EA37DA?userId=8
ws://localhost:3000/game/{roomCode}?userId={userId}
```

**Verificar en el backend:**

```javascript
// ¿Hay algo como?
app.ws('/game/:roomCode', (ws, req) => { ... });
// O
wss.on('connection', (ws, req) => { ... });
// O
io.on('connection', (socket) => { ... });
```

**❓ PREGUNTA:** ¿Cuál es la ruta correcta del WebSocket? ¿Existe `/game/:roomCode`?

---

### 3. ¿Está en el mismo puerto?

**Verificar:**
- ¿El servidor WebSocket está en el puerto 3000 junto con REST?
- ¿O está en un puerto diferente? (ej: 3001)

**❓ PREGUNTA:** ¿En qué puerto escucha el WebSocket?

---

### 4. ¿Qué librería WebSocket usa?

**Opciones comunes:**

| Librería | Protocolo | Formato de conexión |
|----------|-----------|---------------------|
| `ws` (nativo) | WebSocket | `ws://localhost:3000/path` |
| `socket.io` | Socket.IO | `http://localhost:3000` (NO `ws://`) |
| `express-ws` | WebSocket | `ws://localhost:3000/path` |

**❓ PREGUNTA:** ¿Qué librería usa el backend para WebSocket?

---

### 5. Agregar Logs de Debugging

**Agregar esto al backend para ver qué está pasando:**

#### Si usan `ws` o `express-ws`:

```javascript
// En la inicialización del WebSocket
app.ws('/game/:roomCode', (ws, req) => {
  console.log('🔌 NUEVA CONEXIÓN WEBSOCKET');
  console.log('📍 URL:', req.url);
  console.log('🔑 Params:', req.params);
  console.log('❓ Query:', req.query);
  console.log('👤 roomCode:', req.params.roomCode);
  console.log('👤 userId:', req.query.userId);
  
  // Resto del código...
});
```

#### Si usan servidor WebSocket directo:

```javascript
wss.on('connection', (ws, req) => {
  console.log('🔌 NUEVA CONEXIÓN WEBSOCKET');
  console.log('📍 URL completa:', req.url);
  console.log('📍 Headers:', req.headers);
  
  // Parsear URL manualmente
  const url = new URL(req.url, 'ws://localhost:3000');
  console.log('🔑 Pathname:', url.pathname);
  console.log('❓ Search params:', Object.fromEntries(url.searchParams));
});
```

#### Si usan Socket.IO:

```javascript
io.on('connection', (socket) => {
  console.log('🔌 NUEVA CONEXIÓN SOCKET.IO');
  console.log('👤 Socket ID:', socket.id);
  console.log('❓ Handshake query:', socket.handshake.query);
  
  socket.on('PLAYER_READY', (data) => {
    console.log('📨 PLAYER_READY recibido:', data);
  });
});
```

---

### 6. ¿Qué formato de mensaje espera?

**Frontend está enviando:**

```json
{
  "type": "PLAYER_READY",
  "payload": {
    "roomCode": "EA37DA",
    "userId": 8
  }
}
```

**❓ PREGUNTAS:**
- ¿El backend espera este formato?
- ¿O usa eventos de Socket.IO como `socket.emit('PLAYER_READY', data)`?
- ¿Hay validación del mensaje?

---

### 7. CORS y Headers

**El frontend envía desde:**
- Origin: `http://localhost:8081`

**Verificar CORS en WebSocket:**

```javascript
// Para express-ws o ws
const wss = new WebSocket.Server({
  server,
  verifyClient: (info) => {
    console.log('🔐 Verificando cliente WebSocket');
    console.log('Origin:', info.origin);
    console.log('Secure:', info.secure);
    return true; // Aceptar todas las conexiones (solo para debug)
  }
});
```

---

## 🧪 Script de Prueba para Backend

**Guardar como `test-websocket-backend.js` y ejecutar con Node.js:**

```javascript
const WebSocket = require('ws');

// Probar diferentes formatos
const tests = [
  { name: 'Con roomCode en path', url: 'ws://localhost:3000/game/EA37DA?userId=8' },
  { name: 'Con roomCode en query', url: 'ws://localhost:3000/game?roomCode=EA37DA&userId=8' },
  { name: 'Solo /game', url: 'ws://localhost:3000/game' },
  { name: 'Root /', url: 'ws://localhost:3000/' },
];

tests.forEach(test => {
  console.log(`\n🧪 Probando: ${test.name}`);
  console.log(`📍 URL: ${test.url}`);
  
  const ws = new WebSocket(test.url);
  
  ws.on('open', () => {
    console.log(`✅ ${test.name} - CONECTADO`);
    
    // Enviar mensaje de prueba
    ws.send(JSON.stringify({
      type: 'PLAYER_READY',
      payload: { roomCode: 'EA37DA', userId: 8 }
    }));
    
    setTimeout(() => ws.close(), 1000);
  });
  
  ws.on('message', (data) => {
    console.log(`📨 ${test.name} - Respuesta:`, data.toString());
  });
  
  ws.on('error', (error) => {
    console.log(`❌ ${test.name} - ERROR:`, error.message);
  });
  
  ws.on('close', (code, reason) => {
    console.log(`🔌 ${test.name} - CERRADO - Código: ${code}, Razón: ${reason || 'N/A'}`);
  });
});
```

**Para ejecutar:**
```bash
npm install ws
node test-websocket-backend.js
```

---

## 📝 Información a Proporcionar

**Por favor enviar:**

1. ✅ ¿Qué librería WebSocket usa? (`ws`, `socket.io`, `express-ws`, otra)
2. ✅ ¿En qué archivo está el código del WebSocket?
3. ✅ ¿Cuál es la ruta correcta? (línea de código exacta)
4. ✅ ¿En qué puerto escucha el WebSocket?
5. ✅ Logs del backend después de agregar los console.log sugeridos
6. ✅ Resultado del script de prueba `test-websocket-backend.js`

---

## 🎯 Posibles Soluciones

### Opción A: Si NO hay WebSocket implementado

```javascript
// Agregar en app.js o server.js
const expressWs = require('express-ws');
expressWs(app);

app.ws('/game/:roomCode', (ws, req) => {
  const { roomCode } = req.params;
  const { userId } = req.query;
  
  console.log(`🔌 Jugador ${userId} conectado a sala ${roomCode}`);
  
  ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    console.log('📨 Mensaje recibido:', data);
    
    if (data.type === 'PLAYER_READY') {
      // Lógica cuando jugador está listo
      ws.send(JSON.stringify({
        type: 'GAME_START',
        payload: { message: 'El juego comenzará pronto' }
      }));
    }
  });
});
```

### Opción B: Si existe pero está en ruta diferente

**Decir cuál es la ruta correcta para actualizar el frontend.**

### Opción C: Si usa Socket.IO en lugar de WebSocket nativo

**Entonces el frontend debe cambiar a Socket.IO:**

```javascript
// En lugar de:
const ws = new WebSocket('ws://...');

// Usar:
import io from 'socket.io-client';
const socket = io('http://localhost:3000');
```

---

## ⚠️ Error Actual

```
WebSocket connection to 'ws://localhost:3000/game/EA37DA?userId=8' failed: 
Error during WebSocket handshake: Unexpected response code: 400
```

**Esto significa:**
- El servidor respondió con HTTP 400 Bad Request
- NO es un error de red (el servidor está accesible)
- El endpoint NO acepta conexiones WebSocket
- Posiblemente no existe la ruta `/game/:roomCode` para WebSocket

---

**POR FAVOR, REVISAR ESTOS PUNTOS Y ENVIAR LA INFORMACIÓN SOLICITADA.**
