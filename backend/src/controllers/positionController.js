// backend/src/controllers/positionController.js
import * as PositionModel from '../models/positionModel.js';

// Obtener todos los cargos
export const getPositions = async (req, res) => {
    try {
        const positions = await PositionModel.getAllPositions();
        res.json(positions);
    } catch (error) {
        console.error('Error al obtener cargos:', error);
        res.status(500).json({ message: 'Error al obtener cargos' });
    }
};

// Obtener un cargo por ID
export const getPosition = async (req, res) => {
    try {
        const { id } = req.params;
        const position = await PositionModel.getPositionById(id);

        if (!position) {
            return res.status(404).json({ message: 'Cargo no encontrado' });
        }

        res.json(position);
    } catch (error) {
        console.error('Error al obtener cargo:', error);
        res.status(500).json({ message: 'Error al obtener cargo' });
    }
};

// Crear nuevo cargo
export const createPosition = async (req, res) => {
    try {
        const { name, monthly_salary, description } = req.body;

        if (!name || !monthly_salary) {
            return res.status(400).json({
                message: 'Nombre y salario mensual son requeridos'
            });
        }

        const insertId = await PositionModel.createPosition(
            name,
            parseFloat(monthly_salary),
            description
        );

        const newPosition = await PositionModel.getPositionById(insertId);
        res.status(201).json(newPosition);
    } catch (error) {
        console.error('Error al crear cargo:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                message: 'Ya existe un cargo con ese nombre'
            });
        }

        res.status(500).json({ message: 'Error al crear cargo' });
    }
};

// Actualizar cargo
export const updatePosition = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, monthly_salary, description } = req.body;

        if (!name || !monthly_salary) {
            return res.status(400).json({
                message: 'Nombre y salario mensual son requeridos'
            });
        }

        const affectedRows = await PositionModel.updatePosition(
            id,
            name,
            parseFloat(monthly_salary),
            description
        );

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Cargo no encontrado' });
        }

        const updatedPosition = await PositionModel.getPositionById(id);
        res.json(updatedPosition);
    } catch (error) {
        console.error('Error al actualizar cargo:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                message: 'Ya existe un cargo con ese nombre'
            });
        }

        res.status(500).json({ message: 'Error al actualizar cargo' });
    }
};

// Eliminar cargo
export const deletePosition = async (req, res) => {
    try {
        const { id } = req.params;

        const affectedRows = await PositionModel.deletePosition(id);

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Cargo no encontrado' });
        }

        res.json({
            success: true,
            message: 'Cargo eliminado correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar cargo:', error);

        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
                message: 'No se puede eliminar el cargo porque tiene empleados asignados'
            });
        }

        res.status(500).json({ message: 'Error al eliminar cargo' });
    }
};
