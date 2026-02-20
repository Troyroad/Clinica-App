-- ============================================
-- SCRIPT DE INSTALACION COMPLETA DE BASE DE DATOS
-- ============================================
-- Este script crea todas las tablas necesarias desde cero.
-- Ejecutar en MySQL Workbench o vía PowerShell.

CREATE DATABASE IF NOT EXISTS clinica_db;
USE clinica_db;

-- Desactivar chequeo de llaves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------
-- 1. TABLA CARGOS (POSITIONS)
-- --------------------------------------------
DROP TABLE IF EXISTS positions;
CREATE TABLE positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    monthly_salary DECIMAL(10, 2) DEFAULT 0,
    description VARCHAR(255),
    payment_type ENUM('quincenal', 'honorario') DEFAULT 'quincenal',
    late_deduction_percentage DECIMAL(5, 2) DEFAULT 5.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Datos iniciales de cargos
INSERT INTO positions (name, monthly_salary, description, payment_type, late_deduction_percentage) VALUES
('Enfermera de Piso', 1800.00, 'Enfermera de atención en piso', 'quincenal', 5.00),
('Recepcionista', 1200.00, 'Atención al cliente', 'quincenal', 5.00),
('Camarera', 1000.00, 'Limpieza y mantenimiento', 'quincenal', 5.00);

-- --------------------------------------------
-- 2. TABLA CARGOS POR HONORARIO (HONORARIUM_POSITIONS)
-- --------------------------------------------
DROP TABLE IF EXISTS honorarium_positions;
CREATE TABLE honorarium_positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    hourly_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
    description VARCHAR(255),
    late_deduction_percentage DECIMAL(5, 2) DEFAULT 10.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Datos iniciales de cargos por honorario
INSERT INTO honorarium_positions (name, hourly_rate, description, late_deduction_percentage) VALUES
('Anestesiólogo', 50.00, 'Especialista en anestesia', 10.00),
('Instrumentista', 30.00, 'Asistente quirúrgico', 10.00),
('Circulante', 25.00, 'Enfermero circulante', 10.00);

-- --------------------------------------------
-- 3. TABLA EMPLEADOS (EMPLOYEES)
-- --------------------------------------------
DROP TABLE IF EXISTS employees;
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'Empleado',
    position_id INT,
    honorarium_position_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL,
    FOREIGN KEY (honorarium_position_id) REFERENCES honorarium_positions(id) ON DELETE SET NULL
);

-- --------------------------------------------
-- 4. TABLA SESIONES (SESSIONS) - ASISTENCIA REGULAR
-- --------------------------------------------
DROP TABLE IF EXISTS sessions;
CREATE TABLE sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    start DATETIME NOT NULL,
    end DATETIME,
    shift ENUM('morning', 'afternoon', 'night') DEFAULT NULL,
    late_minutes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee_date (employee_id, start)
);

-- --------------------------------------------
-- 5. TABLA SESIONES POR HONORARIO (HONORARIUM_SESSIONS)
-- --------------------------------------------
DROP TABLE IF EXISTS honorarium_sessions;
CREATE TABLE honorarium_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    start DATETIME NOT NULL,
    end DATETIME,
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee_date_h (employee_id, start)
);

-- --------------------------------------------
-- 6. TABLA USUARIOS (USERS)
-- --------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'secretaria', 'secretary') NOT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Usuarios por defecto
INSERT INTO users (username, password, role) VALUES 
('admin', 'admin123', 'admin'),
('secretaria', 'sec123', 'secretary');

-- Reactivar chequeo de llaves foráneas
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'INSTALACION COMPLETA EXITOSA!' AS Resultado;
