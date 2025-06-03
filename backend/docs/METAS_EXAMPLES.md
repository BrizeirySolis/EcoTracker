# 🛠️ Ejemplos Prácticos - Sistema de Metas

## 📚 Tabla de Contenidos
1. [Casos de Uso Comunes](#casos-de-uso-comunes)
2. [Ejemplos de Extensión](#ejemplos-de-extensión)
3. [Ejemplos de Testing](#ejemplos-de-testing)
4. [Resolución de Problemas](#resolución-de-problemas)
5. [Mejores Prácticas](#mejores-prácticas)

## 🎯 Casos de Uso Comunes

### 1. Crear una Meta de Agua

```java
// En el frontend
const waterMeta = {
    titulo: "Reducir consumo de agua en cocina",
    descripcion: "Meta para reducir el consumo mensual en 20%",
    tipo: "agua",
    metrica: "consumo_total", 
    unidad: "litros",
    valorObjetivo: 800.0, // 20% menos del consumo actual (1000L)
    fechaInicio: new Date(),
    fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
    tipoEvaluacion: "automatica"
};

// El sistema automáticamente:
// 1. MetaServiceImp.createMeta() orquesta el proceso
// 2. MetaCalculationCoordinator obtiene el valor inicial (1000L)
// 3. WaterMetaCalculationService calcula valores específicos
// 4. MetaMapper convierte a DTO para respuesta
```

### 2. Actualización Automática Programada

```java
@Component
public class MetaScheduler {
    
    private final MetaAutomationCoordinator automationCoordinator;
    
    @Scheduled(cron = "0 0 2 * * *") // Cada día a las 2 AM
    public void updateAllAutomaticMetas() {
        logger.info("Iniciando actualización automática programada");
        
        // El coordinador se encarga de todo el proceso
        int updated = automationCoordinator.updateAllAutomaticMetas();
        
        logger.info("Actualización completada: {} metas procesadas", updated);
    }
}
```

### 3. Obtener Recomendaciones Personalizadas

```java
@RestController
public class MetaController {
    
    private final MetaService metaService;
    
    @GetMapping("/recommendations/{tipo}")
    public ResponseEntity<Map<String, List<MetaRecommendationDTO>>> 
            getRecommendations(@PathVariable String tipo) {
        
        // El servicio delega al coordinador de recomendaciones
        Map<String, List<MetaRecommendationDTO>> recommendations = 
            metaService.getRecommendationsForTipo(tipo);
            
        return ResponseEntity.ok(recommendations);
    }
}

// Flujo interno:
// 1. MetaServiceImp → MetaRecommendationCoordinator
// 2. Coordinator encuentra WaterRecommendationService (si tipo = "agua")
// 3. Service analiza datos históricos del usuario
// 4. Genera recomendaciones personalizadas
```

## 🔧 Ejemplos de Extensión

### 1. Agregar Soporte para "Gas Natural"

#### Paso 1: Crear el Servicio de Cálculo

```java
@Service
public class GasMetaCalculationService implements MetaProgressCalculationService {
    
    private final GasRepository gasRepository;
    private final ConsumptionAnalyticsService analyticsService;
    
    @Override
    public boolean canHandle(String tipo) {
        return "gas".equals(tipo);
    }
    
    @Override
    public void updateProgress(Meta meta) {
        User user = meta.getUser();
        String metrica = meta.getMetrica();
        
        switch (metrica) {
            case "consumo_total":
                updateConsumoTotalGas(meta, user);
                break;
            case "eficiencia":
                updateEficienciaGas(meta, user);
                break;
            case "costo":
                updateCostoGas(meta, user);
                break;
            default:
                logger.warn("Métrica '{}' no reconocida para gas", metrica);
        }
    }
    
    @Override
    public Double obtenerValorInicial(User user, String metrica) {
        if ("consumo_total".equals(metrica)) {
            return gasRepository.findAverageMonthlyConsumption(user.getId())
                    .orElse(50.0); // m³ promedio mensual
        }
        return 0.0;
    }
    
    @Override
    public boolean isReductionMetric(String metrica) {
        return "consumo_total".equals(metrica) || "costo".equals(metrica);
    }
    
    private void updateConsumoTotalGas(Meta meta, User user) {
        LocalDateTime inicio = meta.getFechaInicio();
        LocalDateTime ahora = LocalDateTime.now();
        
        Double consumoActual = gasRepository
            .findTotalConsumptionBetween(user.getId(), inicio, ahora);
            
        meta.setValorActual(consumoActual != null ? consumoActual : 0.0);
        
        logger.info("Gas meta ID {}: consumo actualizado a {} m³", 
                meta.getId(), meta.getValorActual());
    }
}
```

#### Paso 2: Crear el Servicio de Recomendaciones

```java
@Service
public class GasRecommendationService implements MetaRecommendationService {
    
    private final GasRepository gasRepository;
    private final ConsumptionAnalyticsService analyticsService;
    
    @Override
    public boolean canHandle(String tipo) {
        return "gas".equals(tipo);
    }
    
    @Override
    public List<MetaRecommendationDTO> generatePersonalizedRecommendations(User user) {
        List<MetaRecommendationDTO> recommendations = new ArrayList<>();
        
        // Analizar patrones de consumo de gas
        Double promedioMensual = gasRepository.findAverageMonthlyConsumption(user.getId())
                .orElse(50.0);
        
        // Recomendación de reducción conservadora (10%)
        recommendations.add(MetaRecommendationDTO.builder()
                .descripcion("Reducir consumo de gas natural un 10%")
                .valor(promedioMensual * 0.9)
                .unidad("m³")
                .metrica("consumo_total")
                .tipoMeta("reduccion")
                .dificultad("facil")
                .ahorroEstimado(calculateSavings(promedioMensual, 0.1))
                .build());
        
        // Recomendación de reducción moderada (20%)
        if (promedioMensual > 60.0) { // Solo si consume más del promedio
            recommendations.add(MetaRecommendationDTO.builder()
                    .descripcion("Optimizar calefacción y reducir consumo 20%")
                    .valor(promedioMensual * 0.8)
                    .unidad("m³")
                    .metrica("consumo_total")
                    .tipoMeta("reduccion")
                    .dificultad("moderada")
                    .ahorroEstimado(calculateSavings(promedioMensual, 0.2))
                    .build());
        }
        
        return recommendations;
    }
    
    @Override
    public double calculatePotentialSavings(User user) {
        Double consumoActual = gasRepository.findAverageMonthlyConsumption(user.getId())
                .orElse(50.0);
        
        // Estimar ahorro del 15% en promedio
        return calculateSavings(consumoActual, 0.15);
    }
    
    private double calculateSavings(double consumo, double porcentajeReduccion) {
        double precioM3 = 12.50; // Precio promedio por m³
        return consumo * porcentajeReduccion * precioM3;
    }
}
```

#### Paso 3: Actualizar el Frontend

```typescript
// En el componente de creación de metas
export class MetaFormComponent {
    tiposDisponibles = {
        'agua': 'Consumo de Agua',
        'electricidad': 'Consumo Eléctrico', 
        'transporte': 'Transporte',
        'gas': 'Gas Natural', // ¡Nuevo tipo!
        'combinada': 'Meta Combinada'
    };
    
    metricasDisponibles = {
        'agua': ['consumo_total', 'benchmark', 'emisiones'],
        'electricidad': ['consumo_total', 'benchmark', 'emisiones'],
        'transporte': ['eficiencia_combustible', 'reduccion_combustion', 'transporte_publico'],
        'gas': ['consumo_total', 'eficiencia', 'costo'], // ¡Nuevas métricas!
        'combinada': ['huella_carbono', 'ahorro_total', 'sostenibilidad']
    };
}
```

### 2. Agregar Nueva Métrica "Huella de Carbono"

```java
@Service
public class CarbonFootprintCalculationService {
    
    // Factores de emisión por tipo de consumo
    private static final Map<String, Double> EMISSION_FACTORS = Map.of(
        "agua", 0.001,      // kg CO2 por litro
        "electricidad", 0.5, // kg CO2 por kWh
        "gas", 2.0          // kg CO2 por m³
    );
    
    public double calculateCarbonFootprint(User user, String tipo) {
        switch (tipo) {
            case "agua":
                return calculateWaterCarbonFootprint(user);
            case "electricidad":
                return calculateElectricityCarbonFootprint(user);
            case "gas":
                return calculateGasCarbonFootprint(user);
            default:
                return 0.0;
        }
    }
    
    private double calculateWaterCarbonFootprint(User user) {
        Double consumoMensual = waterRepository
            .findCurrentMonthConsumption(user.getId())
            .orElse(0.0);
            
        return consumoMensual * EMISSION_FACTORS.get("agua");
    }
    
    // Métodos similares para electricidad y gas...
}
```

## 🧪 Ejemplos de Testing

### 1. Test del Coordinador de Cálculos

```java
@ExtendWith(MockitoExtension.class)
class MetaCalculationCoordinatorTest {
    
    @Mock private WaterMetaCalculationService waterService;
    @Mock private ElectricityMetaCalculationService electricityService;
    @Mock private GasMetaCalculationService gasService;
    
    @InjectMocks private MetaCalculationCoordinator coordinator;
    
    @BeforeEach
    void setUp() {
        // Configurar los servicios mock
        when(waterService.canHandle("agua")).thenReturn(true);
        when(electricityService.canHandle("electricidad")).thenReturn(true);
        when(gasService.canHandle("gas")).thenReturn(true);
        
        // Inyectar lista de servicios
        coordinator = new MetaCalculationCoordinator(
            List.of(waterService, electricityService, gasService)
        );
    }
    
    @Test
    void shouldDelegateWaterMetaToWaterService() {
        // Given
        Meta waterMeta = TestDataBuilder.createMeta("agua", "consumo_total");
        
        // When
        coordinator.updateMetaProgress(waterMeta);
        
        // Then
        verify(waterService).updateProgress(waterMeta);
        verify(electricityService, never()).updateProgress(any());
        verify(gasService, never()).updateProgress(any());
    }
    
    @Test
    void shouldReturnZeroWhenNoServiceFound() {
        // Given
        User user = TestDataBuilder.createUser();
        
        // When
        Double valor = coordinator.obtenerValorInicial(user, "tipoInexistente", "metrica");
        
        // Then
        assertThat(valor).isEqualTo(0.1); // Valor por defecto
    }
    
    @Test
    void shouldCorrectlyIdentifyReductionMetrics() {
        // Given
        when(waterService.canHandle("agua")).thenReturn(true);
        when(waterService.isReductionMetric("consumo_total")).thenReturn(true);
        
        // When
        boolean isReduction = coordinator.isReductionMetric("agua", "consumo_total");
        
        // Then
        assertThat(isReduction).isTrue();
    }
}
```

### 2. Test de Integración del Servicio Principal

```java
@SpringBootTest
@Transactional
class MetaServiceIntegrationTest {
    
    @Autowired private MetaService metaService;
    @Autowired private MetaRepository metaRepository;
    @Autowired private UserService userService;
    
    @Test
    void shouldCreateAndUpdateMetaCorrectly() {
        // Given
        User testUser = createTestUser();
        MetaDTO metaDTO = createTestMetaDTO("agua");
        
        // When - Crear meta
        MetaDTO createdMeta = metaService.createMeta(metaDTO);
        
        // Then - Verificar creación
        assertThat(createdMeta.getId()).isNotNull();
        assertThat(createdMeta.getValorInicial()).isGreaterThan(0);
        assertThat(createdMeta.getEstado()).isEqualTo("en_progreso");
        
        // When - Actualizar progreso
        MetaDTO updatedMeta = metaService.updateMetaProgreso(
            createdMeta.getId(), 800.0);
        
        // Then - Verificar actualización
        assertThat(updatedMeta.getValorActual()).isEqualTo(800.0);
        assertThat(updatedMeta.getProgreso()).isGreaterThan(0);
    }
    
    @Test
    void shouldGenerateRecommendationsForAllTypes() {
        // Given
        User testUser = createTestUser();
        addSampleConsumptionData(testUser);
        
        // When & Then
        Arrays.asList("agua", "electricidad", "transporte", "gas").forEach(tipo -> {
            Map<String, List<MetaRecommendationDTO>> recommendations = 
                metaService.getRecommendationsForTipo(tipo);
                
            assertThat(recommendations).containsKey("recommendations");
            assertThat(recommendations.get("recommendations")).isNotEmpty();
        });
    }
}
```

### 3. Test de Performance

```java
@Test
@Timeout(value = 5, unit = TimeUnit.SECONDS)
void shouldUpdateLargeNumberOfMetasEfficiently() {
    // Given
    List<Meta> metas = createTestMetas(1000); // 1000 metas
    metaRepository.saveAll(metas);
    
    // When
    long startTime = System.currentTimeMillis();
    int updated = automationCoordinator.updateAllAutomaticMetas();
    long duration = System.currentTimeMillis() - startTime;
    
    // Then
    assertThat(updated).isEqualTo(1000);
    assertThat(duration).isLessThan(5000); // Menos de 5 segundos
    
    logger.info("Actualizadas {} metas en {} ms", updated, duration);
}
```

## 🔍 Resolución de Problemas

### 1. Error: "No se encontró servicio para tipo X"

**Problema**: Al crear una meta se obtiene este error.

**Causa**: No existe un servicio que maneje el tipo especificado.

**Solución**:
```java
// Verificar que existe un servicio con canHandle() que retorne true
@Service
public class CustomMetaCalculationService implements MetaProgressCalculationService {
    @Override
    public boolean canHandle(String tipo) {
        return "mi_nuevo_tipo".equals(tipo); // ¡Importante!
    }
}
```

### 2. Error: "Meta no se actualiza automáticamente"

**Problema**: Las metas automáticas no se actualizan.

**Diagnóstico**:
```java
@Test
void debugAutomaticUpdate() {
    Meta meta = metaRepository.findById(metaId).orElseThrow();
    
    // Verificar condiciones
    assertThat(meta.getTipoEvaluacion()).isEqualTo("automatica");
    assertThat(meta.getEstado()).isEqualTo("en_progreso");
    
    // Verificar que hay servicio disponible
    boolean canHandle = automationCoordinator.requiresAutomaticUpdate(meta);
    assertThat(canHandle).isTrue();
}
```

### 3. Error: "Valores de progreso incorrectos"

**Problema**: El progreso calculado no es correcto.

**Verificación**:
```java
@Test
void debugProgressCalculation() {
    Meta meta = createTestMeta();
    meta.setValorInicial(1000.0);
    meta.setValorActual(800.0);
    meta.setValorObjetivo(750.0);
    
    MetaDTO dto = metaMapper.convertToDTO(meta);
    
    // Para meta de reducción: progreso = (inicial - actual) / (inicial - objetivo)
    // (1000 - 800) / (1000 - 750) = 200 / 250 = 0.8 = 80%
    assertThat(dto.getProgreso()).isEqualTo(80.0);
}
```

## ✅ Mejores Prácticas

### 1. Implementación de Nuevos Servicios

```java
@Service
public class NewTypeCalculationService implements MetaProgressCalculationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NewTypeCalculationService.class);
    
    @Override
    public boolean canHandle(String tipo) {
        return "nuevo_tipo".equals(tipo);
    }
    
    @Override
    public void updateProgress(Meta meta) {
        // 1. Validar entrada
        if (meta == null || meta.getUser() == null) {
            logger.warn("Meta o usuario es null");
            return;
        }
        
        // 2. Obtener datos necesarios
        String metrica = meta.getMetrica();
        User user = meta.getUser();
        
        // 3. Procesar según métrica
        try {
            switch (metrica) {
                case "metrica1":
                    updateMetrica1(meta, user);
                    break;
                case "metrica2": 
                    updateMetrica2(meta, user);
                    break;
                default:
                    logger.warn("Métrica '{}' no reconocida", metrica);
            }
        } catch (Exception e) {
            logger.error("Error actualizando meta ID {}: {}", meta.getId(), e.getMessage());
        }
    }
    
    @Override
    public Double obtenerValorInicial(User user, String metrica) {
        // Siempre retornar un valor válido
        try {
            Double valor = calculateInitialValue(user, metrica);
            return valor != null ? Math.max(valor, 0.1) : 0.1;
        } catch (Exception e) {
            logger.error("Error calculando valor inicial: {}", e.getMessage());
            return 0.1; // Valor seguro por defecto
        }
    }
}
```

### 2. Manejo de Errores

```java
@Service
public class SafeMetaCalculationService {
    
    @Override
    public void updateProgress(Meta meta) {
        try {
            // Lógica principal
            doUpdateProgress(meta);
            
        } catch (DataAccessException e) {
            logger.error("Error de base de datos al actualizar meta {}: {}", 
                    meta.getId(), e.getMessage());
            // No propagar - permitir que otras metas se procesen
            
        } catch (Exception e) {
            logger.error("Error inesperado al actualizar meta {}: {}", 
                    meta.getId(), e.getMessage(), e);
            // Considerar notificación al administrador
        }
    }
    
    private void doUpdateProgress(Meta meta) {
        // Validaciones
        requireNonNull(meta, "Meta no puede ser null");
        requireNonNull(meta.getUser(), "Usuario no puede ser null");
        requireNonNull(meta.getMetrica(), "Métrica no puede ser null");
        
        // Lógica de actualización...
    }
}
```

### 3. Testing Exhaustivo

```java
class ComprehensiveMetaServiceTest {
    
    @ParameterizedTest
    @ValueSource(strings = {"agua", "electricidad", "transporte", "gas"})
    void shouldHandleAllSupportedTypes(String tipo) {
        // Test que cada tipo es manejado correctamente
        MetaDTO meta = createTestMeta(tipo);
        MetaDTO result = metaService.createMeta(meta);
        
        assertThat(result.getTipo()).isEqualTo(tipo);
        assertThat(result.getValorInicial()).isGreaterThan(0);
    }
    
    @Test
    void shouldHandleEdgeCases() {
        // Casos límite
        assertThrows(IllegalArgumentException.class, 
            () -> metaService.createMeta(null));
            
        assertThrows(IllegalArgumentException.class,
            () -> metaService.updateMeta(-1L, createTestMeta("agua")));
    }
}
```

### 4. Logging Efectivo

```java
@Service
public class WellLoggedService {
    
    private static final Logger logger = LoggerFactory.getLogger(WellLoggedService.class);
    
    @Override
    public void updateProgress(Meta meta) {
        logger.info("Iniciando actualización de meta ID: {}, tipo: {}, métrica: {}", 
                meta.getId(), meta.getTipo(), meta.getMetrica());
        
        try {
            Double valorAnterior = meta.getValorActual();
            
            // Lógica de actualización
            performUpdate(meta);
            
            logger.info("Meta ID {} actualizada: {} → {} ({})", 
                    meta.getId(), valorAnterior, meta.getValorActual(), meta.getUnidad());
                    
        } catch (Exception e) {
            logger.error("Error actualizando meta ID {}: {}", meta.getId(), e.getMessage());
            throw e;
        }
    }
}
```

---

**Documento actualizado**: Diciembre 2024  
**Versión**: 2.0  
**Autor**: EcoTracker Development Team 