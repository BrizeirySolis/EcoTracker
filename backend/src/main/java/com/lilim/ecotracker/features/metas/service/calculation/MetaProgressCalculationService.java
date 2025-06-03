package com.lilim.ecotracker.features.metas.service.calculation;

import com.lilim.ecotracker.features.metas.model.Meta;
import com.lilim.ecotracker.security.model.User;

/**
 * Interfaz base para servicios de cálculo de progreso de metas
 * Define los contratos que deben cumplir los servicios especializados por tipo de consumo
 */
public interface MetaProgressCalculationService {

    /**
     * Actualiza el progreso de una meta basándose en datos reales de consumo
     * @param meta Meta a actualizar
     */
    void updateProgress(Meta meta);

    /**
     * Obtiene el valor inicial de consumo para una nueva meta
     * @param user Usuario
     * @param metrica Métrica específica (consumo_total, benchmark, emisiones, etc.)
     * @return Valor inicial calculado
     */
    Double obtenerValorInicial(User user, String metrica);

    /**
     * Obtiene el valor actual de consumo
     * @param user Usuario
     * @param metrica Métrica específica
     * @return Valor actual calculado
     */
    Double obtenerValorActual(User user, String metrica);

    /**
     * Verifica si el servicio puede manejar el tipo de meta especificado
     * @param tipo Tipo de meta (agua, electricidad, transporte, etc.)
     * @return true si puede manejar el tipo, false en caso contrario
     */
    boolean canHandle(String tipo);

    /**
     * Determina si una métrica específica es de reducción (menor es mejor)
     * @param metrica Métrica a evaluar
     * @return true si es de reducción, false si es de incremento
     */
    boolean isReductionMetric(String metrica);
} 