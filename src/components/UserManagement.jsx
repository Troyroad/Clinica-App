import React, { useState } from 'react'

export default function UserManagement() {
  const [users, setUsers] = useState([
    { id: 1, username: 'admin', role: 'admin' },
    { id: 2, username: 'secretaria', role: 'secretaria' }
  ])

  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ username: '', password: '', role: '' })

  function startEdit(user) {
    setEditing(user.id)
    setForm({ username: user.username, password: '', role: user.role })
  }

  function save() {
    if (!form.username || !form.role) {
      alert('Usuario y rol son obligatorios')
      return
    }

    setUsers(prev =>
      prev.map(u =>
        u.id === editing
          ? { ...u, username: form.username, role: form.role }
          : u
      )
    )

    setEditing(null)
    setForm({ username: '', password: '', role: '' })

    alert('Usuario actualizado (demo)')
  }

  return (
    <div style={styles.card}>
      <h3>Usuarios del sistema</h3>

      {users.map(u => (
        <div key={u.id} style={styles.userRow}>
          <div>
            <strong>{u.username}</strong>
            <div style={styles.role}>{u.role}</div>
          </div>

          <button onClick={() => startEdit(u)}>Editar</button>
        </div>
      ))}

      {editing && (
        <div style={styles.editBox}>
          <h4>Editar usuario</h4>

          <input
            placeholder="Usuario"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
          />

          <input
            placeholder="Nueva contraseña"
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />

          <select
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
          >
            <option value="">Rol</option>
            <option value="admin">Admin</option>
            <option value="secretaria">Secretaria</option>
          </select>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={save}>Guardar</button>
            <button onClick={() => setEditing(null)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  card: {
    marginTop: 30,
    background: '#fff',
    padding: 20,
    borderRadius: 12,
    boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
  },
  userRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #e5e7eb'
  },
  role: {
    fontSize: 13,
    color: '#6b7280'
  },
  editBox: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  }
}
