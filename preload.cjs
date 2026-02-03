const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Login
  login: (data) => ipcRenderer.invoke('login', data),
  
  // Usuarios
  agregarUsuario: (userData) => ipcRenderer.invoke('agregar-usuario', userData),
  obtenerUsuarios: () => ipcRenderer.invoke('obtener-usuarios'),
  
  // Empleados (solo los campos que necesitas)
  obtenerEmpleados: () => ipcRenderer.invoke('obtener-empleados'),
  agregarEmpleado: (empleado) => ipcRenderer.invoke('agregar-empleado', empleado),
  actualizarEmpleado: (empleado) => ipcRenderer.invoke('actualizar-empleado', empleado),
  eliminarEmpleado: (id) => ipcRenderer.invoke('eliminar-empleado', id),
  
  // Asistencias
  marcarEntrada: (employeeId) => ipcRenderer.invoke('marcar-entrada', employeeId),
  marcarSalida: (employeeId) => ipcRenderer.invoke('marcar-salida', employeeId),
  obtenerAsistencias: (filtros) => ipcRenderer.invoke('obtener-asistencias', filtros),
  
  // Pagos
  obtenerPagos: () => ipcRenderer.invoke('obtener-pagos'),
  registrarPago: (pagoData) => ipcRenderer.invoke('registrar-pago', pagoData),
  
  // Exportar
  exportarPagos: (options) => ipcRenderer.invoke('exportar-pagos', options)
})