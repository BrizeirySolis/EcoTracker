package com.lilim.ecotracker.features.bitacora.controller;

import com.lilim.ecotracker.features.bitacora.dto.BitacoraDTO;
import com.lilim.ecotracker.features.bitacora.service.BitacoraServiceImp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Bitácora operations
 * Exposes endpoints for CRUD operations on environmental activity logs
 */
@RestController
@RequestMapping("/api/bitacoras")
public class BitacoraController {
    
    private final BitacoraServiceImp bitacoraServiceImp;
    
    @Autowired
    public BitacoraController(BitacoraServiceImp bitacoraServiceImp) {
        this.bitacoraServiceImp = bitacoraServiceImp;
    }
    
    /**
     * Get all bitácoras for the current user
     * @param categoria Optional category filter
     * @return List of bitácoras
     */
    @GetMapping
    public ResponseEntity<List<BitacoraDTO>> getAllBitacoras(
            @RequestParam(required = false) String categoria) {
        
        List<BitacoraDTO> bitacoras;
        if (categoria != null && !categoria.isEmpty()) {
            bitacoras = bitacoraServiceImp.getBitacorasByCategoria(categoria);
        } else {
            bitacoras = bitacoraServiceImp.getAllBitacoras();
        }
        
        return ResponseEntity.ok(bitacoras);
    }
    
    /**
     * Get a specific bitácora by ID
     * @param id Bitácora ID
     * @return Bitácora if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<BitacoraDTO> getBitacoraById(@PathVariable Long id) {

        if (id == null) {
            return ResponseEntity.badRequest().build();
        }

        return bitacoraServiceImp.getBitacoraById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Create a new bitácora
     * Uses multipart request to handle image upload
     * @param titulo Bitácora title
     * @param descripcion Bitácora description
     * @param fecha Date of the activity
     * @param categoria Activity category
     * @param camposAdicionales Additional fields as JSON string
     * @param imagen Optional image file
     * @return Created bitácora
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createBitacora(
            @RequestParam String titulo,
            @RequestParam(required = false) String descripcion,
            @RequestParam String fecha,
            @RequestParam String categoria,
            @RequestParam(required = false) String camposAdicionales,
            @RequestParam(required = false) MultipartFile imagen) {
        
        try {
            BitacoraDTO dto = new BitacoraDTO();
            dto.setTitulo(titulo);
            dto.setDescripcion(descripcion);
            dto.setFecha(java.time.LocalDateTime.parse(fecha));
            dto.setCategoria(categoria);
            
            // Parse additional fields if provided
            if (camposAdicionales != null && !camposAdicionales.isEmpty()) {
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> campos = new com.fasterxml.jackson.databind.ObjectMapper()
                            .readValue(camposAdicionales, Map.class);
                    dto.setCamposAdicionales(campos);
                } catch (Exception e) {
                    return ResponseEntity.badRequest()
                            .body("Error en formato de campos adicionales: " + e.getMessage());
                }
            }
            
            BitacoraDTO created = bitacoraServiceImp.createBitacora(dto, imagen);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al procesar la imagen: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * Update an existing bitácora
     * @param id Bitácora ID
     * @param titulo Updated title
     * @param descripcion Updated description
     * @param fecha Updated date
     * @param categoria Updated category
     * @param camposAdicionales Updated additional fields
     * @param imagen Optional new image
     * @return Updated bitácora
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateBitacora(
            @PathVariable Long id,
            @RequestParam String titulo,
            @RequestParam(required = false) String descripcion,
            @RequestParam String fecha,
            @RequestParam String categoria,
            @RequestParam(required = false) String camposAdicionales,
            @RequestParam(required = false) MultipartFile imagen) {
        
        try {
            BitacoraDTO dto = new BitacoraDTO();
            dto.setTitulo(titulo);
            dto.setDescripcion(descripcion);
            dto.setFecha(java.time.LocalDateTime.parse(fecha));
            dto.setCategoria(categoria);
            
            // Parse additional fields if provided
            if (camposAdicionales != null && !camposAdicionales.isEmpty()) {
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> campos = new com.fasterxml.jackson.databind.ObjectMapper()
                            .readValue(camposAdicionales, Map.class);
                    dto.setCamposAdicionales(campos);
                } catch (Exception e) {
                    return ResponseEntity.badRequest()
                            .body("Error en formato de campos adicionales: " + e.getMessage());
                }
            }
            
            BitacoraDTO updated = bitacoraServiceImp.updateBitacora(id, dto, imagen);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al procesar la imagen: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * Delete a bitácora
     * @param id Bitácora ID
     * @return Success status
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBitacora(@PathVariable Long id) {
        try {
            boolean deleted = bitacoraServiceImp.deleteBitacora(id);
            if (deleted) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al eliminar la bitácora: " + e.getMessage());
        }
    }
    
    /**
     * Get all available categories
     * @return Map of category codes to display names
     */
    @GetMapping("/categorias")
    public ResponseEntity<Map<String, String>> getCategorias() {
        return ResponseEntity.ok(bitacoraServiceImp.getCategorias());
    }
}