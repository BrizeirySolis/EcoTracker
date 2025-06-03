package com.lilim.ecotracker.features.metas.service.automation;

import com.lilim.ecotracker.features.metas.dto.MetaDTO;
import com.lilim.ecotracker.features.metas.mapper.MetaMapper;
import com.lilim.ecotracker.features.metas.model.Meta;
import com.lilim.ecotracker.features.metas.repository.MetaRepository;
import com.lilim.ecotracker.security.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio coordinador que orquesta las llamadas a los servicios de automatización especializados
 * Actúa como punto de entrada único para todas las operaciones de automatización de metas
 */
@Service
public class MetaAutomationCoordinator {

    private static final Logger logger = LoggerFactory.getLogger(MetaAutomationCoordinator.class);

    private final List<MetaAutomationService> automationServices;
    private final MetaRepository metaRepository;
    private final MetaMapper metaMapper;

    @Autowired
    public MetaAutomationCoordinator(
            List<MetaAutomationService> automationServices,
            MetaRepository metaRepository,
            MetaMapper metaMapper) {
        this.automationServices = automationServices;
        this.metaRepository = metaRepository;
        this.metaMapper = metaMapper;
    }

    /**
     * Actualiza automáticamente el progreso de una meta individual
     * @param meta Meta a actualizar
     */
    @Transactional
    public void updateMetaProgress(Meta meta) {
        if (meta == null) {
            logger.warn("Meta es null, no se puede actualizar progreso");
            return;
        }

        MetaAutomationService service = findServiceForType(meta.getTipo());
        if (service != null) {
            logger.info("Delegando actualización de progreso de meta ID {} al servicio {}", 
                    meta.getId(), service.getClass().getSimpleName());
            
            service.updateMetaProgress(meta);
            metaRepository.save(meta);
        } else {
            logger.error("No se encontró servicio de automatización para tipo de meta: {}", meta.getTipo());
        }
    }

    /**
     * Actualiza todas las metas automáticas en progreso de todos los tipos
     * @return Número total de metas actualizadas
     */
    @Transactional
    public int updateAllAutomaticMetas() {
        logger.info("Iniciando actualización automática masiva de metas...");

        List<Meta> automaticMetas = metaRepository.findByTipoEvaluacionAndEstado("automatica", "en_progreso");
        
        int totalUpdated = 0;
        for (Meta meta : automaticMetas) {
            try {
                updateMetaProgress(meta);
                totalUpdated++;
            } catch (Exception e) {
                logger.error("Error actualizando meta ID {}: {}", meta.getId(), e.getMessage());
            }
        }

        logger.info("Actualización automática masiva finalizada. {} metas actualizadas de {} encontradas.", 
                totalUpdated, automaticMetas.size());
        return totalUpdated;
    }

    /**
     * Actualiza todas las metas automáticas de un usuario específico
     * @param user Usuario
     * @return Número total de metas actualizadas
     */
    @Transactional
    public int updateAllUserMetas(User user) {
        logger.info("Actualizando todas las metas automáticas del usuario: {}", user.getUsername());

        int totalUpdated = 0;
        
        // Actualizar con cada servicio especializado
        for (MetaAutomationService service : automationServices) {
            try {
                int serviceUpdates = service.updateAllUserMetas(user);
                totalUpdated += serviceUpdates;
                logger.info("Servicio {} actualizó {} metas", 
                        service.getClass().getSimpleName(), serviceUpdates);
            } catch (Exception e) {
                logger.error("Error en servicio {}: {}", 
                        service.getClass().getSimpleName(), e.getMessage());
            }
        }

        logger.info("Total de metas actualizadas para usuario {}: {}", user.getUsername(), totalUpdated);
        return totalUpdated;
    }

    /**
     * Actualiza metas automáticas de un tipo específico para un usuario
     * @param user Usuario
     * @param tipo Tipo de meta
     * @return Lista de DTOs de metas actualizadas
     */
    @Transactional
    public List<MetaDTO> updateMetasByType(User user, String tipo) {
        logger.info("Actualizando metas de tipo '{}' para usuario '{}'", tipo, user.getUsername());

        MetaAutomationService service = findServiceForType(tipo);
        if (service != null) {
            logger.info("Delegando actualización de metas tipo {} al servicio {}", 
                    tipo, service.getClass().getSimpleName());
            
            List<Meta> metasActualizadas = service.updateMetasByType(user, tipo);
            
            return metasActualizadas.stream()
                    .map(metaMapper::convertToDTO)
                    .collect(Collectors.toList());
        } else {
            logger.warn("No se encontró servicio de automatización para tipo: {}", tipo);
            return new ArrayList<>();
        }
    }

    /**
     * Evalúa el estado de una meta usando el servicio apropiado
     * @param meta Meta a evaluar
     * @return Nuevo estado de la meta
     */
    public String evaluateMetaState(Meta meta) {
        if (meta == null) {
            logger.warn("Meta es null, no se puede evaluar estado");
            return "en_progreso";
        }

        MetaAutomationService service = findServiceForType(meta.getTipo());
        if (service != null) {
            return service.evaluateMetaState(meta);
        } else {
            logger.warn("No se encontró servicio para evaluar estado de meta tipo: {}", meta.getTipo());
            return "en_progreso"; // Estado por defecto
        }
    }

    /**
     * Verifica si una meta requiere actualización automática
     * @param meta Meta a verificar
     * @return true si requiere actualización, false en caso contrario
     */
    public boolean requiresAutomaticUpdate(Meta meta) {
        if (meta == null) {
            return false;
        }

        MetaAutomationService service = findServiceForType(meta.getTipo());
        if (service != null) {
            return service.requiresAutomaticUpdate(meta);
        } else {
            // Si no hay servicio específico, usar lógica general
            return "automatica".equals(meta.getTipoEvaluacion()) && 
                   "en_progreso".equals(meta.getEstado());
        }
    }

    /**
     * Obtiene estadísticas de metas automáticas para un usuario
     * @param user Usuario
     * @return Mapa con estadísticas por tipo
     */
    public MetaAutomationStats getAutomationStats(User user) {
        List<Meta> metasAutomaticas = metaRepository.findByUserIdAndTipoEvaluacion(
                user.getId(), "automatica");

        MetaAutomationStats stats = new MetaAutomationStats();
        
        for (Meta meta : metasAutomaticas) {
            stats.incrementTotal();
            
            switch (meta.getEstado()) {
                case "en_progreso":
                    stats.incrementEnProgreso();
                    break;
                case "completada":
                    stats.incrementCompletadas();
                    break;
                case "fallida":
                    stats.incrementFallidas();
                    break;
            }
            
            // Contar por tipo
            stats.incrementByType(meta.getTipo());
        }

        logger.info("Estadísticas de automatización para {}: {}", user.getUsername(), stats);
        return stats;
    }

    /**
     * Busca el servicio de automatización apropiado para un tipo de meta
     * @param tipo Tipo de meta
     * @return Servicio de automatización o null si no se encuentra
     */
    private MetaAutomationService findServiceForType(String tipo) {
        return automationServices.stream()
                .filter(service -> service.canHandle(tipo))
                .findFirst()
                .orElse(null);
    }

    /**
     * Clase interna para estadísticas de automatización
     */
    public static class MetaAutomationStats {
        private int total = 0;
        private int enProgreso = 0;
        private int completadas = 0;
        private int fallidas = 0;
        private int agua = 0;
        private int electricidad = 0;
        private int transporte = 0;
        private int combinadas = 0;

        public void incrementTotal() { this.total++; }
        public void incrementEnProgreso() { this.enProgreso++; }
        public void incrementCompletadas() { this.completadas++; }
        public void incrementFallidas() { this.fallidas++; }

        public void incrementByType(String tipo) {
            switch (tipo) {
                case "agua": this.agua++; break;
                case "electricidad": this.electricidad++; break;
                case "transporte": this.transporte++; break;
                case "combinada": this.combinadas++; break;
            }
        }

        // Getters
        public int getTotal() { return total; }
        public int getEnProgreso() { return enProgreso; }
        public int getCompletadas() { return completadas; }
        public int getFallidas() { return fallidas; }
        public int getAgua() { return agua; }
        public int getElectricidad() { return electricidad; }
        public int getTransporte() { return transporte; }
        public int getCombinadas() { return combinadas; }

        @Override
        public String toString() {
            return String.format(
                "Total: %d, En progreso: %d, Completadas: %d, Fallidas: %d | Agua: %d, Electricidad: %d, Transporte: %d, Combinadas: %d",
                total, enProgreso, completadas, fallidas, agua, electricidad, transporte, combinadas
            );
        }
    }
} 