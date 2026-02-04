const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING ALL PORTS TO 3002...');

// 1. FIX BACKEND - server.js
const backendFile = path.join(__dirname, 'backend', 'server.js');
let content = fs.readFileSync(backendFile, 'utf8');

// Busca y reemplaza la línea del puerto
content = content.replace(
  /const PORT = (process\.env\.PORT \|\| )?\d+;/,
  'const PORT = 3002; // Forzado a 3002'
);

// También cambia el console.log si existe
content = content.replace(
  /console\.log\\(`✅ Backend corriendo en: http:\/\/localhost:\d+`\\)/,
  'console.log(`✅ Backend corriendo en: http://localhost:3002`)'
);

fs.writeFileSync(backendFile, content);
console.log('✅ Backend FIXED to port 3002');

// 2. FIX FRONTEND - SecretaryModule.jsx
const frontendFile = path.join(__dirname, 'src', 'components', 'Secretaria', 'SecretaryModule.jsx');
if (fs.existsSync(frontendFile)) {
  let frontendContent = fs.readFileSync(frontendFile, 'utf8');
  
  // Cambia TODAS las URLs de 3000 o 3001 a 3002
  frontendContent = frontendContent.replace(
    /http:\/\/localhost:300[01]\/api/g,
    'http://localhost:3002/api'
  );
  
  // También cambia los mensajes de error
  frontendContent = frontendContent.replace(
    /puerto 300[01]/g,
    'puerto 3002'
  );
  
  fs.writeFileSync(frontendFile, frontendContent);
  console.log('✅ Frontend URLs updated to port 3002');
}

console.log('\n🎯 EJECUTA ESTO:');
console.log('1. npm run dev');
console.log('2. Verifica en: http://localhost:3002/api/health');