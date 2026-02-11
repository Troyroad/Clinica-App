import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Cargar usuarios al iniciar
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await axios.get('http://localhost:3001/api/auth/users')
      setUsers(res.data)
    } catch (err) {
      console.error('Error al cargar usuarios:', err)
      alert('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleSavePassword = async () => {
    if (!newPassword || !confirmPassword) {
      alert('Por favor complete ambos campos de contraseña')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }

    if (newPassword.length < 4) {
      alert('La contraseña debe tener al menos 4 caracteres')
      return
    }

    try {
      setLoading(true)
      await axios.post('http://localhost:3001/api/auth/change-password', {
        userId: editingUser.id,
        newPassword: newPassword
      })

      alert('Contraseña actualizada correctamente')
      setEditingUser(null)
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      console.error('Error al cambiar contraseña:', err)
      alert(err.response?.data?.message || 'Error al cambiar contraseña')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingUser(null)
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Gestión de Usuarios</h2>

      {loading && <p style={styles.loading}>Cargando...</p>}

      <div style={styles.userList}>
        {users.map(user => (
          <div key={user.id} style={styles.userCard}>
            <div style={styles.userInfo}>
              <h3 style={styles.userName}>
                {user.username}
                <span style={styles.userRole}>
                  ({user.role === 'admin' ? 'Administrador' : 'Secretaria'})
                </span>
              </h3>
            </div>
            <button
              onClick={() => handleEditUser(user)}
              disabled={loading}
              style={styles.editButton}
            >
              Cambiar Contraseña
            </button>
          </div>
        ))}
      </div>

      {/* Modal para cambiar contraseña */}
      {editingUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>
              Cambiar Contraseña - {editingUser.username}
            </h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nueva Contraseña:</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={styles.input}
                placeholder="Mínimo 4 caracteres"
                disabled={loading}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirmar Contraseña:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={styles.input}
                placeholder="Repita la contraseña"
                disabled={loading}
              />
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={handleCancel}
                disabled={loading}
                style={styles.cancelButton}
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePassword}
                disabled={loading}
                style={styles.saveButton}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    padding: '20px'
  },
  title: {
    marginTop: 0,
    marginBottom: '24px',
    fontSize: '24px',
    color: '#1f2937'
  },
  loading: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '20px'
  },
  userList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  userCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  },
  userInfo: {
    flex: 1
  },
  userName: {
    margin: 0,
    fontSize: '18px',
    color: '#1f2937'
  },
  userRole: {
    marginLeft: '10px',
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: 'normal'
  },
  editButton: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    background: '#fff',
    borderRadius: '12px',
    padding: '30px',
    width: '90%',
    maxWidth: '450px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
  },
  modalTitle: {
    marginTop: 0,
    marginBottom: '24px',
    fontSize: '20px',
    color: '#1f2937'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px'
  },
  cancelButton: {
    background: '#6b7280',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  saveButton: {
    background: '#10b981',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  }
}
