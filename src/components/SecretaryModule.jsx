// SecretaryModule.jsx - VERSIÓN CORREGIDA Y FUNCIONAL
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import AddEmployeeModal from './AddEmployeeModal'

export default function SecretaryModule() {
  const [employees, setEmployees] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [section, setSection] = useState('attendance') // 'attendance' o 'employees'
  const [, setTick] = useState(0) // refresco cada minuto
  const [loading, setLoading] = useState(false)

  // 🔁 Refrescar tiempo trabajado cada minuto
  useEffect(() => {
    const interval = setInterval(() => setTick(Date.now()), 60000)
    return () => clearInterval(interval)
  }, [])

  // 🔁 Traer empleados al iniciar
  useEffect(() => {
    fetchEmployees()
  }, [])

  // 🔁 FUNCIÓN PRINCIPAL: Obtener empleados con sus sesiones
  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const res = await axios.get('http://localhost:3000/api/employees')
      setEmployees(res.data)
    } catch (err) {
      console.error('Error al cargar empleados:', err)
      alert('Error al cargar empleados. Verifica que el backend esté corriendo en puerto 3000')
    } finally {
      setLoading(false)
    }
  }

  // -------------------------
  // AGREGAR EMPLEADO - CORREGIDO
  // -------------------------
  const addEmployee = async (data) => {
    try {
      setLoading(true)
      // Los nombres de campos deben coincidir con lo que espera el backend
      const employeeData = {
        name: data.name,
        lastName: data.lastName,
        role: data.role,
        idNumber: data.idNumber
      }
      
      const res = await axios.post('http://localhost:3000/api/employees', employeeData)
      
      // Agregar el nuevo empleado a la lista
      setEmployees(prev => [...prev, res.data])
      setShowModal(false)
      
      alert('Empleado agregado correctamente')
    } catch (err) {
      console.error('Error al agregar empleado:', err.response?.data || err)
      alert(`Error: ${err.response?.data?.message || 'No se pudo agregar el empleado'}`)
    } finally {
      setLoading(false)
    }
  }

  // -------------------------
  // ELIMINAR EMPLEADO - CORREGIDO
  // -------------------------
  const removeEmployee = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este empleado?')) return
    
    try {
      setLoading(true)
      await axios.delete(`http://localhost:3000/api/employees/${id}`)
      
      // Eliminar de la lista local
      setEmployees(prev => prev.filter(e => e.id !== id))
      alert('Empleado eliminado correctamente')
    } catch (err) {
      console.error('Error al eliminar empleado:', err)
      alert('Error al eliminar empleado. Verifica que no tenga asistencias registradas.')
    } finally {
      setLoading(false)
    }
  }

  // -------------------------
  // MARCAR ENTRADA - CORREGIDO
  // -------------------------
  const clockIn = async (id) => {
    try {
      setLoading(true)
      await axios.post('http://localhost:3000/api/sessions/start', { 
        employee_id: id 
      })
      
      // Refrescar la lista para actualizar estados
      await fetchEmployees()
      alert('Entrada registrada correctamente')
    } catch (err) {
      console.error('Error al marcar entrada:', err.response?.data || err)
      alert(`Error: ${err.response?.data?.error || 'No se pudo registrar la entrada'}`)
    } finally {
      setLoading(false)
    }
  }

  // -------------------------
  // MARCAR SALIDA - CORREGIDO
  // -------------------------
  const clockOut = async (id) => {
    try {
      setLoading(true)
      await axios.post('http://localhost:3000/api/sessions/end', { 
        employee_id: id 
      })
      
      // Refrescar la lista para actualizar estados
      await fetchEmployees()
      alert('Salida registrada correctamente')
    } catch (err) {
      console.error('Error al marcar salida:', err.response?.data || err)
      alert(`Error: ${err.response?.data?.error || 'No se pudo registrar la salida'}`)
    } finally {
      setLoading(false)
    }
  }

  // -------------------------
  // CALCULAR TIEMPO TRABAJADO (HH:mm) - CORREGIDO
  // -------------------------
  const calculateTime = (sessions = []) => {
    if (!sessions || sessions.length === 0) return '00:00'
    
    const totalMs = sessions.reduce((acc, s) => {
      const start = new Date(s.start)
      const end = s.end ? new Date(s.end) : new Date()
      return acc + (end - start)
    }, 0)
    
    const totalMinutes = Math.floor(totalMs / 60000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  // -------------------------
  // VERIFICAR SI TIENE SESIÓN ACTIVA
  // -------------------------
  const hasActiveSession = (sessions = []) => {
    return sessions.some(s => !s.end)
  }

  // -------------------------
  // OBTENER SESIÓN ACTIVA
  // -------------------------
  const getActiveSession = (sessions = []) => {
    return sessions.find(s => !s.end)
  }

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <h3 style={styles.menuTitle}>Secretaría</h3>
        <button 
          style={section === 'attendance' ? styles.menuActive : styles.menuBtn} 
          onClick={() => setSection('attendance')}
          disabled={loading}
        >
          Marcar asistencia
        </button>
        <button 
          style={section === 'employees' ? styles.menuActive : styles.menuBtn} 
          onClick={() => setSection('employees')}
          disabled={loading}
        >
          Lista de empleados
        </button>
      </aside>

      {/* Main */}
      <main style={styles.content}>
        <div style={styles.card}>
          
          {/* Indicador de carga */}
          {loading && (
            <div style={styles.loadingOverlay}>
              <div style={styles.loadingSpinner}></div>
              <p>Cargando...</p>
            </div>
          )}

          {/* ================== MARCAR ASISTENCIA ================== */}
          {section === 'attendance' && (
            <>
              <h2>Marcar asistencia</h2>
              
              <div style={styles.refreshBar}>
                <button 
                  onClick={fetchEmployees}
                  disabled={loading}
                  style={styles.refreshButton}
                >
                  Actualizar lista
                </button>
                <small>Última actualización: {new Date().toLocaleTimeString()}</small>
              </div>
              
              {employees.length === 0 ? (
                <p style={{ opacity: 0.6, textAlign: 'center', padding: '20px' }}>
                  {loading ? 'Cargando empleados...' : 'No hay empleados registrados.'}
                </p>
              ) : (
                <ul style={styles.list}>
                  {employees.map(e => {
                    const active = hasActiveSession(e.sessions)
                    const activeSession = getActiveSession(e.sessions)
                    
                    return (
                      <li key={e.id} style={styles.item}>
                        <div>
                          <strong>{e.name} {e.lastName}</strong>
                          <div style={styles.role}>{e.role || 'Empleado'}</div>
                          <div>Cédula: {e.idNumber || 'No registrada'}</div>
                          <small>
                            Tiempo trabajado hoy: <strong>{calculateTime(e.sessions)}</strong>
                            {active && (
                              <span style={{ color: '#e74c3c', marginLeft: '10px' }}>
                                ● En turno (desde: {new Date(activeSession.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})
                              </span>
                            )}
                          </small>
                        </div>
                        <div style={styles.actions}>
                          {!active ? (
                            <button 
                              onClick={() => clockIn(e.id)}
                              disabled={loading}
                              style={styles.primaryButton}
                            >
                              Entrada
                            </button>
                          ) : (
                            <button 
                              onClick={() => clockOut(e.id)}
                              disabled={loading}
                              style={styles.secondaryButton}
                            >
                              Salida
                            </button>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </>
          )}

          {/* ================== LISTA DE EMPLEADOS ================== */}
          {section === 'employees' && (
            <>
              <h2>Lista de empleados</h2>
              
              <div style={styles.headerActions}>
                <button 
                  className="secondary" 
                  onClick={() => setShowModal(true)}
                  disabled={loading}
                  style={styles.addButton}
                >
                  + Agregar empleado
                </button>
                <button 
                  onClick={fetchEmployees}
                  disabled={loading}
                  style={styles.refreshButton}
                >
                  Actualizar
                </button>
              </div>
              
              {employees.length === 0 ? (
                <p style={{ opacity: 0.6, textAlign: 'center', padding: '20px' }}>
                  {loading ? 'Cargando...' : 'No hay empleados registrados. Agrega el primero.'}
                </p>
              ) : (
                <ul style={styles.list}>
                  {employees.map(e => (
                    <li key={e.id} style={styles.item}>
                      <div>
                        <strong>{e.name} {e.lastName}</strong>
                        <div style={styles.role}>{e.role || 'Empleado'}</div>
                        <div>Cédula: {e.idNumber || 'No registrada'}</div>
                        <div style={styles.stats}>
                          <small>Sesiones hoy: {e.sessions?.length || 0}</small>
                          <small>Tiempo: {calculateTime(e.sessions)}</small>
                        </div>
                      </div>
                      <div style={styles.actions}>
                        <button 
                          className="danger" 
                          onClick={() => removeEmployee(e.id)}
                          disabled={loading}
                          style={styles.dangerButton}
                        >
                          Eliminar
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {/* Modal para agregar empleado */}
          {showModal && (
            <AddEmployeeModal 
              onAdd={addEmployee} 
              onClose={() => setShowModal(false)} 
            />
          )}
        </div>
      </main>
    </div>
  )
}

// ================== ESTILOS (MANTENIDOS ORIGINALES + MEJORAS) ==================
const styles = {
  layout: { 
    display: 'flex', 
    minHeight: '100vh', 
    background: '#f3f4f6' 
  },
  sidebar: { 
    width: 230, 
    background: '#1f2937', 
    padding: 20, 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 10 
  },
  menuTitle: { 
    color: '#fff', 
    marginBottom: 20 
  },
  menuBtn: { 
    background: 'transparent', 
    border: 'none', 
    color: '#d1d5db', 
    padding: 10, 
    textAlign: 'left', 
    borderRadius: 6, 
    cursor: 'pointer' 
  },
  menuActive: { 
    background: '#2563eb', 
    color: '#fff', 
    border: 'none', 
    padding: 10, 
    textAlign: 'left', 
    borderRadius: 6 
  },
  content: { 
    flex: 1, 
    padding: 30, 
    display: 'flex', 
    justifyContent: 'center' 
  },
  card: { 
    width: '100%', 
    maxWidth: 800, 
    background: '#fff', 
    borderRadius: 14, 
    padding: 32, 
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    position: 'relative'
  },
  list: { 
    listStyle: 'none', 
    padding: 0, 
    margin: 0 
  },
  item: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '14px 0', 
    borderBottom: '1px solid #e5e7eb' 
  },
  role: { 
    fontSize: 13, 
    color: '#6b7280', 
    marginBottom: 4 
  },
  actions: { 
    display: 'flex', 
    gap: 8 
  },
  stats: {
    display: 'flex',
    gap: '15px',
    marginTop: '5px'
  },
  headerActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  addButton: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  refreshButton: {
    background: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  refreshBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '10px',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  primaryButton: {
    background: '#10b981',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  secondaryButton: {
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  dangerButton: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderRadius: '14px'
  },
  loadingSpinner: {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite'
  }
}

// Agregar animación de spinner
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);