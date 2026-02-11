@echo off
REM Script simple para iniciar la aplicacion
echo ========================================
echo   Iniciando Aplicacion Clinica
echo ========================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "backend" (
    echo ERROR: No se encuentra la carpeta backend
    echo Asegurate de ejecutar este script desde: C:\Users\usuario\Desktop\clinica-app
    pause
    exit /b 1
)

if not exist "package.json" (
    echo ERROR: No se encuentra package.json
    echo Asegurate de ejecutar este script desde: C:\Users\usuario\Desktop\clinica-app
    pause
    exit /b 1
)

echo [1/2] Iniciando Backend (puerto 3001)...
start "Backend - Clinica" cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo [2/2] Iniciando Frontend (puerto 5173)...
start "Frontend - Clinica" cmd /k "npm run dev"

echo.
echo ========================================
echo   Aplicacion iniciada!
echo ========================================
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Se abrieron 2 ventanas de comandos:
echo - Backend (puerto 3001)
echo - Frontend (puerto 5173)
echo.
echo NO CIERRES estas ventanas mientras uses la aplicacion.
echo.
pause
