package com.lilim.ecotracker.features.metas.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor; /**
 * DTO para actualizar solo el progreso de una meta
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MetaUpdateProgresoDTO {
    private Double valorActual;
}
