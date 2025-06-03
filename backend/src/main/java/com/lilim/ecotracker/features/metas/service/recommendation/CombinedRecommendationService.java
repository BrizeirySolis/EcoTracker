package com.lilim.ecotracker.features.metas.service.recommendation;

import com.lilim.ecotracker.features.metas.dto.MetaRecommendationDTO;
import com.lilim.ecotracker.features.summary.dto.ConsumptionAnalyticsDTO;
import com.lilim.ecotracker.features.summary.service.ConsumptionAnalyticsService;
import com.lilim.ecotracker.security.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * Servicio especializado para generar recomendaciones de metas combinadas
 * Combina datos de múltiples tipos de consumo para generar recomendaciones integradas
 */
@Service
public class CombinedRecommendationService implements MetaRecommendationService {

    private static final Logger logger = LoggerFactory.getLogger(CombinedRecommendationService.class);

    private final ConsumptionAnalyticsService analyticsService;
    private final WaterRecommendationService waterService;
    private final ElectricityRecommendationService electricityService;
    private final TransportRecommendationService transportService;

    @Autowired
    public CombinedRecommendationService(
            ConsumptionAnalyticsService analyticsService,
            WaterRecommendationService waterService,
            ElectricityRecommendationService electricityService,
            TransportRecommendationService transportService) {
        this.analyticsService = analyticsService;
        this.waterService = waterService;
        this.electricityService = electricityService;
        this.transportService = transportService;
    }

    @Override
    public List<MetaRecommendationDTO> generatePersonalizedRecommendations(User user) {
        List<MetaRecommendationDTO> recommendations = new ArrayList<>();

        try {
            // Obtener datos de análisis de agua y electricidad
            ConsumptionAnalyticsDTO waterAnalytics = analyticsService.getWaterAnalytics(user);
            ConsumptionAnalyticsDTO electricityAnalytics = analyticsService.getElectricityAnalytics(user);

            // Calcular ahorro total actual
            double ahorroAgua = waterService.calculatePotentialSavings(user);
            double ahorroElectricidad = electricityService.calculatePotentialSavings(user);
            double ahorroTransporte = transportService.calculatePotentialSavings(user);
            double ahorroTotal = ahorroAgua + ahorroElectricidad + ahorroTransporte;

            // Recomendación 1: Incrementar ahorro total
            double objetivoAhorro = Math.max(500, ahorroTotal * 1.5); // Al menos 500 MXN
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

            // Recomendación 4: Meta de reducción combinada específica
            if (ahorroTotal > 100) { // Solo si hay potencial de ahorro significativo
                recommendations.add(MetaRecommendationDTO.builder()
                        .descripcion("Reducir consumo total en 12%")
                        .valor(12.0)
                        .unidad("porcentaje")
                        .metrica("reduccion_total")
                        .build());
            }

        } catch (Exception e) {
            logger.error("Error generando recomendaciones personalizadas combinadas: {}", e.getMessage());
        }

        // Si no se generaron recomendaciones, usar predeterminadas
        if (recommendations.isEmpty()) {
            recommendations = generateDefaultRecommendations();
        }

        return recommendations;
    }

    @Override
    public List<MetaRecommendationDTO> generateDefaultRecommendations() {
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

        recommendations.add(MetaRecommendationDTO.builder()
                .descripcion("Reducir consumo total en 10%")
                .valor(10.0)
                .unidad("porcentaje")
                .metrica("reduccion_total")
                .build());

        return recommendations;
    }

    @Override
    public boolean canHandle(String tipo) {
        return "combinada".equals(tipo);
    }

    @Override
    public double calculatePotentialSavings(User user) {
        try {
            // Combinar ahorros potenciales de todos los servicios
            double ahorroAgua = waterService.calculatePotentialSavings(user);
            double ahorroElectricidad = electricityService.calculatePotentialSavings(user);
            double ahorroTransporte = transportService.calculatePotentialSavings(user);

            // Agregar un bonus del 5% por combinar múltiples estrategias
            double ahorroTotal = ahorroAgua + ahorroElectricidad + ahorroTransporte;
            double bonusCombinado = ahorroTotal * 0.05;

            logger.info("Ahorro potencial combinado: Agua={}, Electricidad={}, Transporte={}, Bonus={}, Total={}",
                    ahorroAgua, ahorroElectricidad, ahorroTransporte, bonusCombinado, ahorroTotal + bonusCombinado);

            return ahorroTotal + bonusCombinado;

        } catch (Exception e) {
            logger.error("Error calculando ahorros potenciales combinados: {}", e.getMessage());
        }

        return 0.0;
    }
} 