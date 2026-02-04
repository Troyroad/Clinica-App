-- Script de reparación de usuarios
-- Ejecuta este script para solucionar el error "Usuario no encontrado"

USE clinica_db;

-- 1. Eliminar tabla corrupta o incompleta si existe
DROP TABLE IF EXISTS users;

-- 2. Crear tabla correctamente (usando VARCHAR para evitar problemas de ENUM)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL, -- En producción usar hash
  role VARCHAR(50) NOT NULL DEFAULT 'secretaria',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Insertar usuarios por defecto
INSERT INTO users (username, password, role) VALUES
('admin', 'admin123', 'admin'),
('secretaria', 'secretaria123', 'secretaria');

-- 4. Verificar resultado
SELECT * FROM users;
