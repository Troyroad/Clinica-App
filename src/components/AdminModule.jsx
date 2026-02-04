import React, { useMemo, useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import axios from 'axios'
import UserManagement from './UserManagement'

export default function AdminModule(props) {
  // Estados generales
  const [section, setSection] = useState('daily')
  const [employees, setEmployees] = useState([])
  const [positions, setPositions] = useState([])
  const [, setTick] = useState(0)

  // Estados para Reporte Diario
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [openId, setOpenId] = useState(null)

  // Estados para Calendario/Asistencias
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [entryTime, setEntryTime] = useState('08:00')
  const [tolerance, setTolerance] = useState(30)

  // Estados para Cargos
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [editingPosition, setEditingPosition] = useState(null)
  const [showPositionForm, setShowPositionForm] = useState(false)
  const [positionForm, setPositionForm] = useState({ name: '', monthly_salary: '', description: '' })

  // 🔁 Cargar empleados y cargos cada minuto
  useEffect(() => {
    fetchEmployees()
    fetchPositions()
    const interval = setInterval(() => {
      setTick(Date.now())
      fetchEmployees()
      fetchPositions()
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // 🔁 Obtener empleados desde backend
  const fetchEmployees = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/employees')
      setEmployees(res.data)
    } catch (err) {
      console.error('Error al cargar empleados:', err)
    }
  }

  // 🔁 Obtener cargos desde backend
  const fetchPositions = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/positions')
      setPositions(res.data)
    } catch (err) {
      console.error('Error al cargar cargos:', err)
    }
  }

  const formatTime = mins => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  /* ================= REPORTE DIARIO ================= */
  const report = useMemo(() => {
    return employees.map(e => {
      const sessions = (e.sessions || []).filter(s => {
        if (!s.start) return false
        const d = new Date(s.start).toISOString().slice(0, 10)
        return d === date
      })

      const totalMs = sessions.reduce((acc, s) => {
        const start = new Date(s.start)
        const end = s.end ? new Date(s.end) : new Date()
        return acc + (end - start)
      }, 0)

      const totalMinutes = Math.floor(totalMs / 60000)

      return {
        ...e,
        sessions,
        totalMinutes,
        name: e.name || `${e.first_name || ''} ${e.last_name || ''}`.trim()
      }
    }).filter(e => e.sessions.length > 0)
  }, [employees, date])

  /* ================= CALENDARIO ================= */
  function getWorkingDays(year, month) {
    let count = 0
    const days = new Date(year, month + 1, 0).getDate()
    for (let d = 1; d <= days; d++) {
      const day = new Date(year, month, d).getDay()
      if (day !== 0 && day !== 6) count++
    }
    return count
  }

  const attendanceSummary = useMemo(() => {
    const [y, m] = month.split('-').map(Number)
    const totalDays = getWorkingDays(y, m - 1)

    const [eh, em] = entryTime.split(':').map(Number)
    const entryBaseMinutes = eh * 60 + em + tolerance

    return employees.map(e => {
      const records = (e.sessions || []).filter(s => {
        if (!s.start) return false
        const d = new Date(s.start)
        return d.getFullYear() === y && d.getMonth() === m - 1
      })

      const daysMap = {}
      records.forEach(s => {
        const d = new Date(s.start)
        const key = d.toISOString().slice(0, 10)
        if (!daysMap[key]) {
          const mins = d.getHours() * 60 + d.getMinutes()
          daysMap[key] = mins > entryBaseMinutes ? 'tardy' : 'ok'
        }
      })

      const present = Object.keys(daysMap).length
      const tardy = Object.values(daysMap).filter(v => v === 'tardy').length

      return {
        id: e.id,
        name: e.name || `${e.first_name || ''} ${e.last_name || ''}`.trim(),
        present,
        tardy,
        absent: totalDays - present
      }
    })
  }, [employees, month, entryTime, tolerance])

  /* ================= SUELDOS CON DESCUENTOS ================= */
  const payroll = useMemo(() => {
    const [y, m] = month.split('-').map(Number)

    return employees.map(e => {
      const attendance = attendanceSummary.find(a => a.id === e.id)

      // Asegurar que sea número y manejar nulos de forma segura
      let baseSalary = 0
      if (e.monthlySalary) {
        baseSalary = Number(e.monthlySalary)
      } else if (e.monthly_salary) {
        baseSalary = Number(e.monthly_salary)
      }

      // Calcular descuentos (ejemplo: $50 por falta, $10 por tardanza)
      const absentDeduction = (attendance?.absent || 0) * 50
      const tardyDeduction = (attendance?.tardy || 0) * 10
      const totalDeductions = absentDeduction + tardyDeduction
      const finalSalary = Math.max(0, baseSalary - totalDeductions)

      return {
        name: e.name || `${e.first_name || ''} ${e.last_name || ''}`.trim(),
        positionName: e.positionName || 'Sin cargo',
        baseSalary,
        tardy: attendance?.tardy || 0,
        absent: attendance?.absent || 0,
        deductions: totalDeductions,
        total: finalSalary
      }
    })
  }, [employees, attendanceSummary, month])

  /* ================= FUNCIÓN EXPORTAR PDF ================= */
  function exportPayrollPDF() {
    if (!payroll || payroll.length === 0) {
      alert('No hay datos de nómina para exportar.')
      return
    }

    try {
      const doc = new jsPDF()

      doc.setFontSize(18)
      doc.text(`REPORTE DE NÓMINA - ${month}`, 105, 20, { align: 'center' })

      doc.setFontSize(10)
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' })

      const headers = [['No.', 'Empleado', 'Cargo', 'Sueldo Base', 'Tardanzas', 'Faltas', 'Descuentos', 'Total']]

      const tableData = payroll.map((emp, index) => [
        (index + 1).toString(),
        emp.name || `Empleado ${index + 1}`,
        emp.positionName,
        `$${emp.baseSalary.toFixed(2)}`,
        emp.tardy.toString(),
        emp.absent.toString(),
        `$${emp.deductions.toFixed(2)}`,
        `$${emp.total.toFixed(2)}`
      ])

      const totalFinal = payroll.reduce((sum, e) => sum + e.total, 0)
      tableData.push(['', 'TOTAL GENERAL', '', '', '', '', '', `$${totalFinal.toFixed(2)}`])

      doc.autoTable({
        startY: 35,
        head: headers,
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] }
      })

      doc.save(`nomina_${month.replace('-', '_')}.pdf`)
      alert(`✅ Reporte generado: nomina_${month}.pdf`)
    } catch (error) {
      console.error('Error al generar PDF:', error)
      alert('Error al generar PDF')
    }
  }

  /* ================= GESTIÓN DE CARGOS ================= */
  const handleSavePosition = async () => {
    try {
      if (!positionForm.name || !positionForm.monthly_salary) {
        alert('Nombre y salario son requeridos')
        return
      }

      if (editingPosition) {
        await axios.put(`http://localhost:3001/api/positions/${editingPosition.id}`, positionForm)
        alert('Cargo actualizado')
      } else {
        await axios.post('http://localhost:3001/api/positions', positionForm)
        alert('Cargo creado')
      }

      setPositionForm({ name: '', monthly_salary: '', description: '' })
      setEditingPosition(null)
      setShowPositionForm(false)
      fetchPositions()
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar cargo')
    }
  }

  const handleDeletePosition = async (id) => {
    if (!confirm('¿Eliminar este cargo?')) return
    try {
      await axios.delete(`http://localhost:3001/api/positions/${id}`)
      alert('Cargo eliminado')
      fetchPositions()
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar cargo')
    }
  }

  const handleEditEmployee = async (employee) => {
    setEditingEmployee(employee)
  }

  const handleSaveEmployee = async () => {
    try {
      await axios.put(`http://localhost:3001/api/employees/${editingEmployee.id}`, {
        name: editingEmployee.name,
        lastName: editingEmployee.lastName,
        role: editingEmployee.role,
        idNumber: editingEmployee.idNumber,
        positionId: editingEmployee.positionId
      })
      alert('Empleado actualizado')
      setEditingEmployee(null)
      fetchEmployees()
    } catch (err) {
      alert('Error al actualizar empleado')
    }
  }

  /* ================= UI ================= */
  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <h3 style={styles.menuTitle}>Administración</h3>

        <div style={styles.menuContainer}>
          <button style={section === 'daily' ? styles.menuActive : styles.menuBtn} onClick={() => setSection('daily')}>
            Reporte diario
          </button>
          <button style={section === 'calendar' ? styles.menuActive : styles.menuBtn} onClick={() => setSection('calendar')}>
            Asistencias
          </button>
          <button style={section === 'positions' ? styles.menuActive : styles.menuBtn} onClick={() => setSection('positions')}>
            Cargos
          </button>
          <button style={section === 'payroll' ? styles.menuActive : styles.menuBtn} onClick={() => setSection('payroll')}>
            Sueldos
          </button>
          <button style={section === 'employees' ? styles.menuActive : styles.menuBtn} onClick={() => setSection('employees')}>
            Usuarios
          </button>
        </div>

        <button style={styles.logoutBtn} onClick={props.onLogout}>
          Cerrar Sesión
        </button>
      </aside>

      <main style={styles.content}>
        <div style={styles.card}>
          {/* ================= REPORTE DIARIO ================= */}
          {section === 'daily' && (
            <>
              <h2 style={styles.sectionTitle}>Reporte Diario</h2>
              <div style={styles.controls}>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={styles.input}
                />
              </div>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Empleado</th>
                    <th style={styles.th}>Tiempo Trabajado</th>
                    <th style={styles.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {report.map(e => (
                    <React.Fragment key={e.id}>
                      <tr>
                        <td style={styles.td}>{e.name}</td>
                        <td style={styles.td}>{formatTime(e.totalMinutes)}</td>
                        <td style={styles.td}>
                          <button
                            style={styles.link}
                            onClick={() => setOpenId(openId === e.id ? null : e.id)}
                          >
                            {openId === e.id ? 'Ocultar' : 'Ver detalle'}
                          </button>
                        </td>
                      </tr>
                      {openId === e.id && (
                        <tr>
                          <td colSpan="3" style={styles.detailCell}>
                            {e.sessions.map((s, i) => {
                              const start = new Date(s.start)
                              const end = s.end ? new Date(s.end) : new Date()
                              const mins = Math.floor((end - start) / 60000)
                              return (
                                <div key={i} style={styles.session}>
                                  <span>
                                    {start.toLocaleTimeString()} —{' '}
                                    {s.end ? end.toLocaleTimeString() : 'Trabajando'}
                                  </span>
                                  <strong>{formatTime(mins)}</strong>
                                </div>
                              )
                            })}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              <div style={styles.footer}>
                <strong>Empleados trabajando hoy:</strong>
                <span>{report.length}</span>
              </div>
            </>
          )}

          {/* ================= CALENDARIO ================= */}
          {section === 'calendar' && (
            <>
              <h2 style={styles.sectionTitle}>Calendario de Asistencias</h2>
              <div style={styles.controls}>
                <input
                  type="month"
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  style={styles.input}
                />
                <input
                  type="time"
                  value={entryTime}
                  onChange={e => setEntryTime(e.target.value)}
                  style={styles.input}
                  title="Hora de entrada"
                />
                <input
                  type="number"
                  value={tolerance}
                  onChange={e => setTolerance(Number(e.target.value))}
                  style={styles.input}
                  placeholder="Tolerancia (min)"
                />
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Empleado</th>
                    <th style={styles.th}>Presentes</th>
                    <th style={styles.th}>Tardanzas</th>
                    <th style={styles.th}>Ausentes</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceSummary.map(e => (
                    <tr key={e.id}>
                      <td style={styles.td}>{e.name}</td>
                      <td style={styles.td}>{e.present}</td>
                      <td style={styles.td}>{e.tardy}</td>
                      <td style={styles.td}>{e.absent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* ================= USUARIOS ================= */}
          {section === 'employees' && <UserManagement />}

          {/* ================= CARGOS ================= */}
          {section === 'positions' && (
            <>
              <h2 style={styles.sectionTitle}>Gestión de Cargos</h2>

              {/* Lista de Cargos */}
              <div style={styles.subsection}>
                <div style={styles.subsectionHeader}>
                  <h3>Cargos Disponibles</h3>
                  <button
                    style={styles.primaryBtn}
                    onClick={() => {
                      setShowPositionForm(true)
                      setEditingPosition(null)
                      setPositionForm({ name: '', monthly_salary: '', description: '' })
                    }}
                  >
                    + Crear Cargo
                  </button>
                </div>

                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Nombre</th>
                      <th style={styles.th}>Sueldo Mensual</th>
                      <th style={styles.th}>Descripción</th>
                      <th style={styles.th}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map(pos => (
                      <tr key={pos.id}>
                        <td style={styles.td}>{pos.name}</td>
                        <td style={styles.td}>${Number(pos.monthly_salary).toFixed(2)}</td>
                        <td style={styles.td}>{pos.description || '-'}</td>
                        <td style={styles.td}>
                          <button
                            style={styles.editBtn}
                            onClick={() => {
                              setEditingPosition(pos)
                              setPositionForm({
                                name: pos.name,
                                monthly_salary: pos.monthly_salary,
                                description: pos.description || ''
                              })
                              setShowPositionForm(true)
                            }}
                          >
                            Editar
                          </button>
                          <button
                            style={styles.deleteBtn}
                            onClick={() => handleDeletePosition(pos.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {showPositionForm && (
                  <div style={styles.formCard}>
                    <h4>{editingPosition ? 'Editar Cargo' : 'Nuevo Cargo'}</h4>
                    <input
                      type="text"
                      placeholder="Nombre del cargo"
                      value={positionForm.name}
                      onChange={e => setPositionForm({ ...positionForm, name: e.target.value })}
                      style={styles.input}
                    />
                    <input
                      type="number"
                      placeholder="Sueldo mensual"
                      value={positionForm.monthly_salary}
                      onChange={e => setPositionForm({ ...positionForm, monthly_salary: e.target.value })}
                      style={styles.input}
                    />
                    <input
                      type="text"
                      placeholder="Descripción (opcional)"
                      value={positionForm.description}
                      onChange={e => setPositionForm({ ...positionForm, description: e.target.value })}
                      style={styles.input}
                    />
                    <div style={styles.formActions}>
                      <button style={styles.primaryBtn} onClick={handleSavePosition}>Guardar</button>
                      <button style={styles.secondaryBtn} onClick={() => setShowPositionForm(false)}>Cancelar</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de Empleados con Asignación de Cargo */}
              <div style={styles.subsection}>
                <h3>Asignar Cargos a Empleados</h3>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Empleado</th>
                      <th style={styles.th}>Cédula</th>
                      <th style={styles.th}>Cargo Actual</th>
                      <th style={styles.th}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp.id}>
                        <td style={styles.td}>{emp.name} {emp.lastName}</td>
                        <td style={styles.td}>{emp.idNumber}</td>
                        <td style={styles.td}>{emp.positionName || 'Sin cargo'}</td>
                        <td style={styles.td}>
                          <button
                            style={styles.editBtn}
                            onClick={() => handleEditEmployee(emp)}
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {editingEmployee && (
                  <div style={styles.formCard}>
                    <h4>Editar Empleado</h4>
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={editingEmployee.name}
                      onChange={e => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                      style={styles.input}
                    />
                    <input
                      type="text"
                      placeholder="Apellido"
                      value={editingEmployee.lastName}
                      onChange={e => setEditingEmployee({ ...editingEmployee, lastName: e.target.value })}
                      style={styles.input}
                    />
                    <input
                      type="text"
                      placeholder="Cédula"
                      value={editingEmployee.idNumber}
                      onChange={e => setEditingEmployee({ ...editingEmployee, idNumber: e.target.value })}
                      style={styles.input}
                    />
                    <select
                      value={editingEmployee.positionId || ''}
                      onChange={e => setEditingEmployee({ ...editingEmployee, positionId: e.target.value || null })}
                      style={styles.input}
                    >
                      <option value="">Sin cargo</option>
                      {positions.map(pos => (
                        <option key={pos.id} value={pos.id}>{pos.name}</option>
                      ))}
                    </select>
                    <div style={styles.formActions}>
                      <button style={styles.primaryBtn} onClick={handleSaveEmployee}>Guardar</button>
                      <button style={styles.secondaryBtn} onClick={() => setEditingEmployee(null)}>Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ================= SUELDOS ================= */}
          {section === 'payroll' && (
            <>
              <h2 style={styles.sectionTitle}>Nómina Mensual</h2>
              <div style={styles.controls}>
                <input
                  type="month"
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  style={styles.input}
                />
                <button style={styles.primaryBtn} onClick={exportPayrollPDF}>
                  Exportar PDF
                </button>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Empleado</th>
                    <th style={styles.th}>Cargo</th>
                    <th style={styles.th}>Sueldo Base</th>
                    <th style={styles.th}>Tardanzas</th>
                    <th style={styles.th}>Faltas</th>
                    <th style={styles.th}>Descuentos</th>
                    <th style={styles.th}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.map((e, i) => (
                    <tr key={i}>
                      <td style={styles.td}>{e.name}</td>
                      <td style={styles.td}>{e.positionName}</td>
                      <td style={styles.td}>${e.baseSalary.toFixed(2)}</td>
                      <td style={styles.td}>{e.tardy}</td>
                      <td style={styles.td}>{e.absent}</td>
                      <td style={styles.td}>-${e.deductions.toFixed(2)}</td>
                      <td style={styles.td}><strong>${e.total.toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={styles.footer}>
                <strong>Total Empleados:</strong>
                <span>{employees.length}</span>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

/* ===== ESTILOS MEJORADOS ===== */
const styles = {
  layout: { display: 'flex', minHeight: '100vh', background: '#f3f4f6' },
  sidebar: {
    width: 250,
    background: '#1f2937',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  menuTitle: { color: '#fff', marginBottom: 20, fontSize: 20 },
  menuContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    flex: 1
  },
  menuBtn: {
    background: 'transparent',
    border: 'none',
    color: '#d1d5db',
    padding: 12,
    textAlign: 'left',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 15
  },
  menuActive: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: 12,
    textAlign: 'left',
    borderRadius: 6,
    fontSize: 15,
    fontWeight: '500'
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
  content: { flex: 1, padding: 30, display: 'flex', justifyContent: 'center' },
  card: {
    width: '100%',
    maxWidth: 1200,
    background: '#fff',
    borderRadius: 14,
    padding: 40,
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: 24,
    fontSize: 28,
    color: '#1f2937'
  },
  controls: { display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' },
  input: {
    padding: 10,
    borderRadius: 6,
    border: '1px solid #d1d5db',
    fontSize: 14,
    minWidth: 150
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: 16
  },
  th: {
    background: '#f9fafb',
    padding: 14,
    textAlign: 'left',
    borderBottom: '2px solid #e5e7eb',
    fontWeight: '600',
    color: '#374151',
    fontSize: 14
  },
  td: {
    padding: 14,
    borderBottom: '1px solid #e5e7eb',
    fontSize: 14,
    color: '#1f2937'
  },
  detailCell: {
    padding: 14,
    background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb'
  },
  session: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontSize: 14
  },
  link: {
    background: 'none',
    border: 'none',
    color: '#2563eb',
    cursor: 'pointer',
    fontSize: 14,
    textDecoration: 'underline'
  },
  footer: {
    marginTop: 24,
    display: 'flex',
    justifyContent: 'space-between',
    padding: 16,
    background: '#f9fafb',
    borderRadius: 8,
    fontSize: 16
  },
  subsection: {
    marginBottom: 40,
    padding: 20,
    background: '#f9fafb',
    borderRadius: 8
  },
  subsectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  primaryBtn: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: '500'
  },
  secondaryBtn: {
    background: '#6b7280',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14
  },
  editBtn: {
    background: '#10b981',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 13,
    marginRight: 8
  },
  deleteBtn: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 13
  },
  formCard: {
    background: '#fff',
    padding: 24,
    borderRadius: 8,
    marginTop: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  formActions: {
    display: 'flex',
    gap: 12,
    marginTop: 16
  }
}