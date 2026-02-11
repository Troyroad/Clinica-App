// backend/src/models/honorariumPositionModel.js
import db from "../config/db.js";

// Obtener todos los cargos por honorario
export const getAllHonorariumPositions = async () => {
    const [rows] = await db.query(`
    SELECT id, name, hourly_rate, description, late_deduction_percentage, created_at, updated_at
    FROM honorarium_positions
    ORDER BY name
  `);
    return rows;
};

// Obtener un cargo por honorario por ID
export const getHonorariumPositionById = async (id) => {
    const [rows] = await db.query(
        'SELECT * FROM honorarium_positions WHERE id = ?',
        [id]
    );
    return rows[0];
};

// Crear nuevo cargo por honorario
export const createHonorariumPosition = async (name, hourly_rate, description, late_deduction_percentage) => {
    const [result] = await db.query(
        'INSERT INTO honorarium_positions (name, hourly_rate, description, late_deduction_percentage) VALUES (?, ?, ?, ?)',
        [name, hourly_rate, description || null, late_deduction_percentage || 0]
    );
    return result.insertId;
};

// Actualizar cargo por honorario
export const updateHonorariumPosition = async (id, name, hourly_rate, description, late_deduction_percentage) => {
    const [result] = await db.query(
        'UPDATE honorarium_positions SET name = ?, hourly_rate = ?, description = ?, late_deduction_percentage = ? WHERE id = ?',
        [name, hourly_rate, description || null, late_deduction_percentage || 0, id]
    );
    return result.affectedRows;
};

// Eliminar cargo por honorario
export const deleteHonorariumPosition = async (id) => {
    const [result] = await db.query(
        'DELETE FROM honorarium_positions WHERE id = ?',
        [id]
    );
    return result.affectedRows;
};
