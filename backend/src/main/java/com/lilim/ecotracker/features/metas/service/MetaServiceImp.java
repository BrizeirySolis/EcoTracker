package com.lilim.ecotracker.features.metas.service;

import com.lilim.ecotracker.features.electricity.model.Electricity;
import com.lilim.ecotracker.features.electricity.repository.ElectricityRepository;
import com.lilim.ecotracker.features.metas.dto.MetaDTO;
import com.lilim.ecotracker.features.metas.dto.MetaRecommendationDTO;
import com.lilim.ecotracker.features.metas.model.Meta;
import com.lilim.ecotracker.features.metas.repository.MetaRepository;
import com.lilim.ecotracker.features.summary.dto.ConsumptionAnalyticsDTO;
import com.lilim.ecotracker.features.summary.service.ConsumptionAnalyticsService;
import com.lilim.ecotracker.features.transport.model.Transport;
import com.lilim.ecotracker.features.transport.repository.TransportRepository;
import com.lilim.ecotracker.features.water.model.Water;
import com.lilim.ecotracker.features.water.repository.WaterRepository;
import com.lilim.ecotracker.security.model.User;
import com.lilim.ecotracker.security.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementación del servicio de metas
 * Proporciona funcionalidad para gestionar desafíos personales de consumo responsable
 */
@Service
public class MetaServiceImp implements MetaService {

    private static final Logger logger = LoggerFactory.getLogger(MetaServiceImp.class);

    private final MetaRepository metaRepository;
    private final UserService userService;
    private final ConsumptionAnalyticsService analyticsService;
    private final WaterRepository waterRepository;
    private final ElectricityRepository electricityRepository;
    private final TransportRepository transportRepository;

    @Autowired
    public MetaServiceImp(
            MetaRepository metaRepository,
            UserService userService,
            ConsumptionAnalyticsService analyticsService,
            WaterRepository waterRepository,
            ElectricityRepository electricityRepository,
            TransportRepository transportRepository) {
        this.metaRepository = metaRepository;
        this.userService = userService;
        this.analyticsService = analyticsService;
        this.waterRepository = waterRepository;
        this.electricityRepository = electricityRepository;
        this.transportRepository = transportRepository;
    }

    @Override
    public List<MetaDTO> getAllMetas() {
        User currentUser = userService.getCurrentUser();
        List<Meta> metas = metaRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        return convertToDTOList(metas);
    }

    @Override
    public List<MetaDTO> getMetasByTipo(String tipo) {
        User currentUser = userService.getCurrentUser();
        List<Meta> metas = metaRepository.findByUserIdAndTipoOrderByCreatedAtDesc(currentUser.getId(), tipo);
        return convertToDTOList(metas);
    }

    @Override
    public Optional<MetaDTO> getMetaById(Long id) {
        User currentUser = userService.getCurrentUser();
        return metaRepository.findByIdAndUserId(id, currentUser.getId())
                .map(this::convertToDTO);
    }

    @Transactional
    public MetaDTO createMeta(MetaDTO metaDTO) {
        User currentUser = userService.getCurrentUser();

        Meta meta = new Meta();
        // Configurar propiedades básicas...
        meta.setTitulo(metaDTO.getTitulo());
        meta.setDescripcion(metaDTO.getDescripcion());
        meta.setTipo(metaDTO.getTipo());
        meta.setUnidad(metaDTO.getUnidad());
        meta.setMetrica(metaDTO.getMetrica());
        meta.setFechaInicio(metaDTO.getFechaInicio());
        meta.setFechaFin(metaDTO.getFechaFin());
        meta.setEstado("en_progreso");

        // Determinar el valor inicial basado en el último mes
        Double valorInicial = obtenerValorActualConsumo(metaDTO.getTipo(), metaDTO.getMetrica());
        meta.setValorInicial(valorInicial);

        // NUEVO: Usar siempre el valor objetivo proporcionado por el usuario
                meta.setValorObjetivo(metaDTO.getValorObjetivo());
        logger.info("Estableciendo valor objetivo de la meta: {}", metaDTO.getValorObjetivo());

        // NUEVO: El valor actual siempre empieza en 0 para metas de transporte
        // ya que queremos contar solo los registros posteriores a la creación
        if ("transporte".equals(metaDTO.getTipo())) {
            meta.setValorActual(0.0);
            logger.info("Meta de transporte: valor actual inicial = 0");
        } else if (isIncrementMetric(metaDTO.getTipo(), metaDTO.getMetrica())) {
            meta.setValorActual(0.0);
        } else {
            // Para otras metas de reducción (agua, electricidad), partimos del valor inicial
            meta.setValorActual(valorInicial);
        }

        meta.setTipoEvaluacion(metaDTO.getTipoEvaluacion() != null ?
                metaDTO.getTipoEvaluacion() : determinarTipoEvaluacion(metaDTO.getTipo()));
        meta.setUser(currentUser);

        Meta savedMeta = metaRepository.save(meta);

        // NO actualizar el progreso automático al crear para transporte
        // para mantener el valor actual en 0
        if ("automatica".equals(savedMeta.getTipoEvaluacion()) && !"transporte".equals(savedMeta.getTipo())) {
            updateAutomaticProgress(savedMeta);
            savedMeta = metaRepository.save(savedMeta);
        }

        return convertToDTO(savedMeta);
    }

    /**
     * Determina si una métrica es de incremento (donde más es mejor)
     */
    private boolean isIncrementMetric(String tipo, String metrica) {
        if ("transporte".equals(tipo)) {
            return "porcentaje_sostenible".equals(metrica) ||
                    "km_bicicleta".equals(metrica) ||
                    "uso_bicicleta".equals(metrica);
        }
        return false;
    }

    /**
     * Método para obtener el valor actual de consumo según el tipo
     */
    private Double obtenerValorActualConsumo(String tipo, String metrica) {
        User currentUser = userService.getCurrentUser();
        Double valorActual = 0.0;
        Double valorInicial = 0.1;

        try {
            LocalDateTime ahora = LocalDateTime.now();
            LocalDateTime unMesAtras = ahora.minus(1, ChronoUnit.MONTHS);

            switch (tipo) {
                case "agua":
                    // Obtener solo el último registro de agua
                    List<Water> ultimosConsumoAgua = waterRepository.findByUserIdOrderByDateDesc(currentUser.getId());
                    if (!ultimosConsumoAgua.isEmpty()) {
                        valorActual = ultimosConsumoAgua.get(0).getLiters();
                        logger.info("Valor actual para agua (último registro): {} m³", valorActual);
                    }
                    break;

                case "electricidad":
                    // Obtener solo el último registro de electricidad
                    List<Electricity> ultimosConsumoElectricidad = electricityRepository.findByUserIdOrderByDateDesc(currentUser.getId());
                    if (!ultimosConsumoElectricidad.isEmpty()) {
                        valorActual = ultimosConsumoElectricidad.get(0).getKilowatts();
                        logger.info("Valor actual para electricidad (último registro): {} kWh", valorActual);
                    }
                    break;

                case "transporte":
                    if ("reduccion_combustion".equals(metrica)) {
                        // Obtener kilómetros recorridos en vehículos de combustión en el último mes
                        Double kmCombustion = transportRepository.sumKilometersByUserIdAndTransportTypeAndDateBetween(
                                currentUser.getId(), "car", unMesAtras, ahora);

                        if (kmCombustion != null && kmCombustion > 0) {
                            valorInicial = kmCombustion;
                            logger.info("Valor inicial (último mes) para reducción combustión: {} km", valorInicial);
                        }
                    }
                    else if ("porcentaje_sostenible".equals(metrica)) {
                        // Calcular porcentaje actual de transporte sostenible
                        List<Transport> transportesUltimoMes = transportRepository.findByUserIdAndDateBetween(
                                currentUser.getId(), unMesAtras, ahora);

                        double kmTotales = transportesUltimoMes.stream()
                                .mapToDouble(Transport::getKilometers)
                                .sum();

                        double kmSostenibles = transportesUltimoMes.stream()
                                .filter(t -> "bicycle".equals(t.getTransportType()) || "walk".equals(t.getTransportType()))
                                .mapToDouble(Transport::getKilometers)
                                .sum();

                        if (kmTotales > 0) {
                            valorInicial = (kmSostenibles / kmTotales) * 100; // Porcentaje
                            logger.info("Valor inicial (último mes) para transporte sostenible: {}%", valorInicial);
                        } else {
                            valorInicial = 0.0;
                        }
                    }
                    else if ("costo".equals(metrica)) {
                        // Obtener costo total de transporte del último mes
                        Double costoUltimoMes = transportRepository.sumCostByUserIdAndDateBetween(
                                currentUser.getId(), unMesAtras, ahora);

                        if (costoUltimoMes != null && costoUltimoMes > 0) {
                            valorInicial = costoUltimoMes;
                            logger.info("Valor inicial (último mes) para costo de transporte: {} MXN", valorInicial);
                        }
                    }
                    break;
            }
        } catch (Exception e) {
            logger.error("Error al obtener valor actual para tipo {}: {}", tipo, e.getMessage());
        }

        // Asegurar que tenemos un valor positivo (para evitar divisiones por cero)
        return Math.max(valorActual, 0.1);
    }

    /**
     * Obtiene el valor de referencia actual para inicializar una meta de reducción
     */
    private double obtenerValorReferenciaActual(String tipo) {
        User currentUser = userService.getCurrentUser();

        if ("agua".equals(tipo)) {
            // Buscar el último registro de consumo de agua
            List<Water> consumos = waterRepository.findByUserIdOrderByDateDesc(currentUser.getId());
            if (!consumos.isEmpty()) {
                return consumos.get(0).getLiters();
            }
        }
        else if ("electricidad".equals(tipo)) {
            // Buscar el último registro de consumo de electricidad
            List<Electricity> consumos = electricityRepository.findByUserIdOrderByDateDesc(currentUser.getId());
            if (!consumos.isEmpty()) {
                return consumos.get(0).getKilowatts();
            }
        }
        else if ("transporte".equals(tipo)) {
            // Para métricas de reducción como "reduccion_combustion"
            List<Transport> consumos = transportRepository.findByUserIdOrderByDateDesc(currentUser.getId());
            if (!consumos.isEmpty()) {
                // Filtrar según la métrica específica
                // Por ejemplo, para reducción de combustión, sumar solo viajes en carro
                return consumos.stream()
                        .filter(t -> "car".equals(t.getTransportType()))
                        .mapToDouble(Transport::getKilometers)
                        .sum();
            }
        }

        return 0.0; // Valor por defecto si no hay datos
    }

    @Override
    @Transactional
    public MetaDTO updateMeta(Long id, MetaDTO metaDTO) throws IllegalArgumentException {
        User currentUser = userService.getCurrentUser();

        Meta meta = metaRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Meta no encontrada o acceso denegado"));

        meta.setTitulo(metaDTO.getTitulo());
        meta.setDescripcion(metaDTO.getDescripcion());
        meta.setTipo(metaDTO.getTipo());
        meta.setValorObjetivo(metaDTO.getValorObjetivo());
        meta.setUnidad(metaDTO.getUnidad());
        meta.setMetrica(metaDTO.getMetrica());
        meta.setFechaInicio(metaDTO.getFechaInicio());
        meta.setFechaFin(metaDTO.getFechaFin());
        meta.setTipoEvaluacion(metaDTO.getTipoEvaluacion() != null ?
                metaDTO.getTipoEvaluacion() : determinarTipoEvaluacion(metaDTO.getTipo()));

        Meta updatedMeta = metaRepository.save(meta);

        // Si la meta es de evaluación automática, actualizar el progreso actual
        if ("automatica".equals(updatedMeta.getTipoEvaluacion())) {
            updateAutomaticProgress(updatedMeta);
        }

        return convertToDTO(updatedMeta);
    }

    @Override
    @Transactional
    public MetaDTO updateMetaProgreso(Long id, double valorActual) throws IllegalArgumentException {
        User currentUser = userService.getCurrentUser();

        Meta meta = metaRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Meta no encontrada o acceso denegado"));

        meta.setValorActual(valorActual);

        // CORREGIDO: Usar actualizarEstadoMeta para que use la lógica específica de transporte
        actualizarEstadoMeta(meta);

        Meta updatedMeta = metaRepository.save(meta);
        return convertToDTO(updatedMeta);
    }

    @Override
    @Transactional
    public boolean deleteMeta(Long id) {
        User currentUser = userService.getCurrentUser();

        if (!metaRepository.existsByIdAndUserId(id, currentUser.getId())) {
            return false;
        }

        metaRepository.deleteById(id);
        return true;
    }

    @Override
    public Map<String, List<MetaRecommendationDTO>> getRecommendationsForTipo(String tipo) {
        User currentUser = userService.getCurrentUser();
        List<MetaRecommendationDTO> recommendations = new ArrayList<>();

        try {
            switch (tipo) {
                case "agua":
                    recommendations = generateWaterRecommendations(currentUser);
                    break;
                case "electricidad":
                    recommendations = generateElectricityRecommendations(currentUser);
                    break;
                case "transporte":
                    recommendations = generateTransportRecommendations(currentUser);
                    break;
                case "combinada":
                    recommendations = generateCombinedRecommendations(currentUser);
                    break;
                default:
                    recommendations = generateDefaultRecommendations(tipo);
            }
        } catch (Exception e) {
            // En caso de error, proporcionar recomendaciones predeterminadas
            logger.error("Error generando recomendaciones para {}: {}", tipo, e.getMessage());
            recommendations = generateDefaultRecommendations(tipo);
        }

        Map<String, List<MetaRecommendationDTO>> result = new HashMap<>();
        result.put("recommendations", recommendations);
        return result;
    }

    @Transactional
    @Override
    public void updateAllAutomaticMetas() {
        logger.info("Iniciando actualización automática de metas...");

        // Obtener todas las metas automáticas en progreso
        List<Meta> automaticMetas = metaRepository.findByTipoEvaluacionAndEstado("automatica", "en_progreso");

        int count = 0;
        for (Meta meta : automaticMetas) {
            try {
                updateAutomaticProgress(meta);
                count++;
            } catch (Exception e) {
                logger.error("Error actualizando meta {}: {}", meta.getId(), e.getMessage());
            }
        }

        logger.info("Actualización automática finalizada. {} metas actualizadas.", count);
    }

    /**
     * Convertir entidad Meta a DTO
     */
    private MetaDTO convertToDTO(Meta meta) {
        // Redondear valores para evitar decimales excesivos
        Double valorObjetivo = meta.getValorObjetivo() != null ? 
            Math.round(meta.getValorObjetivo() * 100.0) / 100.0 : null;
        Double valorActual = meta.getValorActual() != null ? 
            Math.round(meta.getValorActual() * 100.0) / 100.0 : null;
        Double valorInicial = meta.getValorInicial() != null ? 
            Math.round(meta.getValorInicial() * 100.0) / 100.0 : null;
        
        // NUEVO: Calcular progreso según el tipo de meta
        Double progreso = 0.0;
        if ("transporte".equals(meta.getTipo())) {
            progreso = calcularProgresoTransporte(meta);
        } else {
            // Para agua y electricidad, usar la lógica original
            if (valorActual != null && valorObjetivo != null && valorInicial != null && valorInicial > 0) {
                if (isReductionMetric(meta.getTipo(), meta.getMetrica())) {
                    // Para reducción: calcular cuánto se ha reducido
                    double reduccionTotal = valorInicial - valorObjetivo;
                    double reduccionActual = valorInicial - valorActual;
                    if (reduccionTotal > 0) {
                        progreso = (reduccionActual / reduccionTotal) * 100;
                        progreso = Math.min(100, Math.max(0, progreso));
                    }
                } else {
                    // Para incremento
                    if (valorObjetivo > 0) {
                        progreso = (valorActual / valorObjetivo) * 100;
                        progreso = Math.min(100, Math.max(0, progreso));
                    }
                }
            }
        }
        
        // Redondear progreso a 2 decimales
        progreso = Math.round(progreso * 100.0) / 100.0;
        
        logger.info("Convirtiendo Meta a DTO: id={}, tipo={}, valorInicial={}, valorActual={}, valorObjetivo={}, progreso={}%",
                meta.getId(), meta.getTipo(), valorInicial, valorActual, valorObjetivo, progreso);

        return MetaDTO.builder()
                .id(meta.getId())
                .titulo(meta.getTitulo())
                .descripcion(meta.getDescripcion())
                .tipo(meta.getTipo())
                .valorObjetivo(valorObjetivo)
                .unidad(meta.getUnidad())
                .metrica(meta.getMetrica())
                .fechaInicio(meta.getFechaInicio())
                .fechaFin(meta.getFechaFin())
                .estado(meta.getEstado())
                .valorActual(valorActual)
                .valorInicial(valorInicial)
                .tipoEvaluacion(meta.getTipoEvaluacion())
                .createdAt(meta.getCreatedAt())
                .updatedAt(meta.getUpdatedAt())
                .progreso(progreso)  // NUEVO: Incluir progreso calculado
                .build();
    }

    /**
     * Convertir lista de entidades Meta a lista de DTOs
     */
    private List<MetaDTO> convertToDTOList(List<Meta> metas) {
        return metas.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Determinar el tipo de evaluación según el tipo de meta
     */
    private String determinarTipoEvaluacion(String tipo) {
        // Por defecto todas las metas son automáticas, excepto las de "otro"
        return "otro".equals(tipo) ? "manual" : "automatica";
    }

    /**
     * Actualizar el estado de una meta basado en el progreso actual
     */
    private void updateMetaStatus(Meta meta) {
        logger.info("Evaluando estado meta ID {}: valorActual={}, valorInicial={}, valorObjetivo={}",
                meta.getId(), meta.getValorActual(), meta.getValorInicial(), meta.getValorObjetivo());

        // Determinar si es meta de reducción basado en tipo y métrica
        boolean esReduccion = isReductionMetric(meta.getTipo(), meta.getMetrica());

        // Para transporte, verificar métricas específicas
        if ("transporte".equals(meta.getTipo())) {
            // Métricas de reducción incluyen "reduccion_combustion", "emisiones", "costo"
            // Métricas de incremento incluyen "porcentaje_sostenible", "km_bicicleta", "uso_bicicleta"
            if ("km_bicicleta".equals(meta.getMetrica()) ||
                    "uso_bicicleta".equals(meta.getMetrica()) ||
                    "porcentaje_sostenible".equals(meta.getMetrica())) {
                esReduccion = false; // Estas son metas de incremento
            }
        }

        // Si el valor inicial es "No disponible", establecerlo adecuadamente
        if (meta.getValorInicial() == null || "No disponible".equals(meta.getValorInicial())) {
            if (esReduccion) {
                // Para reducción, establecer mayor que el objetivo
                meta.setValorInicial(meta.getValorObjetivo() * 1.5);
            } else {
                // Para incremento, establecer en 0
                meta.setValorInicial(0.0);
            }
            logger.info("Meta ID {}: Valor inicial corregido de 'No disponible' a {}",
                    meta.getId(), meta.getValorInicial());
        }

        // Calcular progreso para logging
        double progreso = 0;
        if (esReduccion) {
            if (meta.getValorInicial() != null && meta.getValorActual() != null) {
                double reduccionTotal = meta.getValorInicial() - meta.getValorObjetivo();
                if (reduccionTotal > 0) {
                    double reduccionActual = meta.getValorInicial() - meta.getValorActual();
                    progreso = (reduccionActual / reduccionTotal) * 100;
                    logger.info("Meta ID {}: Progreso calculado para reducción: {}%", meta.getId(), progreso);
                }
            }
        } else {
            if (meta.getValorActual() != null && meta.getValorObjetivo() > 0) {
                progreso = (meta.getValorActual() / meta.getValorObjetivo()) * 100;
                logger.info("Meta ID {}: Progreso calculado para incremento: {}%", meta.getId(), progreso);
            }
        }

        // Determinar si la meta está completada
        boolean metaCompletada = false;
        if (esReduccion) {
            metaCompletada = meta.getValorActual() <= meta.getValorObjetivo();
        } else {
            metaCompletada = meta.getValorActual() >= meta.getValorObjetivo();
        }

        // Actualizar estado y otorgar puntos si es necesario
        String estadoAnteriorMeta = meta.getEstado();
        if (metaCompletada) {
            meta.setEstado("completada");
            logger.info("Meta ID {}: Estableciendo estado a 'completada'", meta.getId());
            
            // Otorgar puntos solo si la meta no estaba previamente completada
            if (!"completada".equals(estadoAnteriorMeta)) {
                try {
                    Integer nuevaPuntuacion = userService.awardPointsForCompletedGoal();
                    logger.info("Meta ID {}: Usuario recibió 10 puntos por completar la meta. Nueva puntuación: {}", 
                            meta.getId(), nuevaPuntuacion);
                } catch (Exception e) {
                    logger.error("Error al otorgar puntos por meta completada ID {}: {}", meta.getId(), e.getMessage());
                }
            }
        } else if (meta.getFechaFin().isBefore(LocalDateTime.now())) {
            meta.setEstado("fallida");
            logger.info("Meta ID {}: Meta fallida (fecha vencida)", meta.getId());
        } else {
            meta.setEstado("en_progreso");
            logger.info("Meta ID {}: Meta en progreso ({}% completado)", meta.getId(),
                    Math.min(100, Math.max(0, Math.round(progreso))));
        }

        // Información sobre el cambio de estado
        if (!meta.getEstado().equals(estadoAnteriorMeta)) {
            logger.info("Estado de la meta ID {} actualizado: {} -> {}",
                    meta.getId(), estadoAnteriorMeta, meta.getEstado());
        }
    }

    /**
     * Verificar si una meta se ha completado
     */
    private boolean isMetaCompleted(Meta meta) {
        // Si no hay progreso (valor actual es 0 o null), la meta no está completada
        if (meta.getValorActual() == null || meta.getValorActual() == 0) {
            return false;
        }

        // Para metas de reducción, lógica inversa (menor es mejor)
        if (isReductionMetric(meta.getTipo(), meta.getMetrica())) {
            return meta.getValorActual() <= meta.getValorObjetivo();
        } else {
            // Para metas de incremento, mayor o igual es completado
            return meta.getValorActual() >= meta.getValorObjetivo();
        }
    }

    /**
     * Verificar si una meta ha fallado (fecha de fin pasada y no completada)
     */
    private boolean isMetaFailed(Meta meta) {
        return meta.getFechaFin().isBefore(LocalDateTime.now()) && !isMetaCompleted(meta);
    }

    /**
     * Determinar si una métrica es de reducción (menor es mejor)
     */
    private boolean isReductionMetric(String tipo, String metrica) {
        // La mayoría de métricas de agua, electricidad y emisiones son de reducción
        if ("agua".equals(tipo) || "electricidad".equals(tipo)) {
            // Excepto benchmarks que pueden ser "mantener por debajo de"
            return !"benchmark".equals(metrica);
        }

        // En transporte, depende de la métrica
        if ("transporte".equals(tipo)) {
            // Métricas específicas de reducción
            boolean esReduccion = "reduccion_combustion".equals(metrica) ||
                    "emisiones".equals(metrica) ||
                    "costo".equals(metrica);

            // Métricas específicas de incremento (como uso de bicicleta)
            boolean esIncremento = "porcentaje_sostenible".equals(metrica) ||
                    "km_bicicleta".equals(metrica) ||
                    "uso_bicicleta".equals(metrica);

            if (esReduccion) return true;
            if (esIncremento) return false;

            // Si no es una métrica específica, usar heurística
            return true; // Por defecto asumimos reducción para transporte
        }

        // Para tipos combinados u otros, evaluar por el valor objetivo vs actual
        return false; // Por defecto para otros tipos
    }

    /**
     * Actualizar automáticamente el progreso de una meta
     */
    public void updateAutomaticProgress(Meta meta) {
        switch (meta.getTipo()) {
            case "agua":
                updateWaterMetaProgress(meta);
                break;
            case "electricidad":
                updateElectricityMetaProgress(meta);
                break;
            case "transporte":
                updateTransportMetaProgress(meta);
                break;
            case "combinada":
                updateCombinedMetaProgress(meta);
                break;
        }

        // CORREGIDO: Usar actualizarEstadoMeta en lugar de updateMetaStatus
        // para que use la lógica específica de transporte
        actualizarEstadoMeta(meta);
        metaRepository.save(meta);
    }

    /**
     * Actualizar progreso de meta de agua
     */
    private void updateWaterMetaProgress(Meta meta) {
        User user = meta.getUser();


        if ("consumo_total".equals(meta.getMetrica())) {
            // Obtener el último registro por fecha
            List<Water> registros = waterRepository.findByUserIdOrderByDateDesc(user.getId());

            if (!registros.isEmpty()) {
                // Usar el valor del último registro
                Water ultimoRegistro = registros.get(0);
                logger.info("Meta ID {}: Último registro de agua - fecha={}, valor={} m³",
                        meta.getId(), ultimoRegistro.getDate(), ultimoRegistro.getLiters());

                // Actualizar el valor actual
                meta.setValorActual(ultimoRegistro.getLiters());
                logger.info("Meta ID {}: Valor actual actualizado a {} m³",
                        meta.getId(), meta.getValorActual());

                // Si no hay valor inicial, establecerlo
                if (meta.getValorInicial() == null || meta.getValorInicial() <= 0) {
                    meta.setValorInicial(Math.max(ultimoRegistro.getLiters() * 1.05, meta.getValorObjetivo() * 1.2));
                    logger.info("Meta ID {}: Valor inicial establecido a {} m³",
                            meta.getId(), meta.getValorInicial());
                }
            } else {
                logger.warn("Meta ID {}: No se encontraron registros de agua", meta.getId());
            }
        }
        else if ("benchmark".equals(meta.getMetrica())) {
            // Usar datos del servicio de analytics
            ConsumptionAnalyticsDTO analytics = analyticsService.getWaterAnalytics(user);

            if (analytics.getBenchmark() != null) {
                double porcentaje = analytics.getBenchmark().getCurrentValue() / analytics.getBenchmark().getNationalAverage() * 100;
                meta.setValorActual(porcentaje);
            }
        }
        else if ("emisiones".equals(meta.getMetrica())) {
            ConsumptionAnalyticsDTO analytics = analyticsService.getWaterAnalytics(user);

            if (analytics.getCo2Metrics() != null) {
                meta.setValorActual(analytics.getCo2Metrics().getCo2Savings());
            }
        }
        // Implementar más métricas según sea necesario
    }

    /**
     * Actualizar progreso de meta de electricidad
     */
    private void updateElectricityMetaProgress(Meta meta) {
        User user = meta.getUser();

        if ("consumo_total".equals(meta.getMetrica())) {
            // Obtener todos los registros ordenados por fecha (el más reciente primero)
            List<Electricity> registros = electricityRepository.findByUserIdOrderByDateDesc(user.getId());

            // Imprimir información detallada para diagnóstico
            if (!registros.isEmpty()) {
                Electricity ultimoRegistro = registros.get(0);
                logger.info("Meta ID {}: Último registro de electricidad encontrado - fecha={}, valor={}",
                        meta.getId(), ultimoRegistro.getDate(), ultimoRegistro.getKilowatts());

                // Actualizar el valor actual con el último registro
                meta.setValorActual(ultimoRegistro.getKilowatts());
                logger.info("Meta ID {}: Valor actual actualizado a {} kWh",
                        meta.getId(), meta.getValorActual());

                // Mantener el valor inicial para permitir el cálculo del progreso
                if (meta.getValorInicial() == null || meta.getValorInicial() <= 0) {
                    meta.setValorInicial(ultimoRegistro.getKilowatts() * 1.1); // 10% más alto para meta de reducción
                    logger.info("Meta ID {}: Valor inicial establecido a {} kWh",
                            meta.getId(), meta.getValorInicial());
                }
            } else {
                logger.warn("Meta ID {}: No se encontraron registros de electricidad", meta.getId());
            }
        }
        else if ("benchmark".equals(meta.getMetrica())) {
            // Código existente para benchmark
            ConsumptionAnalyticsDTO analytics = analyticsService.getElectricityAnalytics(user);

            if (analytics.getBenchmark() != null) {
                double porcentaje = analytics.getBenchmark().getCurrentValue() / analytics.getBenchmark().getNationalAverage() * 100;
                meta.setValorActual(porcentaje);

                // NUEVO: Si no hay valor inicial, usar el valor actual
                if (meta.getValorInicial() == null || meta.getValorInicial() == 0) {
                    meta.setValorInicial(porcentaje);
                    logger.info("Meta ID {}: Estableciendo valor inicial benchmark: {}",
                            meta.getId(), meta.getValorInicial());
                }
            }
        }
        else if ("emisiones".equals(meta.getMetrica())) {
            // Código existente para emisiones
            ConsumptionAnalyticsDTO analytics = analyticsService.getElectricityAnalytics(user);

            if (analytics.getCo2Metrics() != null) {
                double emisionesActuales = analytics.getCo2Metrics().getCo2Savings();
                meta.setValorActual(emisionesActuales);

                // NUEVO: Si no hay valor inicial, usar el valor actual
                if (meta.getValorInicial() == null || meta.getValorInicial() == 0) {
                    meta.setValorInicial(emisionesActuales);
                    logger.info("Meta ID {}: Estableciendo valor inicial para emisiones: {}",
                            meta.getId(), meta.getValorInicial());
                }
            }
        }
        // Otras métricas se manejarían de manera similar
    }

    /**
     * Actualiza el progreso de una meta de transporte basado en el historial desde la creación
     */
    private void updateTransportMetaProgress(Meta meta) {
        User user = meta.getUser();

        // Obtener fecha de creación de la meta
        LocalDateTime fechaCreacionMeta = meta.getCreatedAt();
        if (fechaCreacionMeta == null) {
            fechaCreacionMeta = LocalDateTime.now().minus(1, ChronoUnit.DAYS);
            logger.warn("Meta ID {}: No tiene fecha de creación, usando fecha actual - 1 día", meta.getId());
        }

        // Obtener la métrica específica - si no existe, usar un valor predeterminado
        String metrica = meta.getMetrica();
        if (metrica == null || metrica.isEmpty()) {
            metrica = determinarMetricaPorDefecto(meta.getTipo(), meta.getUnidad());
            logger.info("Meta ID {}: No tiene métrica definida, usando '{}' como predeterminada",
                    meta.getId(), metrica);
        }

        logger.info("Actualizando meta ID {}: tipo={}, métrica={}, unidad={}, valorInicial={}, valorActual={}, valorObjetivo={}",
                meta.getId(), meta.getTipo(), metrica, meta.getUnidad(), meta.getValorInicial(),
                meta.getValorActual(), meta.getValorObjetivo());

        try {
            // CORREGIDO: Asegurar que siempre tengamos un valor inicial válido
            if (meta.getValorInicial() == null || meta.getValorInicial() <= 0.1) {
                // Calcular del último mes antes de crear la meta
                LocalDateTime unMesAtras = fechaCreacionMeta.minus(1, ChronoUnit.MONTHS);
                List<Transport> transportesUltimoMes = transportRepository.findByUserIdAndDateBetween(
                        user.getId(), unMesAtras, fechaCreacionMeta);
                
                Double valorInicial = calcularValorSegunMetrica(transportesUltimoMes, metrica);
                
                // CORREGIDO: Para metas de reducción, asegurar un valor inicial mínimo razonable
                if (isReductionMetric(meta.getTipo(), metrica) && valorInicial < meta.getValorObjetivo()) {
                    // Si el valor inicial es menor que el objetivo, usar el objetivo + 20% como inicial
                    valorInicial = meta.getValorObjetivo() * 1.2;
                    logger.info("Meta ID {}: Ajustando valor inicial a {} para permitir reducción desde objetivo",
                            meta.getId(), valorInicial);
                }
                
                // Asegurar un valor mínimo para evitar problemas de división por cero
                if (valorInicial <= 0) {
                    valorInicial = meta.getValorObjetivo() > 0 ? meta.getValorObjetivo() * 1.1 : 10.0;
                }
                
                meta.setValorInicial(valorInicial);
                logger.info("Valor inicial calculado y establecido: {} {}", valorInicial, meta.getUnidad());
            }

            // Obtener registros SOLO desde la creación de la meta
            List<Transport> registrosDesdeCreacion = transportRepository.findByUserIdAndDateAfter(
                    user.getId(), fechaCreacionMeta);
            logger.info("Encontrados {} registros posteriores a la creación de la meta ({})",
                    registrosDesdeCreacion.size(), fechaCreacionMeta);
            
            // Calcular el valor actual como suma de registros posteriores a la creación
            double valorActual = calcularValorSegunMetrica(registrosDesdeCreacion, metrica);
            meta.setValorActual(valorActual);
            logger.info("Valor actual actualizado a: {} {} (suma de {} registros)",
                    valorActual, meta.getUnidad(), registrosDesdeCreacion.size());

            // Actualizar el estado de la meta según su progreso
            actualizarEstadoMeta(meta);
            logger.info("Estado actualizado: {}", meta.getEstado());

        } catch (Exception e) {
            logger.error("Error al actualizar meta de transporte ID {}: {}", meta.getId(), e.getMessage(), e);
        }
    }

    /**
     * Calcula el valor según la métrica especificada
     */
    private double calcularValorSegunMetrica(List<Transport> registros, String metrica) {
        if (registros.isEmpty()) {
            return 0.0;
        }

        switch (metrica) {
            case "reduccion_combustion":
                // Kilómetros en vehículos de combustión
                return registros.stream()
                        .filter(t -> "car".equals(t.getTransportType()))
                        .mapToDouble(Transport::getKilometers)
                        .sum();
                
            case "porcentaje_sostenible":
                // Porcentaje de transporte sostenible
                double kmTotales = registros.stream()
                        .mapToDouble(Transport::getKilometers)
                        .sum();
                double kmSostenibles = registros.stream()
                        .filter(t -> "bicycle".equals(t.getTransportType()) || "walk".equals(t.getTransportType()))
                        .mapToDouble(Transport::getKilometers)
                        .sum();
                return kmTotales > 0 ? (kmSostenibles / kmTotales) * 100 : 0.0;
                
            case "km_bicicleta":
            case "uso_bicicleta":
                // Kilómetros en bicicleta
                return registros.stream()
                        .filter(t -> "bicycle".equals(t.getTransportType()))
                        .mapToDouble(Transport::getKilometers)
                        .sum();
                
            case "costo":
                // Costo total
                return registros.stream()
                        .mapToDouble(Transport::getCost)
                        .sum();
                
            default:
                // Por defecto, kilómetros totales
                return registros.stream()
                        .mapToDouble(Transport::getKilometers)
                        .sum();
        }
    }

    /**
     * Obtiene el valor actual del KPI de kilómetros recorridos
     * Este método debe adaptarse según la forma en que se calculen los KPIs en tu sistema
     */
    private Double obtenerValorKpiTransporte(User user) {
        try {
            // OPCIÓN 1: Consultar el valor directamente si existe un servicio o repositorio para KPIs
            // return kpiRepository.findLatestByUserAndType(user.getId(), "kilometros_recorridos");

            // OPCIÓN 2: Calcular el valor como lo hace el KPIt
            // Por ejemplo, sumar kilómetros del último mes
            LocalDateTime unMesAtras = LocalDateTime.now().minus(1, ChronoUnit.MONTHS);
            List<Transport> transportesUltimoMes = transportRepository.findByUserIdAndDateBetween(
                    user.getId(), unMesAtras, LocalDateTime.now());

            if (transportesUltimoMes.isEmpty()) {
                logger.warn("No se encontraron registros de transporte en el último mes para el usuario ID {}", user.getId());
                return null;
            }

            Double kmTotales = transportesUltimoMes.stream()
                    .mapToDouble(Transport::getKilometers)
                    .sum();

            logger.info("Valor de KPI calculado: {} km del último mes", kmTotales);
            return kmTotales;
        } catch (Exception e) {
            logger.error("Error al obtener valor de KPI de transporte: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Determina la métrica basándose en la unidad si no está explícitamente definida
     */
    private String determinarMetricaPorDefecto(String tipo, String unidad) {
        if ("transporte".equals(tipo)) {
            switch (unidad) {
                case "km":
                    return "reduccion_combustion"; // Por defecto, asumimos reducción
                case "porcentaje":
                    return "porcentaje_sostenible";
                case "costo":
                    return "costo";
                default:
                    return "reduccion_combustion";
            }
        }
        return null;
    }

    /**
     * Calcula el valor inicial para una meta de transporte basado en registros anteriores
     */
    private double calcularValorInicialTransporte(List<Transport> registrosAnteriores, String metrica) {
        if (registrosAnteriores.isEmpty()) {
            return 0.1; // Valor por defecto si no hay datos previos
        }

        if ("reduccion_combustion".equals(metrica)) {
            // Usar kilómetros totales de vehículos de combustión
            return registrosAnteriores.stream()
                    .filter(t -> "car".equals(t.getTransportType()))
                    .mapToDouble(Transport::getKilometers)
                    .sum();
        }
        else if ("porcentaje_sostenible".equals(metrica)) {
            double kmTotales = registrosAnteriores.stream()
                    .mapToDouble(Transport::getKilometers)
                    .sum();

            double kmSostenibles = registrosAnteriores.stream()
                    .filter(t -> "bicycle".equals(t.getTransportType()) || "walk".equals(t.getTransportType()))
                    .mapToDouble(Transport::getKilometers)
                    .sum();

            return kmTotales > 0 ? (kmSostenibles / kmTotales) * 100 : 0.0;
        }
        else if ("costo".equals(metrica)) {
            return registrosAnteriores.stream()
                    .mapToDouble(Transport::getCost)
                    .sum();
        }

        // Valor por defecto
        return registrosAnteriores.stream()
                .mapToDouble(Transport::getKilometers)
                .sum();
    }

    /**
     * Actualiza el estado de una meta basado en su progreso actual
     * Corregido para evaluar correctamente las metas de reducción e incremento
     */
    private void actualizarEstadoMeta(Meta meta) {
        // NUEVO: Usar lógica específica para transporte
        if ("transporte".equals(meta.getTipo())) {
            String nuevoEstado = evaluarEstadoTransporte(meta);
            String estadoAnterior = meta.getEstado();
            
            meta.setEstado(nuevoEstado);
            
            logger.info("Meta de transporte ID {}: Estado evaluado como '{}' (anterior: '{}')",
                    meta.getId(), nuevoEstado, estadoAnterior);
            
            // Otorgar puntos si se completó
            if ("completada".equals(nuevoEstado) && !"completada".equals(estadoAnterior)) {
                try {
                    Integer nuevaPuntuacion = userService.awardPointsForCompletedGoal();
                    logger.info("Meta ID {}: Usuario recibió 10 puntos por completar la meta. Nueva puntuación: {}", 
                            meta.getId(), nuevaPuntuacion);
                } catch (Exception e) {
                    logger.error("Error al otorgar puntos por meta ID {}: {}", meta.getId(), e.getMessage());
                }
            }
            
            return; // Salir temprano para metas de transporte
        }
        
        // LÓGICA ORIGINAL para agua y electricidad
        LocalDateTime hoy = LocalDateTime.now();
        LocalDateTime fechaFin = meta.getFechaFin();

        // Comprobar si la fecha de fin ya pasó
        boolean fechaVencida = fechaFin != null && fechaFin.isBefore(hoy);

        // Verificar si la meta es de reducción o incremento
        boolean esReduccion = isReductionMetric(meta.getTipo(), meta.getMetrica());

        logger.info("Evaluando estado de meta ID {}: tipo={}, métrica={}, valorInicial={}, " +
                        "valorActual={}, valorObjetivo={}, fecha fin={}, esReduccion={}",
                meta.getId(), meta.getTipo(), meta.getMetrica(), meta.getValorInicial(),
                meta.getValorActual(), meta.getValorObjetivo(), fechaFin, esReduccion);

        // Guardar estado anterior para logging
        String estadoAnteriorMeta = meta.getEstado();

        // Evaluar si la meta está completada
        boolean metaCompletada = false;

        if (meta.getValorActual() != null && meta.getValorObjetivo() != null) {
                if (esReduccion) {
                metaCompletada = meta.getValorActual() <= meta.getValorObjetivo();
                logger.info("Meta de reducción - ¿Completada? {} (valorActual {} <= valorObjetivo {})",
                        metaCompletada, meta.getValorActual(), meta.getValorObjetivo());
            } else {
                metaCompletada = meta.getValorActual() >= meta.getValorObjetivo();
                logger.info("Meta de incremento - ¿Completada? {} (valorActual {} >= valorObjetivo {})",
                        metaCompletada, meta.getValorActual(), meta.getValorObjetivo());
            }
        } else {
            logger.warn("Meta ID {}: No se puede evaluar el estado porque falta valorActual o valorObjetivo", meta.getId());
        }

        // Determinar el estado final de la meta
        if (metaCompletada) {
            meta.setEstado("completada");
            logger.info("Meta ID {}: Estableciendo estado a 'completada'", meta.getId());
            
            // Otorgar puntos solo si la meta no estaba previamente completada
            if (!"completada".equals(estadoAnteriorMeta)) {
                try {
                    Integer nuevaPuntuacion = userService.awardPointsForCompletedGoal();
                    logger.info("Meta ID {}: Usuario recibió 10 puntos por completar la meta. Nueva puntuación: {}", 
                            meta.getId(), nuevaPuntuacion);
                } catch (Exception e) {
                    logger.error("Error al otorgar puntos por meta completada ID {}: {}", meta.getId(), e.getMessage());
                }
            }
        } else if (fechaVencida) {
            meta.setEstado("fallida");
            logger.info("Meta ID {}: Estableciendo estado a 'fallida' (fecha vencida)", meta.getId());
        } else {
            meta.setEstado("en_progreso");
            logger.info("Meta ID {}: Estableciendo estado a 'en_progreso'", meta.getId());
        }

        // Información sobre el cambio de estado
        if (!meta.getEstado().equals(estadoAnteriorMeta)) {
            logger.info("Estado de la meta ID {} actualizado: {} -> {}",
                    meta.getId(), estadoAnteriorMeta, meta.getEstado());
        }
    }

    /**
     * Actualizar progreso de meta combinada
     */
    private void updateCombinedMetaProgress(Meta meta) {
        User user = meta.getUser();

        if ("huella_carbono".equals(meta.getMetrica())) {
            // Combinar datos de CO2 de los servicios de análisis
            try {
                ConsumptionAnalyticsDTO waterAnalytics = analyticsService.getWaterAnalytics(user);
                ConsumptionAnalyticsDTO electricityAnalytics = analyticsService.getElectricityAnalytics(user);

                double totalSavings = 0;

                if (waterAnalytics.getCo2Metrics() != null) {
                    totalSavings += waterAnalytics.getCo2Metrics().getCo2Savings();
                }

                if (electricityAnalytics.getCo2Metrics() != null) {
                    totalSavings += electricityAnalytics.getCo2Metrics().getCo2Savings();
                }

                meta.setValorActual(totalSavings);
            } catch (Exception e) {
                logger.error("Error calculando huella de carbono combinada: {}", e.getMessage());
            }
        }
        else if ("ahorro_total".equals(meta.getMetrica())) {
            // Calcular ahorros totales en costos
            double ahorroTotalAgua = calcularAhorroAgua(user, meta.getFechaInicio());
            double ahorroTotalElectricidad = calcularAhorroElectricidad(user, meta.getFechaInicio());
            double ahorroTotalTransporte = calcularAhorroTransporte(user, meta.getFechaInicio());

            meta.setValorActual(ahorroTotalAgua + ahorroTotalElectricidad + ahorroTotalTransporte);
        }
        // Implementar más métricas según sea necesario
    }

    /**
     * Calcular ahorro en agua
     */
    private double calcularAhorroAgua(User user, LocalDateTime desde) {
        ConsumptionAnalyticsDTO analytics = analyticsService.getWaterAnalytics(user);

        // Simplificación: usar los datos de ahorro que proporciona el servicio de analytics
        if (analytics.getCostMetrics() != null) {
            double costUnitDifference = analytics.getCostMetrics().getHistoricalAverageUnitCost() -
                    analytics.getCostMetrics().getUnitCost();

            if (analytics.getBimonthlyConsumption() != null) {
                return costUnitDifference * analytics.getBimonthlyConsumption().getCurrentValue();
            }
        }

        return 0.0;
    }

    /**
     * Calcular ahorro en electricidad
     */
    private double calcularAhorroElectricidad(User user, LocalDateTime desde) {
        ConsumptionAnalyticsDTO analytics = analyticsService.getElectricityAnalytics(user);

        // Simplificación: usar los datos de ahorro que proporciona el servicio de analytics
        if (analytics.getCostMetrics() != null) {
            double costUnitDifference = analytics.getCostMetrics().getHistoricalAverageUnitCost() -
                    analytics.getCostMetrics().getUnitCost();

            if (analytics.getBimonthlyConsumption() != null) {
                return costUnitDifference * analytics.getBimonthlyConsumption().getCurrentValue();
            }
        }

        return 0.0;
    }

    /**
     * Calcular ahorro en transporte
     */
    private double calcularAhorroTransporte(User user, LocalDateTime desde) {
        // Simplificación: estimar ahorro basado en el uso de transporte sostenible
        List<Transport> transportes = transportRepository.findByUserIdAndDateBetween(user.getId(), desde, LocalDateTime.now());

        double kmSostenible = transportes.stream()
                .filter(t -> "bicycle".equals(t.getTransportType()) || "walk".equals(t.getTransportType()))
                .mapToDouble(Transport::getKilometers)
                .sum();

        // Calcular el costo promedio por kilómetro basado en datos históricos
        double costoPorKm = transportes.stream()
                .filter(t -> t.getCost() > 0 && t.getKilometers() > 0)
                .mapToDouble(t -> t.getCost() / t.getKilometers())
                .average()
                .orElse(0.1); // Usar un valor mínimo si no hay datos históricos

        logger.info("Costo promedio por kilómetro calculado: {} MXN/km", costoPorKm);

        return kmSostenible * costoPorKm;
    }

    /**
     * Generar recomendaciones para metas de agua basadas en datos históricos
     */
    private List<MetaRecommendationDTO> generateWaterRecommendations(User user) {
        List<MetaRecommendationDTO> recommendations = new ArrayList<>();

        try {
            ConsumptionAnalyticsDTO analytics = analyticsService.getWaterAnalytics(user);

            // Solo generar recomendaciones si tenemos datos
            if (analytics.getBimonthlyConsumption() != null) {
                double currentUsage = analytics.getBimonthlyConsumption().getCurrentValue();

                // Recomendación 1: Reducir 10% del consumo actual
                double reduccionDiezPorciento = Math.round(currentUsage * 0.9 * 100) / 100.0;
                recommendations.add(MetaRecommendationDTO.builder()
                        .descripcion("Reducir consumo un 10%")
                        .valor(reduccionDiezPorciento)
                        .unidad("m3")
                        .metrica("consumo_total")
                        .build());

                // Recomendación 2: Reducir 15% del consumo actual
                double reduccionQuincePorciento = Math.round(currentUsage * 0.85 * 100) / 100.0;
                recommendations.add(MetaRecommendationDTO.builder()
                        .descripcion("Reducir consumo un 15%")
                        .valor(reduccionQuincePorciento)
                        .unidad("m3")
                        .metrica("consumo_total")
                        .build());

                // Recomendación 3: Alcanzar el benchmark estatal si estamos por encima
                if (analytics.getBenchmark() != null &&
                        analytics.getBenchmark().getCurrentValue() > analytics.getBenchmark().getStateAverage()) {
                    recommendations.add(MetaRecommendationDTO.builder()
                            .descripcion("Reducir a promedio estatal")
                            .valor(analytics.getBenchmark().getStateAverage())
                            .unidad("m3")
                            .metrica("consumo_total")
                            .build());
                }
            }
        } catch (Exception e) {
            logger.error("Error generando recomendaciones de agua: {}", e.getMessage());
        }

        // Si no se generaron recomendaciones, usar valores predeterminados
        if (recommendations.isEmpty()) {
            recommendations = generateDefaultWaterRecommendations();
        }

        return recommendations;
    }

    /**
     * Generar recomendaciones predeterminadas para agua
     */
    private List<MetaRecommendationDTO> generateDefaultWaterRecommendations() {
        List<MetaRecommendationDTO> recommendations = new ArrayList<>();

        recommendations.add(MetaRecommendationDTO.builder()
                .descripcion("Reducir consumo un 10%")
                .valor(10.0)
                .unidad("porcentaje")
                .metrica("consumo_total")
                .build());

        recommendations.add(MetaRecommendationDTO.builder()
                .descripcion("Reducir consumo un 15%")
                .valor(15.0)
                .unidad("porcentaje")
                .metrica("consumo_total")
                .build());

        recommendations.add(MetaRecommendationDTO.builder()
                .descripcion("Reducir a 12 m³ bimestrales")
                .valor(12.0)
                .unidad("m3")
                .metrica("consumo_total")
                .build());

        return recommendations;
    }

    /**
     * Generar recomendaciones para metas de electricidad basadas en datos históricos
     */
    private List<MetaRecommendationDTO> generateElectricityRecommendations(User user) {
        List<MetaRecommendationDTO> recommendations = new ArrayList<>();

        try {
            ConsumptionAnalyticsDTO analytics = analyticsService.getElectricityAnalytics(user);

            // Solo generar recomendaciones si tenemos datos
            if (analytics.getBimonthlyConsumption() != null) {
                double currentUsage = analytics.getBimonthlyConsumption().getCurrentValue();

                // Recomendación 1: Reducir 10% del consumo actual
                double reduccionDiezPorciento = Math.round(currentUsage * 0.9 * 100) / 100.0;
                recommendations.add(MetaRecommendationDTO.builder()
                        .descripcion("Reducir consumo un 10%")
                        .valor(reduccionDiezPorciento)
                        .unidad("kwh")
                        .metrica("consumo_total")
                        .build());

                // Recomendación 2: Reducir 15% del consumo actual
                double reduccionQuincePorciento = Math.round(currentUsage * 0.85 * 100) / 100.0;
                recommendations.add(MetaRecommendationDTO.builder()
                        .descripcion("Reducir consumo un 15%")
                        .valor(reduccionQuincePorciento)
                        .unidad("kwh")
                        .metrica("consumo_total")
                        .build());

                // Recomendación 3: Alcanzar el benchmark nacional si estamos por encima
                if (analytics.getBenchmark() != null &&
                        analytics.getBenchmark().getCurrentValue() > analytics.getBenchmark().getNationalAverage()) {
                    recommendations.add(MetaRecommendationDTO.builder()
                            .descripcion("Reducir a promedio nacional")
                            .valor(analytics.getBenchmark().getNationalAverage())
                            .unidad("kwh")
                            .metrica("consumo_total")
                            .build());
                }
            }
        } catch (Exception e) {
            logger.error("Error generando recomendaciones de electricidad: {}", e.getMessage());
        }

        // Si no se generaron recomendaciones, usar valores predeterminados
        if (recommendations.isEmpty()) {
            recommendations = generateDefaultElectricityRecommendations();
        }

        return recommendations;
    }

    /**
     * Generar recomendaciones predeterminadas para electricidad
     */
    private List<MetaRecommendationDTO> generateDefaultElectricityRecommendations() {
        List<MetaRecommendationDTO> recommendations = new ArrayList<>();

        recommendations.add(MetaRecommendationDTO.builder()
                .descripcion("Reducir consumo un 10%")
                .valor(10.0)
                .unidad("porcentaje")
                .metrica("consumo_total")
                .build());

        recommendations.add(MetaRecommendationDTO.builder()
                .descripcion("Reducir consumo un 15%")
                .valor(15.0)
                .unidad("porcentaje")
                .metrica("consumo_total")
                .build());

        recommendations.add(MetaRecommendationDTO.builder()
                .descripcion("Reducir a 180 kWh mensuales")
                .valor(180.0)
                .unidad("kwh")
                .metrica("consumo_total")
                .build());

        return recommendations;
    }

    /**
     * Generar recomendaciones para metas de transporte basadas en datos históricos
     */
    private List<MetaRecommendationDTO> generateTransportRecommendations(User user) {
        List<MetaRecommendationDTO> recommendations = new ArrayList<>();

        try {
            // Obtener datos de transporte de los últimos 3 meses
            LocalDateTime startDate = LocalDateTime.now().minus(3, ChronoUnit.MONTHS);
            List<Transport> transportes = transportRepository.findByUserIdAndDateBetween(
                    user.getId(), startDate, LocalDateTime.now());

            if (!transportes.isEmpty()) {
                // Calcular kilometros actuales en auto
                double kilometrosAuto = transportes.stream()
                        .filter(t -> "car".equals(t.getTransportType()))
                        .mapToDouble(Transport::getKilometers)
                        .sum();

                if (kilometrosAuto > 0) {
                    // Recomendación 1: Reducir 10%
                    double reduccion10 = kilometrosAuto * 0.9; // 90% del actual = reducción del 10%
                    recommendations.add(MetaRecommendationDTO.builder()
                            .descripcion("Reducir el uso de auto de 10%")
                            .valor(Math.round(reduccion10 * 100.0) / 100.0)
                            .unidad("km")
                            .metrica("reduccion_combustion")
                            .build());

                    // Recomendación 2: Reducir 20%
                    double reduccion20 = kilometrosAuto * 0.8; // 80% del actual = reducción del 20%
                    recommendations.add(MetaRecommendationDTO.builder()
                            .descripcion("Reducir el uso de auto de 20%")
                            .valor(Math.round(reduccion20 * 100.0) / 100.0)
                            .unidad("km")
                            .metrica("reduccion_combustion")
                            .build());

                    // Recomendación 3: Reducir 30%
                    double reduccion30 = kilometrosAuto * 0.7; // 70% del actual = reducción del 30%
                    recommendations.add(MetaRecommendationDTO.builder()
                            .descripcion("Reducir el uso de auto de 30%")
                            .valor(Math.round(reduccion30 * 100.0) / 100.0)
                            .unidad("km")
                            .metrica("reduccion_combustion")
                            .build());
                } else {
                    // Si no hay uso de auto, dar recomendaciones en porcentaje
                    recommendations.add(MetaRecommendationDTO.builder()
                            .descripcion("Reducir el uso de auto de 10%")
                            .valor(10.0)
                            .unidad("porcentaje")
                            .metrica("reduccion_combustion")
                            .build());

                    recommendations.add(MetaRecommendationDTO.builder()
                            .descripcion("Reducir el uso de auto de 20%")
                            .valor(20.0)
                            .unidad("porcentaje")
                            .metrica("reduccion_combustion")
                            .build());

                    recommendations.add(MetaRecommendationDTO.builder()
                            .descripcion("Reducir el uso de auto de 30%")
                            .valor(30.0)
                            .unidad("porcentaje")
                            .metrica("reduccion_combustion")
                            .build());
                }
            }
        } catch (Exception e) {
            logger.error("Error generando recomendaciones de transporte: {}", e.getMessage());
        }

        // Si no se generaron recomendaciones, usar valores predeterminados
        if (recommendations.isEmpty()) {
            recommendations = generateDefaultTransportRecommendations();
        }

        return recommendations;
    }

    /**
     * Generar recomendaciones predeterminadas para transporte
     */
    private List<MetaRecommendationDTO> generateDefaultTransportRecommendations() {
        List<MetaRecommendationDTO> recommendations = new ArrayList<>();

        recommendations.add(MetaRecommendationDTO.builder()
                .descripcion("Reducir el uso de auto de 10%")
                .valor(10.0)
                .unidad("porcentaje")
                .metrica("reduccion_combustion")
                .build());

        recommendations.add(MetaRecommendationDTO.builder()
                .descripcion("Reducir el uso de auto de 20%")
                .valor(20.0)
                .unidad("porcentaje")
                .metrica("reduccion_combustion")
                .build());

        recommendations.add(MetaRecommendationDTO.builder()
                .descripcion("Reducir el uso de auto de 30%")
                .valor(30.0)
                .unidad("porcentaje")
                .metrica("reduccion_combustion")
                .build());

        return recommendations;
    }

    /**
     * Generar recomendaciones para metas combinadas
     */
    private List<MetaRecommendationDTO> generateCombinedRecommendations(User user) {
        List<MetaRecommendationDTO> recommendations = new ArrayList<>();

        try {
            // Obtener datos de análisis de agua y electricidad
            ConsumptionAnalyticsDTO waterAnalytics = analyticsService.getWaterAnalytics(user);
            ConsumptionAnalyticsDTO electricityAnalytics = analyticsService.getElectricityAnalytics(user);

            // Calcular ahorro total actual
            double ahorroActual = calcularAhorroAgua(user, LocalDateTime.now().minus(3, ChronoUnit.MONTHS)) +
                    calcularAhorroElectricidad(user, LocalDateTime.now().minus(3, ChronoUnit.MONTHS)) +
                    calcularAhorroTransporte(user, LocalDateTime.now().minus(3, ChronoUnit.MONTHS));

            // Recomendación 1: Incrementar ahorro total
            double objetivoAhorro = Math.max(500, ahorroActual * 1.5); // Al menos 500 MXN
            recommendations.add(MetaRecommendationDTO.builder()
                    .descripcion("Ahorrar $" + Math.round(objetivoAhorro) + " en servicios")
                    .valor(objetivoAhorro)
                    .unidad("costo")
                    .metrica("ahorro_total")
                    .build());

            // Recomendación 2: Reducir huella de carbono
            double emisionesActuales = 0;
            if (waterAnalytics.getCo2Metrics() != null && electricityAnalytics.getCo2Metrics() != null) {
                double emisionesAgua = waterAnalytics.getCo2Metrics().getForecastValue() -
                        waterAnalytics.getCo2Metrics().getCo2Savings();
                double emisionesElectricidad = electricityAnalytics.getCo2Metrics().getForecastValue() -
                        electricityAnalytics.getCo2Metrics().getCo2Savings();
                emisionesActuales = emisionesAgua + emisionesElectricidad;
            }

            if (emisionesActuales > 0) {
                double objetivoEmisiones = emisionesActuales * 0.85; // Reducir 15%
                recommendations.add(MetaRecommendationDTO.builder()
                        .descripcion("Reducir huella de carbono en 15%")
                        .valor(15.0)
                        .unidad("porcentaje")
                        .metrica("huella_carbono")
                        .build());
            }

            // Recomendación 3: Mejorar índice de sostenibilidad general
            recommendations.add(MetaRecommendationDTO.builder()
                    .descripcion("Mejorar índice de sostenibilidad en 20%")
                    .valor(20.0)
                    .unidad("porcentaje")
                    .metrica("sostenibilidad")
                    .build());

        } catch (Exception e) {
            logger.error("Error generando recomendaciones combinadas: {}", e.getMessage());
        }

        // Si no se generaron recomendaciones, usar valores predeterminados
        if (recommendations.isEmpty()) {
            recommendations = generateDefaultCombinedRecommendations();
        }

        return recommendations;
    }

    /**
     * Generar recomendaciones predeterminadas para metas combinadas
     */
    private List<MetaRecommendationDTO> generateDefaultCombinedRecommendations() {
        List<MetaRecommendationDTO> recommendations = new ArrayList<>();

        recommendations.add(MetaRecommendationDTO.builder()
                .descripcion("Reducir huella de carbono en 15%")
                .valor(15.0)
                .unidad("porcentaje")
                .metrica("huella_carbono")
                .build());

        recommendations.add(MetaRecommendationDTO.builder()
                .descripcion("Ahorrar $500 en servicios")
                .valor(500.0)
                .unidad("costo")
                .metrica("ahorro_total")
                .build());

        recommendations.add(MetaRecommendationDTO.builder()
                .descripcion("Mejorar índice de sostenibilidad en 20%")
                .valor(20.0)
                .unidad("porcentaje")
                .metrica("sostenibilidad")
                .build());

        return recommendations;
    }

    /**
     * Generar recomendaciones predeterminadas para un tipo
     */
    private List<MetaRecommendationDTO> generateDefaultRecommendations(String tipo) {
        switch (tipo) {
            case "agua":
                return generateDefaultWaterRecommendations();
            case "electricidad":
                return generateDefaultElectricityRecommendations();
            case "transporte":
                return generateDefaultTransportRecommendations();
            case "combinada":
                return generateDefaultCombinedRecommendations();
            default:
                // Para "otro" u otros tipos no reconocidos
                List<MetaRecommendationDTO> recommendations = new ArrayList<>();
                recommendations.add(MetaRecommendationDTO.builder()
                        .descripcion("Meta personalizada")
                        .valor(100.0)
                        .unidad("unidad")
                        .metrica("personalizada")
                        .build());
                return recommendations;
        }
    }

    @Transactional
    @Override
    public List<MetaDTO> updateAutomaticMetasForType(String tipo) {
        logger.info("Actualizando metas automáticas de tipo: {}", tipo);

        // Obtener el usuario actual
        User currentUser = userService.getCurrentUser();

        // Buscar todas las metas automáticas en progreso del tipo especificado para el usuario actual
        List<Meta> metasAutomaticas = metaRepository.findByTipoAndTipoEvaluacionAndEstadoAndUserId(
                tipo, "automatica", "en_progreso", currentUser.getId());

        logger.info("Encontradas {} metas de tipo {} para usuario {} para actualizar",
                metasAutomaticas.size(), tipo, currentUser.getUsername());

        List<Meta> metasActualizadas = new ArrayList<>();

        for (Meta meta : metasAutomaticas) {
            try {
                logger.info("Actualizando meta ID: {}, título: {}", meta.getId(), meta.getTitulo());
                updateAutomaticProgress(meta);
                metasActualizadas.add(metaRepository.save(meta));
            } catch (Exception e) {
                logger.error("Error actualizando meta {}: {}", meta.getId(), e.getMessage());
            }
        }

        // Convertir a DTOs y devolver
        return metasActualizadas.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * NUEVO: Calcula el progreso específicamente para metas de transporte
     * Para transporte, el progreso se calcula de manera diferente:
     * - Para reducción: progreso = (valorActual / valorObjetivo) * 100 (menos es mejor)
     * - Para incremento: progreso = (valorActual / valorObjetivo) * 100 (más es mejor)
     */
    private double calcularProgresoTransporte(Meta meta) {
        if (meta.getValorActual() == null || meta.getValorObjetivo() == null || meta.getValorObjetivo() <= 0) {
            return 0.0;
        }

        boolean esReduccion = isReductionMetric(meta.getTipo(), meta.getMetrica());
        
        if (esReduccion) {
            // Para metas de reducción (ej: máximo 250 km en auto)
            // Progreso = cuánto has usado del límite permitido
            // Si has usado 50 km de 250 km permitidos = 20% de progreso
            double porcentaje = (meta.getValorActual() / meta.getValorObjetivo()) * 100;
            
            // Limitar a 100% aunque se exceda el objetivo
            return Math.min(100, Math.max(0, porcentaje));
        } else {
            // Para metas de incremento (ej: mínimo 100 km en bicicleta)
            // Progreso = cuánto has alcanzado del objetivo
            double porcentaje = (meta.getValorActual() / meta.getValorObjetivo()) * 100;
            
            return Math.min(100, Math.max(0, porcentaje));
        }
    }

    /**
     * NUEVO: Evalúa el estado específicamente para metas de transporte
     * Simplifica la lógica para ser más intuitiva
     */
    private String evaluarEstadoTransporte(Meta meta) {
        LocalDateTime hoy = LocalDateTime.now();
        LocalDateTime fechaFin = meta.getFechaFin();
        boolean fechaVencida = fechaFin != null && fechaFin.isBefore(hoy);
        
        // Agregar logging adicional para depurar
        logger.info("=== EVALUANDO ESTADO TRANSPORTE META ID {} ===", meta.getId());
        logger.info("Métrica: {}", meta.getMetrica());
        logger.info("Unidad: {}", meta.getUnidad());
        logger.info("Fecha actual: {}, Fecha fin: {}, ¿Vencida?: {}", hoy, fechaFin, fechaVencida);
        
        // Si no hay métrica definida, inferirla de la unidad
        String metrica = meta.getMetrica();
        if (metrica == null || metrica.isEmpty()) {
            metrica = determinarMetricaPorDefecto(meta.getTipo(), meta.getUnidad());
            logger.info("Métrica no definida, usando por defecto: {}", metrica);
        }
        
        boolean esReduccion = isReductionMetric(meta.getTipo(), metrica);
        logger.info("¿Es métrica de reducción?: {}", esReduccion);
        
        if (meta.getValorActual() == null || meta.getValorObjetivo() == null) {
            return "en_progreso"; // Si faltan datos, asumir en progreso
        }
        
        if (esReduccion) {
            // LÓGICA PARA METAS DE REDUCCIÓN (ej: máximo 250 km en auto)
            
            // Si ya se excedió el límite, la meta está fallida inmediatamente
            if (meta.getValorActual() >= meta.getValorObjetivo()) {
                logger.info("Meta de transporte ID {}: FALLIDA - Se excedió el límite (actual {} >= objetivo {})",
                        meta.getId(), meta.getValorActual(), meta.getValorObjetivo());
                return "fallida";
            }
            
            // Si la fecha venció y NO se excedió el límite, está completada
            if (fechaVencida) {
                logger.info("Meta de transporte ID {}: COMPLETADA - Fecha vencida sin exceder límite (actual {} < objetivo {})",
                        meta.getId(), meta.getValorActual(), meta.getValorObjetivo());
                return "completada";
            }
            
            // Si no ha vencido y no se ha excedido, está en progreso
            logger.info("Meta de transporte ID {}: EN PROGRESO - No vencida y sin exceder límite (actual {} < objetivo {})",
                    meta.getId(), meta.getValorActual(), meta.getValorObjetivo());
            return "en_progreso";
            
        } else {
            // LÓGICA PARA METAS DE INCREMENTO (ej: mínimo 100 km en bicicleta)
            
            // Si ya se alcanzó el objetivo, está completada
            if (meta.getValorActual() >= meta.getValorObjetivo()) {
                logger.info("Meta de transporte ID {}: COMPLETADA - Se alcanzó el objetivo de incremento (actual {} >= objetivo {})",
                        meta.getId(), meta.getValorActual(), meta.getValorObjetivo());
                return "completada";
            }
            
            // Si la fecha venció sin alcanzar el objetivo, está fallida
            if (fechaVencida) {
                logger.info("Meta de transporte ID {}: FALLIDA - Fecha vencida sin alcanzar objetivo (actual {} < objetivo {})",
                        meta.getId(), meta.getValorActual(), meta.getValorObjetivo());
                return "fallida";
            }
            
            // Si no ha vencido y no se ha alcanzado, está en progreso
            logger.info("Meta de transporte ID {}: EN PROGRESO - No vencida y sin alcanzar objetivo (actual {} < objetivo {})",
                    meta.getId(), meta.getValorActual(), meta.getValorObjetivo());
            return "en_progreso";
        }
    }
}