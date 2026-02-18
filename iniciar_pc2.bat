@echo off
REM ============================================================
REM  INICIAR APP CLINICA - PC2 (Cliente)
REM  Abre el navegador apuntando al servidor de la PC1
REM  INSTRUCCION: Cambia PC1_IP por la IP real de la PC1
REM ============================================================

set PC1_IP=192.168.1.100
set FRONTEND_PORT=5173
set BACKEND_PORT=3001
set URL=http://%PC1_IP%:%FRONTEND_PORT%

echo ========================================
echo   Clinica App - Acceso desde PC2
echo ========================================
echo.
echo Conectando al servidor: %PC1_IP%
echo.

REM Esperar a que el servidor de PC1 este disponible (intentar hasta 10 veces)
echo Verificando conexion con el servidor...
set /a INTENTOS=0

:VERIFICAR
set /a INTENTOS+=1
if %INTENTOS% GTR 10 (
    echo.
    echo ADVERTENCIA: No se pudo verificar la conexion con %PC1_IP%
    echo Abriendo el navegador de todas formas...
    goto ABRIR
)

REM Intentar conectar al backend de PC1
curl -s --connect-timeout 2 http://%PC1_IP%:%BACKEND_PORT%/api/employees >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Servidor encontrado! Abriendo aplicacion...
    goto ABRIR
)

echo Intento %INTENTOS%/10 - Esperando servidor en %PC1_IP%...
timeout /t 2 /nobreak >nul
goto VERIFICAR

:ABRIR
echo.
echo Abriendo navegador en: %URL%
echo.
start "" "%URL%"

echo ========================================
echo   Listo! La app deberia abrirse ahora.
echo ========================================
echo.
echo Si no se abrio, abre tu navegador y ve a:
echo   %URL%
echo.
echo Para cambiar la IP del servidor, edita este
echo archivo y modifica la linea: set PC1_IP=...
echo.
timeout /t 5 /nobreak >nul
