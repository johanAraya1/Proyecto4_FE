/**
 * Probar diferentes formatos de mensaje para encontrar el correcto
 */

const WebSocket = require('ws');

const ROOM_CODE = '68DDE6';
const USER_ID = 8;

const messageVariations = [
  {
    name: 'Payload con roomCode y userId',
    message: {
      type: 'PLAYER_READY',
      payload: {
        roomCode: ROOM_CODE,
        userId: USER_ID
      }
    }
  },
  {
    name: 'Payload con code en lugar de roomCode',
    message: {
      type: 'PLAYER_READY',
      payload: {
        code: ROOM_CODE,
        userId: USER_ID
      }
    }
  },
  {
    name: 'roomCode fuera de payload',
    message: {
      type: 'PLAYER_READY',
      roomCode: ROOM_CODE,
      userId: USER_ID
    }
  },
  {
    name: 'roomCode fuera de payload con payload vacío',
    message: {
      type: 'PLAYER_READY',
      roomCode: ROOM_CODE,
      userId: USER_ID,
      payload: {}
    }
  },
  {
    name: 'Sin type, solo roomCode',
    message: {
      roomCode: ROOM_CODE,
      userId: USER_ID
    }
  },
  {
    name: 'JOIN_GAME en lugar de PLAYER_READY',
    message: {
      type: 'JOIN_GAME',
      payload: {
        roomCode: ROOM_CODE,
        userId: USER_ID
      }
    }
  }
];

function testMessage(variation, index) {
  return new Promise((resolve) => {
    console.log(`\n[${index + 1}/${messageVariations.length}] ${variation.name}`);
    console.log(`  Mensaje:`, JSON.stringify(variation.message));
    
    const url = `ws://localhost:3000/game?roomCode=${ROOM_CODE}&userId=${USER_ID}`;
    const ws = new WebSocket(url);
    
    const timeout = setTimeout(() => {
      ws.close();
      resolve({ success: false, reason: 'timeout' });
    }, 3000);

    ws.on('open', () => {
      ws.send(JSON.stringify(variation.message));
    });

    const messages = [];

    ws.on('message', (data) => {
      const msg = data.toString();
      console.log(`  📨 Respuesta:`, msg);
      try {
        messages.push(JSON.parse(msg));
      } catch (e) {
        messages.push(msg);
      }
    });

    ws.on('close', (code, reason) => {
      clearTimeout(timeout);
      const reasonStr = reason?.toString() || 'N/A';
      console.log(`  🔌 Código: ${code}, Razón: ${reasonStr}`);
      
      if (code === 1000) {
        console.log(`  ✅ ÉXITO - Conexión cerrada normalmente`);
        resolve({ success: true, messages, code, reason: reasonStr });
      } else if (code === 1008) {
        console.log(`  ❌ RECHAZADO - ${reasonStr}`);
        resolve({ success: false, messages, code, reason: reasonStr });
      } else {
        console.log(`  ⚠️  RESULTADO INESPERADO`);
        resolve({ success: messages.length > 0, messages, code, reason: reasonStr });
      }
    });

    ws.on('error', (error) => {
      clearTimeout(timeout);
      console.log(`  ❌ Error:`, error.message);
      resolve({ success: false, reason: error.message });
    });
  });
}

async function runTests() {
  console.log('🧪 PROBANDO FORMATOS DE MENSAJE');
  console.log('='.repeat(70));
  console.log(`Sala: ${ROOM_CODE}, Usuario: ${USER_ID}`);
  console.log('='.repeat(70));
  
  const results = [];
  
  for (let i = 0; i < messageVariations.length; i++) {
    const result = await testMessage(messageVariations[i], i);
    results.push({ ...result, name: messageVariations[i].name });
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Resumen
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN');
  console.log('='.repeat(70));
  
  const successful = results.filter(r => r.success || r.code === 1000 || (r.messages && r.messages.length > 0));
  const rejected = results.filter(r => r.code === 1008);
  
  console.log(`\n✅ Formatos que funcionaron: ${successful.length}`);
  successful.forEach(r => {
    console.log(`   - ${r.name}`);
    if (r.messages && r.messages.length > 0) {
      console.log(`     Mensajes recibidos: ${JSON.stringify(r.messages)}`);
    }
  });
  
  console.log(`\n❌ Formatos rechazados: ${rejected.length}`);
  rejected.forEach(r => {
    console.log(`   - ${r.name}: ${r.reason}`);
  });
  
  if (successful.length > 0) {
    console.log('\n🎉 ¡ENCONTRADO! Usa este formato:');
    console.log(JSON.stringify(messageVariations.find((_, i) => 
      results[i].success || results[i].code === 1000 || (results[i].messages && results[i].messages.length > 0)
    ).message, null, 2));
  } else {
    console.log('\n⚠️  Ningún formato funcionó. Contacta al desarrollador del backend.');
  }
  
  console.log('\n' + '='.repeat(70));
}

runTests().catch(error => {
  console.error('\n💥 Error fatal:', error);
});
