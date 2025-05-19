package com.lilim.ecotracker.features.metas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor; /**
 * DTO para recomendaciones de metas basadas en el historial
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetaRecommendationDTO {
    private String descripcion;
    private Double valor;
    private String unidad;
    private String metrica;
}
