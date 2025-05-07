package com.lilim.ecotracker.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lilim.ecotracker.features.bitacora.dto.BitacoraDTO;
import com.lilim.ecotracker.features.bitacora.model.Bitacora;
import com.lilim.ecotracker.features.bitacora.repository.BitacoraRepository;
import com.lilim.ecotracker.features.bitacora.service.BitacoraServiceImp;
import com.lilim.ecotracker.features.bitacora.service.ImagenServiceImp;
import com.lilim.ecotracker.security.model.User;
import com.lilim.ecotracker.security.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BitacoraServiceTest {

    @Mock
    private BitacoraRepository bitacoraRepository;

    @Mock
    private UserService userService;

    @Mock
    private ImagenServiceImp imagenService;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private BitacoraServiceImp bitacoraService;

    private User testUser;
    private BitacoraDTO testBitacoraDTO;
    private Bitacora testBitacora;
    private MultipartFile testImage;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setName("Test User");

        testBitacoraDTO = new BitacoraDTO();
        testBitacoraDTO.setTitulo("Test Bitácora");
        testBitacoraDTO.setDescripcion("Descripción de prueba");
        testBitacoraDTO.setFecha(LocalDateTime.now());
        testBitacoraDTO.setCategoria("plantacion");
        
        Map<String, Object> camposAdicionales = new HashMap<>();
        camposAdicionales.put("especie", "Pino");
        camposAdicionales.put("cantidad", 5);
        testBitacoraDTO.setCamposAdicionales(camposAdicionales);

        testBitacora = new Bitacora();
        testBitacora.setId(1L);
        testBitacora.setTitulo("Test Bitácora");
        testBitacora.setDescripcion("Descripción de prueba");
        testBitacora.setFecha(LocalDateTime.now());
        testBitacora.setCategoria("plantacion");
        testBitacora.setUser(testUser);
        testBitacora.setCamposAdicionales("{\"especie\":\"Pino\",\"cantidad\":5}");
        testBitacora.setCreatedAt(LocalDateTime.now());

        testImage = new MockMultipartFile(
            "testImage.jpg", 
            "testImage.jpg",
            "image/jpeg", 
            "test image content".getBytes()
        );
    }

    @Test
    @DisplayName("Test crear bitácora exitosamente sin imagen")
    void testCreateBitacoraWithoutImage() throws IOException {
        // Arrange
        when(userService.getCurrentUser()).thenReturn(testUser);
        when(objectMapper.writeValueAsString(any())).thenReturn("{\"especie\":\"Pino\",\"cantidad\":5}");
        when(bitacoraRepository.save(any(Bitacora.class))).thenReturn(testBitacora);
        when(objectMapper.readValue(anyString(), eq(Map.class))).thenReturn(testBitacoraDTO.getCamposAdicionales());

        // Act
        BitacoraDTO result = bitacoraService.createBitacora(testBitacoraDTO, null);

        // Assert
        assertNotNull(result);
        assertEquals(testBitacoraDTO.getTitulo(), result.getTitulo());
        assertEquals(testBitacoraDTO.getCategoria(), result.getCategoria());
        assertNotNull(result.getCamposAdicionales());
        assertEquals(2, result.getCamposAdicionales().size());
        
        verify(userService, times(1)).getCurrentUser();
        verify(bitacoraRepository, times(1)).save(any(Bitacora.class));
        verify(imagenService, never()).storeImage(any(MultipartFile.class));
    }

    @Test
    @DisplayName("Test crear bitácora exitosamente con imagen")
    void testCreateBitacoraWithImage() throws IOException {
        // Arrange
        String imagePath = "test-image-path.jpg";
        when(userService.getCurrentUser()).thenReturn(testUser);
        when(objectMapper.writeValueAsString(any())).thenReturn("{\"especie\":\"Pino\",\"cantidad\":5}");
        when(imagenService.storeImage(any(MultipartFile.class))).thenReturn(imagePath);
        
        testBitacora.setImagenUrl(imagePath);
        when(bitacoraRepository.save(any(Bitacora.class))).thenReturn(testBitacora);
        when(objectMapper.readValue(anyString(), eq(Map.class))).thenReturn(testBitacoraDTO.getCamposAdicionales());

        // Act
        BitacoraDTO result = bitacoraService.createBitacora(testBitacoraDTO, testImage);

        // Assert
        assertNotNull(result);
        assertEquals(testBitacoraDTO.getTitulo(), result.getTitulo());
        assertEquals(imagePath, result.getImagenUrl());
        
        verify(userService, times(1)).getCurrentUser();
        verify(imagenService, times(1)).storeImage(any(MultipartFile.class));
        verify(bitacoraRepository, times(1)).save(any(Bitacora.class));
    }

    @Test
    @DisplayName("Test manejo de error al procesar imagen")
    void testImageProcessingError() throws IOException {
        // Arrange
        when(userService.getCurrentUser()).thenReturn(testUser);
        when(imagenService.storeImage(any(MultipartFile.class))).thenThrow(new IOException("Error al procesar imagen"));

        // Act & Assert
        Exception exception = assertThrows(IOException.class, () -> {
            bitacoraService.createBitacora(testBitacoraDTO, testImage);
        });
        
        assertEquals("Error al procesar imagen", exception.getMessage());
        verify(bitacoraRepository, never()).save(any());
    }

    @Test
    @DisplayName("Test obtener una bitácora por ID")
    void testGetBitacoraById() throws JsonProcessingException {
        // Arrange
        Long bitacoraId = 1L;
        when(userService.getCurrentUser()).thenReturn(testUser);
        when(bitacoraRepository.findByIdAndUserId(bitacoraId, testUser.getId())).thenReturn(Optional.of(testBitacora));
        when(objectMapper.readValue(anyString(), eq(Map.class))).thenReturn(testBitacoraDTO.getCamposAdicionales());

        // Act
        Optional<BitacoraDTO> result = bitacoraService.getBitacoraById(bitacoraId);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testBitacora.getTitulo(), result.get().getTitulo());
        verify(bitacoraRepository, times(1)).findByIdAndUserId(bitacoraId, testUser.getId());
    }

    @Test
    @DisplayName("Test eliminar una bitácora con imagen")
    void testDeleteBitacoraWithImage() throws Exception {
        // Arrange
        Long bitacoraId = 1L;
        String imagePath = "test-image-path.jpg";
        testBitacora.setImagenUrl(imagePath);
        
        when(userService.getCurrentUser()).thenReturn(testUser);
        when(bitacoraRepository.findByIdAndUserId(bitacoraId, testUser.getId())).thenReturn(Optional.of(testBitacora));
        when(imagenService.deleteImage(imagePath)).thenReturn(true);

        // Act
        boolean result = bitacoraService.deleteBitacora(bitacoraId);

        // Assert
        assertTrue(result);
        verify(bitacoraRepository, times(1)).delete(testBitacora);
        verify(imagenService, times(1)).deleteImage(imagePath);
    }

    @Test
    @DisplayName("Test intentar eliminar una bitácora que no existe")
    void testDeleteNonExistentBitacora() {
        // Arrange
        Long bitacoraId = 999L;
        when(userService.getCurrentUser()).thenReturn(testUser);
        when(bitacoraRepository.findByIdAndUserId(bitacoraId, testUser.getId())).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            bitacoraService.deleteBitacora(bitacoraId);
        });
        
        assertTrue(exception.getMessage().contains("no encontrada"));
        verify(bitacoraRepository, never()).delete(any());
    }
}