-- Script simplificado para crear solo las tablas que faltan
-- Ejecutar si run_migration.bat no funciona

USE clinica_db;

-- Crear tabla honorarium_positions si no existe
CREATE TABLE IF NOT EXISTS honorarium_positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    hourly_rate DECIMAL(10,2) NOT NULL,
    description TEXT,
    late_deduction_percentage DECIMAL(5,2) DEFAULT 10.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear tabla honorarium_sessions si no existe
CREATE TABLE IF NOT EXISTS honorarium_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    start DATETIME NOT NULL,
    end DATETIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee (employee_id),
    INDEX idx_date (start)
);

-- Agregar columnas a positions si no existen
ALTER TABLE positions 
ADD COLUMN IF NOT EXISTS late_deduction_percentage DECIMAL(5,2) DEFAULT 5.00;

-- Agregar columnas a sessions si no existen
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS shift ENUM('morning', 'afternoon', 'night') DEFAULT NULL,
ADD COLUMN IF NOT EXISTS late_minutes INT DEFAULT 0;

-- Agregar columna a employees si no existe
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS honorarium_position_id INT DEFAULT NULL,
ADD CONSTRAINT fk_honorarium_position FOREIGN KEY (honorarium_position_id) 
    REFERENCES honorarium_positions(id) ON DELETE SET NULL;

-- Crear tabla users si no existe
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'secretary') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar usuarios por defecto si no existen
INSERT IGNORE INTO users (username, password, role) VALUES 
('admin', 'admin123', 'admin'),
('secretaria', 'sec123', 'secretary');

-- Mensaje de confirmación
SELECT 'Tablas creadas/actualizadas correctamente!' as Resultado;
