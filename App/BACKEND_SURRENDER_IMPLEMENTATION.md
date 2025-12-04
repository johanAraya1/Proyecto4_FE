# 🚪 Implementación de Rendición/Abandono de Partida - Backend

## 📋 Resumen

El frontend ahora envía un evento `PLAYER_SURRENDER` cuando un jugador abandona la partida. El backend debe:

1. Recibir el evento `PLAYER_SURRENDER`
2. Terminar el juego inmediatamente
3. Dar la victoria al jugador que NO se rindió
4. Actualizar los ELO de ambos jugadores
5. Notificar a ambos jugadores del resultado

---

## 📥 Evento que Recibe el Backend

### Formato del Evento `PLAYER_SURRENDER`

```javascript
{
  type: 'PLAYER_SURRENDER',
  payload: {
    playerId: 123  // ID del jugador que se rinde
  }
}
```

---

## 📤 Evento que Debe Enviar el Backend

### Formato del Evento `PLAYER_SURRENDERED`

El backend debe enviar este evento a **AMBOS** jugadores:

```javascript
{
  type: 'PLAYER_SURRENDERED',
  payload: {
    playerId: 123,           // ID del jugador que se rindió
    winnerId: 456,           // ID del jugador ganador
    loserId: 123,            // ID del jugador perdedor
    winnerScore: 0,          // Score del ganador (puede ser 0)
    loserScore: 0,           // Score del perdedor (puede ser 0)
    eloChanges: {
      winner: 25,            // ELO ganado por el ganador
      loser: -25             // ELO perdido por el perdedor
    },
    reason: 'surrender'      // Razón del fin del juego
  }
}
```

---

## 🔧 Implementación Sugerida para el Backend

### Paso 1: Agregar el Handler del Evento

En tu archivo de manejo de WebSocket (probablemente `gameWebSocketHandler.js` o similar):

```javascript
// En la función que maneja los mensajes WebSocket
handleMessage(ws, message) {
  const { type, payload } = JSON.parse(message);
  
  switch (type) {
    // ... otros casos existentes ...
    
    case 'PLAYER_SURRENDER':
      this.handlePlayerSurrender(ws, payload);
      break;
      
    // ... resto del código ...
  }
}
```

### Paso 2: Implementar la Función `handlePlayerSurrender`

```javascript
async handlePlayerSurrender(ws, payload) {
  const { playerId } = payload;
  
  try {
    console.log(`🚪 Jugador ${playerId} se ha rendido`);
    
    // 1. Obtener información del match actual
    const gameState = await this.getGameStateByPlayerId(playerId);
    
    if (!gameState) {
      console.error('❌ No se encontró el estado del juego');
      return;
    }
    
    const { match_id, player1_id, player2_id } = gameState;
    
    // 2. Determinar ganador y perdedor
    const loserId = playerId;
    const winnerId = player1_id === playerId ? player2_id : player1_id;
    
    // 3. Obtener los scores actuales (pueden ser 0 si apenas empezó)
    const player1Score = gameState.player1_score || 0;
    const player2Score = gameState.player2_score || 0;
    const winnerScore = winnerId === player1_id ? player1Score : player2Score;
    const loserScore = winnerId === player1_id ? player2Score : player1Score;
    
    // 4. Calcular cambios de ELO
    const eloChanges = await this.calculateEloChanges(winnerId, loserId, 'surrender');
    // Sugerencia: El ganador obtiene menos ELO por victoria por rendición
    // Por ejemplo: +15 en lugar de +25
    
    // 5. Actualizar el match en la base de datos
    await this.db.query(`
      UPDATE matches 
      SET 
        winner_id = $1,
        status = 'completed',
        end_time = NOW(),
        surrender = TRUE
      WHERE id = $2
    `, [winnerId, match_id]);
    
    // 6. Actualizar ELO de ambos jugadores
    await this.updatePlayerElo(winnerId, eloChanges.winner);
    await this.updatePlayerElo(loserId, eloChanges.loser);
    
    // 7. Eliminar el game_state (partida terminada)
    await this.db.query(`
      DELETE FROM game_state 
      WHERE match_id = $1
    `, [match_id]);
    
    // 8. Notificar a AMBOS jugadores
    const surrenderEvent = {
      type: 'PLAYER_SURRENDERED',
      payload: {
        playerId: loserId,
        winnerId: winnerId,
        loserId: loserId,
        winnerScore: winnerScore,
        loserScore: loserScore,
        eloChanges: eloChanges,
        reason: 'surrender'
      }
    };
    
    // Enviar a ambos jugadores conectados
    this.broadcastToMatch(match_id, surrenderEvent);
    
    console.log(`✅ Partida terminada por rendición. Ganador: ${winnerId}`);
    
  } catch (error) {
    console.error('❌ Error al procesar rendición:', error);
  }
}
```

### Paso 3: Funciones Auxiliares

```javascript
// Función para calcular ELO en caso de rendición
async calculateEloChanges(winnerId, loserId, reason) {
  // En caso de rendición, dar menos puntos que en victoria normal
  if (reason === 'surrender') {
    return {
      winner: 15,   // Menos puntos por victoria por rendición
      loser: -15    // Menos pérdida por rendirse
    };
  }
  
  // Para victorias normales
  return {
    winner: 25,
    loser: -25
  };
}

// Función para actualizar el ELO de un jugador
async updatePlayerElo(playerId, eloChange) {
  await this.db.query(`
    UPDATE users 
    SET elo = elo + $1 
    WHERE id = $2
  `, [eloChange, playerId]);
}

// Función para obtener el game_state de un jugador
async getGameStateByPlayerId(playerId) {
  const result = await this.db.query(`
    SELECT * FROM game_state 
    WHERE player1_id = $1 OR player2_id = $1
    LIMIT 1
  `, [playerId]);
  
  return result.rows[0];
}

// Función para enviar mensaje a todos los jugadores de un match
broadcastToMatch(matchId, event) {
  // Obtener todos los WebSockets conectados a este match
  const connections = this.getMatchConnections(matchId);
  
  connections.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(event));
    }
  });
}
```

---

## 🗄️ Cambios en la Base de Datos (Opcional)

Si quieres llevar un registro de las rendiciones, puedes agregar una columna a la tabla `matches`:

```sql
ALTER TABLE matches 
ADD COLUMN surrender BOOLEAN DEFAULT FALSE;
```

Esto te permitirá filtrar partidas que terminaron por rendición vs partidas normales.

---

## ✅ Checklist de Implementación

- [ ] Agregar handler para `PLAYER_SURRENDER` en el switch de mensajes
- [ ] Implementar función `handlePlayerSurrender`
- [ ] Determinar ganador y perdedor correctamente
- [ ] Calcular cambios de ELO (menor penalización para rendiciones)
- [ ] Actualizar tabla `matches` (status = 'completed', winner_id, etc.)
- [ ] Actualizar ELO de ambos jugadores en tabla `users`
- [ ] Eliminar `game_state` del match terminado
- [ ] Enviar evento `PLAYER_SURRENDERED` a ambos jugadores
- [ ] (Opcional) Agregar columna `surrender` a tabla `matches`
- [ ] Probar con dos jugadores conectados
- [ ] Verificar que el ganador recibe la notificación correcta
- [ ] Verificar que el perdedor puede salir sin problemas

---

## 🧪 Prueba de la Funcionalidad

### Escenario de Prueba

1. **Jugador 1** crea una sala
2. **Jugador 2** se une a la sala
3. Ambos juegan algunos turnos
4. **Jugador 2** presiona el botón "Salir"
5. **Jugador 2** confirma "Sí, abandonar" en el modal
6. **Backend** debe:
   - Recibir `PLAYER_SURRENDER` con `playerId` = Jugador 2
   - Marcar a Jugador 1 como ganador
   - Actualizar ELO de ambos
   - Enviar `PLAYER_SURRENDERED` a ambos

### Resultado Esperado

- **Jugador 2**: Se redirige al Dashboard (ya implementado en frontend)
- **Jugador 1**: Ve un modal: "🎉 ¡Victoria por Abandono! Tu oponente ha abandonado la partida..."

---

## 📊 Logs Recomendados

Para facilitar el debugging, agrega estos logs:

```javascript
console.log(`🚪 Jugador ${playerId} se ha rendido`);
console.log(`🎮 Match ID: ${match_id}`);
console.log(`🏆 Ganador: ${winnerId}, Perdedor: ${loserId}`);
console.log(`📊 ELO Changes - Winner: +${eloChanges.winner}, Loser: ${eloChanges.loser}`);
console.log(`✅ Partida terminada por rendición`);
```

---

## 🐛 Debugging y Verificación

### Frontend: Verificar que se envía el evento

Abre la consola del navegador (F12) y busca estos logs al presionar "Salir":

```
🚪 Jugador abandonando la partida...
👤 User ID: 123
🔌 WebSocket conectado: true
📤 Enviando evento PLAYER_SURRENDER...
📤 Enviando PLAYER_SURRENDER: { type: 'PLAYER_SURRENDER', payload: { playerId: 123 } }
📡 Enviando mensaje WebSocket: PLAYER_SURRENDER
✅ Mensaje enviado correctamente
✅ Evento PLAYER_SURRENDER enviado
🔄 Navegando al Dashboard...
```

Si NO ves estos logs, el problema está en el frontend.

### Backend: Verificar que se recibe el evento

En los logs del backend deberías ver:

```
📥 Mensaje recibido: PLAYER_SURRENDER
🚪 Jugador 123 se ha rendido
🎮 Match ID: abc-123-def
🏆 Ganador: 456, Perdedor: 123
📊 ELO Changes - Winner: +15, Loser: -15
✅ Partida terminada por rendición
```

Si ves el evento llegar pero no se procesa, el problema está en el backend.

### Problemas Comunes

1. **WebSocket no conectado**
   ```
   ❌ No se pudo enviar PLAYER_SURRENDER - WebSocket no conectado o sin user ID
   ```
   **Solución**: Verificar que el WebSocket se conectó correctamente al entrar a la sala

2. **Evento no llega al backend**
   - Verificar que el backend está escuchando en el puerto correcto
   - Verificar que el WebSocket acepta el tipo de mensaje `PLAYER_SURRENDER`
   - Revisar logs de red en el navegador (Network tab → WS)

3. **Partida no se termina**
   - Verificar que el backend actualiza la tabla `matches` correctamente
   - Verificar que se envía el evento `PLAYER_SURRENDERED` a ambos jugadores
   - Revisar que el `game_state` se elimina de la base de datos

### Script de Verificación del Backend

Crear un script para verificar el estado de las partidas:

```javascript
// check-active-games.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkActiveGames() {
  const result = await pool.query(`
    SELECT 
      m.id,
      m.room_code,
      m.status,
      m.created_at,
      gs.match_id as has_game_state,
      u1.email as player1_email,
      u2.email as player2_email
    FROM matches m
    LEFT JOIN game_state gs ON m.id = gs.match_id
    LEFT JOIN users u1 ON m.player1_id = u1.id
    LEFT JOIN users u2 ON m.player2_id = u2.id
    WHERE m.status = 'active'
    ORDER BY m.created_at DESC
  `);
  
  console.log('\n🎮 PARTIDAS ACTIVAS:\n');
  
  if (result.rows.length === 0) {
    console.log('   No hay partidas activas');
  } else {
    result.rows.forEach(row => {
      console.log(`📌 Sala: ${row.room_code}`);
      console.log(`   Status: ${row.status}`);
      console.log(`   Player 1: ${row.player1_email}`);
      console.log(`   Player 2: ${row.player2_email}`);
      console.log(`   Game State: ${row.has_game_state ? '✅' : '❌'}`);
      console.log(`   Creada: ${row.created_at}`);
      console.log('');
    });
  }
  
  await pool.end();
}

checkActiveGames().catch(console.error);
```

Ejecutar: `node check-active-games.js`

---

## ⚠️ Consideraciones Importantes

1. **Validación**: Asegúrate de que el jugador que se rinde realmente pertenece a la partida
2. **Race Conditions**: Si ambos jugadores se rinden al mismo tiempo, manejar adecuadamente
3. **Conexión Perdida vs Rendición**: El frontend envía `PLAYER_SURRENDER` en ambos casos:
   - Cuando el jugador presiona "Salir" y confirma
   - Cuando el componente se desmonta sin usar el botón oficial
   - Cuando hay una desconexión inesperada
4. **ELO Justo**: Considera dar menos penalización por rendición que por derrota normal
5. **Estadísticas**: Guarda el tipo de finalización (normal/rendición) para estadísticas
6. **Timeout de Desconexión**: Considera agregar un timeout antes de declarar rendición por desconexión

---

## 🔌 Manejo de Desconexiones en el Backend

### Opción 1: Rendición Inmediata

Cuando se recibe `PLAYER_SURRENDER` o el WebSocket se cierra, terminar el juego inmediatamente:

```javascript
// En el handler de cierre de WebSocket
ws.on('close', async () => {
  console.log(`🔌 WebSocket cerrado para jugador ${playerId}`);
  
  // Obtener el game_state del jugador
  const gameState = await this.getGameStateByPlayerId(playerId);
  
  if (gameState && gameState.status === 'active') {
    // Tratar el cierre como rendición
    await this.handlePlayerSurrender(ws, { playerId });
  }
});
```

### Opción 2: Timeout de Reconexión (Recomendado)

Dar al jugador 30-60 segundos para reconectarse antes de declarar rendición:

```javascript
const disconnectionTimers = new Map();

ws.on('close', async () => {
  console.log(`🔌 WebSocket cerrado para jugador ${playerId}`);
  
  // Establecer un timer de 60 segundos
  const timer = setTimeout(async () => {
    console.log(`⏰ Timeout de reconexión alcanzado para jugador ${playerId}`);
    
    const gameState = await this.getGameStateByPlayerId(playerId);
    if (gameState && gameState.status === 'active') {
      await this.handlePlayerSurrender(ws, { playerId });
    }
    
    disconnectionTimers.delete(playerId);
  }, 60000); // 60 segundos
  
  disconnectionTimers.set(playerId, timer);
});

// En el handler de nueva conexión
ws.on('open', () => {
  // Cancelar el timer de desconexión si el jugador se reconecta
  if (disconnectionTimers.has(playerId)) {
    clearTimeout(disconnectionTimers.get(playerId));
    disconnectionTimers.delete(playerId);
    console.log(`✅ Jugador ${playerId} reconectado - timer cancelado`);
  }
});
```

---

## 🔗 Relación con Frontend

El frontend ya está configurado para:

✅ Mostrar modal de confirmación al presionar "Salir"
✅ Enviar evento `PLAYER_SURRENDER` al backend
✅ Recibir evento `PLAYER_SURRENDERED` y mostrar resultado
✅ Redirigir al Dashboard después de rendirse

---

**Última actualización:** 4 de Diciembre, 2025
**Prioridad:** 🟡 MEDIA - Mejora de UX y prevención de partidas abandonadas
