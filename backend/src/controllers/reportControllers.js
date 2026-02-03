// backend/src/controllers/reportController.js
import db from "../config/db.js";

// Reporte diario
export const getDailyReport = async (req, res) => {
  try {
    const { date } = req.query; // formato: YYYY-MM-DD
    
    const [rows] = await db.query(`
      SELECT 
        e.id,
        e.first_name as name,
        e.last_name as lastName,
        e.role,
        e.cedula as idNumber,
        s.start,
        s.end,
        TIMESTAMPDIFF(MINUTE, s.start, COALESCE(s.end, NOW())) as minutes
      FROM employees e
      LEFT JOIN sessions s ON e.id = s.employee_id 
        AND DATE(s.start) = ?
      WHERE s.start IS NOT NULL
      ORDER BY e.last_name, e.first_name
    `, [date || new Date().toISOString().slice(0, 10)]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error en reporte diario:', error);
    res.status(500).json({ message: 'Error al generar reporte' });
  }
};

// Reporte mensual
export const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    const [rows] = await db.query(`
      SELECT 
        e.id,
        e.first_name as name,
        e.last_name as lastName,
        e.cedula as idNumber,
        COUNT(DISTINCT DATE(s.start)) as days_worked,
        SUM(TIMESTAMPDIFF(HOUR, s.start, s.end)) as total_hours,
        COUNT(s.id) as sessions_count
      FROM employees e
      LEFT JOIN sessions s ON e.id = s.employee_id 
        AND YEAR(s.start) = ? 
        AND MONTH(s.start) = ?
        AND s.end IS NOT NULL
      GROUP BY e.id
      ORDER BY e.last_name, e.first_name
    `, [year || new Date().getFullYear(), month || new Date().getMonth() + 1]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error en reporte mensual:', error);
    res.status(500).json({ message: 'Error al generar reporte mensual' });
  }
};