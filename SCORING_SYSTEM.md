# 🏆 Sistema de Puntuación - EcoTracker

## Descripción General

El Sistema de Puntuación de EcoTracker recompensa a los usuarios por completar exitosamente sus metas ambientales, incentivando el compromiso con hábitos más sostenibles.

## 📋 Funcionalidades

### ⭐ Puntuación por Metas Completadas
- **+10 puntos** por cada meta completada exitosamente
- Los puntos se otorgan automáticamente cuando una meta cambia su estado a 'completada'
- No se otorgan puntos duplicados (solo la primera vez que se completa una meta)

### 🎯 Visualización de Puntuación
- Puntuación visible en la barra de navegación
- Actualización en tiempo real cuando se completan metas
- Sincronización automática cada 30 segundos

## 🔧 Implementación Técnica

### Backend (Spring Boot)

#### Modelo User
```java
@Column(nullable = false)
private Integer puntuacion = 0;
```

#### UserService
- `getCurrentUserScore()`: Obtiene puntuación actual
- `addPointsToCurrentUser(int puntos)`: Agrega puntos al usuario
- `awardPointsForCompletedGoal()`: Otorga +10 puntos por meta completada

#### MetaServiceImp
- Detección automática cuando una meta se completa
- Lógica anti-duplicación para evitar puntos múltiples
- Logging detallado de otorgamiento de puntos

#### Endpoint API
```
GET /api/auth/user/score
```
Respuesta:
```json
{
  "puntuacion": 50,
  "message": "Puntuación obtenida exitosamente"
}
```

### Frontend (Angular)

#### Modelos
```typescript
interface User {
  // ... otros campos
  puntuacion: number;
}

interface UserScore {
  puntuacion: number;
  message: string;
}
```

#### AuthService
- `getUserScore()`: Obtiene puntuación del servidor
- `updateUserScore(nuevaPuntuacion)`: Actualiza estado local
- `getCurrentUserScore()`: Obtiene puntuación desde estado local

#### NavbarComponent
- Visualización de puntuación con icono ⭐
- Actualización automática cada 30 segundos
- Responsive design para móviles

#### MetaService
- Notificación automática cuando se completa una meta
- Actualización inmediata de puntuación en frontend

## 📊 Base de Datos

### Migración SQL
```sql
-- Agregar campo puntuacion
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS puntuacion INTEGER DEFAULT 0 NOT NULL;

-- Índice para consultas
CREATE INDEX IF NOT EXISTS idx_users_puntuacion ON users(puntuacion);
```

## 🚀 Características Principales

### ✅ Detección Automática
- El sistema detecta automáticamente cuando una meta alcanza su objetivo
- Funciona tanto para metas de reducción como de incremento
- Compatible con todos los tipos de metas (agua, electricidad, transporte)

### 🔄 Sincronización en Tiempo Real
- Actualización inmediata cuando se completa una meta
- Sincronización periódica para mantener consistencia
- Manejo robusto de errores

### 🎨 UX/UI Optimizada
- Visualización clara y atractiva de la puntuación
- Feedback visual inmediato al usuario
- Responsive para todos los dispositivos

### 🛡️ Robustez y Seguridad
- Validación de autorización para endpoints
- Manejo de errores comprehensivo
- Logging detallado para auditoría
- Prevención de puntos duplicados

## 📈 Flujo de Funcionamiento

1. **Usuario actualiza progreso de meta** → `MetaService.updateMetaProgress()`
2. **Sistema evalúa si meta está completada** → `MetaServiceImp.updateAutomaticProgress()`
3. **Si está completada, cambia estado** → `meta.setEstado("completada")`
4. **Se otorgan +10 puntos** → `userService.awardPointsForCompletedGoal()`
5. **Frontend se actualiza automáticamente** → `AuthService.updateUserScore()`
6. **Usuario ve nueva puntuación** → `NavbarComponent`

## 🔮 Posibles Extensiones Futuras

- **Niveles y Rangos**: Sistema de niveles basado en puntuación
- **Logros Especiales**: Puntos bonus por hitos específicos
- **Competencias**: Comparación entre usuarios
- **Recompensas**: Canje de puntos por beneficios
- **Histórico**: Registro de puntos ganados por período
- **Multiplicadores**: Puntos extra por racha de metas completadas

## 🧪 Testing

### Casos de Prueba Sugeridos
1. Completar una meta y verificar +10 puntos
2. Completar la misma meta múltiples veces (no debe duplicar puntos)
3. Actualización automática en navbar
4. Manejo de errores en endpoints
5. Sincronización entre múltiples sesiones

## 📝 Notas de Desarrollo

- Los puntos se otorgan solo cuando el estado cambia de cualquier otro estado a 'completada'
- El sistema es retrocompatible con usuarios existentes
- La migración de base de datos es segura y no destructiva
- El frontend maneja graciosamente la ausencia de puntuación

---

**Desarrollado para EcoTracker v1.1**  
*Sistema de gamificación para promover hábitos sostenibles* 🌱 