/**
 * 🔍 Test Rápido de WebSocket
 * Ejecutar: node quick-test-websocket.js
 */

const WebSocket = require('ws');

const url = 'ws://localhost:3000/game/EA37DA?userId=8';

console.log('🧪 Probando conexión WebSocket...');
console.log('📍 URL:', url);
console.log('-'.repeat(60));

const ws = new WebSocket(url);

ws.on('open', () => {
  console.log('✅ CONEXIÓN EXITOSA - El WebSocket funciona!');
  ws.close();
});

ws.on('error', (error) => {
  console.log('❌ ERROR DE CONEXIÓN');
  console.log('Detalles:', error.message);
  console.log('\n💡 Posibles causas:');
  console.log('  1. El endpoint /game/:roomCode no existe en el backend');
  console.log('  2. El backend no tiene WebSocket habilitado');
  console.log('  3. El backend está en un puerto diferente');
  console.log('  4. El backend usa Socket.IO en lugar de WebSocket nativo');
});

ws.on('close', (code, reason) => {
  console.log('\n🔌 Conexión cerrada');
  console.log('Código:', code);
  console.log('Razón:', reason.toString() || 'N/A');
  
  if (code === 1006) {
    console.log('\n⚠️  Código 1006 = El servidor rechazó la conexión WebSocket');
    console.log('   Esto confirma que el endpoint NO acepta WebSocket');
  }
});

setTimeout(() => {
  console.log('\n⏱️  Timeout - No hubo respuesta');
  process.exit(1);
}, 3000);
