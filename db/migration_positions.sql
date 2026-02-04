-- Migración simplificada para sistema de cargos
USE clinica_db;

-- 1. Crear tabla de cargos (positions)
CREATE TABLE IF NOT EXISTS positions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  monthly_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Agregar columna position_id a employees (solo si no existe)
SET @dbname = DATABASE();
SET @tablename = 'employees';
SET @columnname = 'position_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT NULL')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 3. Agregar la foreign key si no existe
SET @fk_exists = (SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
  WHERE CONSTRAINT_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'employees' 
  AND CONSTRAINT_NAME = 'fk_employee_position'
);

SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE employees ADD CONSTRAINT fk_employee_position FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE SET NULL',
  'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. Insertar cargos por defecto
INSERT INTO positions (name, monthly_salary, description) VALUES
('Médico General', 3000.00, 'Médico de consulta general'),
('Enfermero/a', 1500.00, 'Personal de enfermería'),
('Recepcionista', 1000.00, 'Atención al público'),
('Administrador', 2000.00, 'Gestión administrativa')
ON DUPLICATE KEY UPDATE name=name;

-- Mostrar resultado
SELECT '✅ Migración completada exitosamente' AS Status;
SELECT 'Cargos creados:' AS Info;
SELECT id, name, monthly_salary FROM positions;
