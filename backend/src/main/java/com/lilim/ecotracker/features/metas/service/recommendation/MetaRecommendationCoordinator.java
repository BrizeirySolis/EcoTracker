package com.lilim.ecotracker.features.metas.service.recommendation;

import com.lilim.ecotracker.features.metas.dto.MetaRecommendationDTO;
import com.lilim.ecotracker.security.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Servicio coordinador que orquesta las llamadas a los servicios de recomendaciones especializados
 * Actúa como punto de entrada único para todas las operaciones de generación de recomendaciones de metas
 */
@Service
public class MetaRecommendationCoordinator {

    private static final Logger logger = LoggerFactory.getLogger(MetaRecommendationCoordinator.class);

    private final List<MetaRecommendationService> recommendationServices;

    @Autowired
    public MetaRecommendationCoordinator(List<MetaRecommendationService> recommendationServices) {
        this.recommendationServices = recommendationServices;
    }

    /**
     * Genera recomendaciones para un tipo específico de meta
     * @param tipo Tipo de meta (agua, electricidad, transporte, combinada)
     * @param user Usuario para el que se generan las recomendaciones
     * @return Mapa con las recomendaciones generadas
     */
    public Map<String, List<MetaRecommendationDTO>> getRecommendationsForTipo(String tipo, User user) {
        logger.info("Generando recomendaciones para tipo '{}' y usuario '{}'", tipo, user.getUsername());

        List<MetaRecommendationDTO> recommendations = new ArrayList<>();

        try {
            MetaRecommendationService service = findServiceForType(tipo);
            if (service != null) {
                logger.info("Delegando generación de recomendaciones al servicio {}", 
                        service.getClass().getSimpleName());
                recommendations = service.generatePersonalizedRecommendations(user);
            } else {
                logger.warn("No se encontró servicio de recomendaciones para tipo: {}", tipo);
                recommendations = generateDefaultRecommendationsForType(tipo);
            }
        } catch (Exception e) {
            logger.error("Error generando recomendaciones para tipo {}: {}", tipo, e.getMessage());
            recommendations = generateDefaultRecommendationsForType(tipo);
        }

        Map<String, List<MetaRecommendationDTO>> result = new HashMap<>();
        result.put("recommendations", recommendations);
        return result;
    }

    /**
     * Calcula el ahorro potencial para un tipo específico de meta
     * @param tipo Tipo de meta
     * @param user Usuario
     * @return Ahorro potencial calculado
     */
    public double calculatePotentialSavingsForType(String tipo, User user) {
        MetaRecommendationService service = findServiceForType(tipo);
        if (service != null) {
            logger.info("Delegando cálculo de ahorros para tipo {} al servicio {}", 
                    tipo, service.getClass().getSimpleName());
            return service.calculatePotentialSavings(user);
        } else {
            logger.error("No se encontró servicio de cálculo de ahorros para tipo: {}", tipo);
            return 0.0;
        }
    }

    /**
     * Obtiene recomendaciones combinadas de todos los tipos disponibles
     * @param user Usuario
     * @return Mapa con recomendaciones de todos los tipos
     */
    public Map<String, Map<String, List<MetaRecommendationDTO>>> getAllRecommendations(User user) {
        Map<String, Map<String, List<MetaRecommendationDTO>>> allRecommendations = new HashMap<>();

        // Obtener recomendaciones para cada tipo
        allRecommendations.put("agua", getRecommendationsForTipo("agua", user));
        allRecommendations.put("electricidad", getRecommendationsForTipo("electricidad", user));
        allRecommendations.put("transporte", getRecommendationsForTipo("transporte", user));
        allRecommendations.put("combinada", getRecommendationsForTipo("combinada", user));

        return allRecommendations;
    }

    /**
     * Busca el servicio de recomendaciones apropiado para un tipo de meta
     * @param tipo Tipo de meta
     * @return Servicio de recomendaciones o null si no se encuentra
     */
    private MetaRecommendationService findServiceForType(String tipo) {
        return recommendationServices.stream()
                .filter(service -> service.canHandle(tipo))
                .findFirst()
                .orElse(null);
    }

    /**
     * Genera recomendaciones predeterminadas para un tipo específico
     * @param tipo Tipo de meta
     * @return Lista de recomendaciones predeterminadas
     */
    private List<MetaRecommendationDTO> generateDefaultRecommendationsForType(String tipo) {
        List<MetaRecommendationDTO> recommendations = new ArrayList<>();

        switch (tipo) {
            case "agua":
                recommendations.add(MetaRecommendationDTO.builder()
                        .descripcion("Reducir consumo de agua un 10%")
                        .valor(10.0)
                        .unidad("porcentaje")
                        .metrica("consumo_total")
                        .build());
                break;
            case "electricidad":
                recommendations.add(MetaRecommendationDTO.builder()
                        .descripcion("Reducir consumo eléctrico un 10%")
                        .valor(10.0)
                        .unidad("porcentaje")
                        .metrica("consumo_total")
                        .build());
                break;
            case "transporte":
                recommendations.add(MetaRecommendationDTO.builder()
                        .descripcion("Reducir el uso de auto un 10%")
                        .valor(10.0)
                        .unidad("porcentaje")
                        .metrica("reduccion_combustion")
                        .build());
                break;
            case "combinada":
                recommendations.add(MetaRecommendationDTO.builder()
                        .descripcion("Reducir huella de carbono un 10%")
                        .valor(10.0)
                        .unidad("porcentaje")
                        .metrica("huella_carbono")
                        .build());
                break;
            default:
                recommendations.add(MetaRecommendationDTO.builder()
                        .descripcion("Meta personalizada")
                        .valor(100.0)
                        .unidad("unidad")
                        .metrica("personalizada")
                        .build());
        }

        return recommendations;
    }
} 