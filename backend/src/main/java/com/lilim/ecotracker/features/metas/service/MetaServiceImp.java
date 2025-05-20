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
                    // Para transporte, solo considerar el último periodo
                    if ("reduccion_combustion".equals(metrica)) {
                        // Podemos obtener los registros recientes, por ejemplo del último mes
                        LocalDateTime unMesAtras = LocalDateTime.now().minus(1, ChronoUnit.MONTHS);
                        List<Transport> transportesRecientes = transportRepository.findByUserIdAndDateBetween(
                                currentUser.getId(), unMesAtras, LocalDateTime.now());

                        // Solo considerar vehículos de tipo "car"
                        valorActual = transportesRecientes.stream()
                                .filter(t -> "car".equals(t.getTransportType()))
                                .mapToDouble(Transport::getKilometers)
                                .sum();
                        logger.info("Valor actual para transporte (combustión reciente): {} km", valorActual);
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

        // Actualizar estado
        if (metaCompletada) {
            meta.setEstado("completada");
            logger.info("Meta ID {}: Meta completada", meta.getId());
        } else if (meta.getFechaFin().isBefore(LocalDateTime.now())) {
            meta.setEstado("fallida");
            logger.info("Meta ID {}: Meta fallida (fecha vencida)", meta.getId());
        } else {
            meta.setEstado("en_progreso");
            logger.info("Meta ID {}: Meta en progreso ({}% completado)", meta.getId(),
                    Math.min(100, Math.max(0, Math.round(progreso))));
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
     * Actualizar progreso de meta de transporte
     */
    private void updateTransportMetaProgress(Meta meta) {
        User user = meta.getUser();

        if ("reduccion_combustion".equals(meta.getMetrica())) {
            // Para metas de reducción de combustión

            // Obtener los datos de transporte del último mes
            LocalDateTime unMesAtras = LocalDateTime.now().minus(1, ChronoUnit.MONTHS);
            List<Transport> transportesUltimoMes = transportRepository.findByUserIdAndDateBetween(
                    user.getId(), unMesAtras, LocalDateTime.now());

            // Filtrar solo vehículos de combustión (cars)
            double totalKmUltimoMes = transportesUltimoMes.stream()
                    .filter(t -> "car".equals(t.getTransportType()))
                    .mapToDouble(Transport::getKilometers)
                    .sum();

            logger.info("Meta ID {}: Kilómetros en vehículos de combustión del último mes: {} km",
                    meta.getId(), totalKmUltimoMes);

            // Actualizar el valor actual con los kilómetros del último mes
            meta.setValorActual(totalKmUltimoMes);

            // Establecer un valor inicial adecuado si no existe o es muy bajo
            if (meta.getValorInicial() == null || meta.getValorInicial() < 1.0) {
                // Para una meta de reducción, el valor inicial debe ser mayor que el valor objetivo
                double valorInicial = Math.max(totalKmUltimoMes, meta.getValorObjetivo() * 1.2);
                meta.setValorInicial(valorInicial);
                logger.info("Meta ID {}: Estableciendo valor inicial adecuado: {} km",
                        meta.getId(), valorInicial);
            }
        }
        else if ("km_bicicleta".equals(meta.getMetrica()) || "uso_bicicleta".equals(meta.getMetrica())) {
            // Para metas específicas de uso de bicicleta

            // Obtener los datos de bicicleta del último mes
            LocalDateTime unMesAtras = LocalDateTime.now().minus(1, ChronoUnit.MONTHS);
            List<Transport> transportesBiciUltimoMes = transportRepository.findByUserIdAndTransportTypeAndDateBetween(
                    user.getId(), "bicycle", unMesAtras, LocalDateTime.now());

            // Calcular kilometraje de bicicleta del último mes
            double totalKmBiciUltimoMes = transportesBiciUltimoMes.stream()
                    .mapToDouble(Transport::getKilometers)
                    .sum();

            logger.info("Meta ID {}: Kilómetros en bicicleta del último mes: {} km",
                    meta.getId(), totalKmBiciUltimoMes);

            // Actualizar el valor actual
            meta.setValorActual(totalKmBiciUltimoMes);

            // Para metas de incremento, el valor inicial es 0
            if (meta.getValorInicial() == null || meta.getValorInicial() < 0) {
                meta.setValorInicial(0.0);
                logger.info("Meta ID {}: Estableciendo valor inicial para meta de incremento: 0 km",
                        meta.getId());
            }
        }
        else {
            // Para otras métricas o caso por defecto

            // Obtener el último registro de transporte (todos los tipos)
            LocalDateTime unMesAtras = LocalDateTime.now().minus(1, ChronoUnit.MONTHS);
            List<Transport> transportesUltimoMes = transportRepository.findByUserIdAndDateBetween(
                    user.getId(), unMesAtras, LocalDateTime.now());

            // Calcular kilometraje total del último mes
            double totalKmUltimoMes = transportesUltimoMes.stream()
                    .mapToDouble(Transport::getKilometers)
                    .sum();

            logger.info("Meta ID {}: Kilómetros totales del último mes: {} km",
                    meta.getId(), totalKmUltimoMes);

            // Actualizar el valor actual
            meta.setValorActual(totalKmUltimoMes);

            // Establecer valor inicial basado en si es reducción o incremento
            boolean esReduccion = isReductionMetric(meta.getTipo(), meta.getMetrica());

            if (meta.getValorInicial() == null || meta.getValorInicial() < 1.0) {
                if (esReduccion) {
                    // Para reducción, valor inicial > valor objetivo
                    double valorInicial = Math.max(totalKmUltimoMes, meta.getValorObjetivo() * 1.2);
                    meta.setValorInicial(valorInicial);
                } else {
                    // Para incremento, valor inicial = 0
                    meta.setValorInicial(0.0);
                }

                logger.info("Meta ID {}: Estableciendo valor inicial: {} km para meta de {}",
                        meta.getId(), meta.getValorInicial(), esReduccion ? "reducción" : "incremento");
            }
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

// En backend/src/main/java/com/lilim/ecotracker/features/metas/service/MetaServiceImp.java

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
}