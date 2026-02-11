-- ============================================
-- SCRIPT DE MIGRACION COMPLETA
-- Ejecutar en MySQL Workbench
-- ============================================

USE clinica_db;

-- 1. Crear tabla honorarium_positions
CREATE TABLE IF NOT EXISTS honorarium_positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    hourly_rate DECIMAL(10,2) NOT NULL,
    description TEXT,
    late_deduction_percentage DECIMAL(5,2) DEFAULT 10.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Crear tabla honorarium_sessions
CREATE TABLE IF NOT EXISTS honorarium_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    start DATETIME NOT NULL,
    end DATETIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_employee (employee_id),
    INDEX idx_date (start)
);

-- 3. Agregar columna late_deduction_percentage a positions
-- Verificar primero si la columna existe
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'clinica_db' 
AND TABLE_NAME = 'positions' 
AND COLUMN_NAME = 'late_deduction_percentage';

SET @sql_stmt = IF(@col_exists = 0,
    'ALTER TABLE positions ADD COLUMN late_deduction_percentage DECIMAL(5,2) DEFAULT 5.00',
    'SELECT "Column late_deduction_percentage already exists in positions" AS Result');

PREPARE stmt FROM @sql_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Agregar columnas a sessions
-- shift
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'clinica_db' 
AND TABLE_NAME = 'sessions' 
AND COLUMN_NAME = 'shift';

SET @sql_stmt = IF(@col_exists = 0,
    'ALTER TABLE sessions ADD COLUMN shift ENUM(''morning'', ''afternoon'', ''night'') DEFAULT NULL',
    'SELECT "Column shift already exists in sessions" AS Result');

PREPARE stmt FROM @sql_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- late_minutes
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'clinica_db' 
AND TABLE_NAME = 'sessions' 
AND COLUMN_NAME = 'late_minutes';

SET @sql_stmt = IF(@col_exists = 0,
    'ALTER TABLE sessions ADD COLUMN late_minutes INT DEFAULT 0',
    'SELECT "Column late_minutes already exists in sessions" AS Result');

PREPARE stmt FROM @sql_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Agregar columna honorarium_position_id a employees
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'clinica_db' 
AND TABLE_NAME = 'employees' 
AND COLUMN_NAME = 'honorarium_position_id';

SET @sql_stmt = IF(@col_exists = 0,
    'ALTER TABLE employees ADD COLUMN honorarium_position_id INT DEFAULT NULL',
    'SELECT "Column honorarium_position_id already exists in employees" AS Result');

PREPARE stmt FROM @sql_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. Crear tabla users si no existe
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'secretary') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. Insertar usuarios por defecto
INSERT IGNORE INTO users (username, password, role) VALUES 
('admin', 'admin123', 'admin'),
('secretaria', 'sec123', 'secretary');

-- 8. Agregar foreign keys si no existen
SET @fk_exists = 0;
SELECT COUNT(*) INTO @fk_exists 
FROM information_schema.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_SCHEMA = 'clinica_db' 
AND TABLE_NAME = 'honorarium_sessions' 
AND CONSTRAINT_NAME = 'honorarium_sessions_ibfk_1';

SET @sql_stmt = IF(@fk_exists = 0,
    'ALTER TABLE honorarium_sessions ADD FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE',
    'SELECT "Foreign key already exists on honorarium_sessions" AS Result');

PREPARE stmt FROM @sql_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificacion final
SELECT 'MIGRACION COMPLETADA EXITOSAMENTE!' as Mensaje;
SELECT 'Tablas creadas/actualizadas:' as Info;
SHOW TABLES;
