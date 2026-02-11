// backend/src/controllers/honorariumSessionController.js
import * as HonorariumSession from '../models/honorariumSessionModel.js';

// Iniciar sesión de honorario
export const startSession = async (req, res) => {
    try {
        const { employee_id, notes } = req.body;

        if (!employee_id) {
            return res.status(400).json({ error: 'employee_id es requerido' });
        }

        const session = await HonorariumSession.startHonorariumSession(employee_id, notes);
        res.status(201).json(session);
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(400).json({ error: error.message });
    }
};

// Finalizar sesión de honorario
export const endSession = async (req, res) => {
    try {
        const { employee_id } = req.body;

        if (!employee_id) {
            return res.status(400).json({ error: 'employee_id es requerido' });
        }

        const result = await HonorariumSession.endHonorariumSession(employee_id);
        res.json(result);
    } catch (error) {
        console.error('Error al finalizar sesión:', error);
        res.status(400).json({ error: error.message });
    }
};

// Obtener sesiones de un empleado
export const getEmployeeSessions = async (req, res) => {
    try {
        const { employee_id } = req.params;
        const { date } = req.query;

        const sessions = await HonorariumSession.getHonorariumSessionsByEmployee(employee_id, date);
        res.json(sessions);
    } catch (error) {
        console.error('Error al obtener sesiones:', error);
        res.status(500).json({ error: 'Error al obtener sesiones' });
    }
};

// Obtener sesiones de hoy
export const getTodaySessions = async (req, res) => {
    try {
        const sessions = await HonorariumSession.getAllTodayHonorariumSessions();
        res.json(sessions);
    } catch (error) {
        console.error('Error al obtener sesiones de hoy:', error);
        res.status(500).json({ error: 'Error al obtener sesiones' });
    }
};
