/**
 * Script para probar qué mensajes espera el backend al conectarse
 */

const WebSocket = require('ws');

const ROOM_CODE = '68DDE6';
const USER1_ID = 8;
const USER2_ID = 9;

function connectAndSendMessage(userId, message, label) {
  return new Promise((resolve) => {
    console.log(`\n🔌 Conectando ${label} (userId=${userId})`);
    
    const url = `ws://localhost:3000/game?roomCode=${ROOM_CODE}&userId=${userId}`;
    const ws = new WebSocket(url);
    
    const timeout = setTimeout(() => {
      console.log(`  ⏱️  Timeout para ${label}`);
      ws.close();
      resolve({ success: false, messages: [] });
    }, 5000);

    ws.on('open', () => {
      console.log(`  ✅ Conectado! Enviando mensaje...`);
      console.log(`  📤 Mensaje:`, JSON.stringify(message, null, 2));
      
      ws.send(JSON.stringify(message));
      
      // Esperar respuestas
      setTimeout(() => {
        ws.close();
      }, 3000);
    });

    const receivedMessages = [];

    ws.on('message', (data) => {
      const msg = data.toString();
      console.log(`  📨 Respuesta del servidor:`, msg);
      
      try {
        receivedMessages.push(JSON.parse(msg));
      } catch (e) {
        receivedMessages.push(msg);
      }
    });

    ws.on('error', (error) => {
      clearTimeout(timeout);
      console.log(`  ❌ Error:`, error.message);
      resolve({ success: false, messages: receivedMessages });
    });

    ws.on('close', (code, reason) => {
      clearTimeout(timeout);
      console.log(`  🔌 Cerrado - Código: ${code}, Razón: ${reason || 'N/A'}`);
      resolve({ 
        success: code !== 1008, 
        messages: receivedMessages,
        closeCode: code,
        closeReason: reason?.toString()
      });
    });
  });
}

async function runTests() {
  console.log('🧪 PROBANDO MENSAJES DE WEBSOCKET');
  console.log('='.repeat(70));
  console.log(`Sala: ${ROOM_CODE}`);
  console.log('='.repeat(70));
  
  // Test 1: Enviar PLAYER_READY con userId 8
  console.log('\n📝 TEST 1: Mensaje PLAYER_READY (Jugador 1)');
  console.log('='.repeat(70));
  
  const message1 = {
    type: 'PLAYER_READY',
    payload: {
      roomCode: ROOM_CODE,
      userId: USER1_ID
    }
  };
  
  const result1 = await connectAndSendMessage(USER1_ID, message1, 'Jugador 1');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: Enviar PLAYER_READY con userId 9
  console.log('\n📝 TEST 2: Mensaje PLAYER_READY (Jugador 2)');
  console.log('='.repeat(70));
  
  const message2 = {
    type: 'PLAYER_READY',
    payload: {
      roomCode: ROOM_CODE,
      userId: USER2_ID
    }
  };
  
  const result2 = await connectAndSendMessage(USER2_ID, message2, 'Jugador 2');
  
  // Resumen
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN');
  console.log('='.repeat(70));
  
  console.log(`\nJugador 1 (userId=${USER1_ID}):`);
  console.log(`  Estado: ${result1.success ? '✅ Éxito' : '❌ Falló'}`);
  console.log(`  Código de cierre: ${result1.closeCode || 'N/A'}`);
  console.log(`  Razón: ${result1.closeReason || 'N/A'}`);
  console.log(`  Mensajes recibidos: ${result1.messages.length}`);
  if (result1.messages.length > 0) {
    result1.messages.forEach((msg, i) => {
      console.log(`    ${i + 1}. ${JSON.stringify(msg)}`);
    });
  }
  
  console.log(`\nJugador 2 (userId=${USER2_ID}):`);
  console.log(`  Estado: ${result2.success ? '✅ Éxito' : '❌ Falló'}`);
  console.log(`  Código de cierre: ${result2.closeCode || 'N/A'}`);
  console.log(`  Razón: ${result2.closeReason || 'N/A'}`);
  console.log(`  Mensajes recibidos: ${result2.messages.length}`);
  if (result2.messages.length > 0) {
    result2.messages.forEach((msg, i) => {
      console.log(`    ${i + 1}. ${JSON.stringify(msg)}`);
    });
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('💡 INTERPRETACIÓN:');
  
  if (result1.closeCode === 1008 || result2.closeCode === 1008) {
    console.log('  ⚠️  Código 1008 = El backend rechazó el mensaje');
    console.log('  Razón:', result1.closeReason || result2.closeReason);
    console.log('  El backend espera un formato diferente de mensaje.');
  } else if (result1.success || result2.success) {
    console.log('  ✅ El backend aceptó el mensaje PLAYER_READY');
    console.log('  Revisa los mensajes recibidos para ver la respuesta del servidor.');
  } else {
    console.log('  ❓ Resultados no concluyentes. Revisa los detalles arriba.');
  }
  
  console.log('\n' + '='.repeat(70));
}

runTests().catch(error => {
  console.error('\n💥 Error fatal:', error);
});
