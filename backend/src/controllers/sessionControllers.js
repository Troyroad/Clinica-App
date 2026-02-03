// backend/src/controllers/sessionControllers.js
import db from "../config/db.js";

// 1. Iniciar sesión (marcar entrada)
export const startSession = async (req, res) => {
  try {
    const { employee_id } = req.body;

    if (!employee_id) {
      return res.status(400).json({ 
        success: false,
        error: 'Se requiere employee_id' 
      });
    }

    // Verificar que no tenga una sesión activa
    const [activeSessions] = await db.query(
      'SELECT id FROM sessions WHERE employee_id = ? AND end IS NULL',
      [employee_id]
    );
    
    if (activeSessions.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: 'El empleado ya tiene una sesión activa' 
      });
    }
    
    const [result] = await db.query(
      'INSERT INTO sessions (employee_id, start) VALUES (?, NOW())',
      [employee_id]
    );
    
    res.json({ 
      success: true, 
      id: result.insertId,
      message: 'Entrada registrada correctamente' 
    });
  } catch (err) {
    console.error('Error en startSession:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error al iniciar sesión' 
    });
  }
};

// 2. Finalizar sesión (marcar salida)
export const endSession = async (req, res) => {
  try {
    const { employee_id } = req.body;

    if (!employee_id) {
      return res.status(400).json({ 
        success: false,
        error: 'Se requiere employee_id' 
      });
    }

    const [result] = await db.query(
      `UPDATE sessions 
       SET end = NOW() 
       WHERE employee_id = ? AND end IS NULL 
       ORDER BY start DESC LIMIT 1`,
      [employee_id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'No se encontró una sesión activa para este empleado' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Salida registrada correctamente' 
    });
  } catch (err) {
    console.error('Error en endSession:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error al finalizar sesión' 
    });
  }
};

// 3. Obtener sesiones (opcional)
export const getSessions = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, e.first_name, e.last_name 
      FROM sessions s
      JOIN employees e ON s.employee_id = e.id
      ORDER BY s.start DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error en getSessions:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener sesiones' 
    });
  }
};