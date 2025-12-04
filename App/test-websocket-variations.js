/**
 * Prueba TODAS las variaciones posibles de WebSocket
 * para identificar si hay algún formato específico que funcione
 */

const WebSocket = require('ws');

const BASE_URL = 'http://localhost:3000';
const ROOM_CODE = '68DDE6'; // Código de sala conocido
const USER_ID = 8; // Usuario conocido

// Variaciones de URL a probar
const urlVariations = [
  // Formato actual (documentado)
  `ws://localhost:3000/game/${ROOM_CODE}?userId=${USER_ID}`,
  
  // Con user_id en lugar de userId
  `ws://localhost:3000/game/${ROOM_CODE}?user_id=${USER_ID}`,
  
  // Con roomCode explícito
  `ws://localhost:3000/game?roomCode=${ROOM_CODE}&userId=${USER_ID}`,
  `ws://localhost:3000/game?code=${ROOM_CODE}&userId=${USER_ID}`,
  
  // Sin parámetros en query (espera que se envíe en mensaje)
  `ws://localhost:3000/game/${ROOM_CODE}`,
  
  // Ruta diferente
  `ws://localhost:3000/ws/game/${ROOM_CODE}?userId=${USER_ID}`,
  `ws://localhost:3000/socket/game/${ROOM_CODE}?userId=${USER_ID}`,
  
  // Con prefijo /api
  `ws://localhost:3000/api/game/${ROOM_CODE}?userId=${USER_ID}`,
  
  // Usando solo el roomId (si conocemos el ID)
  // Formato tradicional socket.io (aunque no parece ser socket.io)
  `ws://localhost:3000/socket.io/?roomCode=${ROOM_CODE}&userId=${USER_ID}`,
  
  // Formato REST-like
  `ws://localhost:3000/rooms/${ROOM_CODE}/game?userId=${USER_ID}`,
];

function testWebSocket(url, index) {
  return new Promise((resolve) => {
    console.log(`\n[${index + 1}/${urlVariations.length}] Probando: ${url}`);
    
    const ws = new WebSocket(url);
    let connected = false;
    
    const timeout = setTimeout(() => {
      if (!connected) {
        console.log('  ⏱️  Timeout (sin respuesta)');
        ws.close();
        resolve({ url, status: 'timeout' });
      }
    }, 3000);

    ws.on('open', () => {
      connected = true;
      clearTimeout(timeout);
      console.log('  ✅ CONEXIÓN EXITOSA!');
      
      // Intentar enviar mensaje de inicio
      const initMsg = JSON.stringify({
        type: 'join_game',
        roomCode: ROOM_CODE,
        userId: USER_ID
      });
      
      ws.send(initMsg);
      console.log('  📤 Mensaje enviado:', initMsg);
      
      setTimeout(() => {
        ws.close();
        resolve({ url, status: 'success' });
      }, 1000);
    });

    ws.on('message', (data) => {
      console.log('  📨 Mensaje recibido:', data.toString());
    });

    ws.on('error', (error) => {
      clearTimeout(timeout);
      
      // Extraer código de error HTTP si está disponible
      const errorMsg = error.message;
      let httpCode = 'unknown';
      
      const match = errorMsg.match(/response code: (\d+)/);
      if (match) {
        httpCode = match[1];
      }
      
      console.log(`  ❌ Error: ${errorMsg} (HTTP ${httpCode})`);
      resolve({ url, status: 'error', httpCode, errorMsg });
    });

    ws.on('close', (code, reason) => {
      clearTimeout(timeout);
      if (connected) {
        console.log(`  🔌 Cerrado. Código: ${code}, Razón: ${reason || 'N/A'}`);
      }
    });
  });
}

async function runTests() {
  console.log('🧪 PROBANDO TODAS LAS VARIACIONES DE WEBSOCKET');
  console.log('='.repeat(70));
  console.log(`Sala: ${ROOM_CODE}`);
  console.log(`Usuario: ${USER_ID}`);
  console.log('='.repeat(70));
  
  const results = [];
  
  // Probar todas las URLs de manera secuencial
  for (let i = 0; i < urlVariations.length; i++) {
    const result = await testWebSocket(urlVariations[i], i);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500)); // Pausa entre pruebas
  }
  
  // Resumen
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN DE RESULTADOS');
  console.log('='.repeat(70));
  
  const successful = results.filter(r => r.status === 'success');
  const errors = results.filter(r => r.status === 'error');
  const timeouts = results.filter(r => r.status === 'timeout');
  
  console.log(`\n✅ Exitosas: ${successful.length}`);
  if (successful.length > 0) {
    successful.forEach(r => console.log(`   - ${r.url}`));
  }
  
  console.log(`\n❌ Con Error: ${errors.length}`);
  if (errors.length > 0) {
    // Agrupar por código HTTP
    const byHttpCode = {};
    errors.forEach(r => {
      const code = r.httpCode || 'unknown';
      if (!byHttpCode[code]) byHttpCode[code] = [];
      byHttpCode[code].push(r.url);
    });
    
    Object.keys(byHttpCode).forEach(code => {
      console.log(`   HTTP ${code}: ${byHttpCode[code].length} URLs`);
      byHttpCode[code].forEach(url => console.log(`     - ${url}`));
    });
  }
  
  console.log(`\n⏱️  Timeouts: ${timeouts.length}`);
  
  console.log('\n' + '='.repeat(70));
  console.log('💡 CONCLUSIÓN:');
  
  if (successful.length > 0) {
    console.log('\n🎉 ¡SE ENCONTRÓ UNA URL QUE FUNCIONA!');
    console.log('   Usa esta URL en tu frontend:');
    console.log(`   ${successful[0].url.replace(ROOM_CODE, '{roomCode}').replace(String(USER_ID), '{userId}')}`);
  } else if (errors.every(r => r.httpCode === '400')) {
    console.log('\n⚠️  Todas las URLs retornan HTTP 400');
    console.log('   Esto indica un problema en el backend:');
    console.log('   - El servidor acepta la conexión WebSocket pero la rechaza');
    console.log('   - Posiblemente falta autenticación o headers');
    console.log('   - O el endpoint WebSocket no está implementado correctamente');
    console.log('\n   📝 ACCIÓN REQUERIDA:');
    console.log('   Contacta al desarrollador del backend con el archivo:');
    console.log('   WEBSOCKET_BUG_REPORT.md');
  } else {
    console.log('\n❓ Resultados mixtos. Revisa los errores específicos arriba.');
  }
  
  console.log('\n' + '='.repeat(70));
}

// Ejecutar pruebas
runTests().catch(error => {
  console.error('\n💥 Error fatal:', error);
});
