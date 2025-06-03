# Arquitectura del Sistema de Metas - EcoTracker

## 📋 Tabla de Contenidos
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura General](#arquitectura-general)
3. [Componentes Principales](#componentes-principales)
4. [Flujos de Datos](#flujos-de-datos)
5. [Patrones de Diseño](#patrones-de-diseño)
6. [Guía para Desarrolladores](#guía-para-desarrolladores)
7. [Métricas de Refactorización](#métricas-de-refactorización)

## 🎯 Resumen Ejecutivo

El sistema de metas de EcoTracker ha sido completamente refactorizado para mejorar la mantenibilidad, extensibilidad y separación de responsabilidades. La refactorización redujo el código de **1700 líneas a 207 líneas** (88% de reducción) mediante la implementación de patrones de diseño y arquitectura limpia.

### Objetivos Cumplidos
- ✅ **Separación de Responsabilidades**: Cada componente tiene una responsabilidad específica
- ✅ **Principio Abierto/Cerrado**: Fácil extensión sin modificar código existente
- ✅ **Inversión de Dependencias**: Uso de interfaces para desacoplar componentes
- ✅ **Responsabilidad Única**: Cada clase tiene una sola razón para cambiar

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                        MetaServiceImp                          │
│                   (Orquestador Principal)                      │
│                        207 líneas                              │
└─────────────────┬───────────────┬───────────────┬──────────────┘
                  │               │               │
         ┌────────▼────────┐ ┌────▼─────┐ ┌──────▼──────┐
         │   MetaMapper    │ │Calculation│ │Recommendation│
         │   (DTO/Entity   │ │Coordinator│ │ Coordinator  │
         │   Conversion)   │ │           │ │              │
         └─────────────────┘ └────┬─────┘ └──────┬──────┘
                                  │               │
                         ┌────────▼────────┐ ┌───▼────┐
                         │   Automation    │ │Services│
                         │   Coordinator   │ │ Layer  │
                         └─────────────────┘ └────────┘
```

### Capas de la Arquitectura

1. **Capa de Orquestación** (`MetaServiceImp`)
   - Punto de entrada único para operaciones de metas
   - Delegación a coordinadores especializados
   - Validaciones de seguridad y acceso

2. **Capa de Coordinación** (Coordinators)
   - `MetaCalculationCoordinator`: Cálculos de progreso
   - `MetaRecommendationCoordinator`: Generación de recomendaciones
   - `MetaAutomationCoordinator`: Automatización y evaluación

3. **Capa de Servicios Especializados**
   - Servicios por tipo de consumo (Agua, Electricidad, Transporte)
   - Lógica de negocio específica
   - Implementaciones intercambiables

4. **Capa de Mapeo** (`MetaMapper`)
   - Conversión entre DTOs y entidades
   - Cálculo de progreso para visualización
   - Formateo de datos

## 🧩 Componentes Principales

### 1. MetaServiceImp (Orquestador Principal)
```java
@Service
public class MetaServiceImp implements MetaService
```

**Responsabilidades:**
- Operaciones CRUD básicas
- Validaciones de seguridad (usuario autorizado)
- Orquestación entre coordinadores
- Transacciones de base de datos

**Métodos principales:**
- `createMeta()`: Creación de nuevas metas
- `updateMeta()`: Actualización de metas existentes
- `getAllMetas()`: Recuperación de metas del usuario
- `deleteMeta()`: Eliminación segura de metas

### 2. MetaCalculationCoordinator
```java
@Service
public class MetaCalculationCoordinator
```

**Responsabilidades:**
- Delegar cálculos a servicios especializados
- Coordinar actualizaciones de progreso
- Determinar métricas de reducción vs incremento

**Servicios especializados:**
- `WaterMetaCalculationService`: Cálculos específicos de agua
- `ElectricityMetaCalculationService`: Cálculos de electricidad
- `TransportMetaCalculationService`: Cálculos de transporte

### 3. MetaRecommendationCoordinator
```java
@Service
public class MetaRecommendationCoordinator
```

**Responsabilidades:**
- Generar recomendaciones personalizadas
- Calcular ahorros potenciales
- Coordinar múltiples tipos de recomendaciones

**Servicios especializados:**
- `WaterRecommendationService`: Recomendaciones de agua
- `ElectricityRecommendationService`: Recomendaciones de electricidad
- `TransportRecommendationService`: Recomendaciones de transporte
- `CombinedRecommendationService`: Recomendaciones combinadas

### 4. MetaAutomationCoordinator
```java
@Service
public class MetaAutomationCoordinator
```

**Responsabilidades:**
- Automatizar actualizaciones de progreso
- Evaluar estados de metas
- Coordinar actualizaciones masivas

**Servicios especializados:**
- `StandardMetaAutomationService`: Metas estándar (agua, electricidad, transporte)
- `CombinedMetaAutomationService`: Metas combinadas

### 5. MetaMapper
```java
@Component
public class MetaMapper
```

**Responsabilidades:**
- Conversión Meta ↔ MetaDTO
- Cálculo de progreso para UI
- Formateo de valores y porcentajes

## 🔄 Flujos de Datos

### Flujo de Creación de Meta

```
┌─────────────┐    ┌──────────────┐    ┌───────────────────┐
│   Cliente   │───▶│MetaServiceImp│───▶│MetaCalculation    │
│  (Frontend) │    │              │    │Coordinator        │
└─────────────┘    └──────┬───────┘    └───────────────────┘
                          │                        │
                          ▼                        ▼
                   ┌─────────────┐       ┌─────────────────┐
                   │MetaMapper   │       │Specialized      │
                   │(DTO→Entity) │       │Calculation      │
                   └─────────────┘       │Service          │
                          │              └─────────────────┘
                          ▼                        │
                   ┌─────────────┐                 │
                   │Repository   │◀────────────────┘
                   │(Save)       │
                   └─────────────┘
```

### Flujo de Actualización Automática

```
┌──────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Scheduler  │───▶│MetaAutomation    │───▶│MetaCalculation  │
│  (Cron Job)  │    │Coordinator       │    │Coordinator      │
└──────────────┘    └────────┬─────────┘    └─────────────────┘
                             │                        │
                             ▼                        ▼
                   ┌─────────────────┐      ┌─────────────────┐
                   │Standard/Combined│      │Type-specific    │
                   │AutomationService│      │CalculationSvc  │
                   └─────────────────┘      └─────────────────┘
                             │                        │
                             ▼                        ▼
                   ┌─────────────────┐      ┌─────────────────┐
                   │Repository       │      │External Data    │
                   │(Update Status)  │      │Sources          │
                   └─────────────────┘      └─────────────────┘
```

### Flujo de Generación de Recomendaciones

```
┌─────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Cliente   │───▶│MetaServiceImp    │───▶│MetaRecommendation   │
│(Solicita    │    │                  │    │Coordinator          │
│ recomend.)  │    └──────────────────┘    └───────────┬─────────┘
└─────────────┘                                        │
                                                       ▼
                                            ┌─────────────────────┐
                                            │Type-specific        │
                                            │RecommendationService│
                                            └───────────┬─────────┘
                                                       │
                                                       ▼
                                            ┌─────────────────────┐
                                            │Analytics & Historical│
                                            │Data Analysis        │
                                            └─────────────────────┘
```

## 🎨 Patrones de Diseño

### 1. Coordinator Pattern
**Problema**: El `MetaServiceImp` original tenía demasiadas responsabilidades.

**Solución**: Coordinadores especializados que orquestan operaciones específicas.

```java
// Antes: Todo en MetaServiceImp
public class MetaServiceImp {
    // 1700+ líneas con toda la lógica mezclada
}

// Después: Coordinadores especializados
public class MetaCalculationCoordinator {
    // Solo lógica de cálculos
}
public class MetaRecommendationCoordinator {
    // Solo lógica de recomendaciones  
}
public class MetaAutomationCoordinator {
    // Solo lógica de automatización
}
```

### 2. Strategy Pattern
**Implementación**: Servicios especializados por tipo de consumo.

```java
public interface MetaProgressCalculationService {
    void updateProgress(Meta meta);
    boolean canHandle(String tipo);
}

// Implementaciones específicas
@Service
public class WaterMetaCalculationService implements MetaProgressCalculationService {
    @Override
    public boolean canHandle(String tipo) {
        return "agua".equals(tipo);
    }
}
```

### 3. Delegation Pattern
**Implementación**: MetaServiceImp delega responsabilidades específicas.

```java
@Override
public MetaDTO createMeta(MetaDTO metaDTO) {
    // Orquestación simple
    Meta meta = new Meta();
    configureBasicProperties(meta, metaDTO);
    initializeMetaValues(meta, metaDTO, currentUser); // Delega a coordinator
    
    return metaMapper.convertToDTO(savedMeta); // Delega a mapper
}
```

### 4. Factory Method Pattern
**Implementación**: Coordinadores encuentran el servicio apropiado.

```java
private MetaProgressCalculationService findServiceForType(String tipo) {
    return calculationServices.stream()
            .filter(service -> service.canHandle(tipo))
            .findFirst()
            .orElse(null);
}
```

## 👨‍💻 Guía para Desarrolladores

### Agregar un Nuevo Tipo de Consumo

**Ejemplo**: Agregar soporte para "gas"

1. **Crear el servicio de cálculo**:
```java
@Service
public class GasMetaCalculationService implements MetaProgressCalculationService {
    @Override
    public boolean canHandle(String tipo) {
        return "gas".equals(tipo);
    }
    
    @Override
    public void updateProgress(Meta meta) {
        // Lógica específica para gas
    }
}
```

2. **Crear el servicio de recomendaciones**:
```java
@Service
public class GasRecommendationService implements MetaRecommendationService {
    @Override
    public boolean canHandle(String tipo) {
        return "gas".equals(tipo);
    }
    
    @Override
    public List<MetaRecommendationDTO> generatePersonalizedRecommendations(User user) {
        // Lógica de recomendaciones para gas
    }
}
```

3. **Actualizar el servicio de automatización** (si es necesario):
```java
@Override
public boolean canHandle(String tipo) {
    return "agua".equals(tipo) || "electricidad".equals(tipo) || 
           "transporte".equals(tipo) || "gas".equals(tipo); // Agregar gas
}
```

### Agregar una Nueva Métrica

**Ejemplo**: Agregar métrica "eficiencia_energetica"

1. **Actualizar el servicio de cálculo correspondiente**:
```java
@Override
public void updateProgress(Meta meta) {
    String metrica = meta.getMetrica();
    if ("eficiencia_energetica".equals(metrica)) {
        updateEficienciaEnergetica(meta, user);
    }
    // ... otras métricas
}
```

2. **Implementar la lógica específica**:
```java
private void updateEficienciaEnergetica(Meta meta, User user) {
    // Cálculo específico de eficiencia energética
    double eficiencia = calcularEficiencia(user);
    meta.setValorActual(eficiencia);
}
```

### Modificar Lógica de Automatización

**Para cambiar cuándo se actualiza una meta automáticamente**:

1. **Modificar el método `requiresAutomaticUpdate`**:
```java
@Override
public boolean requiresAutomaticUpdate(Meta meta) {
    return meta != null && 
           "automatica".equals(meta.getTipoEvaluacion()) &&
           "en_progreso".equals(meta.getEstado()) &&
           // Agregar condiciones adicionales aquí
           LocalDateTime.now().isAfter(meta.getUltimaActualizacion().plusHours(24));
}
```

### Pruebas Unitarias

**Estructura recomendada para tests**:

```java
@ExtendWith(MockitoExtension.class)
class MetaCalculationCoordinatorTest {
    
    @Mock
    private List<MetaProgressCalculationService> calculationServices;
    
    @InjectMocks
    private MetaCalculationCoordinator coordinator;
    
    @Test
    void shouldDelegateToCorrectService() {
        // Arrange
        Meta meta = createTestMeta("agua");
        WaterMetaCalculationService waterService = mock(WaterMetaCalculationService.class);
        when(waterService.canHandle("agua")).thenReturn(true);
        
        // Act
        coordinator.updateMetaProgress(meta);
        
        // Assert
        verify(waterService).updateProgress(meta);
    }
}
```

## 📊 Métricas de Refactorización

### Antes de la Refactorización
```
MetaServiceImp.java
├── Líneas de código: ~1700
├── Responsabilidades: 8+
│   ├── CRUD operations
│   ├── Progress calculations (water, electricity, transport)
│   ├── Automatic updates
│   ├── Recommendation generation
│   ├── State evaluation
│   ├── DTO conversion
│   ├── Savings calculations
│   └── Type-specific business logic
├── Dependencias: 6+ repositories/services
├── Complejidad ciclomática: Alta
└── Mantenibilidad: Baja
```

### Después de la Refactorización
```
Sistema Refactorizado
├── MetaServiceImp.java: 207 líneas
│   └── Responsabilidades: 2 (CRUD + Orquestación)
├── Coordinadores: 3
│   ├── MetaCalculationCoordinator: ~150 líneas
│   ├── MetaRecommendationCoordinator: ~160 líneas
│   └── MetaAutomationCoordinator: ~270 líneas
├── Servicios especializados: 9
│   ├── Calculation services: 3 (Agua, Electricidad, Transporte)
│   ├── Recommendation services: 4 (Agua, Electricidad, Transporte, Combinado)
│   └── Automation services: 2 (Estándar, Combinado)
├── MetaMapper: ~180 líneas
└── Total: ~1200 líneas distribuidas en 14 clases especializadas
```

### Beneficios Cuantificables
- ✅ **88% reducción** en la clase principal
- ✅ **14 clases especializadas** vs 1 monolítica
- ✅ **2 responsabilidades** vs 8+ en clase principal
- ✅ **100% cobertura** de tipos de consumo
- ✅ **Extensibilidad** para nuevos tipos sin modificar código existente

## 🔮 Roadmap Futuro

### Mejoras Planificadas
1. **Cache Layer**: Implementar caché para cálculos costosos
2. **Event Sourcing**: Historial de cambios en metas
3. **Metrics & Monitoring**: Instrumentación con Micrometer
4. **Async Processing**: Procesamiento asíncrono de actualizaciones masivas

### Consideraciones de Performance
- **Lazy Loading**: Cargar datos solo cuando se necesiten
- **Batch Processing**: Agrupar actualizaciones múltiples
- **Database Optimization**: Índices y consultas optimizadas

---

**Documento actualizado**: Diciembre 2024  
**Versión de la arquitectura**: 2.0  
**Equipo**: EcoTracker Development Team 