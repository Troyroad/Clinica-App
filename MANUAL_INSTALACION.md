# Manual de Instalación - Sistema de Gestión de Clínica

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Instalación en PC 1 (Servidor Principal)](#instalación-pc-1)
3. [Instalación en PC 2 (Cliente)](#instalación-pc-2)
4. [Configuración de Red](#configuración-de-red)
5. [Verificación del Sistema](#verificación-del-sistema)
6. [Uso Diario](#uso-diario)
7. [Solución de Problemas](#solución-de-problemas)
8. [Mantenimiento](#mantenimiento)

---

## 🔧 Requisitos Previos

### Ambas PCs deben tener:
- ✅ Windows 10/11
- ✅ Conexión a la misma red local (LAN)
- ✅ Al menos 4 GB de RAM
- ✅ 10 GB de espacio en disco

### Software a instalar:
1. **Node.js** (versión 18 o superior)
   - Descargar de: https://nodejs.org/
   - Instalar versión LTS (recomendada)

2. **MySQL** (versión 8.0 o superior)
   - Descargar de: https://dev.mysql.com/downloads/installer/
   - Instalar "MySQL Community Server"
   - Durante instalación, configurar contraseña de root

3. **MySQL Workbench** (opcional pero recomendado)
   - Se instala junto con MySQL
   - Útil para gestionar la base de datos

---

## 💻 Instalación en PC 1 (Servidor Principal)

Esta PC alojará la base de datos y el backend.

### Paso 1: Instalar MySQL

1. Ejecutar el instalador de MySQL
2. Elegir "Server only" o "Full"
3. Configurar contraseña del usuario `root` (ejemplo: `123456`)
4. Completar la instalación

### Paso 2: Configurar MySQL para Acceso Remoto

1. Abrir MySQL Workbench
2. Conectarse a la base de datos local
3. Ejecutar este comando:

```sql
CREATE USER 'clinica_user'@'%' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON *.* TO 'clinica_user'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

4. **Método Automático (Recomendado):**
   - Ir a la carpeta `C:\clinica-app`
   - Click derecho en el archivo `CONFIGURAR_MYSQL.ps1`
   - Seleccionar "Ejecutar con PowerShell"
   - Confirmar si pide permisos
   - Esperar mensaje "Proceso Finalizado"

5. **Método Manual (Alternativo):**
   Si el script falla, editar manualmente:
   - Ubicación: `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini`
   - Buscar la sección: `[mysqld]`
   - Agregar debajo: `bind-address = 0.0.0.0`
   - Guardar el archivo (requiere permisos de Administrador)
   - Reiniciar servicio "MySQL80" desde `services.msc`

### Paso 3: Crear la Base de Datos

1. Abrir MySQL Workbench
2. Conectarse a localhost
3. Ejecutar:

```sql
CREATE DATABASE IF NOT EXISTS clinica_db;
USE clinica_db;
```

4. Abrir el archivo: `C:\ruta\a\clinica-app\db\EJECUTAR_EN_WORKBENCH.sql`
5. Ejecutar todo el script (Ctrl + Shift + Enter)
6. Verificar que aparezca: "MIGRACION COMPLETADA EXITOSAMENTE!"

### Paso 4: Copiar la Aplicación

1. Copiar la carpeta completa `clinica-app` a:
   ```
   C:\clinica-app
   ```

2. Abrir PowerShell como Administrador
3. Navegar a la carpeta:
   ```powershell
   cd C:\clinica-app
   ```

### Paso 5: Instalar Dependencias

```powershell
# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ..
npm install
```

### Paso 6: Configurar Variables de Entorno

1. Crear archivo `.env` en `C:\clinica-app\backend\`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=clinica_db
PORT=3001
```

### Paso 7: Obtener la IP del PC

1. Abrir PowerShell
2. Ejecutar:
   ```powershell
   ipconfig
   ```
3. Anotar la **Dirección IPv4** (ejemplo: `192.168.1.100`)
   - Esta IP es importante para el PC 2

### Paso 8: Configurar el Firewall

1. Abrir "Firewall de Windows Defender"
2. Click en "Configuración avanzada"
3. "Reglas de entrada" → "Nueva regla"
4. Tipo: Puerto
5. TCP, Puertos específicos: `3001, 3306`
6. Permitir la conexión
7. Aplicar a todos los perfiles
8. Nombre: "Clinica App"

### Paso 9: Iniciar la Aplicación

**Opción A: Usando los scripts automáticos**

1. Hacer doble clic en: `C:\clinica-app\iniciar_app.bat`
2. Se abrirán 2 ventanas (Backend y Frontend)
3. ¡Listo!

**Opción B: Manual**

Terminal 1 - Backend:
```powershell
cd C:\clinica-app\backend
npm start
```

Terminal 2 - Frontend:
```powershell
cd C:\clinica-app
npm run dev
```

### Paso 10: Verificar

1. Abrir navegador en PC 1
2. Ir a: `http://localhost:5173`
3. Deberías ver la pantalla de login
4. Usuario: `admin` / Contraseña: `admin123`

---

## 💻 Instalación en PC 2 (Cliente)

Esta PC solo necesita el frontend, se conectará al backend del PC 1.

### Paso 1: Instalar Node.js

1. Descargar e instalar Node.js desde: https://nodejs.org/

### Paso 2: Copiar Solo el Frontend

1. Copiar la carpeta `clinica-app` a:
   ```
   C:\clinica-app
   ```
   
   **O** copiar solo estos archivos/carpetas:
   - `src/`
   - `public/`
   - `package.json`
   - `vite.config.js`
   - `index.html`

### Paso 3: Configurar la Conexión al Servidor

1. Editar TODOS los archivos que tienen `http://localhost:3001` y cambiar a la IP del PC 1:

   **Archivos a editar:**
   - `src/components/AdminModule.jsx`
   - `src/components/SecretaryModule.jsx`
   - `src/components/UserManagement.jsx`
   - `src/App.jsx`

2. Buscar todas las líneas con:
   ```javascript
   http://localhost:3001
   ```

3. Reemplazar con (usando la IP del PC 1):
   ```javascript
   http://192.168.1.100:3001
   ```

### Paso 4: Instalar Dependencias

```powershell
cd C:\clinica-app
npm install
```

### Paso 5: Iniciar la Aplicación

```powershell
npm run dev
```

### Paso 6: Verificar

1. Abrir navegador
2. Ir a: `http://localhost:5173`
3. Debería conectarse al backend del PC 1
4. Login: `secretaria` / `sec123`

---

## 🌐 Configuración de Red

### Verificar Conectividad entre PCs

**Desde PC 2:**

1. Abrir PowerShell
2. Hacer ping al PC 1:
   ```powershell
   ping 192.168.1.100
   ```
3. Probar conexión al backend:
   ```powershell
   curl http://192.168.1.100:3001/api/employees
   ```

Si hay problemas:
- Verificar que ambas PCs estén en la misma red
- Desactivar temporalmente firewall para probar
- Verificar que el backend esté corriendo en PC 1

---

## ✅ Verificación del Sistema

### Lista de Chequeo

- [ ] **PC 1:** MySQL está corriendo (puerto 3306)
- [ ] **PC 1:** Backend está corriendo (puerto 3001)
- [ ] **PC 1:** Frontend está corriendo (puerto 5173)
- [ ] **PC 1:** Firewall permite puertos 3001 y 3306
- [ ] **PC 2:** Frontend está corriendo (puerto 5173)
- [ ] **PC 2:** Puede hacer ping a PC 1
- [ ] **PC 2:** Puede acceder a `http://IP-PC1:3001/api/employees`
- [ ] **Ambas PCs:** Pueden hacer login exitosamente
- [ ] **Ambas PCs:** Pueden ver empleados y cargos

### Credenciales por Defecto

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | admin123 | Administrador |
| secretaria | sec123 | Secretaria |

**⚠️ IMPORTANTE:** Cambiar estas contraseñas después de la instalación.

---

## 📖 Uso Diario

### Inicio del Sistema

**En PC 1 (Servidor):**
1. Hacer doble clic en: `C:\clinica-app\iniciar_app.bat`
2. Esperar a que aparezcan las 2 ventanas (Backend y Frontend)
3. **NO CERRAR** estas ventanas mientras se use el sistema

**En PC 2 (Cliente):**
1. Abrir PowerShell
2. Ejecutar:
   ```powershell
   cd C:\clinica-app
   npm run dev
   ```
3. Abrir navegador en: `http://localhost:5173`

### Flujo de Trabajo Diario

**Secretaria (PC 2):**
1. Login con usuario `secretaria`
2. Marcar asistencia de empleados
3. Seleccionar turno para enfermeras y personal de limpieza
4. Marcar entrada/salida de empleados por honorario

**Administrador (PC 1):**
1. Login con usuario `admin`
2. Ver reporte diario
3. Gestionar asistencias
4. Configurar cargos y porcentajes de descuento
5. Generar nómina mensual
6. Exportar reportes en PDF

### Cierre del Sistema

1. Cerrar los navegadores
2. En las ventanas de PowerShell: presionar `Ctrl + C`
3. Confirmar con `S` (Sí) o `Y` (Yes)

---

## 🔧 Solución de Problemas

### Problema: "No se puede conectar a la base de datos"

**Solución:**
1. Verificar que MySQL esté corriendo:
   - Abrir "Servicios" (services.msc)
   - Buscar "MySQL80"
   - Debe estar "En ejecución"

2. Verificar credenciales en `backend\.env`
3. Reiniciar el backend

### Problema: "Error al obtener empleados" en PC 2

**Solución:**
1. Verificar que PC 1 tenga el backend corriendo
2. Hacer ping desde PC 2 a PC 1:
   ```powershell
   ping IP-DEL-PC1
   ```
3. Verificar configuración del firewall en PC 1
4. Probar acceso directo al API:
   ```
   http://IP-DEL-PC1:3001/api/employees
   ```

### Problema: "Puerto 3001 ya está en uso"

**Solución:**
1. Cerrar la aplicación que usa el puerto
2. O cambiar el puerto en `backend\.env`:
   ```env
   PORT=3002
   ```
3. Actualizar también en todos los archivos del frontend

### Problema: "Table doesn't exist"

**Solución:**
1. Ejecutar el script de migración:
   - Abrir MySQL Workbench
   - Abrir: `db\EJECUTAR_EN_WORKBENCH.sql`
   - Ejecutar todo (Ctrl + Shift + Enter)
2. Reiniciar el backend

### Problema: Aplicación muy lenta

**Solución:**
1. Verificar que no haya otros programas consumiendo recursos
2. Reiniciar ambas PCs
3. Limpiar caché del navegador
4. Verificar velocidad de la red local

---

## 🔄 Mantenimiento

### Backup de la Base de Datos (Semanal)

1. Abrir PowerShell en PC 1
2. Ejecutar:

```powershell
# Crear carpeta de backups si no existe
mkdir C:\clinica-app\backups

# Crear backup
mysqldump -u root -p123456 clinica_db > C:\clinica-app\backups\backup_$(Get-Date -Format 'yyyy-MM-dd').sql
```

### Restaurar Backup

```powershell
mysql -u root -p123456 clinica_db < C:\clinica-app\backups\backup_2026-02-11.sql
```

### Actualizar Contraseñas

1. Login como admin
2. Ir a "Usuarios"
3. Seleccionar usuario
4. Click en "Cambiar Contraseña"
5. Ingresar nueva contraseña (mínimo 4 caracteres)

### Limpiar Datos Antiguos (Opcional)

Para eliminar sesiones de hace más de 1 año:

```sql
DELETE FROM sessions WHERE DATE(date) < DATE_SUB(NOW(), INTERVAL 1 YEAR);
DELETE FROM honorarium_sessions WHERE DATE(start) < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

---

## 📞 Soporte Técnico

### Logs del Sistema

**Backend logs:**
- Se muestran en la ventana del backend
- Errores se marcan en rojo

**Frontend logs:**
- Abrir navegador
- Presionar F12
- Ver pestaña "Console"

### Información del Sistema

Para reportar problemas, incluir:
1. Versión de Windows
2. Versión de Node.js: `node --version`
3. Mensaje de error completo
4. Capturas de pantalla

---

## ✅ Checklist de Instalación Completa

### PC 1 (Servidor)
- [ ] Node.js instalado
- [ ] MySQL instalado y corriendo
- [ ] Base de datos `clinica_db` creada
- [ ] Tablas creadas con script de migración
- [ ] Aplicación copiada a `C:\clinica-app`
- [ ] Dependencias instaladas (backend + frontend)
- [ ] Archivo `.env` configurado
- [ ] Firewall configurado (puertos 3001, 3306)
- [ ] Backend inicia sin errores
- [ ] Frontend inicia sin errores
- [ ] Login funciona correctamente

### PC 2 (Cliente)
- [ ] Node.js instalado
- [ ] Aplicación copiada a `C:\clinica-app`
- [ ] IPs actualizadas en archivos del frontend
- [ ] Dependencias instaladas
- [ ] Frontend inicia sin errores
- [ ] Conecta correctamente al backend de PC 1
- [ ] Login funciona correctamente

### Verificación Final
- [ ] Ambas PCs pueden acceder simultáneamente
- [ ] Marcar asistencia funciona desde ambas PCs
- [ ] Los cambios se reflejan en tiempo real
- [ ] Exportar PDF funciona
- [ ] Cambio de contraseña funciona
- [ ] Backups configurados

---

## 🎉 ¡Sistema Listo!

El sistema está completamente instalado y listo para usar en la clínica.

**Recuerda:**
- Hacer backups semanales
- Cambiar contraseñas por defecto
- No cerrar las ventanas del backend/frontend mientras el sistema esté en uso
- Mantener ambas PCs en la misma red local

**¡Éxito con la implementación!** 🚀
