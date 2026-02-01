import React, { useState, useEffect } from 'react'
import axios from 'axios'
import AddEmployeeModal from './AddEmployeeModal'

export default function SecretaryModule() {
  const [employees, setEmployees] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [section, setSection] = useState('attendance') // 'attendance' o 'employees'
  const [, setTick] = useState(0) // refresco cada minuto

  // 🔁 Refrescar tiempo trabajado cada minuto
  useEffect(() => {
    const interval = setInterval(() => setTick(Date.now()), 60000)
    return () => clearInterval(interval)
  }, [])

  // 🔁 Traer empleados al iniciar
  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/employees/active')
      setEmployees(res.data)
    } catch (err) {
      console.error('Error al cargar empleados:', err)
    }
  }

  // -------------------------
  // AGREGAR EMPLEADO
  // -------------------------
  const addEmployee = async (data) => {
    try {
      // Temporalmente permitimos que secretarias agreguen empleados
      const res = await axios.post('http://localhost:4000/api/employees', data)
      setEmployees(prev => [...prev, res.data]) // se refleja inmediatamente
      setShowModal(false)
    } catch (err) {
      console.error('No se pudo agregar empleado:', err.response?.data || err)
      alert('No se pudo agregar el empleado. Revisa la consola del backend.')
    }
  }

  // -------------------------
  // ELIMINAR EMPLEADO
  // -------------------------
  const removeEmployee = async (id) => {
    if (!window.confirm('¿Eliminar empleado?')) return
    try {
      await axios.delete(`http://localhost:4000/api/employees/${id}`)
      setEmployees(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      console.error('No se pudo eliminar empleado:', err)
      alert('No se pudo eliminar empleado')
    }
  }

  // -------------------------
  // MARCAR ENTRADA/SALIDA
  // -------------------------
  const clockIn = async (id) => {
    try {
      await axios.post('http://localhost:4000/api/sessions/start', { employee_id: id })
      fetchEmployees()
    } catch (err) {
      console.error(err)
    }
  }

  const clockOut = async (id) => {
    try {
      await axios.post('http://localhost:4000/api/sessions/end', { employee_id: id })
      fetchEmployees()
    } catch (err) {
      console.error(err)
    }
  }

  // -------------------------
  // CALCULAR TIEMPO (HH:mm)
  // -------------------------
  const calculateTime = (sessions) => {
    const totalMs = sessions.reduce((acc, s) => {
      const start = new Date(s.start)
      const end = s.end ? new Date(s.end) : new Date()
      return acc + (end - start)
    }, 0)
    const totalMinutes = Math.floor(totalMs / 60000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}`
  }

  // -------------------------
  // UI
  // -------------------------
  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h3 style={styles.menuTitle}>Secretaría</h3>
        <button style={section === 'attendance' ? styles.menuActive : styles.menuBtn} onClick={() => setSection('attendance')}>Marcar asistencia</button>
        <button style={section === 'employees' ? styles.menuActive : styles.menuBtn} onClick={() => setSection('employees')}>Lista de empleados</button>
      </aside>

      {/* Main */}
      <main style={styles.content}>
        <div style={styles.card}>

          {/* ================== MARCAR ASISTENCIA ================== */}
          {section === 'attendance' && (
            <>
              <h2>Marcar asistencia</h2>
              {employees.length === 0 && <p style={{ opacity: 0.6 }}>No hay empleados cargados.</p>}
              <ul style={styles.list}>
                {employees.map(e => {
                  const activeSession = e.sessions.find(s => !s.end)
                  return (
                    <li key={e.id} style={styles.item}>
                      <div>
                        <strong>{e.name} {e.lastName}</strong>
                        <div style={styles.role}>{e.role}</div>
                        <div>Cédula: {e.idNumber}</div>
                        <small>Tiempo trabajado: <strong>{calculateTime(e.sessions)}</strong></small>
                      </div>
                      <div style={styles.actions}>
                        {!activeSession ? (
                          <button onClick={() => clockIn(e.id)}>Entrada</button>
                        ) : (
                          <button className="secondary" onClick={() => clockOut(e.id)}>Salida</button>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          )}

          {/* ================== LISTA DE EMPLEADOS ================== */}
          {section === 'employees' && (
            <>
              <h2>Lista de empleados</h2>
              <button className="secondary" onClick={() => setShowModal(true)}>+ Agregar empleado</button>
              <ul style={styles.list}>
                {employees.map(e => (
                  <li key={e.id} style={styles.item}>
                    <div>
                      <strong>{e.name} {e.lastName}</strong>
                      <div style={styles.role}>{e.role}</div>
                      <div>Cédula: {e.idNumber}</div>
                    </div>
                    <div style={styles.actions}>
                      <button className="danger" onClick={() => removeEmployee(e.id)}>Eliminar</button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {showModal && <AddEmployeeModal onAdd={addEmployee} onClose={() => setShowModal(false)} />}
        </div>
      </main>
    </div>
  )
}

// ================== ESTILOS ==================
const styles = {
  layout: { display: 'flex', minHeight: '100vh', background: '#f3f4f6' },
  sidebar: { width: 230, background: '#1f2937', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 },
  menuTitle: { color: '#fff', marginBottom: 20 },
  menuBtn: { background: 'transparent', border: 'none', color: '#d1d5db', padding: 10, textAlign: 'left', borderRadius: 6, cursor: 'pointer' },
  menuActive: { background: '#2563eb', color: '#fff', border: 'none', padding: 10, textAlign: 'left', borderRadius: 6 },
  content: { flex: 1, padding: 30, display: 'flex', justifyContent: 'center' },
  card: { width: '100%', maxWidth: 800, background: '#fff', borderRadius: 14, padding: 32, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #e5e7eb' },
  role: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  actions: { display: 'flex', gap: 8 }
}
