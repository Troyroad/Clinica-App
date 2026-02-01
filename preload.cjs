const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getEmployees: () => ipcRenderer.invoke('getEmployees'),
  addEmployee: (emp) => ipcRenderer.invoke('addEmployee', emp),
  updateEmployee: (emp) => ipcRenderer.invoke('updateEmployee', emp),
  deleteEmployee: (id) => ipcRenderer.invoke('deleteEmployee', id),
  clockIn: (opts) => ipcRenderer.invoke('clockIn', opts),
  clockOut: (opts) => ipcRenderer.invoke('clockOut', opts),
  getAttendanceForEmployee: (opts) => ipcRenderer.invoke('getAttendanceForEmployee', opts),
  getPayments: () => ipcRenderer.invoke('getPayments')
});

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  login: (data) => ipcRenderer.invoke('login', data)
})
