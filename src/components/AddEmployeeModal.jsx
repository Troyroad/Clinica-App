import React, { useState } from 'react'

export default function AddEmployeeModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    name: '',
    lastName: '',
    role: '',
    idNumber: ''
  })
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!form.name || !form.lastName || !form.idNumber) {
      alert('Complete todos los campos')
      return
    }

    setLoading(true)
    try {
      await onAdd({ ...form })
      setForm({ name: '', lastName: '', role: '', idNumber: '' })
      onClose()
    } catch (err) {
      console.error(err)
      alert('No se pudo agregar el empleado')
    } finally {
      setLoading(false) // ✅ CLAVE: evita que la app se congele
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Agregar empleado</h3>

        <input
          placeholder="Nombre"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          style={styles.input}
        />
        <input
          placeholder="Apellido"
          value={form.lastName}
          onChange={e => setForm({ ...form, lastName: e.target.value })}
          style={styles.input}
        />
        <input
          placeholder="Rol"
          value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })}
          style={styles.input}
        />
        <input
          placeholder="Cédula"
          value={form.idNumber}
          onChange={e => setForm({ ...form, idNumber: e.target.value })}
          style={styles.input}
        />

        <div style={styles.actions}>
          <button onClick={onClose} disabled={loading}>Cancelar</button>
          <button onClick={handleAdd} disabled={loading}>
            {loading ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    background: '#fff',
    padding: 20,
    borderRadius: 10,
    minWidth: 300
  },
  input: {
    display: 'block',
    marginBottom: 10,
    width: '100%',
    padding: 6
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10
  }
}
