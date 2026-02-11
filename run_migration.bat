@echo off
REM Script para ejecutar migracion de base de datos
echo ========================================
echo   Migracion de Base de Datos - Clinica
echo ========================================
echo.

REM Intentar diferentes rutas comunes de MySQL
SET MYSQL_PATHS="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe" "C:\xampp\mysql\bin\mysql.exe" "C:\wamp\bin\mysql\mysql5.7.14\bin\mysql.exe" "C:\wamp64\bin\mysql\mysql5.7.14\bin\mysql.exe"

SET MYSQL_FOUND=0

for %%p in (%MYSQL_PATHS%) do (
    if exist %%p (
        echo MySQL encontrado en: %%p
        SET MYSQL_PATH=%%p
        SET MYSQL_FOUND=1
        goto :found
    )
)

:found
if %MYSQL_FOUND%==0 (
    echo ERROR: No se encontro MySQL en las rutas comunes.
    echo Por favor, ejecuta manualmente con la ruta completa de mysql.exe
    echo.
    echo Ejemplo:
    echo "C:\ruta\a\mysql.exe" -u root -p123456 clinica_db ^< db\migration_complete.sql
    pause
    exit /b 1
)

echo.
echo Ejecutando migracion...
echo.

%MYSQL_PATH% -u root -p123456 clinica_db < db\migration_complete.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   Migracion completada exitosamente!
    echo ========================================
    echo.
) else (
    echo.
    echo ========================================
    echo   ERROR: La migracion fallo
    echo ========================================
    echo.
    echo Verifica:
    echo 1. Que MySQL este corriendo
    echo 2. Que la contrasena sea correcta (123456)
    echo 3. Que la base de datos clinica_db exista
    echo.
)

pause
