import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function UserManagement() {
  const [users, setUsers] = useState([
    { id: 1, username: 'admin', role: 'admin' },
    { id: 2, username: 'secretaria', role: 'secretaria' }
  ])

  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ username: '', password: '', role: '' })
  const [loading, setLoading] = useState(false)

  function startEdit(user) {
    setEditing(user.id)
    setForm({ username: user.username, password: '', role: user.role })
  }

  async function save() {
    if (!form.username || !form.role) {
      alert('Usuario y rol son obligatorios')
      return
    }

    setLoading(true)
    try {
      // Actualizar en el estado local
      setUsers(prev =>
        prev.map(u =>
          u.id === editing
            ? { ...u, username: form.username, role: form.role }
            : u
        )
      )

      setEditing(null)
      setForm({ username: '', password: '', role: '' })

      alert('✅ Usuario actualizado correctamente')
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      alert('Error al actualizar usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={styles.title}>Gestión de Usuarios del Sistema</h2>
      <p style={styles.description}>
        Administra los usuarios que tienen acceso al sistema
      </p>

      <div style={styles.userList}>
        {users.map(u => (
          <div key={u.id} style={styles.userCard}>
            <div style={styles.userInfo}>
              <strong style={styles.username}>{u.username}</strong>
              <span style={styles.role}>
                {u.role === 'admin' ? 'Administrador' : 'Secretaria'}
              </span>
            </div>

            <button
              style={styles.editButton}
              onClick={() => startEdit(u)}
              disabled={loading}
            >
              Editar
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <div style={styles.editBox}>
          <h3 style={styles.editTitle}>Editar Usuario</h3>

          <div style={styles.formGroup}>
            <label style={styles.label}>Usuario</label>
            <input
              placeholder="Nombre de usuario"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nueva Contraseña</label>
            <input
              placeholder="Dejar vacío para no cambiar"
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Rol</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              style={styles.input}
              disabled={loading}
            >
              <option value="">Seleccionar rol</option>
              <option value="admin">Administrador</option>
              <option value="secretaria">Secretaria</option>
            </select>
          </div>

          <div style={styles.buttonGroup}>
            <button
              onClick={save}
              style={styles.saveButton}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button
              onClick={() => setEditing(null)}
              style={styles.cancelButton}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  title: {
    marginTop: 0,
    marginBottom: 8,
    fontSize: 28,
    color: '#1f2937'
  },
  description: {
    marginBottom: 24,
    color: '#6b7280',
    fontSize: 15
  },
  userList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 24
  },
  userCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    background: '#f9fafb',
    borderRadius: 8,
    border: '1px solid #e5e7eb'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  username: {
    fontSize: 16,
    color: '#1f2937'
  },
  role: {
    fontSize: 14,
    color: '#6b7280'
  },
  editButton: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: '500'
  },
  editBox: {
    marginTop: 24,
    padding: 24,
    background: '#fff',
    borderRadius: 12,
    border: '2px solid #2563eb',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
  },
  editTitle: {
    marginTop: 0,
    marginBottom: 20,
    fontSize: 20,
    color: '#1f2937'
  },
  formGroup: {
    marginBottom: 16
  },
  label: {
    display: 'block',
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151'
  },
  input: {
    width: '100%',
    padding: 10,
    border: '1px solid #d1d5db',
    borderRadius: 6,
    fontSize: 14,
    boxSizing: 'border-box'
  },
  buttonGroup: {
    display: 'flex',
    gap: 12,
    marginTop: 20
  },
  saveButton: {
    background: '#10b981',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: '500'
  },
  cancelButton: {
    background: '#6b7280',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14
  }
}
