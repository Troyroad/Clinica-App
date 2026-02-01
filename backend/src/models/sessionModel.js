const pool = require('../../db');

const Session = {
  startSession: async (employee_id) => {
    const [result] = await pool.query(
      'INSERT INTO sessions (employee_id, start) VALUES (?, NOW())',
      [employee_id]
    );
    return { id: result.insertId, employee_id, start: new Date() };
  },

  endSession: async (employee_id) => {
    const [result] = await pool.query(
      'UPDATE sessions SET end = NOW() WHERE employee_id = ? AND end IS NULL',
      [employee_id]
    );
    return { employee_id, ended: true };
  },

  getSessionsByEmployee: async (employee_id) => {
    const [rows] = await pool.query(
      'SELECT * FROM sessions WHERE employee_id = ? ORDER BY start DESC',
      [employee_id]
    );
    return rows;
  }
};

module.exports = Session;
