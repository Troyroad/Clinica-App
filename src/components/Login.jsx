import React, { useState } from 'react'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Importar axios dinámicamente o usar fetch
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Error al iniciar sesión')
      }

      if (data.success) {
        onLogin(data.user)
      }
    } catch (err) {
      console.error('Error de login:', err)
      setError(err.message || 'Error de conexión')
    } finally {
      setLoading(false)
    }
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
          disabled={loading}
        />

        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={styles.input}
          disabled={loading}
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

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      {/* Marca de agua - bloque institucional (izquierda) */}
      <div style={styles.watermarkLeft}>
        <p>República Bolivariana de Venezuela</p>
        <p>Ministerio del Poder Popular para la Educación</p>
        <p>Universitaria, Ciencia y Tecnología</p>
        <p>Universidad Nacional Experimental de la Gran Caracas</p>
        <p>Programa Nacional de Formación en Informática</p>
        <br />
        <p><strong>PNF. Informática</strong></p>
        <p>Unidad Curricular: Proyecto Socio Tecnológico</p>
        <p>Sección 1990</p>
      </div>

      {/* Marca de agua - participantes (derecha) */}
      <div style={styles.watermarkRight}>
        <p><strong>Participantes:</strong></p>
        <p>Santiago Ramírez, C.I: 32.089.333</p>
        <p>Loren Solórzano, C.I: 31.948.633</p>
        <p>María Orihuela, C.I: 31.637.222</p>
        <p>Eliécer Hernández, C.I: 31.872.550</p>
      </div>
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
    cursor: 'pointer',
    opacity: 0.9,
    transition: 'opacity 0.2s',
    ':disabled': {
      opacity: 0.6,
      cursor: 'not-allowed'
    }
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center'
  },
  watermarkLeft: {
    position: 'fixed',
    bottom: 14,
    left: 18,
    opacity: 0.45,
    pointerEvents: 'none',
    userSelect: 'none',
    maxWidth: 320,
    fontSize: 9.5,
    color: '#1e3a5f',
    lineHeight: 1.5,
    textAlign: 'center'
  },
  watermarkRight: {
    position: 'fixed',
    bottom: 14,
    right: 18,
    opacity: 0.45,
    pointerEvents: 'none',
    userSelect: 'none',
    maxWidth: 280,
    fontSize: 9.5,
    color: '#1e3a5f',
    lineHeight: 1.5,
    textAlign: 'right'
  }
}
