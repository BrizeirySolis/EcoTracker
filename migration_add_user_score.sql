-- Migración para agregar sistema de puntuación
-- Agregar campo puntuacion a tabla users
-- EcoTracker v1.1 - Sistema de Puntuación

-- Agregar columna puntuacion a la tabla users si no existe
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS puntuacion INTEGER DEFAULT 0 NOT NULL;

-- Actualizar usuarios existentes para tener puntuación inicial de 0
UPDATE users 
SET puntuacion = 0 
WHERE puntuacion IS NULL;

-- Crear índice para mejorar consultas de puntuación
CREATE INDEX IF NOT EXISTS idx_users_puntuacion ON users(puntuacion);

-- Comentarios para documentación
COMMENT ON COLUMN users.puntuacion IS 'Puntuación acumulada del usuario por completar metas (+10 por cada meta completada)';

-- Verificar la migración
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND column_name = 'puntuacion'; 