/**
 * Script para diagnosticar el flujo completo de WebSocket
 * Simula dos usuarios: uno crea la sala y otro se une
 */

const WebSocket = require('ws');

const BASE_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000';

// IDs de usuarios existentes en la base de datos
const USER1_ID = 8; // Creador
const USER2_ID = 9; // Oponente

let roomCode = null;
let roomId = null;

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createRoom() {
  console.log('\n📝 PASO 1: Creando sala con usuario', USER1_ID);
  
  try {
    const response = await fetch(`${BASE_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: USER1_ID,
        game_mode: 'classic',
        max_players: 2
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Error al crear sala:', data);
      return false;
    }

    // El backend retorna { room: { code, id, ... } }
    roomCode = data.room?.code || data.code;
    roomId = data.room?.id || data.id;
    
    console.log('✅ Sala creada exitosamente');
    console.log('   Código:', roomCode);
    console.log('   ID:', roomId);
    console.log('   Estado:', data.room?.status || data.status);
    console.log('   Creator ID:', data.room?.creator_id || data.creator_id);
    console.log('   Opponent ID:', data.room?.opponent_id || data.opponent_id || 'null');
    
    return true;
  } catch (error) {
    console.error('❌ Error en createRoom:', error.message);
    return false;
  }
}

async function joinRoom() {
  console.log('\n📝 PASO 2: Usuario', USER2_ID, 'uniéndose a sala', roomCode);
  
  try {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: USER2_ID
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Error al unirse a sala:', data);
      return false;
    }

    console.log('✅ Usuario se unió exitosamente');
    console.log('   Estado:', data.room?.status || data.status);
    console.log('   Creator ID:', data.room?.creator_id || data.creator_id);
    console.log('   Opponent ID:', data.room?.opponent_id || data.opponent_id);
    
    return true;
  } catch (error) {
    console.error('❌ Error en joinRoom:', error.message);
    return false;
  }
}

async function getRoomDetails() {
  console.log('\n📝 PASO 3: Obteniendo detalles de la sala', roomCode);
  
  try {
    const response = await fetch(`${BASE_URL}/rooms/code/${roomCode}`);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Error al obtener sala:', data);
      return null;
    }

    console.log('✅ Detalles de la sala:');
    console.log('   Código:', data.code);
    console.log('   Estado:', data.status);
    console.log('   Creator ID:', data.creator_id);
    console.log('   Opponent ID:', data.opponent_id);
    console.log('   Modo de juego:', data.game_mode);
    
    return data;
  } catch (error) {
    console.error('❌ Error en getRoomDetails:', error.message);
    return null;
  }
}

function testWebSocketConnection(userId, userLabel) {
  return new Promise((resolve) => {
    console.log(`\n📝 PASO 4${userLabel}: Conectando WebSocket para usuario ${userId} (${userLabel})`);
    
    const wsUrl = `${WS_URL}/game/${roomCode}?userId=${userId}`;
    console.log('   URL:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    
    const timeout = setTimeout(() => {
      console.log(`⏱️  Timeout de conexión para ${userLabel}`);
      ws.close();
      resolve({ success: false, reason: 'timeout' });
    }, 5000);

    ws.on('open', () => {
      clearTimeout(timeout);
      console.log(`✅ WebSocket conectado exitosamente para ${userLabel}`);
      
      // Intentar enviar un mensaje de inicio
      const initMessage = {
        type: 'player_ready',
        userId: userId,
        roomCode: roomCode
      };
      
      console.log(`   Enviando mensaje:`, initMessage);
      ws.send(JSON.stringify(initMessage));
      
      setTimeout(() => {
        ws.close();
        resolve({ success: true });
      }, 2000);
    });

    ws.on('message', (data) => {
      console.log(`📨 Mensaje recibido para ${userLabel}:`, data.toString());
    });

    ws.on('error', (error) => {
      clearTimeout(timeout);
      console.error(`❌ Error WebSocket para ${userLabel}:`, error.message);
      resolve({ success: false, reason: error.message });
    });

    ws.on('close', (code, reason) => {
      clearTimeout(timeout);
      console.log(`🔌 WebSocket cerrado para ${userLabel}. Código: ${code}, Razón: ${reason || 'N/A'}`);
    });
  });
}

async function runDiagnostic() {
  console.log('🔍 DIAGNÓSTICO DE WEBSOCKET - FLUJO COMPLETO\n');
  console.log('=' .repeat(60));
  
  // Paso 1: Crear sala
  const roomCreated = await createRoom();
  if (!roomCreated) {
    console.log('\n❌ No se pudo crear la sala. Abortando diagnóstico.');
    return;
  }
  
  await wait(1000);
  
  // Paso 2: Intentar WebSocket ANTES de que se una el segundo jugador
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST 1: WebSocket con sala en estado "waiting" (sin oponente)');
  console.log('='.repeat(60));
  
  const resultBeforeJoin = await testWebSocketConnection(USER1_ID, 'Creador (antes de que se una oponente)');
  
  await wait(1000);
  
  // Paso 3: Unir segundo jugador
  console.log('\n' + '='.repeat(60));
  const roomJoined = await joinRoom();
  if (!roomJoined) {
    console.log('\n❌ No se pudo unir a la sala. Abortando resto del diagnóstico.');
    return;
  }
  
  await wait(1000);
  
  // Paso 4: Obtener detalles actualizados
  const roomDetails = await getRoomDetails();
  
  await wait(1000);
  
  // Paso 5: Intentar WebSocket DESPUÉS de que se una el segundo jugador
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST 2: WebSocket con sala en estado "playing" (con oponente)');
  console.log('='.repeat(60));
  
  const resultCreator = await testWebSocketConnection(USER1_ID, 'Creador');
  await wait(1000);
  
  const resultOpponent = await testWebSocketConnection(USER2_ID, 'Oponente');
  
  // Resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE RESULTADOS');
  console.log('='.repeat(60));
  
  console.log('\n1. Creación de sala:', roomCreated ? '✅' : '❌');
  console.log('2. Usuario se une:', roomJoined ? '✅' : '❌');
  console.log('3. WebSocket ANTES de join:', resultBeforeJoin.success ? '✅' : `❌ (${resultBeforeJoin.reason})`);
  console.log('4. WebSocket creador DESPUÉS:', resultCreator.success ? '✅' : `❌ (${resultCreator.reason})`);
  console.log('5. WebSocket oponente:', resultOpponent.success ? '✅' : `❌ (${resultOpponent.reason})`);
  
  console.log('\n💡 CONCLUSIÓN:');
  
  if (!resultBeforeJoin.success && resultCreator.success) {
    console.log('   El WebSocket solo funciona DESPUÉS de que ambos jugadores estén en la sala.');
    console.log('   ⚠️  Tu aplicación debe esperar a que opponent_id no sea null antes de conectar WebSocket.');
  } else if (resultBeforeJoin.success) {
    console.log('   El WebSocket funciona incluso sin oponente.');
  } else if (!resultCreator.success && !resultOpponent.success) {
    console.log('   El WebSocket falla para ambos usuarios.');
    console.log('   ⚠️  Hay un problema en el backend o en la URL del WebSocket.');
  } else {
    console.log('   Resultados mixtos. Revisa los logs arriba para más detalles.');
  }
  
  console.log('\n' + '='.repeat(60));
}

// Ejecutar diagnóstico
runDiagnostic().catch(error => {
  console.error('\n💥 Error fatal en diagnóstico:', error);
});
