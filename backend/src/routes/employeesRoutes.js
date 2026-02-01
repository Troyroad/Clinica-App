// src/routes/employeeRoutes.js
import express from "express";
import { getEmployees, addEmployee, updateEmployee } from "../controllers/employeeController.js";

const router = express.Router();

router.get("/", getEmployees);
router.post("/", addEmployee);
router.put("/:id", updateEmployee);

export default router;
