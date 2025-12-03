// Prueba simple en el navegador - COPIAR Y PEGAR EN LA CONSOLA

(async function testGame() {
  const userId = 8; // Cambia este ID por tu userId real
  
  console.log('🎮 Iniciando prueba de juego...\n');
  
  // 1. Crear sala
  const response = await fetch('http://localhost:3000/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId })
  });
  
  const room = await response.json();
  console.log('✅ Sala creada:', room);
  
  const roomCode = room.code || room.room?.code;
  console.log(`\n🔑 Código de sala: ${roomCode}`);
  console.log(`👤 Creador: ${room.creator_id || room.room?.creator_id}`);
  
  // 2. Conectar WebSocket
  const wsUrl = `ws://localhost:3000/game/${roomCode}?userId=${userId}`;
  console.log(`\n🔌 Conectando a: ${wsUrl}\n`);
  
  const ws = new WebSocket(wsUrl);
  
  ws.onopen = () => {
    console.log('✅ WEBSOCKET CONECTADO!');
    
    // Inicializar juego
    ws.send(JSON.stringify({
      type: 'INITIALIZE_GAME',
      payload: { userId, roomCode }
    }));
  };
  
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    console.log('📨 Mensaje:', msg.type, msg.payload);
  };
  
  ws.onerror = (error) => {
    console.error('❌ Error:', error);
  };
  
  ws.onclose = (event) => {
    console.log(`🔴 Cerrado: código ${event.code}, razón: ${event.reason || 'ninguna'}`);
  };
  
  // Guardar en window para poder usar después
  window.testWS = ws;
  window.testRoom = room;
  
  console.log('\n💡 WebSocket guardado en window.testWS');
  console.log('💡 Datos de sala en window.testRoom');
})();
