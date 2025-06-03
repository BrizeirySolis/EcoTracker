package com.lilim.ecotracker.features.metas.service.calculation;

import com.lilim.ecotracker.features.metas.model.Meta;
import com.lilim.ecotracker.security.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Servicio coordinador que orquesta las llamadas a los servicios de cálculo especializados
 * Actúa como punto de entrada único para todas las operaciones de cálculo de metas
 */
@Service
public class MetaCalculationCoordinator {

    private static final Logger logger = LoggerFactory.getLogger(MetaCalculationCoordinator.class);

    private final List<MetaProgressCalculationService> calculationServices;
    private final TransportMetaCalculationService transportService;

    @Autowired
    public MetaCalculationCoordinator(
            List<MetaProgressCalculationService> calculationServices,
            TransportMetaCalculationService transportService) {
        this.calculationServices = calculationServices;
        this.transportService = transportService;
    }

    /**
     * Actualiza el progreso de una meta delegando al servicio especializado apropiado
     * @param meta Meta a actualizar
     */
    public void updateMetaProgress(Meta meta) {
        if (meta == null || meta.getTipo() == null) {
            logger.warn("Meta o tipo de meta es null, no se puede actualizar progreso");
            return;
        }

        MetaProgressCalculationService service = findServiceForType(meta.getTipo());
        if (service != null) {
            logger.info("Delegando actualización de progreso de meta ID {} al servicio {}", 
                    meta.getId(), service.getClass().getSimpleName());
            service.updateProgress(meta);
        } else {
            logger.error("No se encontró servicio de cálculo para tipo de meta: {}", meta.getTipo());
        }
    }

    /**
     * Obtiene el valor inicial para una nueva meta
     * @param user Usuario
     * @param tipo Tipo de meta
     * @param metrica Métrica específica
     * @return Valor inicial calculado
     */
    public Double obtenerValorInicial(User user, String tipo, String metrica) {
        MetaProgressCalculationService service = findServiceForType(tipo);
        if (service != null) {
            logger.info("Delegando obtención de valor inicial para tipo {} al servicio {}", 
                    tipo, service.getClass().getSimpleName());
            return service.obtenerValorInicial(user, metrica);
        } else {
            logger.error("No se encontró servicio de cálculo para tipo: {}", tipo);
            return 0.1; // Valor por defecto
        }
    }

    /**
     * Obtiene el valor actual para una meta
     * @param user Usuario
     * @param tipo Tipo de meta
     * @param metrica Métrica específica
     * @return Valor actual calculado
     */
    public Double obtenerValorActual(User user, String tipo, String metrica) {
        MetaProgressCalculationService service = findServiceForType(tipo);
        if (service != null) {
            logger.info("Delegando obtención de valor actual para tipo {} al servicio {}", 
                    tipo, service.getClass().getSimpleName());
            return service.obtenerValorActual(user, metrica);
        } else {
            logger.error("No se encontró servicio de cálculo para tipo: {}", tipo);
            return 0.0; // Valor por defecto
        }
    }

    /**
     * Determina si una métrica es de reducción
     * @param tipo Tipo de meta
     * @param metrica Métrica específica
     * @return true si es de reducción, false si es de incremento
     */
    public boolean isReductionMetric(String tipo, String metrica) {
        MetaProgressCalculationService service = findServiceForType(tipo);
        if (service != null) {
            return service.isReductionMetric(metrica);
        } else {
            logger.error("No se encontró servicio de cálculo para tipo: {}", tipo);
            return false; // Valor por defecto
        }
    }

    /**
     * Evalúa el estado específicamente para metas de transporte
     * Este método es específico para transporte debido a su lógica especial
     * @param meta Meta de transporte
     * @return Estado evaluado
     */
    public String evaluarEstadoTransporte(Meta meta) {
        if (!"transporte".equals(meta.getTipo())) {
            logger.warn("evaluarEstadoTransporte llamado para meta que no es de transporte: {}", meta.getTipo());
            return "en_progreso";
        }
        
        return transportService.evaluarEstadoTransporte(meta);
    }

    /**
     * Determina la métrica por defecto basándose en la unidad (específico para transporte)
     * @param unidad Unidad de medida
     * @return Métrica por defecto
     */
    public String determinarMetricaPorDefectoTransporte(String unidad) {
        return transportService.determinarMetricaPorDefecto(unidad);
    }

    /**
     * Busca el servicio de cálculo apropiado para un tipo de meta
     * @param tipo Tipo de meta
     * @return Servicio de cálculo o null si no se encuentra
     */
    private MetaProgressCalculationService findServiceForType(String tipo) {
        return calculationServices.stream()
                .filter(service -> service.canHandle(tipo))
                .findFirst()
                .orElse(null);
    }
} 