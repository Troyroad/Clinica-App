// backend/src/models/positionModel.js
import db from "../config/db.js";

// Obtener todos los cargos
export const getAllPositions = async () => {
    const [rows] = await db.query(`
    SELECT id, name, monthly_salary, description, late_deduction_percentage, created_at, updated_at
    FROM positions
    ORDER BY name
  `);
    return rows;
};

// Obtener un cargo por ID
export const getPositionById = async (id) => {
    const [rows] = await db.query(
        'SELECT * FROM positions WHERE id = ?',
        [id]
    );
    return rows[0];
};

// Crear nuevo cargo
export const createPosition = async (name, monthly_salary, description, late_deduction_percentage) => {
    const [result] = await db.query(
        'INSERT INTO positions (name, monthly_salary, description, late_deduction_percentage) VALUES (?, ?, ?, ?)',
        [name, monthly_salary, description || null, late_deduction_percentage || 0]
    );
    return result.insertId;
};

// Actualizar cargo
export const updatePosition = async (id, name, monthly_salary, description, late_deduction_percentage) => {
    const [result] = await db.query(
        'UPDATE positions SET name = ?, monthly_salary = ?, description = ?, late_deduction_percentage = ? WHERE id = ?',
        [name, monthly_salary, description || null, late_deduction_percentage || 0, id]
    );
    return result.affectedRows;
};

// Eliminar cargo
export const deletePosition = async (id) => {
    const [result] = await db.query(
        'DELETE FROM positions WHERE id = ?',
        [id]
    );
    return result.affectedRows;
};
