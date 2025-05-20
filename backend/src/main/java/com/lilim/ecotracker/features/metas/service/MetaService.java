package com.lilim.ecotracker.features.metas.service;

import com.lilim.ecotracker.features.metas.dto.MetaDTO;
import com.lilim.ecotracker.features.metas.dto.MetaRecommendationDTO;
import com.lilim.ecotracker.features.metas.model.Meta;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Interfaz de servicio para operaciones con metas ambientales
 */
public interface MetaService {
    
    /**
     * Obtener todas las metas del usuario actual
     * @return Lista de metas
     */
    List<MetaDTO> getAllMetas();
    
    /**
     * Obtener metas filtradas por tipo
     * @param tipo Tipo de meta (agua, electricidad, etc.)
     * @return Lista de metas del tipo especificado
     */
    List<MetaDTO> getMetasByTipo(String tipo);
    
    /**
     * Obtener una meta específica por ID
     * @param id ID de la meta
     * @return Meta si existe
     */
    Optional<MetaDTO> getMetaById(Long id);
    
    /**
     * Crear una nueva meta
     * @param metaDTO Datos de la meta
     * @return Meta creada
     */
    MetaDTO createMeta(MetaDTO metaDTO);
    
    /**
     * Actualizar una meta existente
     * @param id ID de la meta
     * @param metaDTO Datos actualizados
     * @return Meta actualizada
     * @throws IllegalArgumentException si la meta no existe o no pertenece al usuario actual
     */
    MetaDTO updateMeta(Long id, MetaDTO metaDTO) throws IllegalArgumentException;
    
    /**
     * Actualizar sólo el progreso de una meta
     * @param id ID de la meta
     * @param valorActual Nuevo valor actual
     * @return Meta actualizada
     * @throws IllegalArgumentException si la meta no existe o no pertenece al usuario actual
     */
    MetaDTO updateMetaProgreso(Long id, double valorActual) throws IllegalArgumentException;
    
    /**
     * Eliminar una meta
     * @param id ID de la meta
     * @return true si se eliminó correctamente
     */
    boolean deleteMeta(Long id);
    
    /**
     * Obtener recomendaciones para crear metas basadas en datos históricos
     * @param tipo Tipo de meta
     * @return Mapa con recomendaciones
     */
    Map<String, List<MetaRecommendationDTO>> getRecommendationsForTipo(String tipo);

    @Transactional
    void updateAllAutomaticMetas();

    void updateAutomaticProgress(Meta meta);

    /**
     * Actualiza todas las metas automáticas de un tipo específico
     * @param tipo Tipo de meta a actualizar (agua, electricidad, transporte, etc.)
     */
    @Transactional
    List<MetaDTO> updateAutomaticMetasForType(String tipo);
}