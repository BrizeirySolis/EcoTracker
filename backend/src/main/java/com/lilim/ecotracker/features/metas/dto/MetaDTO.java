package com.lilim.ecotracker.features.metas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para transferencia de datos de metas entre cliente y servidor
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetaDTO {
    private Long id;
    private String titulo;
    private String descripcion;
    private String tipo;
    private Double valorObjetivo;
    private String unidad;
    private String metrica;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private String estado;
    private Double valorActual;
    private String tipoEvaluacion;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

/**
 * Constantes de tipos de meta disponibles
 */
class TiposMeta {
    public static final String AGUA = "agua";
    public static final String ELECTRICIDAD = "electricidad";
    public static final String TRANSPORTE = "transporte";
    public static final String COMBINADA = "combinada";
    public static final String OTRO = "otro";
}

/**
 * Constantes de estados de meta
 */
class EstadosMeta {
    public static final String EN_PROGRESO = "en_progreso";
    public static final String COMPLETADA = "completada";
    public static final String FALLIDA = "fallida";
}

/**
 * Constantes de tipo de evaluación
 */
class TiposEvaluacion {
    public static final String AUTOMATICA = "automatica";
    public static final String MANUAL = "manual";
}