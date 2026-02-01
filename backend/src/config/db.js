// src/config/db.js
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1803", // <--- tu password de MySQL
  database: "clinica_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;
