// backend/src/models/honorariumSessionModel.js
import db from "../config/db.js";

// Iniciar sesión de honorario
export const startHonorariumSession = async (employee_id, notes) => {
    // Verificar si ya tiene una sesión activa
    const [activeSessions] = await db.query(
        'SELECT id FROM honorarium_sessions WHERE employee_id = ? AND end IS NULL',
        [employee_id]
    );

    if (activeSessions.length > 0) {
        throw new Error('El empleado ya tiene una sesión activa');
    }

    const [result] = await db.query(
        'INSERT INTO honorarium_sessions (employee_id, start, notes) VALUES (?, NOW(), ?)',
        [employee_id, notes || null]
    );

    return {
        id: result.insertId,
        employee_id,
        start: new Date(),
        notes
    };
};

// Finalizar sesión de honorario
export const endHonorariumSession = async (employee_id) => {
    const [result] = await db.query(
        `UPDATE honorarium_sessions 
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
};

// Obtener sesiones de honorario por empleado
export const getHonorariumSessionsByEmployee = async (employee_id, date = null) => {
    let query = `
    SELECT * FROM honorarium_sessions 
    WHERE employee_id = ?
  `;

    const params = [employee_id];

    if (date) {
        query += ' AND DATE(start) = ?';
        params.push(date);
    }

    query += ' ORDER BY start DESC';

    const [rows] = await db.query(query, params);
    return rows;
};

// Obtener sesiones de hoy por empleado
export const getTodayHonorariumSessionsByEmployee = async (employee_id) => {
    const [rows] = await db.query(
        `SELECT * FROM honorarium_sessions 
     WHERE employee_id = ? AND DATE(start) = CURDATE()
     ORDER BY start DESC`,
        [employee_id]
    );
    return rows;
};

// Obtener todas las sesiones de honorario de hoy
export const getAllTodayHonorariumSessions = async () => {
    const [rows] = await db.query(`
    SELECT hs.*, e.first_name, e.last_name, e.cedula
    FROM honorarium_sessions hs
    JOIN employees e ON hs.employee_id = e.id
    WHERE DATE(hs.start) = CURDATE()
    ORDER BY hs.start DESC
  `);
    return rows;
};

// Obtener sesiones por rango de fechas
export const getHonorariumSessionsByDateRange = async (employee_id, startDate, endDate) => {
    const [rows] = await db.query(
        `SELECT * FROM honorarium_sessions 
     WHERE employee_id = ? 
     AND DATE(start) BETWEEN ? AND ?
     ORDER BY start DESC`,
        [employee_id, startDate, endDate]
    );
    return rows;
};
