// models/sessionModel.js
const pool = require('../../db');

const Session = {
  startSession: async (employee_id) => {
    // Primero verificar si ya tiene una sesión activa
    const [activeSessions] = await pool.query(
      'SELECT id FROM sessions WHERE employee_id = ? AND end IS NULL',
      [employee_id]
    );
    
    if (activeSessions.length > 0) {
      throw new Error('El empleado ya tiene una sesión activa');
    }
    
    const [result] = await pool.query(
      'INSERT INTO sessions (employee_id, start) VALUES (?, NOW())',
      [employee_id]
    );
    return { 
      id: result.insertId, 
      employee_id, 
      start: new Date() 
    };
  },

  endSession: async (employee_id) => {
    // Asegurarse de actualizar solo la sesión más reciente sin terminar
    const [result] = await pool.query(
      `UPDATE sessions 
       SET end = NOW() 
       WHERE employee_id = ? AND end IS NULL 
       ORDER BY start DESC LIMIT 1`,
      [employee_id]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('No se encontró una sesión activa para este empleado');
    }
    
    return { 
      employee_id, 
      ended: true,
      affectedRows: result.affectedRows 
    };
  },

  getSessionsByEmployee: async (employee_id, limit = null) => {
    let query = `
      SELECT * FROM sessions 
      WHERE employee_id = ? 
      ORDER BY start DESC
    `;
    
    const params = [employee_id];
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }
    
    const [rows] = await pool.query(query, params);
    return rows;
  },

  // NUEVO: Obtener sesiones de hoy por empleado
  getTodaySessionsByEmployee: async (employee_id) => {
    const [rows] = await pool.query(
      `SELECT * FROM sessions 
       WHERE employee_id = ? AND DATE(start) = CURDATE()
       ORDER BY start DESC`,
      [employee_id]
    );
    return rows;
  },

  // NUEVO: Obtener todas las sesiones de hoy (para todos los empleados)
  getAllTodaySessions: async () => {
    const [rows] = await pool.query(`
      SELECT s.*, e.first_name, e.last_name, e.cedula
      FROM sessions s
      JOIN employees e ON s.employee_id = e.id
      WHERE DATE(s.start) = CURDATE()
      ORDER BY s.start DESC
    `);
    return rows;
  }
};

module.exports = Session;