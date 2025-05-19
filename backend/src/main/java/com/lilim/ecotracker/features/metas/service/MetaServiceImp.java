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
        meta.setValorObjetivo(metaDTO.getValorObjetivo());
        meta.setUnidad(metaDTO.getUnidad());
        meta.setMetrica(metaDTO.getMetrica());
        meta.setFechaInicio(metaDTO.getFechaInicio());
        meta.setFechaFin(metaDTO.getFechaFin());
        meta.setEstado("en_progreso");

        // NUEVO: Determinar si es una meta de reducción
        boolean esReduccion = isReductionMetric(metaDTO.getTipo(), metaDTO.getMetrica());

        // NUEVO: Dependiendo del tipo de meta, establecer valores iniciales
        if (esReduccion) {
            // Para metas de reducción, obtener consumo actual como valor inicial
            Double valorInicial = obtenerValorActualConsumo(metaDTO.getTipo(), metaDTO.getMetrica());
            logger.info("Inicializando meta de reducción con valor inicial: {}", valorInicial);

            meta.setValorInicial(valorInicial);
            meta.setValorActual(valorInicial); // Al inicio, el valor actual = valor inicial
        } else {
            // Para metas de incremento, se inicia desde 0
            meta.setValorInicial(0.0);
            meta.setValorActual(0.0);
        }

        meta.setTipoEvaluacion(metaDTO.getTipoEvaluacion() != null ?
                metaDTO.getTipoEvaluacion() : determinarTipoEvaluacion(metaDTO.getTipo()));
        meta.setUser(currentUser);

        Meta savedMeta = metaRepository.save(meta);

        // Si la meta es de evaluación automática, actualizar el progreso actual
        if ("automatica".equals(savedMeta.getTipoEvaluacion())) {
            updateAutomaticProgress(savedMeta);
            savedMeta = metaRepository.save(savedMeta);
        }

        return convertToDTO(savedMeta);
    }

    /**
     * Método para obtener el valor actual de consumo según el tipo
     */
    private Double obtenerValorActualConsumo(String tipo, String metrica) {
        User currentUser = userService.getCurrentUser();
        Double valorActual = 0.0;

        try {
            switch (tipo) {
                case "agua":
                    // Obtener la suma total de consumo de agua sin filtrar por fechas
                    List<Water> consumosAgua = waterRepository.findByUserId(currentUser.getId());
                    if (!consumosAgua.isEmpty()) {
                        valorActual = consumosAgua.stream()
                                .mapToDouble(Water::getLiters)
                                .sum();
                        logger.info("Valor actual para agua calculado: {} m³", valorActual);
                    }
                    break;

                case "electricidad":
                    // Obtener la suma total de consumo eléctrico sin filtrar por fechas
                    List<Electricity> consumosElectricidad = electricityRepository.findByUserId(currentUser.getId());
                    if (!consumosElectricidad.isEmpty()) {
                        valorActual = consumosElectricidad.stream()
                                .mapToDouble(Electricity::getKilowatts)
                                .sum();
                        logger.info("Valor actual para electricidad calculado: {} kWh", valorActual);
                    }
                    break;

                case "transporte":
                    // Para transporte, depende de la métrica específica
                    if ("reduccion_combustion".equals(metrica)) {
                        List<Transport> transportes = transportRepository.findByUserId(currentUser.getId());
                        valorActual = transportes.stream()
                                .filter(t -> "car".equals(t.getTransportType()))
                                .mapToDouble(Transport::getKilometers)
                                .sum();
                        logger.info("Valor actual para transporte (combustión) calculado: {} km", valorActual);
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

        // Actualizar estado según el progreso
        updateMetaStatus(meta);

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
        // Agrega log para depuración
        logger.info("Convirtiendo Meta a DTO: id={}, valorInicial={}",
                meta.getId(), meta.getValorInicial());

        return MetaDTO.builder()
                .id(meta.getId())
                .titulo(meta.getTitulo())
                .descripcion(meta.getDescripcion())
                .tipo(meta.getTipo())
                .valorObjetivo(meta.getValorObjetivo())
                .unidad(meta.getUnidad())
                .metrica(meta.getMetrica())
                .fechaInicio(meta.getFechaInicio())
                .fechaFin(meta.getFechaFin())
                .estado(meta.getEstado())
                .valorActual(meta.getValorActual())
                .valorInicial(meta.getValorInicial()) // Asegúrate de que este campo esté presente
                .tipoEvaluacion(meta.getTipoEvaluacion())
                .createdAt(meta.getCreatedAt())
                .updatedAt(meta.getUpdatedAt())
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
        logger.info("Evaluando estado meta ID {}: valorActual={}, valorObjetivo={}",
                meta.getId(), meta.getValorActual(), meta.getValorObjetivo());

        // Determinar si es meta de reducción
        boolean esReduccion = isReductionMetric(meta.getTipo(), meta.getMetrica());
        boolean metaCompletada = false;

        // SOLUCIÓN: Si el valor actual es 0 y la métrica es de reducción,
        // no considerar como completada salvo que sea realmente intencional
        if (meta.getValorActual() == 0 && esReduccion) {
            // Para evitar falsa "completada" al iniciar, verificamos si hubo actualización real
            if (meta.getUpdatedAt() == null ||
                    meta.getUpdatedAt().isEqual(meta.getCreatedAt())) {
                // Meta nueva sin actualizaciones reales, mantener en progreso
                logger.info("Meta de reducción nueva con valor 0, marcando en_progreso");
                meta.setEstado("en_progreso");
                return;
            }
        }

        // Evaluación normal para otros casos
        if (esReduccion) {
            metaCompletada = meta.getValorActual() <= meta.getValorObjetivo();
        } else {
            metaCompletada = meta.getValorActual() >= meta.getValorObjetivo();
        }

        if (metaCompletada) {
            meta.setEstado("completada");
        } else if (meta.getFechaFin().isBefore(LocalDateTime.now())) {
            meta.setEstado("fallida");
        } else {
            meta.setEstado("en_progreso");
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
            return "reduccion_combustion".equals(metrica) ||
                    "emisiones".equals(metrica) ||
                    "costo".equals(metrica);
        }

        return false;
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

        // Actualizar estado y guardar
        updateMetaStatus(meta);
        metaRepository.save(meta);
    }

    /**
     * Actualizar progreso de meta de agua
     */
    private void updateWaterMetaProgress(Meta meta) {
        User user = meta.getUser();

        if ("consumo_total".equals(meta.getMetrica())) {
            // No filtrar por fechas para incluir datos simulados
            List<Water> consumos = waterRepository.findByUserId(user.getId());

            logger.info("Meta ID {}: Encontrados {} registros de agua",
                    meta.getId(), consumos.size());

            double consumoTotal = consumos.stream()
                    .mapToDouble(Water::getLiters)
                    .sum();

            logger.info("Meta ID {}: Consumo total de agua: {} m³", meta.getId(), consumoTotal);

            // Actualizar el valor actual
            meta.setValorActual(consumoTotal);

            // NUEVO: Asegurar que tenemos un valor inicial
            if (meta.getValorInicial() == null || meta.getValorInicial() == 0) {
                meta.setValorInicial(Math.max(consumoTotal, meta.getValorObjetivo() * 1.2));
                logger.info("Meta ID {}: Estableciendo valor inicial: {} m³",
                        meta.getId(), meta.getValorInicial());
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
            // No filtrar por fechas para incluir datos simulados
            List<Electricity> consumos = electricityRepository.findByUserId(user.getId());

            logger.info("Meta ID {}: Encontrados {} registros de electricidad",
                    meta.getId(), consumos.size());

            double consumoTotal = consumos.stream()
                    .mapToDouble(Electricity::getKilowatts)
                    .sum();

            logger.info("Meta ID {}: Consumo total de electricidad: {} kWh", meta.getId(), consumoTotal);

            // Actualizar el valor actual
            meta.setValorActual(consumoTotal);

            // NUEVO: Asegurar que tenemos un valor inicial
            if (meta.getValorInicial() == null || meta.getValorInicial() <= 0) {
                double valorInicialNuevo = Math.max(consumoTotal, meta.getValorObjetivo() * 1.2);
                meta.setValorInicial(valorInicialNuevo);
                meta.setValorInicial(Math.max(consumoTotal, meta.getValorObjetivo() * 1.2));
                logger.info("Meta ID {}: Estableciendo valor inicial: {} kWh",
                        meta.getId(), meta.getValorInicial());
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
     * Actualizar progreso de meta de transporte
     */
    private void updateTransportMetaProgress(Meta meta) {
        User user = meta.getUser();

        if ("reduccion_combustion".equals(meta.getMetrica())) {
            // No filtrar por fechas para incluir datos simulados
            List<Transport> transportes = transportRepository.findByUserIdAndTransportType(
                    user.getId(), "car");

            logger.info("Meta ID {}: Encontrados {} registros de transporte (carro)",
                    meta.getId(), transportes.size());

            double totalKm = transportes.stream()
                    .mapToDouble(Transport::getKilometers)
                    .sum();

            logger.info("Meta ID {}: Kilómetros totales en carro: {} km", meta.getId(), totalKm);

            // Actualizar el valor actual
            meta.setValorActual(totalKm);

            // NUEVO: Asegurar que tenemos un valor inicial
            if (meta.getValorInicial() == null || meta.getValorInicial() == 0) {
                meta.setValorInicial(Math.max(totalKm, meta.getValorObjetivo() * 1.2));
                logger.info("Meta ID {}: Estableciendo valor inicial para km en carro: {}",
                        meta.getId(), meta.getValorInicial());
            }
        }
        else if ("porcentaje_sostenible".equals(meta.getMetrica())) {
            // Código existente para porcentaje de transporte sostenible
            List<Transport> todos = transportRepository.findByUserId(user.getId());

            if (!todos.isEmpty()) {
                double totalKm = todos.stream()
                        .mapToDouble(Transport::getKilometers)
                        .sum();

                double sostenibleKm = todos.stream()
                        .filter(t -> "bicycle".equals(t.getTransportType()) || "walk".equals(t.getTransportType()))
                        .mapToDouble(Transport::getKilometers)
                        .sum();

                double porcentaje = totalKm > 0 ? (sostenibleKm / totalKm) * 100 : 0;
                meta.setValorActual(porcentaje);

                // NUEVO: Si no hay valor inicial, usar el valor actual
                // Nota: Para métricas de incremento, empezamos desde el valor actual
                if (meta.getValorInicial() == null || meta.getValorInicial() == 0) {
                    meta.setValorInicial(porcentaje);
                    logger.info("Meta ID {}: Estableciendo valor inicial para % sostenible: {}",
                            meta.getId(), meta.getValorInicial());
                }
            }
        }
        else if ("emisiones".equals(meta.getMetrica())) {
            // Calcular emisiones de CO2 para todos los transportes
            List<Transport> todos = transportRepository.findByUserId(user.getId());

            double emisionesTotal = 0.0;

            for (Transport t : todos) {
                // Factores de emisión según tipo de transporte
                double factorEmision = 0.0;
                switch (t.getTransportType()) {
                    case "car":
                        factorEmision = 0.192; // kg CO2 por km
                        break;
                    case "bus":
                        factorEmision = 0.105; // kg CO2 por km
                        break;
                    case "bicycle":
                    case "walk":
                        factorEmision = 0.0; // Sin emisiones
                        break;
                    default:
                        factorEmision = 0.150; // Valor por defecto
                }

                emisionesTotal += t.getKilometers() * factorEmision;
            }

            meta.setValorActual(emisionesTotal);

            // NUEVO: Si no hay valor inicial, usar el valor actual
            if (meta.getValorInicial() == null || meta.getValorInicial() == 0) {
                meta.setValorInicial(Math.max(emisionesTotal, meta.getValorObjetivo() * 1.2));
                logger.info("Meta ID {}: Estableciendo valor inicial para emisiones transporte: {}",
                        meta.getId(), meta.getValorInicial());
            }
        }
        else if ("costo".equals(meta.getMetrica())) {
            // Código para costo total de transporte
            List<Transport> todos = transportRepository.findByUserId(user.getId());

            double costoTotal = todos.stream()
                    .mapToDouble(Transport::getCost)
                    .sum();

            meta.setValorActual(costoTotal);

            // NUEVO: Si no hay valor inicial, usar el valor actual
            if (meta.getValorInicial() == null || meta.getValorInicial() == 0) {
                meta.setValorInicial(Math.max(costoTotal, meta.getValorObjetivo() * 1.2));
                logger.info("Meta ID {}: Estableciendo valor inicial para costo transporte: {}",
                        meta.getId(), meta.getValorInicial());
            }
        }
        // Otras métricas se manejarían de manera similar
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

        // Asumir un costo promedio de transporte por km
        double costoPorKm = 4.0; // MXN por km

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
                // Calcular porcentaje actual de transporte sostenible
                double totalKm = transportes.stream()
                        .mapToDouble(Transport::getKilometers)
                        .sum();

                double sostenibleKm = transportes.stream()
                        .filter(t -> "bicycle".equals(t.getTransportType()) || "walk".equals(t.getTransportType()))
                        .mapToDouble(Transport::getKilometers)
                        .sum();

                double porcentajeActual = totalKm > 0 ? (sostenibleKm / totalKm) * 100 : 0;
                double porcentajeObjetivo = Math.min(100, porcentajeActual + 20); // Incrementar 20%

                // Recomendación 1: Aumentar porcentaje de transporte sostenible
                recommendations.add(MetaRecommendationDTO.builder()
                        .descripcion("Aumentar transporte sostenible a " + Math.round(porcentajeObjetivo) + "%")
                        .valor(porcentajeObjetivo)
                        .unidad("porcentaje")
                        .metrica("porcentaje_sostenible")
                        .build());

                // Recomendación 2: Reducir km en vehículos de combustión
                double kilometrosAuto = transportes.stream()
                        .filter(t -> "car".equals(t.getTransportType()))
                        .mapToDouble(Transport::getKilometers)
                        .sum();

                if (kilometrosAuto > 0) {
                    double reduccion = kilometrosAuto * 0.8; // Reducir 20%
                    recommendations.add(MetaRecommendationDTO.builder()
                            .descripcion("Reducir km en auto un 20%")
                            .valor(reduccion)
                            .unidad("km")
                            .metrica("reduccion_combustion")
                            .build());
                }

                // Recomendación 3: Incrementar uso de bicicleta
                double kilometrosBici = transportes.stream()
                        .filter(t -> "bicycle".equals(t.getTransportType()))
                        .mapToDouble(Transport::getKilometers)
                        .sum();

                double objetivoBici = kilometrosBici > 0 ? kilometrosBici * 1.5 : 30; // +50% o 30km mínimo
                recommendations.add(MetaRecommendationDTO.builder()
                        .descripcion("Usar bicicleta al menos " + Math.round(objetivoBici) + " km mensuales")
                        .valor(objetivoBici)
                        .unidad("km")
                        .metrica("porcentaje_sostenible")
                        .build());
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
                .descripcion("Aumentar transporte sostenible a 40%")
                .valor(40.0)
                .unidad("porcentaje")
                .metrica("porcentaje_sostenible")
                .build());

        recommendations.add(MetaRecommendationDTO.builder()
                .descripcion("Reducir emisiones CO2 un 20%")
                .valor(20.0)
                .unidad("porcentaje")
                .metrica("emisiones")
                .build());

        recommendations.add(MetaRecommendationDTO.builder()
                .descripcion("Usar bicicleta al menos 60 km mensuales")
                .valor(60.0)
                .unidad("km")
                .metrica("porcentaje_sostenible")
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
}