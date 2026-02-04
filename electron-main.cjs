const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const mysql = require('mysql2')

// Configuración de la conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1803',
  database: 'clinica_db'
})

// Conectar a la base de datos
db.connect(err => {
  if (err) {
    console.error('❌ Error conectando a MySQL:', err)
  } else {
    console.log('✅ MySQL conectado correctamente')
  }
})

// ============================================================================
// MANEJADORES IPC SIMPLIFICADOS
// ============================================================================

// 1. LOGIN
ipcMain.handle('login', async (event, { username, password }) => {
  console.log('🔐 Login para:', username)
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results[0] || null)
        }
      }
    )
  })
})

// 2. AGREGAR USUARIO (Admin)
ipcMain.handle('agregar-usuario', async (event, userData) => {
  console.log('📥 Agregando usuario:', userData.username)
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [userData.username, userData.password, userData.role],
      (err, results) => {
        if (err) {
          console.error('Error:', err.message)
          resolve({ success: false, error: err.message })
        } else {
          resolve({ success: true, id: results.insertId })
        }
      }
    )
  })
})

// 3. OBTENER USUARIOS (Admin)
ipcMain.handle('obtener-usuarios', async (event) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT id, username, role, created_at FROM users', (err, results) => {
      if (err) reject(err)
      else resolve(results)
    })
  })
})

// 4. AGREGAR EMPLEADO (Solo los campos que necesitas)
ipcMain.handle('agregar-empleado', async (event, empleado) => {
  console.log('👨‍⚕️ Agregando empleado:', empleado)
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO employees (first_name, last_name, role, cedula) VALUES (?, ?, ?, ?)',
      [empleado.first_name, empleado.last_name, empleado.role, empleado.cedula],
      (err, results) => {
        if (err) {
          console.error('Error:', err.message)
          resolve({ success: false, error: err.message })
        } else {
          resolve({ success: true, id: results.insertId })
        }
      }
    )
  })
})

// 5. OBTENER EMPLEADOS (Solo los campos que necesitas)
ipcMain.handle('obtener-empleados', async (event) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT id, first_name, last_name, role, cedula FROM employees',
      (err, results) => {
        if (err) reject(err)
        else resolve(results)
      }
    )
  })
})

// 6. ACTUALIZAR EMPLEADO
ipcMain.handle('actualizar-empleado', async (event, empleado) => {
  return new Promise((resolve, reject) => {
    db.query(
      'UPDATE employees SET first_name = ?, last_name = ?, role = ?, cedula = ? WHERE id = ?',
      [empleado.first_name, empleado.last_name, empleado.role, empleado.cedula, empleado.id],
      (err, results) => {
        if (err) reject(err)
        else resolve({ success: true })
      }
    )
  })
})

// 7. ELIMINAR EMPLEADO
ipcMain.handle('eliminar-empleado', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM employees WHERE id = ?', [id], (err, results) => {
      if (err) reject(err)
      else resolve({ success: true })
    })
  })
})

// 8. MARCAR ENTRADA (Secretaría)
ipcMain.handle('marcar-entrada', async (event, employeeId) => {
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO sessions (employee_id, start) VALUES (?, NOW())',
      [employeeId],
      (err, results) => {
        if (err) reject(err)
        else resolve({ success: true, id: results.insertId })
      }
    )
  })
})

// 9. MARCAR SALIDA (Secretaría)
ipcMain.handle('marcar-salida', async (event, employeeId) => {
  return new Promise((resolve, reject) => {
    db.query(
      'UPDATE sessions SET end = NOW() WHERE employee_id = ? AND end IS NULL ORDER BY start DESC LIMIT 1',
      [employeeId],
      (err, results) => {
        if (err) reject(err)
        else resolve({ success: true })
      }
    )
  })
})

// 10. OBTENER ASISTENCIAS
ipcMain.handle('obtener-asistencias', async (event, filtros = {}) => {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT s.*, e.first_name, e.last_name, e.cedula
      FROM sessions s
      JOIN employees e ON s.employee_id = e.id
      WHERE 1=1
    `
    const params = []
    
    if (filtros.fecha) {
      query += ' AND DATE(s.start) = ?'
      params.push(filtros.fecha)
    }
    
    query += ' ORDER BY s.start DESC'
    
    db.query(query, params, (err, results) => {
      if (err) reject(err)
      else resolve(results)
    })
  })
})

// 11. REGISTRAR PAGO (Solo campos esenciales)
ipcMain.handle('registrar-pago', async (event, pagoData) => {
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO payroll (employee_id, year, month, total_pay) VALUES (?, ?, ?, ?)',
      [pagoData.employee_id, pagoData.year, pagoData.month, pagoData.total_pay],
      (err, results) => {
        if (err) reject(err)
        else resolve({ success: true, id: results.insertId })
      }
    )
  })
})

// 12. OBTENER PAGOS
ipcMain.handle('obtener-pagos', async (event) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT p.*, e.first_name, e.last_name, e.cedula
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id
       ORDER BY p.year DESC, p.month DESC`,
      (err, results) => {
        if (err) reject(err)
        else resolve(results)
      }
    )
  })
})

// 13. EXPORTAR PAGOS (Formato simple)
ipcMain.handle('exportar-pagos', async (event, { formato, year, month }) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT e.first_name, e.last_name, e.cedula, p.total_pay, p.year, p.month
       FROM payroll p
       JOIN employees e ON p.employee_id = e.id
       WHERE p.year = ? AND p.month = ?`,
      [year, month],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve({
            success: true,
            data: results,
            formato: formato || 'json',
            count: results.length
          })
        }
      }
    )
  })
})

// ============================================================================
// CONFIGURACIÓN DE LA VENTANA
// ============================================================================

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs')
    }
  })

  win.loadURL('http://localhost:5173')
  win.webContents.openDevTools()
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})