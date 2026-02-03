// backend/src/routes/employeesRoutes.js
import express from "express";
import { 
  getEmployees, 
  addEmployee, 
  updateEmployee, 
  deleteEmployee 
} from "../controllers/employeeController.js";  // SIN "s"

const router = express.Router();

router.get("/", getEmployees);
router.post("/", addEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;