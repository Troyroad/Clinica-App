// backend/src/routes/positionRoutes.js
import express from 'express';
import {
    getPositions,
    getPosition,
    createPosition,
    updatePosition,
    deletePosition
} from '../controllers/positionController.js';

const router = express.Router();

router.get('/', getPositions);
router.get('/:id', getPosition);
router.post('/', createPosition);
router.put('/:id', updatePosition);
router.delete('/:id', deletePosition);

export default router;
