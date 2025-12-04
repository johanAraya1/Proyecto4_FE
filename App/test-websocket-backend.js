/**
 * 🧪 Script de Prueba para WebSocket Backend
 * 
 * Este script prueba diferentes formatos de URL WebSocket
 * para identificar cuál acepta el backend.
 * 
 * INSTRUCCIONES:
 * 1. Asegurarse de que el backend esté corriendo en localhost:3000
 * 2. Instalar dependencia: npm install ws
 * 3. Ejecutar: node test-websocket-backend.js
 * 4. Enviar los resultados al equipo de frontend
 */

const WebSocket = require('ws');

console.log('🚀 Iniciando pruebas de WebSocket...\n');
console.log('📍 Backend: http://localhost:3000');
console.log('🎯 Sala de prueba: EA37DA');
console.log('👤 Usuario de prueba: 8\n');
console.log('='.repeat(80));

// Diferentes formatos de URL para probar
const tests = [
  {
    name: 'roomCode en PATH + userId en QUERY',
    url: 'ws://localhost:3000/game/EA37DA?userId=8',
    description: 'Formato: /game/{roomCode}?userId={id}'
  },
  {
    name: 'Todo en QUERY params',
    url: 'ws://localhost:3000/game?roomCode=EA37DA&userId=8',
    description: 'Formato: /game?roomCode={code}&userId={id}'
  },
  {
    name: 'Solo /game sin parámetros',
    url: 'ws://localhost:3000/game',
    description: 'Formato: /game (params en mensaje)'
  },
  {
    name: 'Root / sin path',
    url: 'ws://localhost:3000/',
    description: 'Formato: / (todo en mensaje)'
  },
  {
    name: 'Path /ws/game con roomCode',
    url: 'ws://localhost:3000/ws/game/EA37DA?userId=8',
    description: 'Formato: /ws/game/{roomCode}?userId={id}'
  },
];

let currentTest = 0;

function runTest(testConfig) {
  return new Promise((resolve) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 PRUEBA ${currentTest + 1}/${tests.length}: ${testConfig.name}`);
    console.log(`📍 URL: ${testConfig.url}`);
    console.log(`📝 Descripción: ${testConfig.description}`);
    console.log('-'.repeat(80));

    const ws = new WebSocket(testConfig.url);
    let resolved = false;
    
    const timeout = setTimeout(() => {
      if (!resolved) {
        console.log('⏱️  TIMEOUT - No hubo respuesta en 3 segundos');
        ws.close();
        resolved = true;
        resolve();
      }
    }, 3000);

    ws.on('open', () => {
      console.log('✅ CONEXIÓN ABIERTA - El WebSocket se conectó exitosamente!');
      
      // Enviar mensaje PLAYER_READY
      const message = {
        type: 'PLAYER_READY',
        payload: {
          roomCode: 'EA37DA',
          userId: 8
        }
      };
      
      console.log('📤 Enviando mensaje PLAYER_READY:', JSON.stringify(message, null, 2));
      ws.send(JSON.stringify(message));
    });

    ws.on('message', (data) => {
      console.log('📨 MENSAJE RECIBIDO DEL BACKEND:');
      try {
        const parsed = JSON.parse(data.toString());
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log(data.toString());
      }
    });

    ws.on('error', (error) => {
      console.log('❌ ERROR:', error.message);
    });

    ws.on('close', (code, reason) => {
      console.log(`🔌 CONEXIÓN CERRADA`);
      console.log(`   Código: ${code}`);
      console.log(`   Razón: ${reason.toString() || 'N/A'}`);
      
      // Interpretar código de cierre
      const closeReasons = {
        1000: 'Normal closure',
        1001: 'Going away',
        1002: 'Protocol error',
        1003: 'Unsupported data',
        1006: 'Abnormal closure (sin handshake)',
        1008: 'Policy violation',
        1009: 'Message too big',
        1011: 'Server error'
      };
      
      if (closeReasons[code]) {
        console.log(`   Significado: ${closeReasons[code]}`);
      }
      
      if (code === 1006) {
        console.log('   ⚠️  Esto sugiere que el endpoint no acepta WebSocket');
      } else if (code === 1008) {
        console.log('   ⚠️  Esto sugiere validación fallida en el backend');
      }
      
      clearTimeout(timeout);
      if (!resolved) {
        resolved = true;
        setTimeout(resolve, 500);
      }
    });
  });
}

// Ejecutar pruebas secuencialmente
async function runAllTests() {
  for (let i = 0; i < tests.length; i++) {
    currentTest = i;
    await runTest(tests[i]);
  }
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('🏁 PRUEBAS COMPLETADAS\n');
  console.log('📊 RESUMEN:');
  console.log('   - Si alguna prueba mostró ✅ CONEXIÓN ABIERTA, ese es el formato correcto');
  console.log('   - Si todas fallaron con código 1006, el endpoint WebSocket no existe');
  console.log('   - Si todas fallaron con código 1008, hay un problema de validación');
  console.log('   - Si hubo TIMEOUT, el servidor no está respondiendo');
  console.log('\n📧 Por favor, envía TODOS estos logs al equipo de frontend\n');
  console.log('='.repeat(80));
}

// Iniciar
runAllTests().catch(console.error);
