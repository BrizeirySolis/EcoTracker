package com.lilim.ecotracker.features.metas.service.automation;

import com.lilim.ecotracker.features.metas.model.Meta;
import com.lilim.ecotracker.features.metas.repository.MetaRepository;
import com.lilim.ecotracker.features.metas.service.calculation.MetaCalculationCoordinator;
import com.lilim.ecotracker.security.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Servicio de automatización para metas estándar (agua, electricidad, transporte)
 * Maneja la actualización automática de progreso y evaluación de estados
 */
@Service
public class StandardMetaAutomationService implements MetaAutomationService {

    private static final Logger logger = LoggerFactory.getLogger(StandardMetaAutomationService.class);

    private final MetaRepository metaRepository;
    private final MetaCalculationCoordinator calculationCoordinator;

    @Autowired
    public StandardMetaAutomationService(
            MetaRepository metaRepository,
            MetaCalculationCoordinator calculationCoordinator) {
        this.metaRepository = metaRepository;
        this.calculationCoordinator = calculationCoordinator;
    }

    @Override
    public void updateMetaProgress(Meta meta) {
        if (!requiresAutomaticUpdate(meta)) {
            logger.debug("Meta ID {} no requiere actualización automática", meta.getId());
            return;
        }

        try {
            logger.info("Actualizando progreso automático de meta ID: {}, tipo: {}", 
                    meta.getId(), meta.getTipo());

            // Delegar al coordinador de cálculos para actualizar el progreso
            calculationCoordinator.updateMetaProgress(meta);

            // Evaluar y actualizar el estado
            String nuevoEstado = evaluateMetaState(meta);
            meta.setEstado(nuevoEstado);

            // Actualizar timestamp de última modificación
            meta.setUpdatedAt(LocalDateTime.now());

            logger.info("Meta ID {} actualizada exitosamente. Nuevo estado: {}", 
                    meta.getId(), nuevoEstado);

        } catch (Exception e) {
            logger.error("Error al actualizar progreso de meta ID {}: {}", 
                    meta.getId(), e.getMessage(), e);
        }
    }

    @Override
    public int updateAllUserMetas(User user) {
        List<Meta> metasAutomaticas = metaRepository.findByUserIdAndTipoEvaluacionAndEstado(
                user.getId(), "automatica", "en_progreso");

        int updated = 0;
        for (Meta meta : metasAutomaticas) {
            if (canHandle(meta.getTipo())) {
                try {
                    updateMetaProgress(meta);
                    metaRepository.save(meta);
                    updated++;
                } catch (Exception e) {
                    logger.error("Error actualizando meta ID {}: {}", meta.getId(), e.getMessage());
                }
            }
        }

        logger.info("Actualizadas {} metas estándar para usuario {}", updated, user.getUsername());
        return updated;
    }

    @Override
    public List<Meta> updateMetasByType(User user, String tipo) {
        if (!canHandle(tipo)) {
            logger.warn("Tipo de meta '{}' no es manejado por este servicio", tipo);
            return new ArrayList<>();
        }

        List<Meta> metasDelTipo = metaRepository.findByUserIdAndTipoAndTipoEvaluacionAndEstado(
                user.getId(), tipo, "automatica", "en_progreso");

        List<Meta> metasActualizadas = new ArrayList<>();

        for (Meta meta : metasDelTipo) {
            try {
                updateMetaProgress(meta);
                Meta savedMeta = metaRepository.save(meta);
                metasActualizadas.add(savedMeta);
                logger.info("Meta actualizada: ID={}, título={}", 
                        savedMeta.getId(), savedMeta.getTitulo());
            } catch (Exception e) {
                logger.error("Error actualizando meta ID {}: {}", meta.getId(), e.getMessage());
            }
        }

        logger.info("Actualizadas {} metas de tipo '{}' para usuario {}", 
                metasActualizadas.size(), tipo, user.getUsername());
        return metasActualizadas;
    }

    @Override
    public boolean canHandle(String tipo) {
        return "agua".equals(tipo) || "electricidad".equals(tipo) || "transporte".equals(tipo);
    }

    @Override
    public String evaluateMetaState(Meta meta) {
        String tipo = meta.getTipo();
        
        if ("transporte".equals(tipo)) {
            // Usar lógica específica para transporte
            return calculationCoordinator.evaluarEstadoTransporte(meta);
        } else {
            // Usar lógica general para agua y electricidad
            return evaluateStandardMetaState(meta);
        }
    }

    @Override
    public boolean requiresAutomaticUpdate(Meta meta) {
        return meta != null && 
               "automatica".equals(meta.getTipoEvaluacion()) &&
               "en_progreso".equals(meta.getEstado()) &&
               canHandle(meta.getTipo());
    }

    /**
     * Evalúa el estado para metas estándar (agua y electricidad)
     */
    private String evaluateStandardMetaState(Meta meta) {
        LocalDateTime hoy = LocalDateTime.now();
        LocalDateTime fechaFin = meta.getFechaFin();
        LocalDateTime fechaInicio = meta.getFechaInicio();
        boolean fechaVencida = fechaFin != null && fechaFin.isBefore(hoy);
        
        if (meta.getValorActual() == null || meta.getValorObjetivo() == null) {
            return "en_progreso"; // Si faltan datos, asumir en progreso
        }
        
        // Calcular el porcentaje del período transcurrido
        double porcentajePeriodoTranscurrido = 0.0;
        if (fechaInicio != null && fechaFin != null) {
            long totalDias = java.time.Duration.between(fechaInicio, fechaFin).toDays();
            long diasTranscurridos = java.time.Duration.between(fechaInicio, hoy).toDays();
            porcentajePeriodoTranscurrido = totalDias > 0 ? (double) diasTranscurridos / totalDias : 0.0;
        }
        
        // Determinar si es una métrica de reducción
        boolean esReduccion = calculationCoordinator.isReductionMetric(meta.getTipo(), meta.getMetrica());
        
        if (esReduccion) {
            // Para metas de reducción: objetivo es menor que el valor inicial
            if (meta.getValorActual() <= meta.getValorObjetivo()) {
                return "completada"; // Se alcanzó el objetivo de reducción
            }
            
            // NUEVA LÓGICA: Fallar si se excede significativamente el objetivo
            // Especialmente si ya hemos pasado cierto porcentaje del período
            double excesoPercentual = (meta.getValorActual() - meta.getValorObjetivo()) / meta.getValorObjetivo();
            
            // Condiciones para marcar como fallida inmediatamente:
            // 1. Si se excede el objetivo en más del 50% en cualquier momento
            // 2. Si se excede el objetivo en más del 20% y ya transcurrió al menos 25% del período
            // 3. Si se excede el objetivo en más del 10% y ya transcurrió al menos 50% del período
            if (excesoPercentual > 0.5 || 
                (excesoPercentual > 0.2 && porcentajePeriodoTranscurrido >= 0.25) ||
                (excesoPercentual > 0.1 && porcentajePeriodoTranscurrido >= 0.5) ||
                fechaVencida) {
                
                logger.warn("Meta ID {} marcada como fallida. Exceso: {:.1f}%, Período transcurrido: {:.1f}%", 
                    meta.getId(), excesoPercentual * 100, porcentajePeriodoTranscurrido * 100);
                return "fallida";
            }
            
            return "en_progreso";
        } else {
            // Para metas de incremento: objetivo es mayor que el valor inicial
            if (meta.getValorActual() >= meta.getValorObjetivo()) {
                return "completada"; // Se alcanzó el objetivo de incremento
            }
            
            if (fechaVencida) {
                return "fallida"; // No se alcanzó y ya venció
            }
            
            return "en_progreso";
        }
    }
} 