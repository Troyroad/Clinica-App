// backend/src/routes/reportRoutes.js
import express from 'express';
import { getDailyReport, getMonthlyReport } from '../controllers/reportController.js';

const router = express.Router();

router.get('/daily', getDailyReport);
router.get('/monthly', getMonthlyReport);

export default router;