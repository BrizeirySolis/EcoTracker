package com.lilim.ecotracker.features.metas.service.automation;

import com.lilim.ecotracker.features.metas.model.Meta;
import com.lilim.ecotracker.features.metas.repository.MetaRepository;
import com.lilim.ecotracker.features.metas.service.recommendation.MetaRecommendationCoordinator;
import com.lilim.ecotracker.features.summary.dto.ConsumptionAnalyticsDTO;
import com.lilim.ecotracker.features.summary.service.ConsumptionAnalyticsService;
import com.lilim.ecotracker.security.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Servicio de automatización específico para metas combinadas
 * Maneja lógica compleja que integra múltiples tipos de consumo
 */
@Service
public class CombinedMetaAutomationService implements MetaAutomationService {

    private static final Logger logger = LoggerFactory.getLogger(CombinedMetaAutomationService.class);

    private final MetaRepository metaRepository;
    private final ConsumptionAnalyticsService analyticsService;
    private final MetaRecommendationCoordinator recommendationCoordinator;

    @Autowired
    public CombinedMetaAutomationService(
            MetaRepository metaRepository,
            ConsumptionAnalyticsService analyticsService,
            MetaRecommendationCoordinator recommendationCoordinator) {
        this.metaRepository = metaRepository;
        this.analyticsService = analyticsService;
        this.recommendationCoordinator = recommendationCoordinator;
    }

    @Override
    public void updateMetaProgress(Meta meta) {
        if (!requiresAutomaticUpdate(meta)) {
            logger.debug("Meta combinada ID {} no requiere actualización automática", meta.getId());
            return;
        }

        try {
            logger.info("Actualizando progreso de meta combinada ID: {}, métrica: {}", 
                    meta.getId(), meta.getMetrica());

            User user = meta.getUser();
            String metrica = meta.getMetrica();

            // Actualizar según el tipo de métrica combinada
            switch (metrica) {
                case "huella_carbono":
                    updateHuellaCarbono(meta, user);
                    break;
                case "ahorro_total":
                    updateAhorroTotal(meta, user);
                    break;
                case "sostenibilidad":
                    updateIndiceSostenibilidad(meta, user);
                    break;
                case "reduccion_total":
                    updateReduccionTotal(meta, user);
                    break;
                default:
                    logger.warn("Métrica combinada '{}' no reconocida para meta ID {}", 
                            metrica, meta.getId());
                    return;
            }

            // Evaluar y actualizar el estado
            String nuevoEstado = evaluateMetaState(meta);
            meta.setEstado(nuevoEstado);

            // Actualizar timestamp
            meta.setUpdatedAt(LocalDateTime.now());

            logger.info("Meta combinada ID {} actualizada exitosamente. Nuevo estado: {}", 
                    meta.getId(), nuevoEstado);

        } catch (Exception e) {
            logger.error("Error al actualizar meta combinada ID {}: {}", 
                    meta.getId(), e.getMessage(), e);
        }
    }

    @Override
    public int updateAllUserMetas(User user) {
        List<Meta> metasCombinadas = metaRepository.findByUserIdAndTipoAndTipoEvaluacionAndEstado(
                user.getId(), "combinada", "automatica", "en_progreso");

        int updated = 0;
        for (Meta meta : metasCombinadas) {
            try {
                updateMetaProgress(meta);
                metaRepository.save(meta);
                updated++;
            } catch (Exception e) {
                logger.error("Error actualizando meta combinada ID {}: {}", meta.getId(), e.getMessage());
            }
        }

        logger.info("Actualizadas {} metas combinadas para usuario {}", updated, user.getUsername());
        return updated;
    }

    @Override
    public List<Meta> updateMetasByType(User user, String tipo) {
        if (!"combinada".equals(tipo)) {
            logger.warn("Tipo '{}' no es manejado por este servicio de metas combinadas", tipo);
            return new ArrayList<>();
        }

        return new ArrayList<>(updateAllUserMetas(user)); // Usar el método de actualización masiva
    }

    @Override
    public boolean canHandle(String tipo) {
        return "combinada".equals(tipo);
    }

    @Override
    public String evaluateMetaState(Meta meta) {
        LocalDateTime hoy = LocalDateTime.now();
        LocalDateTime fechaFin = meta.getFechaFin();
        boolean fechaVencida = fechaFin != null && fechaFin.isBefore(hoy);
        
        if (meta.getValorActual() == null || meta.getValorObjetivo() == null) {
            return "en_progreso"; // Si faltan datos, asumir en progreso
        }

        // Para metas combinadas, generalmente son de incremento (mejora)
        boolean esIncremento = isIncrementMetric(meta.getMetrica());
        
        if (esIncremento) {
            // Meta de incremento: más es mejor
            if (meta.getValorActual() >= meta.getValorObjetivo()) {
                return "completada"; // Se alcanzó el objetivo
            }
            
            if (fechaVencida) {
                return "fallida"; // No se alcanzó y ya venció
            }
            
            return "en_progreso";
        } else {
            // Meta de reducción: menos es mejor
            if (meta.getValorActual() <= meta.getValorObjetivo()) {
                return "completada"; // Se alcanzó el objetivo
            }
            
            if (fechaVencida) {
                return "fallida"; // No se alcanzó y ya venció
            }
            
            return "en_progreso";
        }
    }

    @Override
    public boolean requiresAutomaticUpdate(Meta meta) {
        return meta != null && 
               "automatica".equals(meta.getTipoEvaluacion()) &&
               "en_progreso".equals(meta.getEstado()) &&
               "combinada".equals(meta.getTipo());
    }

    /**
     * Actualiza la métrica de huella de carbono combinada
     */
    private void updateHuellaCarbono(Meta meta, User user) {
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
            logger.info("Meta ID {}: Huella de carbono actualizada a {} kg CO2", 
                    meta.getId(), totalSavings);

        } catch (Exception e) {
            logger.error("Error calculando huella de carbono para meta ID {}: {}", 
                    meta.getId(), e.getMessage());
        }
    }

    /**
     * Actualiza la métrica de ahorro total
     */
    private void updateAhorroTotal(Meta meta, User user) {
        try {
            double ahorroTotal = recommendationCoordinator.calculatePotentialSavingsForType("combinada", user);
            meta.setValorActual(ahorroTotal);
            logger.info("Meta ID {}: Ahorro total actualizado a {} MXN", 
                    meta.getId(), ahorroTotal);
        } catch (Exception e) {
            logger.error("Error calculando ahorro total para meta ID {}: {}", 
                    meta.getId(), e.getMessage());
        }
    }

    /**
     * Actualiza el índice de sostenibilidad
     */
    private void updateIndiceSostenibilidad(Meta meta, User user) {
        try {
            // Calcular un índice basado en múltiples factores
            ConsumptionAnalyticsDTO waterAnalytics = analyticsService.getWaterAnalytics(user);
            ConsumptionAnalyticsDTO electricityAnalytics = analyticsService.getElectricityAnalytics(user);

            double indiceSostenibilidad = 0;
            int factores = 0;

            // Factor agua (benchmark)
            if (waterAnalytics.getBenchmark() != null) {
                double ratioAgua = waterAnalytics.getBenchmark().getNationalAverage() / 
                                  waterAnalytics.getBenchmark().getCurrentValue();
                indiceSostenibilidad += Math.min(100, ratioAgua * 50); // Máximo 50 puntos
                factores++;
            }

            // Factor electricidad (benchmark)
            if (electricityAnalytics.getBenchmark() != null) {
                double ratioElectricidad = electricityAnalytics.getBenchmark().getNationalAverage() / 
                                          electricityAnalytics.getBenchmark().getCurrentValue();
                indiceSostenibilidad += Math.min(50, ratioElectricidad * 50); // Máximo 50 puntos
                factores++;
            }

            if (factores > 0) {
                // Normalizar a escala 0-100
                indiceSostenibilidad = Math.min(100, indiceSostenibilidad);
                meta.setValorActual(indiceSostenibilidad);
                logger.info("Meta ID {}: Índice de sostenibilidad actualizado a {}", 
                        meta.getId(), indiceSostenibilidad);
            }

        } catch (Exception e) {
            logger.error("Error calculando índice de sostenibilidad para meta ID {}: {}", 
                    meta.getId(), e.getMessage());
        }
    }

    /**
     * Actualiza la métrica de reducción total
     */
    private void updateReduccionTotal(Meta meta, User user) {
        try {
            // Calcular reducción promedio ponderada
            ConsumptionAnalyticsDTO waterAnalytics = analyticsService.getWaterAnalytics(user);
            ConsumptionAnalyticsDTO electricityAnalytics = analyticsService.getElectricityAnalytics(user);

            double reduccionTotal = 0;
            int factores = 0;

            // Reducción en agua
            if (waterAnalytics.getBimonthlyConsumption() != null) {
                double reduccionAgua = calculateReductionPercentage(waterAnalytics);
                reduccionTotal += reduccionAgua;
                factores++;
            }

            // Reducción en electricidad
            if (electricityAnalytics.getBimonthlyConsumption() != null) {
                double reduccionElectricidad = calculateReductionPercentage(electricityAnalytics);
                reduccionTotal += reduccionElectricidad;
                factores++;
            }

            if (factores > 0) {
                reduccionTotal = reduccionTotal / factores; // Promedio
                meta.setValorActual(reduccionTotal);
                logger.info("Meta ID {}: Reducción total actualizada a {}%", 
                        meta.getId(), reduccionTotal);
            }

        } catch (Exception e) {
            logger.error("Error calculando reducción total para meta ID {}: {}", 
                    meta.getId(), e.getMessage());
        }
    }

    /**
     * Calcula el porcentaje de reducción basado en analytics
     */
    private double calculateReductionPercentage(ConsumptionAnalyticsDTO analytics) {
        if (analytics.getBenchmark() == null) {
            return 0.0;
        }

        double actual = analytics.getBenchmark().getCurrentValue();
        double promedio = analytics.getBenchmark().getNationalAverage();

        if (promedio > 0) {
            return Math.max(0, (promedio - actual) / promedio * 100);
        }

        return 0.0;
    }

    /**
     * Determina si una métrica combinada es de incremento
     */
    private boolean isIncrementMetric(String metrica) {
        return "sostenibilidad".equals(metrica) || 
               "ahorro_total".equals(metrica) ||
               "reduccion_total".equals(metrica);
    }
} 