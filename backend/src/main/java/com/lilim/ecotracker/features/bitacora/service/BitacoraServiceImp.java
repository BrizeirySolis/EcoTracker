package com.lilim.ecotracker.features.bitacora.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lilim.ecotracker.features.bitacora.dto.BitacoraDTO;
import com.lilim.ecotracker.features.bitacora.model.Bitacora;
import com.lilim.ecotracker.features.bitacora.repository.BitacoraRepository;
import com.lilim.ecotracker.security.model.User;
import com.lilim.ecotracker.security.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service implementation for Bitácora operations
 * Contains business logic for handling environmental activity logs
 */
@Service
public class BitacoraServiceImp {
    
    private final BitacoraRepository bitacoraRepository;
    private final UserService userService;
    private final ImagenServiceImp imagenServiceImp;
    private final ObjectMapper objectMapper;
    
    /**
     * Available categories with their display names
     * Used for validation and UI display
     */
    private static final Map<String, String> CATEGORIAS = Map.of(
        "plantacion", "Plantación",
        "reciclaje", "Reciclaje",
        "conservacion", "Conservación",
        "educacion", "Educación Ambiental",
        "ahorro", "Ahorro Energético",
        "consumo", "Consumo Responsable",
        "limpieza", "Limpieza Ambiental",
        "otro", "Otro"
    );
    
    @Autowired
    public BitacoraServiceImp(
            BitacoraRepository bitacoraRepository,
            UserService userService,
            ImagenServiceImp imagenServiceImp,
            ObjectMapper objectMapper) {
        this.bitacoraRepository = bitacoraRepository;
        this.userService = userService;
        this.imagenServiceImp = imagenServiceImp;
        this.objectMapper = objectMapper;
    }
    
    /**
     * Get all available categories
     * @return Map of category codes to display names
     */
    public Map<String, String> getCategorias() {
        return CATEGORIAS;
    }
    
    /**
     * Get all bitácoras for the current user
     * @return List of bitácora DTOs
     */
    public List<BitacoraDTO> getAllBitacoras() {
        User currentUser = userService.getCurrentUser();
        List<Bitacora> bitacoras = bitacoraRepository.findByUserIdOrderByFechaDesc(currentUser.getId());
        return bitacoras.stream()
                .map(this::convertToDTO)
                .toList();
    }
    
    /**
     * Get all bitácoras for the current user, filtered by category
     * @param categoria Category to filter by
     * @return List of filtered bitácora DTOs
     */
    public List<BitacoraDTO> getBitacorasByCategoria(String categoria) {
        User currentUser = userService.getCurrentUser();
        List<Bitacora> bitacoras = bitacoraRepository.findByUserIdAndCategoriaOrderByFechaDesc(
                currentUser.getId(), categoria);
        return bitacoras.stream()
                .map(this::convertToDTO)
                .toList();
    }
    
    /**
     * Get a specific bitácora by ID
     * @param id Bitácora ID
     * @return BitácoraDTO if found, or empty Optional
     */
    public Optional<BitacoraDTO> getBitacoraById(Long id) {
        User currentUser = userService.getCurrentUser();
        return bitacoraRepository.findByIdAndUserId(id, currentUser.getId())
                .map(this::convertToDTO);
    }
    
    /**
     * Create a new bitácora
     * @param bitacoraDTO Data for the new bitácora
     * @param imagen Optional image file
     * @return Created BitácoraDTO with ID
     * @throws IOException If image upload fails
     */
    @Transactional
    public BitacoraDTO createBitacora(BitacoraDTO bitacoraDTO, MultipartFile imagen) throws IOException {
        User currentUser = userService.getCurrentUser();
        
        Bitacora bitacora = new Bitacora();
        bitacora.setTitulo(bitacoraDTO.getTitulo());
        bitacora.setDescripcion(bitacoraDTO.getDescripcion());
        bitacora.setFecha(bitacoraDTO.getFecha());
        bitacora.setCategoria(bitacoraDTO.getCategoria());
        bitacora.setUser(currentUser);
        
        // Store additional fields as JSON
        if (bitacoraDTO.getCamposAdicionales() != null) {
            try {
                bitacora.setCamposAdicionales(objectMapper.writeValueAsString(bitacoraDTO.getCamposAdicionales()));
            } catch (JsonProcessingException e) {
                bitacora.setCamposAdicionales("{}");
            }
        }
        
        // Handle image upload if present
        if (imagen != null && !imagen.isEmpty()) {
            String imagePath = imagenServiceImp.storeImage(imagen);
            bitacora.setImagenUrl(imagePath);
        }
        
        Bitacora savedBitacora = bitacoraRepository.save(bitacora);
        return convertToDTO(savedBitacora);
    }
    
    /**
     * Update an existing bitácora
     * @param id Bitácora ID
     * @param bitacoraDTO Updated data
     * @param imagen Optional new image
     * @return Updated BitácoraDTO
     * @throws IOException If image operations fail
     * @throws IllegalArgumentException If the bitácora doesn't exist or user lacks permission
     */
    @Transactional
    public BitacoraDTO updateBitacora(Long id, BitacoraDTO bitacoraDTO, MultipartFile imagen) 
            throws IOException, IllegalArgumentException {
        User currentUser = userService.getCurrentUser();
        
        // Find and validate ownership
        Bitacora bitacora = bitacoraRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Bitácora no encontrada o acceso denegado"));
        
        // Update fields
        bitacora.setTitulo(bitacoraDTO.getTitulo());
        bitacora.setDescripcion(bitacoraDTO.getDescripcion());
        bitacora.setFecha(bitacoraDTO.getFecha());
        bitacora.setCategoria(bitacoraDTO.getCategoria());
        
        // Update additional fields
        if (bitacoraDTO.getCamposAdicionales() != null) {
            try {
                bitacora.setCamposAdicionales(objectMapper.writeValueAsString(bitacoraDTO.getCamposAdicionales()));
            } catch (JsonProcessingException e) {
                bitacora.setCamposAdicionales("{}");
            }
        }
        
        // Handle image upload if a new one is provided
        if (imagen != null && !imagen.isEmpty()) {
            // Delete old image if exists
            if (bitacora.getImagenUrl() != null) {
                imagenServiceImp.deleteImage(bitacora.getImagenUrl());
            }
            // Store new image
            String imagePath = imagenServiceImp.storeImage(imagen);
            bitacora.setImagenUrl(imagePath);
        }
        
        Bitacora updatedBitacora = bitacoraRepository.save(bitacora);
        return convertToDTO(updatedBitacora);
    }
    
    /**
     * Delete a bitácora
     * @param id Bitácora ID
     * @return true if successful
     * @throws IllegalArgumentException If the bitácora doesn't exist or user lacks permission
     */
    @Transactional
    public boolean deleteBitacora(Long id) throws IllegalArgumentException {
        User currentUser = userService.getCurrentUser();
        
        // Find and validate ownership
        Bitacora bitacora = bitacoraRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Bitácora no encontrada o acceso denegado"));
        
        // Delete associated image if exists
        if (bitacora.getImagenUrl() != null) {
            imagenServiceImp.deleteImage(bitacora.getImagenUrl());
        }
        
        bitacoraRepository.delete(bitacora);
        return true;
    }
    
    /**
     * Convert Bitacora entity to DTO
     * @param bitacora Entity to convert
     * @return BitacoraDTO
     */
    private BitacoraDTO convertToDTO(Bitacora bitacora) {
        BitacoraDTO dto = new BitacoraDTO();
        dto.setId(bitacora.getId());
        dto.setTitulo(bitacora.getTitulo());
        dto.setDescripcion(bitacora.getDescripcion());
        dto.setFecha(bitacora.getFecha());
        dto.setImagenUrl(bitacora.getImagenUrl());
        dto.setCategoria(bitacora.getCategoria());
        dto.setCreatedAt(bitacora.getCreatedAt());
        
        // Parse additional fields from JSON
        if (bitacora.getCamposAdicionales() != null && !bitacora.getCamposAdicionales().isEmpty()) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> campos = objectMapper.readValue(bitacora.getCamposAdicionales(), Map.class);
                dto.setCamposAdicionales(campos);
            } catch (JsonProcessingException e) {
                dto.setCamposAdicionales(new HashMap<>());
            }
        } else {
            dto.setCamposAdicionales(new HashMap<>());
        }
        
        return dto;
    }
}