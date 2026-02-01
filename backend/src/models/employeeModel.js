const pool = require('../../db');

const Employee = {
  getAll: async () => {
    const [rows] = await pool.query('SELECT * FROM employees WHERE active = 1');
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [id]);
    return rows[0];
  },

  create: async ({ name, role, pay_type, pay_rate }) => {
    const [result] = await pool.query(
      'INSERT INTO employees (name, role, pay_type, pay_rate) VALUES (?, ?, ?, ?)',
      [name, role, pay_type, pay_rate]
    );
    return { id: result.insertId, name, role, pay_type, pay_rate };
  },

  update: async (id, { name, role, pay_type, pay_rate, active }) => {
    await pool.query(
      'UPDATE employees SET name = ?, role = ?, pay_type = ?, pay_rate = ?, active = ? WHERE id = ?',
      [name, role, pay_type, pay_rate, active, id]
    );
    return { id, name, role, pay_type, pay_rate, active };
  },

  delete: async (id) => {
    await pool.query('UPDATE employees SET active = 0 WHERE id = ?', [id]);
    return { id };
  }
};

module.exports = Employee;
