import React, { useState } from 'react'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // DEMO (luego se conecta a BD)
    if (username === 'admin' && password === 'admin123') {
      onLogin({ name: 'Administrador', role: 'admin' })
      return
    }

    if (username === 'secretaria' && password === 'secretaria123') {
      onLogin({ name: 'Secretaria', role: 'secretary' })
      return
    }

    setError('Usuario o contraseña incorrectos')
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>Clínica – Acceso</h2>
        <p style={styles.subtitle}>Ingrese sus credenciales</p>

        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={styles.input}
        />

        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={styles.input}
        />

        {/* Ver contraseña */}
        <label style={styles.showPassword}>
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
          />
          <span>Ver contraseña</span>
        </label>

        {error && <div style={styles.error}>{error}</div>}

        <button type="submit" style={styles.button}>
          Ingresar
        </button>
      </form>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #2563eb, #ffffffff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    background: '#fff',
    padding: 32,
    borderRadius: 14,
    width: 360,
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },
  title: {
    margin: 0,
    textAlign: 'center'
  },
  subtitle: {
    margin: 0,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14
  },
  input: {
    padding: 12,
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: 15
  },
  showPassword: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    color: '#374151',
    marginTop: -4
  },
  button: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    border: 'none',
    background: '#2563eb',
    color: 'white',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer'
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center'
  }
}
