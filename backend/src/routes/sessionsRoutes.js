import express from 'express';
import { startSession, endSession } from '../controllers/sessionControllers.js';

const router = express.Router();

router.post('/start', startSession);
router.post('/end', endSession);

export default router;
