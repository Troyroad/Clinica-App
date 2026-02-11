-- ============================================
-- MIGRACIÓN COMPLETA PARA SISTEMA DE CLÍNICA
-- ============================================
USE clinica_db;

-- 1. CREAR TABLA DE CARGOS POR HONORARIO
CREATE TABLE IF NOT EXISTS honorarium_positions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  description VARCHAR(255),
  late_deduction_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. ACTUALIZAR TABLA DE CARGOS QUINCENALES
-- Agregar tipo de pago y porcentaje de descuento por tardanza
ALTER TABLE positions 
  ADD COLUMN IF NOT EXISTS payment_type ENUM('quincenal', 'honorario') DEFAULT 'quincenal',
  ADD COLUMN IF NOT EXISTS late_deduction_percentage DECIMAL(5,2) DEFAULT 0;

-- 3. CREAR TABLA DE SESIONES POR HONORARIO
CREATE TABLE IF NOT EXISTS honorarium_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  start DATETIME NOT NULL,
  end DATETIME NULL,
  notes VARCHAR(255),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_employee_date (employee_id, start)
);

-- 4. ACTUALIZAR TABLA DE SESIONES REGULARES
-- Agregar turno y minutos de tardanza
ALTER TABLE sessions 
  ADD COLUMN IF NOT EXISTS shift ENUM('morning', 'afternoon', 'night') DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS late_minutes INT DEFAULT 0;

-- Agregar índices para mejorar rendimiento
ALTER TABLE sessions 
  ADD INDEX IF NOT EXISTS idx_employee_date (employee_id, start);

-- 5. ACTUALIZAR TABLA DE EMPLEADOS
-- Agregar referencia a cargo por honorario
ALTER TABLE employees 
  ADD COLUMN IF NOT EXISTS honorarium_position_id INT NULL;

-- Agregar foreign key si no existe
SET @fk_exists = (SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'employees' 
  AND CONSTRAINT_NAME = 'fk_employee_honorarium_position'
);

SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE employees ADD CONSTRAINT fk_employee_honorarium_position FOREIGN KEY (honorarium_position_id) REFERENCES honorarium_positions(id) ON DELETE SET NULL',
  'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. ASEGURAR QUE EXISTE TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'secretaria') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 7. INSERTAR CARGOS POR HONORARIO PREDETERMINADOS
INSERT INTO honorarium_positions (name, hourly_rate, description, late_deduction_percentage) VALUES
('Anestesiólogo', 50.00, 'Especialista en anestesia', 10.00),
('Instrumentista', 30.00, 'Asistente quirúrgico instrumentista', 10.00),
('Circulante', 25.00, 'Enfermero circulante de quirófano', 10.00)
ON DUPLICATE KEY UPDATE name=name;

-- 8. ACTUALIZAR CARGOS QUINCENALES EXISTENTES
UPDATE positions 
SET payment_type = 'quincenal', 
    late_deduction_percentage = 5.00
WHERE payment_type IS NULL OR payment_type = 'quincenal';

-- 9. INSERTAR CARGOS QUINCENALES ADICIONALES SI NO EXISTEN
INSERT INTO positions (name, monthly_salary, description, payment_type, late_deduction_percentage) VALUES
('Enfermera de Piso', 1800.00, 'Enfermera de atención en piso - Turnos rotativos', 'quincenal', 5.00),
('Recepcionista', 1200.00, 'Atención en recepción - 8am a 6pm', 'quincenal', 5.00),
('Camarera', 1000.00, 'Limpieza y mantenimiento - Turnos rotativos', 'quincenal', 5.00)
ON DUPLICATE KEY UPDATE 
  payment_type = VALUES(payment_type),
  late_deduction_percentage = VALUES(late_deduction_percentage);

-- 10. INSERTAR USUARIOS PREDETERMINADOS SI NO EXISTEN
INSERT INTO users (username, password, role) VALUES
('admin', 'admin123', 'admin'),
('secretaria', 'secretaria123', 'secretaria')
ON DUPLICATE KEY UPDATE username=username;

-- Mostrar resultado
SELECT '✅ Migración completada exitosamente' AS Status;

SELECT 'Cargos Quincenales:' AS Info;
SELECT id, name, monthly_salary, late_deduction_percentage FROM positions;

SELECT 'Cargos por Honorario:' AS Info;
SELECT id, name, hourly_rate, late_deduction_percentage FROM honorarium_positions;

SELECT 'Usuarios del Sistema:' AS Info;
SELECT id, username, role FROM users;
