package com.lilim.ecotracker.features.metas.service.automation;

import com.lilim.ecotracker.features.metas.model.Meta;
import com.lilim.ecotracker.security.model.User;

import java.util.List;

/**
 * Interfaz base para servicios de automatización de metas
 * Define los contratos que deben cumplir los servicios especializados de automatización
 */
public interface MetaAutomationService {

    /**
     * Actualiza automáticamente el progreso de una meta individual
     * @param meta Meta a actualizar
     */
    void updateMetaProgress(Meta meta);

    /**
     * Actualiza todas las metas automáticas de un usuario específico
     * @param user Usuario
     * @return Número de metas actualizadas
     */
    int updateAllUserMetas(User user);

    /**
     * Actualiza metas automáticas de un tipo específico para un usuario
     * @param user Usuario
     * @param tipo Tipo de meta (agua, electricidad, transporte, combinada)
     * @return Lista de metas actualizadas
     */
    List<Meta> updateMetasByType(User user, String tipo);

    /**
     * Verifica si el servicio puede manejar el tipo de meta especificado
     * @param tipo Tipo de meta
     * @return true si puede manejar el tipo, false en caso contrario
     */
    boolean canHandle(String tipo);

    /**
     * Evalúa y actualiza el estado de una meta basándose en su progreso
     * @param meta Meta a evaluar
     * @return Nuevo estado de la meta
     */
    String evaluateMetaState(Meta meta);

    /**
     * Determina si una meta requiere actualización automática
     * @param meta Meta a verificar
     * @return true si necesita actualización, false en caso contrario
     */
    boolean requiresAutomaticUpdate(Meta meta);
} 