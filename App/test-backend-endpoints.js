/**
 * Script de diagnóstico para probar endpoints del backend
 * Ejecutar con: node test-backend-endpoints.js
 */

const BASE_URL = 'http://localhost:3000';

const endpoints = [
  { name: 'Ranking (sin /api)', url: '/ranking' },
  { name: 'Ranking (con /api)', url: '/api/ranking' },
  { name: 'Feature Flags (sin /api)', url: '/feature-flags' },
  { name: 'Feature Flags (con /api)', url: '/api/feature-flags' },
  { name: 'Rooms', url: '/api/rooms' },
  { name: 'Auth Login', url: '/auth/login' },
  { name: 'Auth Login (con /api)', url: '/api/auth/login' },
];

async function testEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint.url}`;
  
  try {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text.substring(0, 100) + (text.length > 100 ? '...' : '');
    }
    
    console.log(`✅ ${endpoint.name}: ${response.status}`);
    console.log(`   URL: ${url}`);
    console.log(`   Content-Type: ${contentType}`);
    
    if (response.status === 200) {
      console.log(`   Response: ${JSON.stringify(data).substring(0, 150)}...`);
    }
    console.log('');
    
    return { success: true, status: response.status, data };
  } catch (error) {
    console.log(`❌ ${endpoint.name}: ERROR`);
    console.log(`   URL: ${url}`);
    console.log(`   Error: ${error.message}`);
    console.log('');
    
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🔍 Probando endpoints del backend...\n');
  console.log(`Base URL: ${BASE_URL}\n`);
  console.log('='.repeat(80));
  console.log('');
  
  const results = {};
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results[endpoint.name] = result;
  }
  
  console.log('='.repeat(80));
  console.log('\n📊 RESUMEN:\n');
  
  const working = Object.entries(results).filter(([_, r]) => r.success && r.status === 200);
  const failing = Object.entries(results).filter(([_, r]) => !r.success || r.status !== 200);
  
  console.log(`✅ Funcionando correctamente: ${working.length}`);
  working.forEach(([name]) => console.log(`   - ${name}`));
  
  console.log(`\n❌ Con errores o no encontrados: ${failing.length}`);
  failing.forEach(([name]) => console.log(`   - ${name}`));
  
  console.log('\n💡 RECOMENDACIÓN:');
  if (working.some(([name]) => name.includes('con /api'))) {
    console.log('   Los endpoints funcionan con el prefijo /api');
    console.log('   Actualiza la configuración para usar: /api/ranking, /api/feature-flags, etc.');
  }
}

runTests().catch(console.error);
