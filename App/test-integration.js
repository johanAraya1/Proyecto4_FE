/**
 * Script de prueba de integración Frontend-Backend
 * Ejecutar con: node test-integration.js
 * 
 * Este script verifica que todas las rutas estén correctamente configuradas
 */

const WebSocket = require('ws');
const BASE_URL = 'http://localhost:3000';

console.log('🧪 PRUEBA DE INTEGRACIÓN FRONTEND-BACKEND\n');
console.log('='.repeat(80));

async function testEndpoints() {
  // Usar un usuario que existe en la BD (del contexto sabemos que 8 y 9 existen)
  const userId = 8;
  console.log(`\n👤 Usuario de prueba: ${userId} (usuario existente en BD)\n`);

  try {
    // 1. Crear sala
    console.log('1️⃣ Creando sala...');
    const createResponse = await fetch(`${BASE_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        user_id: userId,
        name: 'Sala de Prueba'
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Error ${createResponse.status}: ${await createResponse.text()}`);
    }

    const room = await createResponse.json();
    console.log(`   ✅ Sala creada: ${room.code || room.room?.code || 'N/A'}`);
    console.log(`   ID: ${room.id || room.room?.id || 'N/A'}`);
    console.log(`   Status: ${room.status || room.room?.status || 'N/A'}`);
    
    const roomCode = room.code || room.room?.code;
    if (!roomCode) {
      console.log('\n   ⚠️  Respuesta del servidor:', JSON.stringify(room, null, 2));
      throw new Error('No se pudo obtener el código de la sala');
    }

    // 2. Listar salas
    console.log('\n2️⃣ Listando salas activas...');
    const listResponse = await fetch(`${BASE_URL}/rooms`);
    const rooms = await listResponse.json();
    console.log(`   ✅ ${rooms.length} salas encontradas`);

    // 3. Obtener sala por código
    console.log('\n3️⃣ Obteniendo sala por código...');
    const getRoomResponse = await fetch(`${BASE_URL}/rooms/code/${roomCode}`);
    const roomByCode = await getRoomResponse.json();
    console.log(`   ✅ Sala obtenida: ${roomByCode.code || roomByCode.room?.code || 'N/A'}`);

    // 4. Probar WebSocket
    console.log('\n4️⃣ Probando WebSocket...');
    await testWebSocket(roomCode, userId);

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE\n');
    console.log('🎯 Tu frontend está listo para conectarse al backend\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('\n' + '='.repeat(80));
    console.log('\n⚠️  VERIFICA:');
    console.log('1. ¿El backend está corriendo en localhost:3000?');
    console.log('2. ¿Las rutas coinciden con la documentación?');
    console.log('3. ¿Los headers son correctos?\n');
  }
}

function testWebSocket(roomCode, userId) {
  return new Promise((resolve, reject) => {
    const wsUrl = `ws://localhost:3000/game/${roomCode}?userId=${userId}`;
    console.log(`   🔌 Conectando a: ${wsUrl}`);

    const ws = new WebSocket(wsUrl);
    let connected = false;

    const timeout = setTimeout(() => {
      if (!connected) {
        ws.close();
        reject(new Error('WebSocket timeout - no conectó en 5 segundos'));
      }
    }, 5000);

    ws.onopen = () => {
      connected = true;
      clearTimeout(timeout);
      console.log('   ✅ WebSocket conectado');
      
      // Enviar mensaje de prueba
      ws.send(JSON.stringify({
        type: 'INITIALIZE_GAME',
        payload: { userId, roomCode }
      }));
      
      setTimeout(() => {
        ws.close();
        resolve();
      }, 1000);
    };

    ws.onerror = (error) => {
      clearTimeout(timeout);
      reject(new Error(`WebSocket error: ${error.message || 'Unknown error'}`));
    };

    ws.onclose = (event) => {
      if (event.code === 1008) {
        reject(new Error(`WebSocket cerrado con código 1008: ${event.reason || 'Validación fallida'}`));
      }
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(`   📨 Mensaje recibido: ${message.type}`);
    };
  });
}

testEndpoints().catch(console.error);
