/**
 * Script de diagnóstico para WebSocket del juego
 * Ejecutar con: node websocket-diagnostic.js
 * 
 * COMPARTIR ESTE OUTPUT CON EL DESARROLLADOR DEL BACKEND
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const ROOM_CODE = 'TEST123';
const USER_ID = 1;

// Rutas posibles para probar
const possiblePaths = [
  `/game/${ROOM_CODE}?userId=${USER_ID}`,
  `/api/game/${ROOM_CODE}?userId=${USER_ID}`,
  `/ws/game/${ROOM_CODE}?userId=${USER_ID}`,
  `/api/ws/game/${ROOM_CODE}?userId=${USER_ID}`,
  `/socket/game/${ROOM_CODE}?userId=${USER_ID}`,
  `/api/socket/game/${ROOM_CODE}?userId=${USER_ID}`,
];

console.log('🔍 DIAGNÓSTICO DE WEBSOCKET - FRONTEND\n');
console.log('='.repeat(80));
console.log(`\n📡 Base URL: ${BASE_URL}`);
console.log(`🎮 Room Code: ${ROOM_CODE}`);
console.log(`👤 User ID: ${USER_ID}\n`);
console.log('='.repeat(80));

function testWebSocketEndpoint(path) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Connection': 'Upgrade',
        'Upgrade': 'websocket',
        'Sec-WebSocket-Version': '13',
        'Sec-WebSocket-Key': Buffer.from('test-key-for-diagnostic').toString('base64'),
      }
    };

    const req = http.request(options, (res) => {
      const result = {
        path,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        headers: res.headers,
        upgradeSuccess: res.statusCode === 101,
      };
      
      resolve(result);
    });

    req.on('error', (error) => {
      resolve({
        path,
        error: error.message,
        upgradeSuccess: false,
      });
    });

    req.on('upgrade', (res, socket, head) => {
      socket.end();
      resolve({
        path,
        statusCode: 101,
        statusMessage: 'Switching Protocols',
        upgradeSuccess: true,
        message: '✅ WEBSOCKET UPGRADE EXITOSO - ESTA ES LA RUTA CORRECTA',
      });
    });

    req.end();
  });
}

async function runDiagnostics() {
  console.log('\n🧪 Probando rutas WebSocket...\n');
  
  const results = [];
  
  for (const path of possiblePaths) {
    const result = await testWebSocketEndpoint(path);
    results.push(result);
    
    console.log(`\n${result.upgradeSuccess ? '✅' : '❌'} ${path}`);
    console.log(`   Status: ${result.statusCode || 'ERROR'} ${result.statusMessage || ''}`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
    
    if (result.message) {
      console.log(`   ${result.message}`);
    }
    
    if (result.headers) {
      const relevantHeaders = ['upgrade', 'connection', 'sec-websocket-accept'];
      const hasRelevant = relevantHeaders.some(h => result.headers[h]);
      if (hasRelevant) {
        console.log('   Headers relevantes:');
        relevantHeaders.forEach(h => {
          if (result.headers[h]) {
            console.log(`     ${h}: ${result.headers[h]}`);
          }
        });
      }
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 RESUMEN:\n');
  
  const successful = results.filter(r => r.upgradeSuccess);
  const badRequest = results.filter(r => r.statusCode === 400);
  const notFound = results.filter(r => r.statusCode === 404);
  const errors = results.filter(r => r.error);
  
  if (successful.length > 0) {
    console.log(`✅ RUTAS QUE FUNCIONAN (${successful.length}):`);
    successful.forEach(r => console.log(`   ${r.path}`));
  } else {
    console.log('❌ NO SE ENCONTRÓ NINGUNA RUTA WEBSOCKET FUNCIONAL');
  }
  
  if (badRequest.length > 0) {
    console.log(`\n⚠️  Rutas con 400 Bad Request (${badRequest.length}):`);
    badRequest.forEach(r => console.log(`   ${r.path}`));
    console.log('   💡 400 puede significar que el endpoint existe pero rechaza la conexión');
  }
  
  if (notFound.length > 0) {
    console.log(`\n❌ Rutas no encontradas 404 (${notFound.length}):`);
    notFound.forEach(r => console.log(`   ${r.path}`));
  }
  
  if (errors.length > 0) {
    console.log(`\n⚠️  Errores de red (${errors.length}):`);
    errors.forEach(r => console.log(`   ${r.path}: ${r.error}`));
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n📝 PREGUNTAS PARA EL DESARROLLADOR DEL BACKEND:\n');
  console.log('1. ¿Cuál es la ruta correcta para conectar WebSocket del juego?');
  console.log('   Formato esperado: ws://host/ruta/{roomCode}?userId={userId}');
  console.log('');
  console.log('2. ¿El WebSocket requiere autenticación o headers especiales?');
  console.log('   (token, api-key, etc.)');
  console.log('');
  console.log('3. ¿Hay alguna validación especial en el handshake?');
  console.log('   (validar que el roomCode existe, userId válido, etc.)');
  console.log('');
  console.log('4. Si estás viendo múltiples 400 Bad Request, ¿puedes revisar los logs');
  console.log('   del backend para ver el motivo específico del rechazo?');
  console.log('');
  console.log('5. ¿El endpoint WebSocket funciona en la versión móvil (ngrok)?');
  console.log('   Si sí, ¿cuál es la diferencia con localhost?');
  
  console.log('\n' + '='.repeat(80));
  console.log('\n💡 INFORMACIÓN ADICIONAL DEL FRONTEND:\n');
  console.log('- Versión del cliente: React Native Web');
  console.log('- WebSocket API: navegador nativo (ws://)');
  console.log(`- URL actual en código: ws://localhost:3000/api/game/{roomCode}?userId={userId}`);
  console.log('- Error recibido: "Unexpected response code: 400"');
  console.log('- El problema ocurre en ambos jugadores (creador y oponente)');
  console.log('\n' + '='.repeat(80));
  
  if (successful.length === 0) {
    console.log('\n❗ ACCIÓN REQUERIDA:');
    console.log('Ninguna ruta WebSocket funcionó. El backend necesita:');
    console.log('1. Verificar que el servidor WebSocket esté corriendo');
    console.log('2. Confirmar la ruta correcta del endpoint');
    console.log('3. Revisar logs del servidor para ver por qué rechaza la conexión');
    console.log('4. Verificar que la sala exista antes de intentar conectar');
  }
}

// Agregar también prueba de endpoints HTTP relacionados
async function testHTTPEndpoints() {
  console.log('\n\n🌐 PROBANDO ENDPOINTS HTTP RELACIONADOS:\n');
  
  const httpEndpoints = [
    { name: 'Crear sala', path: '/api/rooms', method: 'POST' },
    { name: 'Obtener sala por código', path: `/api/rooms/code/${ROOM_CODE}`, method: 'GET' },
    { name: 'Detalles de juego', path: `/api/rooms/${ROOM_CODE}/game-details`, method: 'GET' },
  ];
  
  for (const endpoint of httpEndpoints) {
    try {
      const url = `${BASE_URL}${endpoint.path}`;
      const response = await fetch(url);
      console.log(`${response.ok ? '✅' : '❌'} ${endpoint.name}`);
      console.log(`   ${endpoint.method} ${endpoint.path}`);
      console.log(`   Status: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`❌ ${endpoint.name}`);
      console.log(`   Error: ${error.message}`);
    }
  }
}

runDiagnostics()
  .then(() => testHTTPEndpoints())
  .catch(console.error);
