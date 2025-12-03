/**
 * Prueba final: Verificar que el WebSocket funciona con el formato correcto
 */

const WebSocket = require('ws');

const ROOM_CODE = '68DDE6'; // Sala conocida
const USER1_ID = 8; // Creador
const USER2_ID = 9; // Oponente

function testConnection(userId, label) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Probando conexión para ${label} (userId=${userId})`);
    
    const url = `ws://localhost:3000/game?roomCode=${ROOM_CODE}&userId=${userId}`;
    console.log(`   URL: ${url}`);
    
    const ws = new WebSocket(url);
    let receivedMessages = [];
    
    const timeout = setTimeout(() => {
      console.log('  ⏱️  Timeout - cerrando conexión');
      ws.close();
      resolve({ success: false, reason: 'timeout', messages: receivedMessages });
    }, 5000);

    ws.on('open', () => {
      clearTimeout(timeout);
      console.log('  ✅ Conexión WebSocket establecida!');
      
      // Enviar mensaje de prueba
      const testMessage = {
        type: 'player_ready',
        roomCode: ROOM_CODE,
        userId: userId
      };
      
      ws.send(JSON.stringify(testMessage));
      console.log('  📤 Mensaje enviado:', JSON.stringify(testMessage));
      
      // Esperar respuestas por 2 segundos
      setTimeout(() => {
        ws.close();
        resolve({ success: true, messages: receivedMessages });
      }, 2000);
    });

    ws.on('message', (data) => {
      const message = data.toString();
      console.log('  📨 Mensaje recibido:', message);
      
      try {
        const parsed = JSON.parse(message);
        receivedMessages.push(parsed);
      } catch (e) {
        receivedMessages.push(message);
      }
    });

    ws.on('error', (error) => {
      clearTimeout(timeout);
      console.log('  ❌ Error:', error.message);
      resolve({ success: false, reason: error.message, messages: receivedMessages });
    });

    ws.on('close', (code, reason) => {
      clearTimeout(timeout);
      console.log(`  🔌 Conexión cerrada - Código: ${code}, Razón: ${reason || 'N/A'}`);
    });
  });
}

async function runTest() {
  console.log('🎯 PRUEBA FINAL: WebSocket con formato correcto');
  console.log('='.repeat(70));
  console.log(`Sala: ${ROOM_CODE}`);
  console.log(`URL Format: ws://localhost:3000/game?roomCode={code}&userId={id}`);
  console.log('='.repeat(70));
  
  // Probar con el creador
  const resultCreator = await testConnection(USER1_ID, 'Creador');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Probar con el oponente
  const resultOpponent = await testConnection(USER2_ID, 'Oponente');
  
  // Resumen
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN');
  console.log('='.repeat(70));
  
  console.log(`\nCreador (userId=${USER1_ID}):`, resultCreator.success ? '✅' : `❌ (${resultCreator.reason})`);
  console.log(`Oponente (userId=${USER2_ID}):`, resultOpponent.success ? '✅' : `❌ (${resultOpponent.reason})`);
  
  if (resultCreator.success || resultOpponent.success) {
    console.log('\n🎉 ¡WebSocket funcionando correctamente!');
    
    if (resultCreator.messages.length > 0 || resultOpponent.messages.length > 0) {
      console.log('\n📬 Mensajes recibidos:');
      if (resultCreator.messages.length > 0) {
        console.log(`  Creador: ${JSON.stringify(resultCreator.messages)}`);
      }
      if (resultOpponent.messages.length > 0) {
        console.log(`  Oponente: ${JSON.stringify(resultOpponent.messages)}`);
      }
    }
    
    console.log('\n✅ SIGUIENTE PASO:');
    console.log('   Recarga tu aplicación web para que use el nuevo formato de URL.');
    console.log('   El servicio gameWebSocketService.js ya ha sido actualizado.');
  } else {
    console.log('\n⚠️  Aún hay problemas con la conexión.');
    console.log('   Verifica que el backend esté ejecutándose en localhost:3000');
  }
  
  console.log('\n' + '='.repeat(70));
}

runTest().catch(error => {
  console.error('\n💥 Error fatal:', error);
});
