
import React, { useState } from 'react'

export default function EmployeeList({ employees, onRefresh }) {
  const [form, setForm] = useState({ name: '', role: '', salary: 0 })

  async function add() {
    if (!form.name.trim() || !form.role.trim()) {
      alert("Completa nombre y rol");
      return;
    }

    await window.api.addEmployee(form)
    setForm({ name: '', role: '', salary: 0 })
    onRefresh()
  }

  return (
    <div>
      <h3>Lista de empleados</h3>

      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        background: 'white',
        boxShadow: '0 0 4px rgba(0,0,0,0.1)'
      }}>
        <thead>
          <tr style={{ background: '#e6e6e6' }}>
            <th style={{ padding: 8 }}>ID</th>
            <th style={{ padding: 8 }}>Nombre</th>
            <th style={{ padding: 8 }}>Rol</th>
            <th style={{ padding: 8 }}>Salario</th>
            <th style={{ padding: 8 }}>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {employees.length === 0 && (
            <tr>
              <td colSpan="5" style={{ padding: 20, textAlign: 'center', opacity: 0.6 }}>
                No hay empleados registrados.
              </td>
            </tr>
          )}

          {employees.map(e => (
            <tr key={e.id}>
              <td style={{ padding: 8, borderTop: '1px solid #ddd' }}>{e.id}</td>
              <td style={{ padding: 8, borderTop: '1px solid #ddd' }}>{e.name}</td>
              <td style={{ padding: 8, borderTop: '1px solid #ddd' }}>{e.role}</td>
              <td style={{ padding: 8, borderTop: '1px solid #ddd' }}>${e.salary}</td>

              <td style={{ padding: 8, borderTop: '1px solid #ddd' }}>
                <button
                  style={{ marginRight: 6 }}
                  onClick={async () => {
                    const name = prompt('Nuevo nombre', e.name)
                    if (name) {
                      await window.api.updateEmployee({ ...e, name })
                      onRefresh()
                    }
                  }}>
                  Editar
                </button>

                <button
                  style={{ background: '#c0392b', color: 'white' }}
                  onClick={async () => {
                    if (confirm('¿Eliminar empleado?')) {
                      await window.api.deleteEmployee(e.id)
                      onRefresh()
                    }
                  }}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{
        marginTop: 20,
        padding: 15,
        background: '#fafafa',
        border: '1px solid #ddd',
        borderRadius: 8
      }}>
        <h4>Agregar empleado</h4>

        <input placeholder='Nombre'
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })} />

        <input placeholder='Rol'
          value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })} />

        <input placeholder='Salario' type='number'
          value={form.salary}
          onChange={e => setForm({ ...form, salary: +e.target.value })} />

        <button onClick={add}>Agregar</button>
      </div>
    </div>
  )
}
