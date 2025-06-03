package com.lilim.ecotracker.features.metas.service.calculation;

import com.lilim.ecotracker.features.electricity.model.Electricity;
import com.lilim.ecotracker.features.electricity.repository.ElectricityRepository;
import com.lilim.ecotracker.features.metas.model.Meta;
import com.lilim.ecotracker.features.summary.dto.ConsumptionAnalyticsDTO;
import com.lilim.ecotracker.features.summary.service.ConsumptionAnalyticsService;
import com.lilim.ecotracker.security.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Servicio de cálculo específico para metas de electricidad
 * Maneja la lógica de actualización de progreso y cálculo de valores para consumo de electricidad
 */
@Service
public class ElectricityMetaCalculationService implements MetaProgressCalculationService {

    private static final Logger logger = LoggerFactory.getLogger(ElectricityMetaCalculationService.class);

    private final ElectricityRepository electricityRepository;
    private final ConsumptionAnalyticsService analyticsService;

    @Autowired
    public ElectricityMetaCalculationService(
            ElectricityRepository electricityRepository,
            ConsumptionAnalyticsService analyticsService) {
        this.electricityRepository = electricityRepository;
        this.analyticsService = analyticsService;
    }

    @Override
    public void updateProgress(Meta meta) {
        User user = meta.getUser();
        logger.info("Actualizando progreso de meta de electricidad ID: {}", meta.getId());

        if ("consumo_total".equals(meta.getMetrica())) {
            updateConsumoTotalProgress(meta, user);
        } else if ("benchmark".equals(meta.getMetrica())) {
            updateBenchmarkProgress(meta, user);
        } else if ("emisiones".equals(meta.getMetrica())) {
            updateEmisionesProgress(meta, user);
        } else {
            logger.warn("Meta ID {}: Métrica '{}' no reconocida para electricidad", meta.getId(), meta.getMetrica());
        }
    }

    @Override
    public Double obtenerValorInicial(User user, String metrica) {
        try {
            // Obtener solo el último registro de electricidad
            List<Electricity> ultimosConsumoElectricidad = electricityRepository.findByUserIdOrderByDateDesc(user.getId());
            if (!ultimosConsumoElectricidad.isEmpty()) {
                Double valorActual = ultimosConsumoElectricidad.get(0).getKilowatts();
                logger.info("Valor inicial para electricidad (último registro): {} kWh", valorActual);
                return valorActual;
            }
        } catch (Exception e) {
            logger.error("Error al obtener valor inicial para electricidad: {}", e.getMessage());
        }

        return 0.1; // Valor por defecto
    }

    @Override
    public Double obtenerValorActual(User user, String metrica) {
        // Buscar el último registro de consumo de electricidad
        List<Electricity> consumos = electricityRepository.findByUserIdOrderByDateDesc(user.getId());
        if (!consumos.isEmpty()) {
            return consumos.get(0).getKilowatts();
        }
        return 0.0; // Valor por defecto si no hay datos
    }

    @Override
    public boolean canHandle(String tipo) {
        return "electricidad".equals(tipo);
    }

    @Override
    public boolean isReductionMetric(String metrica) {
        // La mayoría de métricas de electricidad son de reducción
        // Excepto benchmarks que pueden ser "mantener por debajo de"
        return !"benchmark".equals(metrica);
    }

    /**
     * Actualiza el progreso para métrica de consumo total
     */
    private void updateConsumoTotalProgress(Meta meta, User user) {
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

    /**
     * Actualiza el progreso para métrica de benchmark
     */
    private void updateBenchmarkProgress(Meta meta, User user) {
        ConsumptionAnalyticsDTO analytics = analyticsService.getElectricityAnalytics(user);

        if (analytics.getBenchmark() != null) {
            double porcentaje = analytics.getBenchmark().getCurrentValue() / analytics.getBenchmark().getNationalAverage() * 100;
            meta.setValorActual(porcentaje);

            // Si no hay valor inicial, usar el valor actual
            if (meta.getValorInicial() == null || meta.getValorInicial() == 0) {
                meta.setValorInicial(porcentaje);
                logger.info("Meta ID {}: Estableciendo valor inicial benchmark: {}",
                        meta.getId(), meta.getValorInicial());
            }
            logger.info("Meta ID {}: Valor actual benchmark actualizado a {}%", meta.getId(), porcentaje);
        }
    }

    /**
     * Actualiza el progreso para métrica de emisiones
     */
    private void updateEmisionesProgress(Meta meta, User user) {
        ConsumptionAnalyticsDTO analytics = analyticsService.getElectricityAnalytics(user);

        if (analytics.getCo2Metrics() != null) {
            double emisionesActuales = analytics.getCo2Metrics().getCo2Savings();
            meta.setValorActual(emisionesActuales);

            // Si no hay valor inicial, usar el valor actual
            if (meta.getValorInicial() == null || meta.getValorInicial() == 0) {
                meta.setValorInicial(emisionesActuales);
                logger.info("Meta ID {}: Estableciendo valor inicial para emisiones: {}",
                        meta.getId(), meta.getValorInicial());
            }
            logger.info("Meta ID {}: Valor actual emisiones actualizado a {} kg CO2", 
                    meta.getId(), emisionesActuales);
        }
    }
} 