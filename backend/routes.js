import express from 'express'
import { getActiveEmployees, addEmployee, deleteEmployee } from './controllers/employeeController.js'
import { startSession, endSession } from './controllers/sessionController.js'

const router = express.Router()

router.get('/employees/active', getActiveEmployees)
router.post('/employees', addEmployee)
router.delete('/employees/:id', deleteEmployee)

router.post('/sessions/start', startSession)
router.post('/sessions/end', endSession)

export default router
