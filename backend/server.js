// src/server.js
import express from "express";
import cors from "cors";
import employeeRoutes from "./src/routes/employeesRoutes.js";
import db from "./src/config/db.js";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Conexión a MySQL
db.getConnection()
  .then(() => console.log("✅ MySQL conectado"))
  .catch(err => console.error("❌ Error al conectar a MySQL:", err));

// Rutas
app.use("/api/employees", employeeRoutes);

// Servidor
app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});
