// backend/src/routes/honorariumSessionRoutes.js
import express from 'express';
import * as honorariumSessionController from '../controllers/honorariumSessionController.js';

const router = express.Router();

// Rutas para sesiones de honorario
router.post('/start', honorariumSessionController.startSession);
router.post('/end', honorariumSessionController.endSession);
router.get('/today', honorariumSessionController.getTodaySessions);
router.get('/employee/:employee_id', honorariumSessionController.getEmployeeSessions);

export default router;
