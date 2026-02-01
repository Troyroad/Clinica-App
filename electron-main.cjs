const { app, BrowserWindow } = require('electron')
const path = require('path')
const mysql = require('mysql2')

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1803',
  database: 'clinica_db'
})

const { ipcMain } = require('electron')

ipcMain.handle('login', async (event, { username, password }) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password],
      (err, results) => {
        if (err) reject(err)
        else resolve(results[0] || null)
      }
    )
  })
})


db.connect(err => {
  if (err) {
    console.error('Error conectando a MySQL:', err)
  } else {
    console.log('MySQL conectado')
  }
})


function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs')
    }
  })

  win.loadURL('http://localhost:5173')
}

app.whenReady().then(createWindow)
