import React, { useMemo, useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import axios from 'axios'
import UserManagement from './UserManagement'

export default function AdminModule() {
  const [rate, setRate] = useState(0)
  const [rateType, setRateType] = useState('hour')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [entryTime, setEntryTime] = useState('08:00')
  const [tolerance, setTolerance] = useState(30)
  const [openId, setOpenId] = useState(null)
  const [section, setSection] = useState('daily')
  const [employees, setEmployees] = useState([])
  const [, setTick] = useState(0)

  // 🔁 Cargar empleados cada minuto
  useEffect(() => {
    fetchEmployees()
    const interval = setInterval(() => {
      setTick(Date.now())
      fetchEmployees()
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // 🔁 Obtener empleados desde backend
  const fetchEmployees = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/employees')
      setEmployees(res.data)
    } catch (err) {
      console.error('Error al cargar empleados:', err)
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
      // Filtrar sesiones de la fecha seleccionada
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
      const hours = totalMinutes / 60

      let pay = 0
      if (rateType === 'hour') pay = hours * rate
      if (rateType === 'day') pay = sessions.length ? rate : 0
      if (rateType === 'month') pay = rate

      return { 
        ...e, 
        sessions, 
        totalMinutes, 
        pay,
        name: e.name || `${e.first_name || ''} ${e.last_name || ''}`.trim()
      }
    }).filter(e => e.sessions.length > 0) // Solo mostrar empleados con sesiones hoy
  }, [employees, rate, rateType, date])

  const totalPayroll = report.reduce((a, e) => a + e.pay, 0)

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

  /* ================= SUELDOS ================= */
  const payroll = useMemo(() => {
    const [y, m] = month.split('-').map(Number)

    return employees.map(e => {
      const sessions = (e.sessions || []).filter(s => {
        if (!s.start) return false
        const d = new Date(s.start)
        return d.getFullYear() === y && d.getMonth() === m - 1
      })

      const totalMs = sessions.reduce((acc, s) => {
        const start = new Date(s.start)
        const end = s.end ? new Date(s.end) : new Date()
        return acc + (end - start)
      }, 0)

      const hours = totalMs / 3600000
      const attendance = attendanceSummary.find(a => a.id === e.id)

      return {
        name: e.name || `${e.first_name || ''} ${e.last_name || ''}`.trim(),
        hours: hours || 0,
        tardy: attendance?.tardy || 0,
        absent: attendance?.absent || 0,
        total: (hours || 0) * rate
      }
    })
  }, [employees, attendanceSummary, rate, month])

  /* ================= FUNCIÓN EXPORTAR PDF ================= */
  function exportPayrollPDF() {
    // Verificar que hay datos
    if (!payroll || payroll.length === 0) {
      alert('No hay datos de nómina para exportar. Asegúrate de tener empleados con asistencias este mes.');
      return;
    }
    
    try {
      // Crear documento PDF
      const doc = new jsPDF();
      
      // Título principal
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text(`REPORTE DE NÓMINA - ${month}`, 105, 20, { align: 'center' });
      
      // Información del reporte
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 105, 28, { align: 'center' });
      doc.text(`Total empleados: ${payroll.length}`, 105, 34, { align: 'center' });
      
      // Preparar datos para la tabla
      const headers = [['No.', 'Empleado', 'Horas', 'Tardanzas', 'Ausencias', 'Total ($)']];
      
      const tableData = payroll.map((empleado, index) => {
        // Asegurar que todos los valores sean válidos
        const horas = isNaN(empleado.hours) ? 0 : Number(empleado.hours);
        const tardanzas = isNaN(empleado.tardy) ? 0 : Number(empleado.tardy);
        const ausencias = isNaN(empleado.absent) ? 0 : Number(empleado.absent);
        const total = isNaN(empleado.total) ? 0 : Number(empleado.total);
        
        return [
          (index + 1).toString(),
          empleado.name || `Empleado ${index + 1}`,
          horas.toFixed(2),
          tardanzas.toString(),
          ausencias.toString(),
          `$${total.toFixed(2)}`
        ];
      });
      
      // Calcular totales
      const totalHoras = payroll.reduce((sum, e) => sum + (isNaN(e.hours) ? 0 : Number(e.hours)), 0);
      const totalTardanzas = payroll.reduce((sum, e) => sum + (isNaN(e.tardy) ? 0 : Number(e.tardy)), 0);
      const totalAusencias = payroll.reduce((sum, e) => sum + (isNaN(e.absent) ? 0 : Number(e.absent)), 0);
      const totalGeneral = payroll.reduce((sum, e) => sum + (isNaN(e.total) ? 0 : Number(e.total)), 0);
      
      // Agregar fila de totales
      tableData.push([
        '',
        'TOTALES',
        totalHoras.toFixed(2),
        totalTardanzas.toString(),
        totalAusencias.toString(),
        `$${totalGeneral.toFixed(2)}`
      ]);
      
      // Generar la tabla con autotable
      doc.autoTable({
        startY: 45,
        head: headers,
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [50, 50, 50]
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 15, halign: 'center' },
          1: { cellWidth: 60 },
          2: { cellWidth: 25, halign: 'right' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 25, halign: 'center' },
          5: { cellWidth: 30, halign: 'right' }
        },
        margin: { left: 10, right: 10 },
        styles: {
          overflow: 'linebreak',
          cellPadding: 3
        },
        didDrawPage: function (data) {
          const pageCount = doc.internal.getNumberOfPages();
          const currentPage = data.pageNumber;
          
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(
            `Página ${currentPage} de ${pageCount}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
          
          doc.text(
            'Sistema de Gestión Clínica',
            doc.internal.pageSize.width - 50,
            doc.internal.pageSize.height - 10
          );
        }
      });
      
      // Guardar el PDF
      const fileName = `nomina_${month.replace('-', '_')}.pdf`;
      doc.save(fileName);
      
      alert(`✅ Reporte de nómina generado exitosamente:\n${fileName}`);
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      
      try {
        const simpleDoc = new jsPDF();
        simpleDoc.setFontSize(16);
        simpleDoc.text(`Nómina ${month}`, 20, 20);
        simpleDoc.setFontSize(10);
        simpleDoc.text('Empleados registrados:', 20, 30);
        
        let yPos = 40;
        payroll.forEach((emp, idx) => {
          simpleDoc.text(`${idx + 1}. ${emp.name || 'Sin nombre'} - $${(emp.total || 0).toFixed(2)}`, 20, yPos);
          yPos += 7;
        });
        
        simpleDoc.save(`nomina_simple_${month}.pdf`);
        alert('PDF generado en versión simple');
        
      } catch (simpleError) {
        console.error('Error incluso en versión simple:', simpleError);
        alert('Error al generar PDF. Verifica que la librería jsPDF esté instalada correctamente.');
      }
    }
  }

  /* ================= UI ================= */
  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <h3 style={styles.menuTitle}>Administración</h3>
        <button style={section === 'daily' ? styles.menuActive : styles.menuBtn} onClick={() => setSection('daily')}>
          Reporte diario
        </button>
        <button style={section === 'calendar' ? styles.menuActive : styles.menuBtn} onClick={() => setSection('calendar')}>
          Asistencias
        </button>
        <button style={section === 'employees' ? styles.menuActive : styles.menuBtn} onClick={() => setSection('employees')}>
          Usuarios
        </button>
        <button style={section === 'payroll' ? styles.menuActive : styles.menuBtn} onClick={() => setSection('payroll')}>
          Sueldo
        </button>
      </aside>

      <main style={styles.content}>
        <div style={styles.card}>
          {/* ================= REPORTE DIARIO ================= */}
          {section === 'daily' && (
            <>
              <h2>Reporte diario</h2>
              <section style={styles.controls}>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={styles.input}
                />
                <select
                  value={rateType}
                  onChange={e => setRateType(e.target.value)}
                  style={styles.input}
                >
                  <option value="hour">Hora</option>
                  <option value="day">Día</option>
                  <option value="month">Mes</option>
                </select>
                <input
                  type="number"
                  value={rate}
                  onChange={e => setRate(Number(e.target.value))}
                  style={styles.input}
                />
              </section>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Tiempo</th>
                    <th>Pago</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {report.map(e => (
                    <React.Fragment key={e.id}>
                      <tr>
                        <td>{e.name}</td>
                        <td>{formatTime(e.totalMinutes)}</td>
                        <td>${e.pay.toFixed(2)}</td>
                        <td>
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
                          <td colSpan="4">
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
              <footer style={styles.footer}>
                <strong>Total</strong>
                <span>${totalPayroll.toFixed(2)}</span>
              </footer>
            </>
          )}

          {/* ================= CALENDARIO ================= */}
          {section === 'calendar' && (
            <>
              <h2>Calendario de asistencias</h2>
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
                />
                <input
                  type="number"
                  value={tolerance}
                  onChange={e => setTolerance(Number(e.target.value))}
                  style={styles.input}
                />
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Presentes</th>
                    <th>Tardanzas</th>
                    <th>Ausentes</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceSummary.map(e => (
                    <tr key={e.id}>
                      <td>{e.name}</td>
                      <td>{e.present}</td>
                      <td>{e.tardy}</td>
                      <td>{e.absent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* ================= USUARIOS ================= */}
          {section === 'employees' && <UserManagement />}

          {/* ================= SUELDOS ================= */}
          {section === 'payroll' && (
            <>
              <h2>Sueldo mensual</h2>
              <div style={styles.controls}>
                <input
                  type="month"
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  style={styles.input}
                />
                <input
                  type="number"
                  value={rate}
                  onChange={e => setRate(Number(e.target.value))}
                  style={styles.input}
                  placeholder="Pago por hora"
                />
                <button onClick={exportPayrollPDF}>
                  Exportar PDF
                </button>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Horas</th>
                    <th>Tardanzas</th>
                    <th>Ausencias</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.map((e, i) => (
                    <tr key={i}>
                      <td>{e.name}</td>
                      <td>{e.hours.toFixed(2)}</td>
                      <td>{e.tardy}</td>
                      <td>{e.absent}</td>
                      <td>${e.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

/* ===== ESTILOS ORIGINALES ===== */
const styles = {
  layout: { display: 'flex', minHeight: '100vh', background: '#f3f4f6' },
  sidebar: {
    width: 230,
    background: '#1f2937',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  menuTitle: { color: '#fff', marginBottom: 20 },
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
  content: { flex: 1, padding: 30, display: 'flex', justifyContent: 'center' },
  card: {
    width: '100%',
    maxWidth: 1000,
    background: '#fff',
    borderRadius: 14,
    padding: 32,
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
  },
  controls: { display: 'flex', gap: 12, margin: '20px 0' },
  input: { padding: 8, borderRadius: 6, border: '1px solid #d1d5db' },
  table: { width: '100%', borderCollapse: 'collapse' },
  session: { display: 'flex', justifyContent: 'space-between', padding: 6 },
  link: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer' },
  footer: { marginTop: 20, display: 'flex', justifyContent: 'space-between' }
}