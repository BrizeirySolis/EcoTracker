package com.lilim.ecotracker.features.metas.service.recommendation;

import com.lilim.ecotracker.features.metas.dto.MetaRecommendationDTO;
import com.lilim.ecotracker.features.summary.dto.ConsumptionAnalyticsDTO;
import com.lilim.ecotracker.features.summary.service.ConsumptionAnalyticsService;
import com.lilim.ecotracker.security.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Servicio especializado para generar recomendaciones de metas de electricidad
 * Analiza el consumo histórico y genera recomendaciones personalizadas
 */
@Service
public class ElectricityRecommendationService implements MetaRecommendationService {

    private static final Logger logger = LoggerFactory.getLogger(ElectricityRecommendationService.class);

    private final ConsumptionAnalyticsService analyticsService;

    @Autowired
    public ElectricityRecommendationService(ConsumptionAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @Override
    public List<MetaRecommendationDTO> generatePersonalizedRecommendations(User user) {
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
            logger.error("Error generando recomendaciones personalizadas de electricidad: {}", e.getMessage());
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

    @Override
    public boolean canHandle(String tipo) {
        return "electricidad".equals(tipo);
    }

    @Override
    public double calculatePotentialSavings(User user) {
        try {
            ConsumptionAnalyticsDTO analytics = analyticsService.getElectricityAnalytics(user);

            // Calcular ahorro potencial basado en reducción del 15%
            if (analytics.getCostMetrics() != null) {
                double costUnitDifference = analytics.getCostMetrics().getHistoricalAverageUnitCost() -
                        analytics.getCostMetrics().getUnitCost();

                if (analytics.getBimonthlyConsumption() != null) {
                    double currentConsumption = analytics.getBimonthlyConsumption().getCurrentValue();
                    double potentialSavings = currentConsumption * 0.15 * analytics.getCostMetrics().getUnitCost();
                    return Math.max(0, potentialSavings + (costUnitDifference * currentConsumption));
                }
            }
        } catch (Exception e) {
            logger.error("Error calculando ahorros potenciales de electricidad: {}", e.getMessage());
        }

        return 0.0;
    }
} 