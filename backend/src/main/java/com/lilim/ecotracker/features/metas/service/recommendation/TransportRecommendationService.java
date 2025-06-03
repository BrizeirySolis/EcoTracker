package com.lilim.ecotracker.features.metas.service.recommendation;

import com.lilim.ecotracker.features.metas.dto.MetaRecommendationDTO;
import com.lilim.ecotracker.features.transport.model.Transport;
import com.lilim.ecotracker.features.transport.repository.TransportRepository;
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
 * Servicio especializado para generar recomendaciones de metas de transporte
 * Analiza el historial de transporte y genera recomendaciones personalizadas
 */
@Service
public class TransportRecommendationService implements MetaRecommendationService {

    private static final Logger logger = LoggerFactory.getLogger(TransportRecommendationService.class);

    private final TransportRepository transportRepository;

    @Autowired
    public TransportRecommendationService(TransportRepository transportRepository) {
        this.transportRepository = transportRepository;
    }

    @Override
    public List<MetaRecommendationDTO> generatePersonalizedRecommendations(User user) {
        List<MetaRecommendationDTO> recommendations = new ArrayList<>();

        try {
            // Obtener datos de transporte de los últimos 3 meses
            LocalDateTime startDate = LocalDateTime.now().minus(3, ChronoUnit.MONTHS);
            List<Transport> transportes = transportRepository.findByUserIdAndDateBetween(
                    user.getId(), startDate, LocalDateTime.now());

            if (!transportes.isEmpty()) {
                // Calcular kilómetros actuales en auto
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
                }

                // Agregar recomendaciones de transporte sostenible
                double kmTotales = transportes.stream()
                        .mapToDouble(Transport::getKilometers)
                        .sum();

                if (kmTotales > 0) {
                    double kmSostenibles = transportes.stream()
                            .filter(t -> "bicycle".equals(t.getTransportType()) || "walk".equals(t.getTransportType()))
                            .mapToDouble(Transport::getKilometers)
                            .sum();

                    double porcentajeActual = (kmSostenibles / kmTotales) * 100;

                    // Recomendación para incrementar transporte sostenible
                    //double objetivoPorcentaje = Math.min(100, porcentajeActual + 20); // Incrementar 20%
                    //recommendations.add(MetaRecommendationDTO.builder()
                            //.descripcion("Usar transporte sostenible " + Math.round(objetivoPorcentaje) + "% del tiempo")
                            //.valor(objetivoPorcentaje)
                            //.unidad("porcentaje")
                            //.metrica("porcentaje_sostenible")
                            //.build());
                }
            }
        } catch (Exception e) {
            logger.error("Error generando recomendaciones personalizadas de transporte: {}", e.getMessage());
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

        recommendations.add(MetaRecommendationDTO.builder()
                .descripcion("Usar transporte sostenible 50% del tiempo")
                .valor(50.0)
                .unidad("porcentaje")
                .metrica("porcentaje_sostenible")
                .build());

        return recommendations;
    }

    @Override
    public boolean canHandle(String tipo) {
        return "transporte".equals(tipo);
    }

    @Override
    public double calculatePotentialSavings(User user) {
        try {
            // Obtener datos de los últimos 3 meses
            LocalDateTime startDate = LocalDateTime.now().minus(3, ChronoUnit.MONTHS);
            List<Transport> transportes = transportRepository.findByUserIdAndDateBetween(
                    user.getId(), startDate, LocalDateTime.now());

            if (!transportes.isEmpty()) {
                // Calcular ahorro potencial del uso de transporte sostenible
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

                // Estimar ahorro adicional por incrementar 20% el transporte sostenible
                double kmTotales = transportes.stream()
                        .mapToDouble(Transport::getKilometers)
                        .sum();

                double ahorroAdicional = (kmTotales * 0.2) * costoPorKm; // 20% más de uso sostenible

                return Math.max(0, kmSostenible * costoPorKm + ahorroAdicional);
            }
        } catch (Exception e) {
            logger.error("Error calculando ahorros potenciales de transporte: {}", e.getMessage());
        }

        return 0.0;
    }
} 