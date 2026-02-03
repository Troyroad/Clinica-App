// AddEmployeeModal.jsx - VERSIÓN COMPLETAMENTE CORREGIDA
import React, { useState, useEffect, useRef } from 'react'

export default function AddEmployeeModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    name: '',
    lastName: '',
    role: '',
    idNumber: ''
  })
  const [loading, setLoading] = useState(false)
  
  // 🔁 Refs para manejar focus
  const nameInputRef = useRef(null)
  const lastNameInputRef = useRef(null)
  const roleInputRef = useRef(null)
  const idNumberInputRef = useRef(null)

  // 🔁 Enfocar el primer input cuando el modal se abre
  useEffect(() => {
    if (nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current.focus()
      }, 50)
    }
  }, [])

  // 🔁 Manejar cambio de inputs - FORMA CORRECTA
  const handleInputChange = (field) => (e) => {
    const { value } = e.target
    setForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 🔁 Manejar submit con Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleAdd()
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleAdd = async () => {
    // Validación mejorada
    const missingFields = []
    if (!form.name.trim()) missingFields.push('Nombre')
    if (!form.lastName.trim()) missingFields.push('Apellido')
    if (!form.idNumber.trim()) missingFields.push('Cédula')
    
    if (missingFields.length > 0) {
      alert(`Complete los campos requeridos: ${missingFields.join(', ')}`)
      return
    }

    setLoading(true)
    try {
      await onAdd({ ...form })
      
      // 🔁 LIMPIAR FORMULARIO DESPUÉS DE ÉXITO
      setForm({
        name: '',
        lastName: '',
        role: '',
        idNumber: ''
      })
      
      // 🔁 CERRAR MODAL
      onClose()
    } catch (err) {
      console.error('Error:', err)
      alert(err.message || 'No se pudo agregar el empleado')
    } finally {
      setLoading(false)
    }
  }

  // 🔁 Manejar clic fuera del modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose()
    }
  }

  return (
    <div 
      style={styles.overlay} 
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div style={styles.modal}>
        <h3 style={styles.title}>Agregar empleado</h3>

        <div style={styles.formGroup}>
          <input
            ref={nameInputRef}
            type="text"
            placeholder="Nombre"
            value={form.name}
            onChange={handleInputChange('name')}
            onKeyDown={handleKeyDown}
            style={styles.input}
            disabled={loading}
            aria-label="Nombre del empleado"
          />
        </div>

        <div style={styles.formGroup}>
          <input
            ref={lastNameInputRef}
            type="text"
            placeholder="Apellido"
            value={form.lastName}
            onChange={handleInputChange('lastName')}
            onKeyDown={handleKeyDown}
            style={styles.input}
            disabled={loading}
            aria-label="Apellido del empleado"
          />
        </div>

        <div style={styles.formGroup}>
          <input
            ref={roleInputRef}
            type="text"
            placeholder="Rol (opcional)"
            value={form.role}
            onChange={handleInputChange('role')}
            onKeyDown={handleKeyDown}
            style={styles.input}
            disabled={loading}
            aria-label="Rol del empleado"
          />
        </div>

        <div style={styles.formGroup}>
          <input
            ref={idNumberInputRef}
            type="text"
            placeholder="Cédula"
            value={form.idNumber}
            onChange={handleInputChange('idNumber')}
            onKeyDown={handleKeyDown}
            style={styles.input}
            disabled={loading}
            aria-label="Cédula del empleado"
            inputMode="numeric"
          />
        </div>

        <div style={styles.buttonContainer}>
          <button
            onClick={onClose}
            disabled={loading}
            style={styles.cancelButton}
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={handleAdd}
            disabled={loading}
            style={loading ? styles.addButtonDisabled : styles.addButton}
            type="button"
          >
            {loading ? 'Agregando...' : 'Agregar empleado'}
          </button>
        </div>
      </div>
    </div>
  )
}

// 🔁 ESTILOS MEJORADOS
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(2px)'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    animation: 'slideIn 0.3s ease-out'
  },
  title: {
    marginTop: 0,
    marginBottom: '20px',
    color: '#333',
    fontSize: '1.5rem',
    fontWeight: '600'
  },
  formGroup: {
    marginBottom: '16px'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '16px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none'
  },
  inputFocus: {
    borderColor: '#007bff',
    boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px'
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '6px',
    color: '#333',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  addButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  },
  addButtonDisabled: {
    padding: '10px 20px',
    backgroundColor: '#ccc',
    border: 'none',
    borderRadius: '6px',
    color: '#666',
    cursor: 'not-allowed',
    fontSize: '14px',
    fontWeight: '500'
  }
}

// 🔁 Agregar animación
const styleSheet = document.styleSheets[0]
styleSheet.insertRule(`
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`, styleSheet.cssRules.length)

// 🔁 Agregar estilos para placeholders
styleSheet.insertRule(`
  input::placeholder {
    color: #999;
    opacity: 1;
  }
  
  input:focus::placeholder {
    color: #ccc;
  }
  
  input:disabled::placeholder {
    color: #ddd;
  }
`, styleSheet.cssRules.length)