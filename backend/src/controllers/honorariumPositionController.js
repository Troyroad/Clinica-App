// backend/src/controllers/honorariumPositionController.js
import * as HonorariumPosition from '../models/honorariumPositionModel.js';

// Obtener todos los cargos por honorario
export const getHonorariumPositions = async (req, res) => {
    try {
        const positions = await HonorariumPosition.getAllHonorariumPositions();
        res.json(positions);
    } catch (error) {
        console.error('Error al obtener cargos por honorario:', error);
        res.status(500).json({ message: 'Error al obtener cargos por honorario' });
    }
};

// Obtener un cargo por honorario por ID
export const getHonorariumPosition = async (req, res) => {
    try {
        const { id } = req.params;
        const position = await HonorariumPosition.getHonorariumPositionById(id);

        if (!position) {
            return res.status(404).json({ message: 'Cargo no encontrado' });
        }

        res.json(position);
    } catch (error) {
        console.error('Error al obtener cargo:', error);
        res.status(500).json({ message: 'Error al obtener cargo' });
    }
};

// Crear nuevo cargo por honorario
export const createHonorariumPosition = async (req, res) => {
    try {
        const { name, hourly_rate, description, late_deduction_percentage } = req.body;

        if (!name || !hourly_rate) {
            return res.status(400).json({ message: 'Nombre y tarifa por hora son requeridos' });
        }

        const id = await HonorariumPosition.createHonorariumPosition(
            name,
            hourly_rate,
            description,
            late_deduction_percentage
        );

        res.status(201).json({
            id,
            name,
            hourly_rate,
            description,
            late_deduction_percentage,
            message: 'Cargo creado exitosamente'
        });
    } catch (error) {
        console.error('Error al crear cargo:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Ya existe un cargo con ese nombre' });
        }

        res.status(500).json({ message: 'Error al crear cargo' });
    }
};

// Actualizar cargo por honorario
export const updateHonorariumPosition = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, hourly_rate, description, late_deduction_percentage } = req.body;

        if (!name || !hourly_rate) {
            return res.status(400).json({ message: 'Nombre y tarifa por hora son requeridos' });
        }

        const affectedRows = await HonorariumPosition.updateHonorariumPosition(
            id,
            name,
            hourly_rate,
            description,
            late_deduction_percentage
        );

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Cargo no encontrado' });
        }

        res.json({ message: 'Cargo actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar cargo:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Ya existe un cargo con ese nombre' });
        }

        res.status(500).json({ message: 'Error al actualizar cargo' });
    }
};

// Eliminar cargo por honorario
export const deleteHonorariumPosition = async (req, res) => {
    try {
        const { id } = req.params;
        const affectedRows = await HonorariumPosition.deleteHonorariumPosition(id);

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Cargo no encontrado' });
        }

        res.json({ message: 'Cargo eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar cargo:', error);

        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
                message: 'No se puede eliminar el cargo porque hay empleados asignados a él'
            });
        }

        res.status(500).json({ message: 'Error al eliminar cargo' });
    }
};
