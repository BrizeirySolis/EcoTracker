package com.lilim.ecotracker.features.metas.repository;

import com.lilim.ecotracker.features.metas.model.Meta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repositorio para operaciones CRUD con la entidad Meta
 */
@Repository
public interface MetaRepository extends JpaRepository<Meta, Long> {

    /**
     * Encuentra todas las metas de un usuario ordenadas por fecha de creación descendente
     *
     * @param userId ID del usuario
     * @return Lista de metas
     */
    List<Meta> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Encuentra todas las metas de un usuario filtradas por tipo y ordenadas por fecha de creación
     *
     * @param userId ID del usuario
     * @param tipo   Tipo de meta (agua, electricidad, etc.)
     * @return Lista de metas filtradas
     */
    List<Meta> findByUserIdAndTipoOrderByCreatedAtDesc(Long userId, String tipo);

    /**
     * Encuentra una meta específica para un usuario
     *
     * @param id     ID de la meta
     * @param userId ID del usuario
     * @return Meta si existe
     */
    Optional<Meta> findByIdAndUserId(Long id, Long userId);

    /**
     * Comprueba si una meta existe y pertenece a un usuario específico
     *
     * @param id     ID de la meta
     * @param userId ID del usuario
     * @return true si existe y pertenece al usuario
     */
    boolean existsByIdAndUserId(Long id, Long userId);

    /**
     * Encuentra metas por tipo de evaluación y estado
     * Útil para actualizar automáticamente metas que requieren evaluación automática
     *
     * @param tipoEvaluacion Tipo de evaluación (automática o manual)
     * @param estado         Estado de la meta (en_progreso, completada, fallida)
     * @return Lista de metas
     */
    List<Meta> findByTipoEvaluacionAndEstado(String tipoEvaluacion, String estado);

    /**
     * Encuentra metas que están próximas a vencer
     * Útil para notificar a los usuarios de metas que necesitan atención
     *
     * @param fechaLimite Fecha límite (usualmente fecha actual + X días)
     * @param estado      Estado de la meta (normalmente "en_progreso")
     * @return Lista de metas próximas a vencer
     */
    List<Meta> findByFechaFinBeforeAndEstado(LocalDateTime fechaLimite, String estado);

    /**
     * Encuentra todas las metas de un usuario en un rango de fechas
     *
     * @param userId      ID del usuario
     * @param fechaInicio Fecha de inicio
     * @param fechaFin    Fecha de fin
     * @return Lista de metas dentro del rango
     */
    List<Meta> findByUserIdAndFechaInicioBetween(Long userId, LocalDateTime fechaInicio, LocalDateTime fechaFin);

    // En backend/src/main/java/com/lilim/ecotracker/features/metas/repository/MetaRepository.java

    /**
     * Encuentra metas por tipo, tipo de evaluación y estado
     *
     * @param tipo           Tipo de meta (agua, electricidad, etc.)
     * @param tipoEvaluacion Tipo de evaluación (automática o manual)
     * @param estado         Estado de la meta (en_progreso, completada, fallida)
     * @return Lista de metas
     */
    List<Meta> findByTipoAndTipoEvaluacionAndEstado(String tipo, String tipoEvaluacion, String estado);

    List<Meta> findByTipoAndTipoEvaluacionAndEstadoAndUserId(String tipo, String automatica, String enProgreso, Long id);
}