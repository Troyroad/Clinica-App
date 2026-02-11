// backend/src/routes/honorariumPositionRoutes.js
import express from 'express';
import * as honorariumPositionController from '../controllers/honorariumPositionController.js';

const router = express.Router();

// Rutas para cargos por honorario
router.get('/', honorariumPositionController.getHonorariumPositions);
router.get('/:id', honorariumPositionController.getHonorariumPosition);
router.post('/', honorariumPositionController.createHonorariumPosition);
router.put('/:id', honorariumPositionController.updateHonorariumPosition);
router.delete('/:id', honorariumPositionController.deleteHonorariumPosition);

export default router;
