package com.lilim.ecotracker.features.metas.mapper;

import com.lilim.ecotracker.features.metas.dto.MetaDTO;
import com.lilim.ecotracker.features.metas.model.Meta;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper responsable de convertir entidades Meta a DTOs
 * Incluye lógica de cálculo de progreso específica por tipo de consumo
 */
@Component
public class MetaMapper {

    private static final Logger logger = LoggerFactory.getLogger(MetaMapper.class);

    /**
     * Convertir entidad Meta a DTO
     * @param meta Entidad Meta
     * @return MetaDTO con progreso calculado
     */
    public MetaDTO convertToDTO(Meta meta) {
        if (meta == null) {
            return null;
        }

        // Redondear valores para evitar decimales excesivos
        Double valorObjetivo = meta.getValorObjetivo() != null ? 
            Math.round(meta.getValorObjetivo() * 100.0) / 100.0 : null;
        Double valorActual = meta.getValorActual() != null ? 
            Math.round(meta.getValorActual() * 100.0) / 100.0 : null;
        Double valorInicial = meta.getValorInicial() != null ? 
            Math.round(meta.getValorInicial() * 100.0) / 100.0 : null;
        
        // Calcular progreso según el tipo de meta
        Double progreso = calcularProgreso(meta, valorActual, valorObjetivo, valorInicial);
        
        // Redondear progreso a 2 decimales
        progreso = Math.round(progreso * 100.0) / 100.0;
        
        logger.info("Convirtiendo Meta a DTO: id={}, tipo={}, valorInicial={}, valorActual={}, valorObjetivo={}, progreso={}%",
                meta.getId(), meta.getTipo(), valorInicial, valorActual, valorObjetivo, progreso);

        return MetaDTO.builder()
                .id(meta.getId())
                .titulo(meta.getTitulo())
                .descripcion(meta.getDescripcion())
                .tipo(meta.getTipo())
                .valorObjetivo(valorObjetivo)
                .unidad(meta.getUnidad())
                .metrica(meta.getMetrica())
                .fechaInicio(meta.getFechaInicio())
                .fechaFin(meta.getFechaFin())
                .estado(meta.getEstado())
                .valorActual(valorActual)
                .valorInicial(valorInicial)
                .tipoEvaluacion(meta.getTipoEvaluacion())
                .createdAt(meta.getCreatedAt())
                .updatedAt(meta.getUpdatedAt())
                .progreso(progreso)
                .build();
    }

    /**
     * Convertir lista de entidades Meta a lista de DTOs
     * @param metas Lista de entidades Meta
     * @return Lista de MetaDTO
     */
    public List<MetaDTO> convertToDTOList(List<Meta> metas) {
        if (metas == null) {
            return null;
        }
        
        return metas.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Calcula el progreso de una meta según su tipo
     * @param meta Entidad Meta
     * @param valorActual Valor actual redondeado
     * @param valorObjetivo Valor objetivo redondeado
     * @param valorInicial Valor inicial redondeado
     * @return Progreso calculado (0-100)
     */
    private Double calcularProgreso(Meta meta, Double valorActual, Double valorObjetivo, Double valorInicial) {
        Double progreso = 0.0;
        
        if ("transporte".equals(meta.getTipo())) {
            progreso = calcularProgresoTransporte(meta);
        } else {
            // Para agua y electricidad, usar la lógica original
            if (valorActual != null && valorObjetivo != null && valorInicial != null && valorInicial > 0) {
                if (isReductionMetric(meta.getTipo(), meta.getMetrica())) {
                    // Para reducción: calcular cuánto se ha reducido
                    double reduccionTotal = valorInicial - valorObjetivo;
                    double reduccionActual = valorInicial - valorActual;
                    if (reduccionTotal > 0) {
                        progreso = (reduccionActual / reduccionTotal) * 100;
                        progreso = Math.min(100, Math.max(0, progreso));
                    }
                } else {
                    // Para incremento
                    if (valorObjetivo > 0) {
                        progreso = (valorActual / valorObjetivo) * 100;
                        progreso = Math.min(100, Math.max(0, progreso));
                    }
                }
            }
        }
        
        return progreso;
    }

    /**
     * Calcula el progreso específicamente para metas de transporte
     * Para transporte, el progreso se calcula de manera diferente:
     * - Para reducción: progreso = (valorActual / valorObjetivo) * 100 (menos es mejor)
     * - Para incremento: progreso = (valorActual / valorObjetivo) * 100 (más es mejor)
     * @param meta Meta de transporte
     * @return Progreso calculado (0-100)
     */
    private double calcularProgresoTransporte(Meta meta) {
        if (meta.getValorActual() == null || meta.getValorObjetivo() == null || meta.getValorObjetivo() <= 0) {
            return 0.0;
        }

        boolean esReduccion = isReductionMetric(meta.getTipo(), meta.getMetrica());
        
        if (esReduccion) {
            // Para metas de reducción (ej: máximo 250 km en auto)
            // Progreso = cuánto has usado del límite permitido
            // Si has usado 50 km de 250 km permitidos = 20% de progreso
            double porcentaje = (meta.getValorActual() / meta.getValorObjetivo()) * 100;
            
            // Limitar a 100% aunque se exceda el objetivo
            return Math.min(100, Math.max(0, porcentaje));
        } else {
            // Para metas de incremento (ej: mínimo 100 km en bicicleta)
            // Progreso = cuánto has alcanzado del objetivo
            double porcentaje = (meta.getValorActual() / meta.getValorObjetivo()) * 100;
            
            return Math.min(100, Math.max(0, porcentaje));
        }
    }

    /**
     * Determina si una métrica es de reducción (menor es mejor)
     * @param tipo Tipo de meta
     * @param metrica Métrica específica
     * @return true si es métrica de reducción, false si es de incremento
     */
    private boolean isReductionMetric(String tipo, String metrica) {
        // La mayoría de métricas de agua, electricidad y emisiones son de reducción
        if ("agua".equals(tipo) || "electricidad".equals(tipo)) {
            // Excepto benchmarks que pueden ser "mantener por debajo de"
            return !"benchmark".equals(metrica);
        }

        // En transporte, depende de la métrica
        if ("transporte".equals(tipo)) {
            // Métricas específicas de reducción
            boolean esReduccion = "reduccion_combustion".equals(metrica) ||
                    "emisiones".equals(metrica) ||
                    "costo".equals(metrica);

            // Métricas específicas de incremento (como uso de bicicleta)
            boolean esIncremento = "porcentaje_sostenible".equals(metrica) ||
                    "km_bicicleta".equals(metrica) ||
                    "uso_bicicleta".equals(metrica);

            if (esReduccion) return true;
            if (esIncremento) return false;

            // Si no es una métrica específica, usar heurística
            return true; // Por defecto asumimos reducción para transporte
        }

        // Para tipos combinados u otros, evaluar por el valor objetivo vs actual
        return false; // Por defecto para otros tipos
    }

    /**
     * Redondear valor a 2 decimales
     * @param value Valor a redondear
     * @return Valor redondeado
     */
    private Double roundToTwoDecimals(Double value) {
        return value != null ? Math.round(value * 100.0) / 100.0 : null;
    }
} 