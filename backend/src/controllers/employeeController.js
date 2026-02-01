// src/controllers/employeeController.js
import db from "../config/db.js";

// Obtener todos los empleados activos
export const getEmployees = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        first_name AS name,
        last_name AS lastName,
        role,
        cedula,
        active
      FROM employees
      WHERE active = 1
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener empleados' });
  }
};


// Crear un nuevo empleado
export const addEmployee = async (req, res) => {
  try {
    // 🔹 Lo que llega del frontend
    const { name, lastName, role, idNumber } = req.body;

    if (!name || !lastName || !idNumber) {
      return res.status(400).json({ message: "Campos incompletos" });
    }

    // 🔹 Insertamos usando los nombres REALES de la DB
    const [result] = await db.query(
      `INSERT INTO employees 
        (first_name, last_name, role, cedula, active) 
        VALUES (?, ?, ?, ?, 1)`,
      [name, lastName, role || "Empleado", idNumber]
    );

    // 🔹 Devolvemos el empleado recién creado
    const [rows] = await db.query(
      "SELECT id, first_name, last_name, role, cedula FROM employees WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("❌ Error al agregar empleado:", error);
    res.status(500).json({ message: "Error al agregar empleado" });
  }
};


// Actualizar un empleado
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, role, cedula, active } = req.body;

    await db.query(
      `UPDATE employees SET first_name=?, last_name=?, role=?, cedula=?, active=? WHERE id=?`,
      [first_name, last_name, role, cedula, active, id]
    );

    res.json({ message: "Empleado actualizado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar empleado" });
  }
};
