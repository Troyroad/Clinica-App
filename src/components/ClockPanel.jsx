import React, { useState } from 'react'

export default function ClockPanel({ employee }) {
  const [clockInTime, setClockInTime] = useState(null)
  const [totalHours, setTotalHours] = useState(0)

  function clockIn() {
    setClockInTime(new Date())
  }

  function clockOut() {
    if (!clockInTime) return

    const now = new Date()
    const diffMs = now - clockInTime
    const diffHours = (diffMs / 1000 / 60 / 60).toFixed(2)

    setTotalHours(prev => Number(prev) + Number(diffHours))
    setClockInTime(null)
  }

  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={clockIn}>Entrada</button>
        <button className="secondary" onClick={clockOut}>Salida</button>
      </div>

      <small style={{ color: '#555' }}>
        Horas trabajadas: <strong>{totalHours}</strong>
      </small>
    </div>
  )
}
