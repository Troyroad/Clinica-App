// backend/src/routes/authRoutes.js
import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/login', authController.login);
router.post('/change-password', authController.changePassword);
router.get('/users', authController.getUsers);

export default router;
