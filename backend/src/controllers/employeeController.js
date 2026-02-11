// backend/src/controllers/employeeController.js
import db from "../config/db.js";

// 1. OBTENER TODOS LOS EMPLEADOS
export const getEmployees = async (req, res) => {
  try {
    const { date } = req.query; // Permitir consultar por fecha específica
    const targetDate = date || 'CURDATE()';

    const [rows] = await db.query(`
      SELECT 
        e.id,
        e.first_name as name,
        e.last_name as lastName,
        e.role,
        e.cedula as idNumber,
        e.position_id as positionId,
        e.honorarium_position_id as honorariumPositionId,
        p.name as positionName,
        p.monthly_salary as monthlySalary,
        p.late_deduction_percentage as lateDeductionPercentage,
        hp.name as honorariumPositionName,
        hp.hourly_rate as hourlyRate,
        hp.late_deduction_percentage as honorariumLateDeductionPercentage
      FROM employees e
      LEFT JOIN positions p ON e.position_id = p.id
      LEFT JOIN honorarium_positions hp ON e.honorarium_position_id = hp.id
      ORDER BY e.first_name, e.last_name
    `);

    // Para cada empleado, obtener sus sesiones
    const employeesWithSessions = await Promise.all(
      rows.map(async (employee) => {
        const sessionQuery = date
          ? `SELECT id, start, end, shift, late_minutes 
             FROM sessions 
             WHERE employee_id = ? AND DATE(start) = ?`
          : `SELECT id, start, end, shift, late_minutes 
             FROM sessions 
             WHERE employee_id = ? AND DATE(start) = CURDATE()`;

        const sessionParams = date ? [employee.id, date] : [employee.id];
        const [sessions] = await db.query(sessionQuery, sessionParams);

        // También obtener sesiones de honorario si aplica
        let honorariumSessions = [];
        if (employee.honorariumPositionId) {
          const honorariumQuery = date
            ? `SELECT id, start, end, notes FROM honorarium_sessions WHERE employee_id = ? AND DATE(start) = ?`
            : `SELECT id, start, end, notes FROM honorarium_sessions WHERE employee_id = ? AND DATE(start) = CURDATE()`;
          const honorariumParams = date ? [employee.id, date] : [employee.id];
          [honorariumSessions] = await db.query(honorariumQuery, honorariumParams);
        }

        return { ...employee, sessions, honorariumSessions };
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
    const { name, lastName, role, idNumber, positionId, honorariumPositionId } = req.body;

    if (!name || !lastName || !idNumber) {
      return res.status(400).json({
        message: "Campos incompletos: nombre, apellido y cédula son requeridos"
      });
    }

    const [result] = await db.query(
      `INSERT INTO employees (first_name, last_name, role, cedula, position_id, honorarium_position_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, lastName, role || 'Empleado', idNumber, positionId || null, honorariumPositionId || null]
    );

    const [newEmployee] = await db.query(
      `SELECT e.id, e.first_name as name, e.last_name as lastName, e.role, 
              e.cedula as idNumber, e.position_id as positionId, e.honorarium_position_id as honorariumPositionId,
              p.name as positionName, p.monthly_salary as monthlySalary,
              hp.name as honorariumPositionName, hp.hourly_rate as hourlyRate
       FROM employees e
       LEFT JOIN positions p ON e.position_id = p.id
       LEFT JOIN honorarium_positions hp ON e.honorarium_position_id = hp.id
       WHERE e.id = ?`,
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
    const { name, lastName, role, idNumber, positionId, honorariumPositionId } = req.body;

    const [result] = await db.query(
      `UPDATE employees 
       SET first_name = ?, last_name = ?, role = ?, cedula = ?, position_id = ?, honorarium_position_id = ?
       WHERE id = ?`,
      [name, lastName, role, idNumber, positionId || null, honorariumPositionId || null, id]
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