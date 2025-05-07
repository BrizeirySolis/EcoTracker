package com.lilim.ecotracker.features.bitacora.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO for Bitácora API requests and responses
 * Separates entity from API representation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BitacoraDTO {
    private Long id;
    private String titulo;
    private String descripcion;
    private LocalDateTime fecha;
    private String imagenUrl;
    private String categoria;
    private Map<String, Object> camposAdicionales;
    private LocalDateTime createdAt;
}

/**
 * DTO for creating a new Bitácora
 * Omits fields that are set by the system
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
class BitacoraCreateRequest {
    private String titulo;
    private String descripcion;
    private LocalDateTime fecha;
    private String categoria;
    private Map<String, Object> camposAdicionales;
}

/**
 * DTO for updating an existing Bitácora
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
class BitacoraUpdateRequest {
    private String titulo;
    private String descripcion;
    private LocalDateTime fecha;
    private String categoria;
    private Map<String, Object> camposAdicionales;
}

/**
 * DTO for simple responses containing just the category name and display name
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class CategoriaDTO {
    private String codigo;
    private String nombre;
}