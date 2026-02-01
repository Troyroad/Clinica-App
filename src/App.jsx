import React, { useState } from 'react'
import Login from './components/Login'
import AdminModule from './components/AdminModule'
import SecretaryModule from './components/SecretaryModule'

export default function App() {
  const [user, setUser] = useState(null)
  const [employees, setEmployees] = useState([])
  const [view, setView] = useState(null)

  // -------------------------
  // LOGIN
  // -------------------------
  function handleLogin(userData) {
    setUser(userData)

    // Vista inicial según rol
    if (userData.role === 'admin') {
      setView('admin')
    } else {
      setView('secretary')
    }
  }

  // -------------------------
  // LOGOUT
  // -------------------------
  function logout() {
    setUser(null)
    setView(null)
  }

  // -------------------------
  // LOGIN SCREEN
  // -------------------------
  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  // -------------------------
  // APP
  // -------------------------
  return (
    <div style={{ padding: 20 }}>
      <header style={styles.header}>
        {/* SOLO ADMIN VE LOS BOTONES DE NAVEGACIÓN */}
        {user.role === 'admin' && (
          <>
            <button onClick={() => setView('admin')}>Administrador</button>
            <button onClick={() => setView('secretary')}>Secretaría</button>
          </>
        )}

        <button className="secondary" onClick={logout}>
          Cerrar sesión
        </button>
      </header>

      <main>
        {view === 'admin' && user.role === 'admin' && (
          <AdminModule employees={employees} setEmployees={setEmployees} />
        )}

        {view === 'secretary' && (
          <SecretaryModule
            employees={employees}
            setEmployees={setEmployees}
          />
        )}
      </main>
    </div>
  )
}

const styles = {
  header: {
    display: 'flex',
    gap: 10,
    marginBottom: 20,
    justifyContent: 'flex-end'
  }
}
