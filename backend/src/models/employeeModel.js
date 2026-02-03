// models/employeeModel.js
const pool = require('../../db');

const Employee = {
  getAll: async () => {
    // ❌ ANTES: SELECT * FROM employees WHERE active = 1
    // ✅ AHORA: La tabla no tiene columna 'active', y solo tiene 4 campos
    const [rows] = await pool.query(`
      SELECT 
        id,
        first_name,
        last_name,
        role,
        cedula
      FROM employees
    `);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.query(
      `SELECT 
        id,
        first_name,
        last_name,
        role,
        cedula
       FROM employees WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  create: async (data) => {
    // ❌ ANTES: name, role, pay_type, pay_rate (no existen)
    // ✅ AHORA: first_name, last_name, role, cedula
    const [result] = await pool.query(
      'INSERT INTO employees (first_name, last_name, role, cedula) VALUES (?, ?, ?, ?)',
      [data.first_name, data.last_name, data.role || 'Empleado', data.cedula]
    );
    return { 
      id: result.insertId, 
      first_name: data.first_name, 
      last_name: data.last_name, 
      role: data.role || 'Empleado', 
      cedula: data.cedula 
    };
  },

  update: async (id, data) => {
    // ❌ ANTES: name, role, pay_type, pay_rate, active
    // ✅ AHORA: first_name, last_name, role, cedula
    await pool.query(
      'UPDATE employees SET first_name = ?, last_name = ?, role = ?, cedula = ? WHERE id = ?',
      [data.first_name, data.last_name, data.role, data.cedula, id]
    );
    return { 
      id, 
      first_name: data.first_name, 
      last_name: data.last_name, 
      role: data.role, 
      cedula: data.cedula 
    };
  },

  delete: async (id) => {
    // ❌ ANTES: UPDATE employees SET active = 0 (no existe columna active)
    // ✅ AHORA: DELETE físico (o puedes cambiar si quieres eliminación lógica)
    await pool.query('DELETE FROM employees WHERE id = ?', [id]);
    return { id };
  },

  // NUEVO: Buscar por cédula (para validar duplicados)
  findByCedula: async (cedula) => {
    const [rows] = await pool.query(
      'SELECT id FROM employees WHERE cedula = ?',
      [cedula]
    );
    return rows[0];
  }
};

module.exports = Employee;