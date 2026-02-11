@echo off
REM Script para crear tablas manualmente
echo ========================================
echo   Creando Tablas de Base de Datos
echo ========================================
echo.

REM Buscar MySQL
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
    echo ERROR: No se encontro MySQL.
    echo.
    echo Por favor ejecuta manualmente:
    echo.
    echo Opcion 1 - Si MySQL Workbench esta instalado:
    echo   1. Abre MySQL Workbench
    echo   2. Conectate a la base de datos
    echo   3. Abre el archivo: db\create_tables.sql
    echo   4. Ejecuta el script (icono de rayo)
    echo.
    echo Opcion 2 - Desde linea de comandos:
    echo   "C:\ruta\completa\a\mysql.exe" -u root -p clinica_db ^< db\create_tables.sql
    echo   (Te pedira la contraseña)
    pause
    exit /b 1
)

echo Ejecutando script de creacion de tablas...
echo.

%MYSQL_PATH% -u root -p123456 clinica_db < db\create_tables.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   TABLAS CREADAS EXITOSAMENTE!
    echo ========================================
    echo.
    echo Ahora puedes usar la aplicacion normalmente.
    echo Si el backend ya esta corriendo, reinicialo.
    echo.
) else (
    echo.
    echo ========================================
    echo   ERROR al crear tablas
    echo ========================================
    echo.
    echo Verifica:
    echo 1. MySQL esta corriendo
    echo 2. La contraseña es: 123456
    echo 3. La base de datos clinica_db existe
    echo.
    echo Para crear la base de datos ejecuta:
    echo %MYSQL_PATH% -u root -p123456 -e "CREATE DATABASE IF NOT EXISTS clinica_db;"
    echo.
)

pause
