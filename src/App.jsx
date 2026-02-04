import React, { useState, lazy, Suspense } from 'react'
import Login from './components/Login'

// 🔹 Lazy load (clave)
const AdminModule = lazy(() => import('./components/AdminModule'))
const SecretaryModule = lazy(() => import('./components/SecretaryModule'))

export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState(null)

  function handleLogin(userData) {
    setUser(userData)

    if (userData.role === 'admin') {
      setView('admin')
    } else {
      setView('secretary')
    }
  }

  function logout() {
    setUser(null)
    setView(null)
  }

  // LOGIN
  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  // APP
  return (
    <div style={{ padding: 20 }}>
      <header style={styles.header}>
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
        <Suspense fallback={<div>Cargando...</div>}>
          {view === 'admin' && user.role === 'admin' && (
            <AdminModule onLogout={logout} />
          )}

          {view === 'secretary' && (
            <SecretaryModule onLogout={logout} />
          )}
        </Suspense>
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