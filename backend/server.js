// backend/server.js
import EventEmitter from 'events';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import employeesRoutes from './src/routes/employeesRoutes.js';
import sessionsRoutes from './src/routes/sessionsRoutes.js';

// Corregir la advertencia de MaxListeners
EventEmitter.defaultMaxListeners = 20;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Rutas
app.use('/api/employees', employeesRoutes);
app.use('/api/sessions', sessionsRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando',
    timestamp: new Date().toISOString()
  });
});

// Ruta para verificar la conexión a BD
app.get('/api/test-db', async (req, res) => {
  try {
    const db = await import('./src/config/db.js');
    const [rows] = await db.default.query('SELECT 1 + 1 AS result');
    res.json({ 
      db: 'Conectado', 
      result: rows[0].result 
    });
  } catch (error) {
    res.status(500).json({ 
      db: 'Error', 
      error: error.message 
    });
  }
});

// Manejo de errores 404
app.use((req, res, next) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl 
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error del servidor:', err);
  res.status(500).json({ 
    message: 'Error interno del servidor', 
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.listen(PORT, () => {
  console.log(`\n✅ Backend corriendo en: http://localhost:${PORT}`);
  console.log(`📊 Rutas disponibles:`);
  console.log(`   GET    http://localhost:${PORT}/api/health`);
  console.log(`   GET    http://localhost:${PORT}/api/employees`);
  console.log(`   POST   http://localhost:${PORT}/api/employees`);
  console.log(`   PUT    http://localhost:${PORT}/api/employees/:id`);
  console.log(`   DELETE http://localhost:${PORT}/api/employees/:id`);
  console.log(`   POST   http://localhost:${PORT}/api/sessions/start`);
  console.log(`   POST   http://localhost:${PORT}/api/sessions/end`);
  console.log(`\n⚡ Usa Ctrl+C para detener el servidor\n`);
});