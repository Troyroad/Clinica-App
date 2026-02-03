// backend/src/controllers/employeeController.js
import db from "../config/db.js";

// 1. OBTENER TODOS LOS EMPLEADOS
export const getEmployees = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        e.id,
        e.first_name as name,
        e.last_name as lastName,
        e.role,
        e.cedula as idNumber
      FROM employees e
      ORDER BY e.first_name, e.last_name
    `);
    
    // Para cada empleado, obtener sus sesiones de hoy
    const employeesWithSessions = await Promise.all(
      rows.map(async (employee) => {
        const [sessions] = await db.query(
          `SELECT id, start, end 
           FROM sessions 
           WHERE employee_id = ? AND DATE(start) = CURDATE()`,
          [employee.id]
        );
        return { ...employee, sessions };
      })
    );
    
    res.json(employeesWithSessions);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ message: 'Error al obtener empleados' });
  }
};

// 2. AGREGAR EMPLEADO
export const addEmployee = async (req, res) => {
  try {
    const { name, lastName, role, idNumber } = req.body;

    if (!name || !lastName || !idNumber) {
      return res.status(400).json({ 
        message: "Campos incompletos: nombre, apellido y cédula son requeridos" 
      });
    }

    const [result] = await db.query(
      `INSERT INTO employees (first_name, last_name, role, cedula) 
       VALUES (?, ?, ?, ?)`,
      [name, lastName, role || 'Empleado', idNumber]
    );
    
    const [newEmployee] = await db.query(
      `SELECT id, first_name as name, last_name as lastName, role, cedula as idNumber 
       FROM employees WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json(newEmployee[0]);
  } catch (error) {
    console.error("❌ Error en addEmployee:", error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        message: "La cédula ya está registrada" 
      });
    }
    
    res.status(500).json({ 
      message: "Error del servidor",
      error: error.message 
    });
  }
};

// 3. ACTUALIZAR EMPLEADO
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, lastName, role, idNumber } = req.body;

    const [result] = await db.query(
      `UPDATE employees 
       SET first_name = ?, last_name = ?, role = ?, cedula = ?
       WHERE id = ?`,
      [name, lastName, role, idNumber, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    res.json({ 
      success: true, 
      message: "Empleado actualizado correctamente" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar empleado" });
  }
};

// 4. ELIMINAR EMPLEADO
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.query(
      "DELETE FROM employees WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Empleado no encontrado" });
    }

    res.json({ 
      success: true, 
      message: "Empleado eliminado correctamente" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar empleado" });
  }
};