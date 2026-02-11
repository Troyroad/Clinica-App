// SecretaryModule.jsx - VERSIÓN COMPLETA CON HONORARIOS Y TURNOS
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import AddEmployeeModal from './AddEmployeeModal'

export default function SecretaryModule({ onLogout }) {
  const [employees, setEmployees] = useState([])
  const [positions, setPositions] = useState([])
  const [honorariumPositions, setHonorariumPositions] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [section, setSection] = useState('attendance') // 'attendance', 'honorarium-attendance', 'employees'
  const [, setTick] = useState(0) // refresco cada minuto
  const [loading, setLoading] = useState(false)
  const [selectedShift, setSelectedShift] = useState({}) // {employeeId: 'morning'}

  // 🔁 Refrescar tiempo trabajado cada minuto
  useEffect(() => {
    const interval = setInterval(() => setTick(Date.now()), 60000)
    return () => clearInterval(interval)
  }, [])

  // 🔁 Traer empleados y cargos al iniciar
  useEffect(() => {
    fetchEmployees()
    fetchPositions()
    fetchHonorariumPositions()
  }, [])

  // 🔁 Obtener cargos quincenales
  const fetchPositions = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/positions')
      setPositions(res.data)
    } catch (err) {
      console.error('Error al cargar cargos:', err)
    }
  }

  // 🔁 Obtener cargos por honorario
  const fetchHonorariumPositions = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/honorarium-positions')
      setHonorariumPositions(res.data)
    } catch (err) {
      console.error('Error al cargar cargos por honorario:', err)
    }
  }

  // 🔁 FUNCIÓN PRINCIPAL: Obtener empleados con sus sesiones
  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const res = await axios.get('http://localhost:3001/api/employees')
      setEmployees(res.data)
    } catch (err) {
      console.error('Error al cargar empleados:', err)
      alert('Error al cargar empleados. Verifica que el backend esté corriendo en puerto 3001')
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
      const employeeData = {
        name: data.name,
        lastName: data.lastName,
        idNumber: data.idNumber,
        positionId: data.positionId,
        honorariumPositionId: data.honorariumPositionId
      }

      const res = await axios.post('http://localhost:3001/api/employees', employeeData)
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
  // ELIMINAR EMPLEADO
  // -------------------------
  const removeEmployee = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este empleado?')) return

    try {
      setLoading(true)
      await axios.delete(`http://localhost:3001/api/employees/${id}`)
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
  // MARCAR ENTRADA REGULAR (CON TURNO)
  // -------------------------
  const clockIn = async (id) => {
    try {
      setLoading(true)
      const shift = selectedShift[id] || null

      await axios.post('http://localhost:3001/api/sessions/start', {
        employee_id: id,
        shift: shift
      })

      await fetchEmployees()
      alert('Entrada registrada correctamente' + (shift ? ` - Turno: ${shift}` : ''))
    } catch (err) {
      console.error('Error al marcar entrada:', err.response?.data || err)
      alert(`Error: ${err.response?.data?.error || 'No se pudo registrar la entrada'}`)
    } finally {
      setLoading(false)
    }
  }

  // -------------------------
  // MARCAR SALIDA REGULAR
  // -------------------------
  const clockOut = async (id) => {
    try {
      setLoading(true)
      await axios.post('http://localhost:3001/api/sessions/end', {
        employee_id: id
      })

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
  // MARCAR ENTRADA HONORARIO
  // -------------------------
  const clockInHonorarium = async (id) => {
    try {
      setLoading(true)
      await axios.post('http://localhost:3001/api/honorarium-sessions/start', {
        employee_id: id
      })

      await fetchEmployees()
      alert('Entrada de honorario registrada correctamente')
    } catch (err) {
      console.error('Error al marcar entrada de honorario:', err.response?.data || err)
      alert(`Error: ${err.response?.data?.error || 'No se pudo registrar la entrada'}`)
    } finally {
      setLoading(false)
    }
  }

  // -------------------------
  // MARCAR SALIDA HONORARIO
  // -------------------------
  const clockOutHonorarium = async (id) => {
    try {
      setLoading(true)
      await axios.post('http://localhost:3001/api/honorarium-sessions/end', {
        employee_id: id
      })

      await fetchEmployees()
      alert('Salida de honorario registrada correctamente')
    } catch (err) {
      console.error('Error al marcar salida de honorario:', err.response?.data || err)
      alert(`Error: ${err.response?.data?.error || 'No se pudo registrar la salida'}`)
    } finally {
      setLoading(false)
    }
  }

  // -------------------------
  // CALCULAR TIEMPO TRABAJADO (HH:mm)
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

  // Filtrar empleados por tipo
  const regularEmployees = employees.filter(e => e.positionId)
  const honorariumEmployees = employees.filter(e => e.honorariumPositionId)

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
          Marcar Asistencia
        </button>
        <button
          style={section === 'honorarium-attendance' ? styles.menuActive : styles.menuBtn}
          onClick={() => setSection('honorarium-attendance')}
          disabled={loading}
        >
          Asistencia de Honorario
        </button>
        <button
          style={section === 'employees' ? styles.menuActive : styles.menuBtn}
          onClick={() => setSection('employees')}
          disabled={loading}
        >
          Lista de empleados
        </button>

        <button style={styles.logoutBtn} onClick={onLogout}>
          Cerrar Sesión
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

          {/* ================== MARCAR ASISTENCIA REGULAR ================== */}
          {section === 'attendance' && (
            <>
              <h2>Marcar Asistencia (Empleados Quincenales)</h2>

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

              {regularEmployees.length === 0 ? (
                <p style={{ opacity: 0.6, textAlign: 'center', padding: '20px' }}>
                  {loading ? 'Cargando empleados...' : 'No hay empleados con cargos quincenales.'}
                </p>
              ) : (
                <ul style={styles.list}>
                  {regularEmployees.map(e => {
                    const active = hasActiveSession(e.sessions)
                    const activeSession = getActiveSession(e.sessions)
                    const needsShift = ['Enfermera de Piso', 'Camarera'].includes(e.positionName)

                    return (
                      <li key={e.id} style={styles.item}>
                        <div>
                          <strong>{e.name} {e.lastName}</strong>
                          <div style={styles.positionLabel}>{e.positionName || 'Sin cargo'}</div>
                          <div>Cédula: {e.idNumber || 'No registrada'}</div>
                          <small>
                            Tiempo trabajado hoy: <strong>{calculateTime(e.sessions)}</strong>
                            {active && (
                              <span style={{ color: '#e74c3c', marginLeft: '10px' }}>
                                ● En turno (desde: {new Date(activeSession.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                {activeSession.shift && ` - ${activeSession.shift}`}
                              </span>
                            )}
                          </small>
                        </div>
                        <div style={styles.actions}>
                          {!active ? (
                            <>
                              {needsShift && (
                                <select
                                  value={selectedShift[e.id] || ''}
                                  onChange={ev => setSelectedShift({ ...selectedShift, [e.id]: ev.target.value })}
                                  style={styles.shiftSelect}
                                >
                                  <option value="">Seleccionar turno</option>
                                  <option value="morning">Mañana (7am-1pm)</option>
                                  <option value="afternoon">Tarde (1pm-7pm)</option>
                                  <option value="night">Noche (7pm-7am)</option>
                                </select>
                              )}
                              <button
                                onClick={() => clockIn(e.id)}
                                disabled={loading || (needsShift && !selectedShift[e.id])}
                                style={styles.primaryButton}
                              >
                                Entrada
                              </button>
                            </>
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

          {/* ================== MARCAR ASISTENCIA HONORARIO ================== */}
          {section === 'honorarium-attendance' && (
            <>
              <h2>Marcar Asistencia de Honorario</h2>

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

              {honorariumEmployees.length === 0 ? (
                <p style={{ opacity: 0.6, textAlign: 'center', padding: '20px' }}>
                  {loading ? 'Cargando empleados...' : 'No hay empleados con cargos por honorario.'}
                </p>
              ) : (
                <ul style={styles.list}>
                  {honorariumEmployees.map(e => {
                    const active = hasActiveSession(e.honorariumSessions || [])
                    const activeSession = getActiveSession(e.honorariumSessions || [])

                    return (
                      <li key={e.id} style={styles.item}>
                        <div>
                          <strong>{e.name} {e.lastName}</strong>
                          <div style={styles.positionLabel}>{e.honorariumPositionName || 'Sin cargo'}</div>
                          <div>Cédula: {e.idNumber || 'No registrada'}</div>
                          <small>
                            Tiempo trabajado hoy: <strong>{calculateTime(e.honorariumSessions || [])}</strong>
                            {active && (
                              <span style={{ color: '#e74c3c', marginLeft: '10px' }}>
                                ● En cirugía (desde: {new Date(activeSession.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                              </span>
                            )}
                          </small>
                        </div>
                        <div style={styles.actions}>
                          {!active ? (
                            <button
                              onClick={() => clockInHonorarium(e.id)}
                              disabled={loading}
                              style={styles.primaryButton}
                            >
                              Entrada
                            </button>
                          ) : (
                            <button
                              onClick={() => clockOutHonorarium(e.id)}
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
                        <div style={styles.positionLabel}>
                          {e.positionName || e.honorariumPositionName || 'Sin cargo'}
                        </div>
                        <div>Cédula: {e.idNumber || 'No registrada'}</div>
                        <div style={styles.stats}>
                          <small>Sesiones hoy: {(e.sessions?.length || 0) + (e.honorariumSessions?.length || 0)}</small>
                          <small>Tiempo: {calculateTime([...(e.sessions || []), ...(e.honorariumSessions || [])])}</small>
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
              positions={positions}
              honorariumPositions={honorariumPositions}
            />
          )}
        </div>
      </main>
    </div>
  )
}

// ================== ESTILOS ==================
const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f3f4f6'
  },
  sidebar: {
    width: 250,
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
  logoutBtn: {
    marginTop: 'auto',
    background: '#374151',
    color: '#fbbf24',
    border: '1px solid #fbbf24',
    padding: 12,
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center'
  },
  content: {
    flex: 1,
    padding: 30,
    display: 'flex',
    justifyContent: 'center'
  },
  card: {
    width: '100%',
    maxWidth: 900,
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
  positionLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 4
  },
  actions: {
    display: 'flex',
    gap: 8,
    alignItems: 'center'
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
  shiftSelect: {
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: 13,
    marginRight: 8
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

// Agregar animación de spinner de forma segura
if (typeof document !== 'undefined' && document.styleSheets && document.styleSheets[0]) {
  try {
    const styleSheet = document.styleSheets[0];
    const keyframesRule = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;

    // Verificar si la regla ya existe
    let ruleExists = false;
    for (let i = 0; i < styleSheet.cssRules.length; i++) {
      if (styleSheet.cssRules[i].cssText && styleSheet.cssRules[i].cssText.includes('@keyframes spin')) {
        ruleExists = true;
        break;
      }
    }

    if (!ruleExists) {
      styleSheet.insertRule(keyframesRule, styleSheet.cssRules.length);
    }
  } catch (e) {
    // Si falla, crear un elemento style
    if (!document.getElementById('secretary-module-spinner-styles')) {
      const style = document.createElement('style');
      style.id = 'secretary-module-spinner-styles';
      style.innerHTML = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }
}