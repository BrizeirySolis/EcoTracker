package com.lilim.ecotracker.features.metas.service.calculation;

import com.lilim.ecotracker.features.metas.model.Meta;
import com.lilim.ecotracker.features.summary.dto.ConsumptionAnalyticsDTO;
import com.lilim.ecotracker.features.summary.service.ConsumptionAnalyticsService;
import com.lilim.ecotracker.features.water.model.Water;
import com.lilim.ecotracker.features.water.repository.WaterRepository;
import com.lilim.ecotracker.security.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Servicio de cálculo específico para metas de agua
 * Maneja la lógica de actualización de progreso y cálculo de valores para consumo de agua
 */
@Service
public class WaterMetaCalculationService implements MetaProgressCalculationService {

    private static final Logger logger = LoggerFactory.getLogger(WaterMetaCalculationService.class);

    private final WaterRepository waterRepository;
    private final ConsumptionAnalyticsService analyticsService;

    @Autowired
    public WaterMetaCalculationService(
            WaterRepository waterRepository,
            ConsumptionAnalyticsService analyticsService) {
        this.waterRepository = waterRepository;
        this.analyticsService = analyticsService;
    }

    @Override
    public void updateProgress(Meta meta) {
        User user = meta.getUser();
        logger.info("Actualizando progreso de meta de agua ID: {}", meta.getId());

        if ("consumo_total".equals(meta.getMetrica())) {
            updateConsumoTotalProgress(meta, user);
        } else if ("benchmark".equals(meta.getMetrica())) {
            updateBenchmarkProgress(meta, user);
        } else if ("emisiones".equals(meta.getMetrica())) {
            updateEmisionesProgress(meta, user);
        } else {
            logger.warn("Meta ID {}: Métrica '{}' no reconocida para agua", meta.getId(), meta.getMetrica());
        }
    }

    @Override
    public Double obtenerValorInicial(User user, String metrica) {
        try {
            LocalDateTime ahora = LocalDateTime.now();
            LocalDateTime unMesAtras = ahora.minus(1, ChronoUnit.MONTHS);

            // Obtener solo el último registro de agua
            List<Water> ultimosConsumoAgua = waterRepository.findByUserIdOrderByDateDesc(user.getId());
            if (!ultimosConsumoAgua.isEmpty()) {
                Double valorActual = ultimosConsumoAgua.get(0).getLiters();
                logger.info("Valor inicial para agua (último registro): {} m³", valorActual);
                return valorActual;
            }
        } catch (Exception e) {
            logger.error("Error al obtener valor inicial para agua: {}", e.getMessage());
        }

        return 0.1; // Valor por defecto
    }

    @Override
    public Double obtenerValorActual(User user, String metrica) {
        // Buscar el último registro de consumo de agua
        List<Water> consumos = waterRepository.findByUserIdOrderByDateDesc(user.getId());
        if (!consumos.isEmpty()) {
            return consumos.get(0).getLiters();
        }
        return 0.0; // Valor por defecto si no hay datos
    }

    @Override
    public boolean canHandle(String tipo) {
        return "agua".equals(tipo);
    }

    @Override
    public boolean isReductionMetric(String metrica) {
        // La mayoría de métricas de agua son de reducción
        // Excepto benchmarks que pueden ser "mantener por debajo de"
        return !"benchmark".equals(metrica);
    }

    /**
     * Actualiza el progreso para métrica de consumo total
     */
    private void updateConsumoTotalProgress(Meta meta, User user) {
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

    /**
     * Actualiza el progreso para métrica de benchmark
     */
    private void updateBenchmarkProgress(Meta meta, User user) {
        // Usar datos del servicio de analytics
        ConsumptionAnalyticsDTO analytics = analyticsService.getWaterAnalytics(user);

        if (analytics.getBenchmark() != null) {
            double porcentaje = analytics.getBenchmark().getCurrentValue() / analytics.getBenchmark().getNationalAverage() * 100;
            meta.setValorActual(porcentaje);
            logger.info("Meta ID {}: Valor actual benchmark actualizado a {}%", meta.getId(), porcentaje);
        }
    }

    /**
     * Actualiza el progreso para métrica de emisiones
     */
    private void updateEmisionesProgress(Meta meta, User user) {
        ConsumptionAnalyticsDTO analytics = analyticsService.getWaterAnalytics(user);

        if (analytics.getCo2Metrics() != null) {
            meta.setValorActual(analytics.getCo2Metrics().getCo2Savings());
            logger.info("Meta ID {}: Valor actual emisiones actualizado a {} kg CO2", 
                    meta.getId(), meta.getValorActual());
        }
    }
} 