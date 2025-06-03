package com.lilim.ecotracker.features.metas.service.recommendation;

import com.lilim.ecotracker.features.metas.dto.MetaRecommendationDTO;
import com.lilim.ecotracker.security.model.User;

import java.util.List;

/**
 * Interfaz base para servicios de generación de recomendaciones de metas
 * Define los contratos que deben cumplir los servicios especializados por tipo de consumo
 */
public interface MetaRecommendationService {

    /**
     * Genera recomendaciones personalizadas basadas en datos históricos del usuario
     * @param user Usuario para el que se generan las recomendaciones
     * @return Lista de recomendaciones personalizadas
     */
    List<MetaRecommendationDTO> generatePersonalizedRecommendations(User user);

    /**
     * Genera recomendaciones predeterminadas cuando no hay datos suficientes
     * @return Lista de recomendaciones predeterminadas
     */
    List<MetaRecommendationDTO> generateDefaultRecommendations();

    /**
     * Verifica si el servicio puede manejar el tipo de meta especificado
     * @param tipo Tipo de meta (agua, electricidad, transporte, combinada)
     * @return true si puede manejar el tipo, false en caso contrario
     */
    boolean canHandle(String tipo);

    /**
     * Calcula el ahorro potencial para un usuario en el tipo específico
     * @param user Usuario
     * @return Ahorro calculado en la moneda local
     */
    double calculatePotentialSavings(User user);
} 