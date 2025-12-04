# 🔗 Guía de Integración Frontend-Backend

## 📋 Estado Actual del Sistema

### ✅ Backend (Completamente Implementado)
- **Archivo**: `gameController.ts`
- **Estado**: ✅ Totalmente funcional y probado
- **Características**:
  - Sistema de rendición completo
  - Cálculo de ELO con valores fijos
  - Protecciones contra reconexión
  - Timeout de reconexión (60 segundos)
  - Verificación de sala terminada

### ✅ Frontend (Completamente Implementado)
- **Archivos**: `useGameLogic.js`, `gameWebSocketService.js`, `GameScreen.js`
- **Estado**: ✅ Totalmente funcional
- **Características**:
  - Envío de eventos de rendición
  - Recepción y manejo de resultados
  - Protecciones contra reconexión (4 capas)
  - Penalización por órdenes sin completar
  - Modales de confirmación y resultado

---

## ⚖️ Sistema de ELO

### Valores Fijos Implementados en Backend:

```typescript
// Victoria Normal (jugador alcanza 1000+ puntos):
Winner: +500 ELO
Loser: -250 ELO

// Victoria por Rendición:
Winner: +15 ELO
Loser: -15 ELO
```

### Ubicación en Backend:
- **Archivo**: `gameController.ts`
- **Victoria normal**: Línea 345-346
- **Rendición**: Línea 598-599
- **Actualización DB**: `updatePlayerElo()` en `gameService.ts`

### Condición de Victoria:
```typescript
// Partida termina cuando un jugador alcanza 1000 puntos
if (player1Score >= 1000 || player2Score >= 1000) {
  // GAME_ENDED con reason: 'SCORE_LIMIT'
}
```

---

## 📥 Evento que Envía el Frontend

### PLAYER_SURRENDER

```javascript
{
  type: 'PLAYER_SURRENDER',
  payload: {
    playerId: 456  // ID del jugador que se rinde
  }
}
```

**Frontend envía este evento cuando:**
1. Usuario presiona "Salir" y confirma en el modal
2. Componente GameScreen se desmonta sin usar el botón oficial
3. Usuario cierra la app/navegador durante una partida activa

---

## 📤 Eventos que Envía el Backend

### 1. GAME_ENDED (Victoria Normal)

```javascript
{
  type: 'GAME_ENDED',
  payload: {
    winnerId: 123,
    loserId: 456,
    winnerScore: 1050,
    loserScore: 850,
    reason: 'SCORE_LIMIT',
    eloChanges: {
      winner: 500,    // +500 ELO
      loser: -250     // -250 ELO
    }
  }
}
```

### 2. PLAYER_SURRENDERED (Victoria por Rendición)

```javascript
{
  type: 'PLAYER_SURRENDERED',
  payload: {
    playerId: 456,        // Quien se rindió
    winnerId: 123,        // Ganador
    loserId: 456,         // Perdedor
    winnerScore: 350,     // Score actual
    loserScore: 200,      // Score actual
    reason: 'surrender',
    eloChanges: {
      winner: 15,         // +15 ELO
      loser: -15          // -15 ELO
    }
  }
}
```

---

## 🔒 Protecciones Implementadas en Backend

### 1. Verificación de Sala Terminada

```typescript
// Antes de permitir conexión WebSocket:
if (room.status === 'finished') {
  ws.close(1000, 'La partida ya ha terminado');
  return;
}
```

### 2. Timeout de Reconexión

```typescript
const RECONNECTION_TIMEOUT = 60000; // 60 segundos
```

Si un jugador se desconecta, tiene **60 segundos** para reconectar antes de rendición automática.

### 3. Cierre Automático Post-Rendición

```typescript
// Esperar 300ms para sincronización DB
await new Promise(resolve => setTimeout(resolve, 300));

// Cerrar todas las conexiones
room.forEach(client => {
  client.close(1000, 'Partida terminada por rendición');
});
```

---

## 🎮 Frontend - Comportamiento Actual

### 1. Detección de Abandono

**Modal de Confirmación:**
```
⚠️ ¿Abandonar partida?

Si sales ahora, se dará por terminada la partida y 
perderás automáticamente. ¿Estás seguro de que quieres abandonar?

[No, continuar jugando] [Sí, abandonar]
```

### 2. Envío de PLAYER_SURRENDER

```javascript
confirmExitGame = () => {
  // 1. Desactivar reconexión
  gameWebSocketService.shouldReconnect = false;
  
  // 2. Enviar evento al backend
  gameWebSocketService.sendPlayerSurrender(user.id);
  
  // 3. Desconectar después de 800ms
  setTimeout(() => {
    gameWebSocketService.disconnectPermanently();
    navigation.navigate('Dashboard');
  }, 800);
}
```

### 3. Recepción de Resultados

**Victoria Normal (1000+ puntos):**
```
🏆 ¡Victoria!

¡Felicidades! Has ganado la partida con 1050 puntos.
Tu oponente obtuvo 850 puntos.

ELO: +500

[Volver al menú]
```

**Victoria por Rendición:**
```
🎉 ¡Victoria por Abandono!

Tu oponente ha abandonado la partida.
¡Has ganado por rendición!

ELO: +15

[Volver al menú]
```

**Derrota Normal:**
```
😔 Derrota

Tu oponente ha ganado la partida con 1050 puntos.
Obtuviste 850 puntos.

ELO: -250

[Volver al menú]
```

### 4. Protecciones Contra Reconexión

El frontend implementa **4 capas de protección**:

#### Capa 1: Flag `shouldReconnect`
```javascript
this.shouldReconnect = true; // Permite reconexión
this.shouldReconnect = false; // Bloquea reconexión
```

#### Capa 2: Método `disconnectPermanently()`
```javascript
disconnectPermanently() {
  this.shouldReconnect = false;
  this.socket.close(1000, 'Partida terminada');
  // Limpiar todo
}
```

#### Capa 3: Detección de Código 1008
```javascript
ws.onclose = (event) => {
  if (event.code === 1008 || 
      event.reason.includes('terminada')) {
    this.shouldReconnect = false;
  }
}
```

#### Capa 4: Handler de ERROR
```javascript
handleError = (payload) => {
  if (payload.message.includes('terminada')) {
    this.shouldReconnect = false;
    showModal('Sala Terminada', ...);
    disconnectPermanently();
  }
}
```

#### Capa 5: Prevención de Duplicados
```javascript
connect(roomCode, roomId, userId) {
  // Si ya conectado a la misma sala, no crear nueva conexión
  if (this.socket && this.roomCode === roomCode) {
    return;
  }
  
  // Si conectado a otra sala, desconectar primero
  if (this.socket && this.roomCode !== roomCode) {
    this.disconnectPermanently();
  }
}
```

---

## 💔 Órdenes Sin Completar

### Comportamiento Actual del Frontend:

**Cuando un jugador finaliza turno sin completar órdenes:**

1. ✅ **Cálculo de penalización**:
   ```javascript
   const penaltyPoints = uncompletedOrders.reduce(
     (sum, order) => sum + (order.points || 0), 
     0
   );
   ```

2. ✅ **Resta de puntos**:
   ```javascript
   score: Math.max(0, prev.score - penaltyPoints)
   ```

3. ✅ **Limpieza de órdenes**:
   ```javascript
   orders: [] // Eliminar todas las órdenes pendientes
   ```

4. ✅ **Advertencia al jugador**:
   ```
   ⚠️ Órdenes sin completar
   
   No has seleccionado ninguna orden para canjear.
   Si finalizas el turno ahora:
   
   ❌ Perderás 2 orden(es)
   💔 Penalización: -35 puntos
   
   ¿Deseas continuar?
   
   [Cancelar] [Sí, finalizar]
   ```

### ❓ Pregunta Pendiente para Backend:

**¿El backend necesita conocer las órdenes descartadas?**

**Opción A - Frontend maneja todo (actual):**
```javascript
// END_TURN solo envía posición
{
  type: 'END_TURN',
  payload: {
    pos: [row, col]
  }
}
```

**Opción B - Backend también valida:**
```javascript
// END_TURN incluye info de órdenes
{
  type: 'END_TURN',
  payload: {
    pos: [row, col],
    uncompletedOrders: [
      { id: 1, name: "Café", points: 15 },
      { id: 2, name: "Caramelo", points: 20 }
    ],
    penaltyPoints: 35
  }
}
```

**Por favor indicar cuál prefieren o si la Opción A (actual) está bien.**

---

## 🧪 Testing y Verificación

### Logs del Frontend (Consola del Navegador):

**Al abandonar partida:**
```
🚪 Jugador abandonando la partida...
👤 User ID: 123
🔌 WebSocket conectado: true
📤 Enviando evento PLAYER_SURRENDER...
📡 Enviando mensaje WebSocket: PLAYER_SURRENDER
✅ Mensaje enviado correctamente
✅ Evento PLAYER_SURRENDER enviado
🔌 Desconectando permanentemente...
🔄 Navegando al Dashboard...
```

**Al recibir victoria por rendición:**
```
🏳️ Evento PLAYER_SURRENDERED recibido: {...}
🏆 El oponente se rindió - desactivando reconexión
🔌 Desconectando permanentemente después de victoria...
```

**Al finalizar turno con órdenes sin completar:**
```
⚠️ 2 orden(es) sin completar - Penalización: -35 puntos
```

### Logs Esperados del Backend:

```
📥 Mensaje recibido: PLAYER_SURRENDER
🚪 Jugador 123 se ha rendido
🏆 Ganador: 456, Perdedor: 123
📊 ELO Changes - Winner: +15, Loser: -15
✅ Partida terminada por rendición
```

---

## ✅ Checklist de Verificación

### Backend:
- [x] Handler de `PLAYER_SURRENDER` implementado
- [x] Cálculo de ELO fijo (500/-250 y 15/-15)
- [x] Verificación de sala terminada
- [x] Timeout de reconexión (60s)
- [x] Cierre automático de WebSockets
- [x] Eventos `GAME_ENDED` y `PLAYER_SURRENDERED`

### Frontend:
- [x] Modal de confirmación de abandono
- [x] Envío de `PLAYER_SURRENDER`
- [x] Recepción de `PLAYER_SURRENDERED`
- [x] Recepción de `GAME_ENDED`
- [x] 4 capas de protección contra reconexión
- [x] Prevención de conexiones duplicadas
- [x] Penalización por órdenes sin completar
- [x] Advertencias claras al jugador

### Pendiente:
- [ ] Confirmar si backend necesita info de órdenes en `END_TURN`

---

## 📊 Resumen de Flujos

### Flujo 1: Rendición Voluntaria

```mermaid
Jugador presiona "Salir"
    ↓
Modal de confirmación
    ↓
Jugador confirma "Sí, abandonar"
    ↓
Frontend: shouldReconnect = false
    ↓
Frontend: Envía PLAYER_SURRENDER
    ↓
Backend: Recibe evento
    ↓
Backend: Actualiza ELO (+15/-15)
    ↓
Backend: Marca match como 'finished'
    ↓
Backend: Envía PLAYER_SURRENDERED a ambos
    ↓
Backend: Cierra WebSockets (código 1000)
    ↓
Frontend: Muestra modal de resultado
    ↓
Frontend: disconnectPermanently()
    ↓
Frontend: Navega a Dashboard
```

### Flujo 2: Victoria Normal (1000 puntos)

```mermaid
Jugador alcanza 1000+ puntos
    ↓
Backend: Detecta condición de victoria
    ↓
Backend: Actualiza ELO (+500/-250)
    ↓
Backend: Marca match como 'finished'
    ↓
Backend: Envía GAME_ENDED a ambos
    ↓
Backend: Cierra WebSockets
    ↓
Frontend: shouldReconnect = false
    ↓
Frontend: Muestra modal de victoria/derrota
    ↓
Frontend: disconnectPermanently()
    ↓
Frontend: Navega a Dashboard
```

### Flujo 3: Órdenes Sin Completar

```mermaid
Jugador presiona "Finalizar turno"
    ↓
Frontend: ¿Tiene órdenes pendientes?
    ↓ SÍ
Modal de advertencia con penalización
    ↓
Jugador confirma "Sí, finalizar"
    ↓
Frontend: Calcula penalización
    ↓
Frontend: score = score - penaltyPoints
    ↓
Frontend: orders = []
    ↓
Frontend: Envía END_TURN
    ↓
Frontend: Envía TURN_CHANGED
    ↓
Turno pasa al otro jugador
```

---

**Última actualización:** 4 de Diciembre, 2025  
**Estado:** ✅ Sistema completamente funcional  
**Pendiente:** Confirmación sobre manejo de órdenes en backend
