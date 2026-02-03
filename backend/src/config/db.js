// backend/src/config/db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1803',
  database: process.env.DB_NAME || 'clinica_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;