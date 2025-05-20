package com.lilim.ecotracker.features.metas.controller;

import com.lilim.ecotracker.features.electricity.model.Electricity;
import com.lilim.ecotracker.features.electricity.repository.ElectricityRepository;
import com.lilim.ecotracker.features.metas.dto.MetaDTO;
import com.lilim.ecotracker.features.metas.dto.MetaRecommendationDTO;
import com.lilim.ecotracker.features.metas.dto.MetaUpdateProgresoDTO;
import com.lilim.ecotracker.features.metas.model.Meta;
import com.lilim.ecotracker.features.metas.repository.MetaRepository;
import com.lilim.ecotracker.features.metas.service.MetaService;
import com.lilim.ecotracker.features.transport.model.Transport;
import com.lilim.ecotracker.features.transport.repository.TransportRepository;
import com.lilim.ecotracker.features.water.model.Water;
import com.lilim.ecotracker.features.water.repository.WaterRepository;
import com.lilim.ecotracker.security.model.User;
import com.lilim.ecotracker.security.service.UserService;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controlador REST para operaciones CRUD de metas ambientales
 * Expone endpoints para gestionar los desafíos personales de consumo responsable
 */
@RestController
@RequestMapping("/api/metas")
public class MetaController {

    private final MetaService metaService;
    private final UserService userService;
    private final MetaRepository metaRepository;
    private final Logger logger = org.slf4j.LoggerFactory.getLogger(MetaController.class);

    // Repositories for fetching records
    private final WaterRepository waterRepository;
    private final ElectricityRepository electricityRepository;
    private final TransportRepository transportRepository;



    @Autowired
    public MetaController(MetaService metaService, UserService userService, MetaRepository metaRepository, WaterRepository waterRepository, ElectricityRepository electricityRepository, TransportRepository transportRepository) {
        this.metaService = metaService;
        this.userService = userService;
        this.metaRepository = metaRepository;
        this.waterRepository = waterRepository;
        this.electricityRepository = electricityRepository;
        this.transportRepository = transportRepository;
    }

    /**
     * Obtener todas las metas del usuario actual
     * @param tipo Filtro opcional por tipo de meta (agua, electricidad, etc.)
     * @return Lista de metas
     */
    @GetMapping
    public ResponseEntity<List<MetaDTO>> getAllMetas(
            @RequestParam(required = false) String tipo) {
        
        List<MetaDTO> metas;
        if (tipo != null && !tipo.isEmpty()) {
            metas = metaService.getMetasByTipo(tipo);
        } else {
            metas = metaService.getAllMetas();
        }
        
        return ResponseEntity.ok(metas);
    }

    /**
     * Obtener una meta específica por ID
     * @param id ID de la meta
     * @return Meta si existe
     */
    @GetMapping("/{id}")
    public ResponseEntity<MetaDTO> getMetaById(@PathVariable Long id) {
        return metaService.getMetaById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Crear una nueva meta
     * @param metaDTO Datos de la meta a crear
     * @return Meta creada
     */
    @PostMapping
    public ResponseEntity<MetaDTO> createMeta(@RequestBody MetaDTO metaDTO) {
        MetaDTO createdMeta = metaService.createMeta(metaDTO);
        return new ResponseEntity<>(createdMeta, HttpStatus.CREATED);
    }

    /**
     * Actualizar una meta existente
     * @param id ID de la meta a actualizar
     * @param metaDTO Datos actualizados
     * @return Meta actualizada
     */
    @PutMapping("/{id}")
    public ResponseEntity<MetaDTO> updateMeta(
            @PathVariable Long id,
            @RequestBody MetaDTO metaDTO) {
        
        try {
            MetaDTO updatedMeta = metaService.updateMeta(id, metaDTO);
            return ResponseEntity.ok(updatedMeta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Actualizar solo el progreso de una meta
     * @param id ID de la meta
     * @param updateDTO Datos de actualización de progreso
     * @return Meta actualizada
     */
    @PatchMapping("/{id}/progreso")
    public ResponseEntity<MetaDTO> updateMetaProgreso(
            @PathVariable Long id,
            @RequestBody MetaUpdateProgresoDTO updateDTO) {
        
        try {
            MetaDTO updatedMeta = metaService.updateMetaProgreso(id, updateDTO.getValorActual());
            return ResponseEntity.ok(updatedMeta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Eliminar una meta
     * @param id ID de la meta a eliminar
     * @return Respuesta vacía con estado 204
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMeta(@PathVariable Long id) {
        if (metaService.deleteMeta(id)) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Obtener recomendaciones para crear metas basadas en datos históricos
     * @param tipo Tipo de meta (agua, electricidad, transporte, etc.)
     * @return Lista de recomendaciones
     */
    @GetMapping("/recomendaciones/{tipo}")
    public ResponseEntity<Map<String, List<MetaRecommendationDTO>>> getRecommendations(
            @PathVariable String tipo) {
        
        Map<String, List<MetaRecommendationDTO>> recommendations = 
                metaService.getRecommendationsForTipo(tipo);
        
        return ResponseEntity.ok(recommendations);
    }


    @GetMapping("/{id}/refresh")
    public ResponseEntity<MetaDTO> refreshMetaProgress(@PathVariable Long id) {
        User currentUser = userService.getCurrentUser();


        Meta meta = metaRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Meta no encontrada o acceso denegado"));

        logger.info("Iniciando actualización forzada de meta {} para usuario {}. Valores iniciales: valorActual={}, estado={}",
                id, currentUser.getUsername(), meta.getValorActual(), meta.getEstado());

        try {
            // Consultar todos los registros sin filtro para diagnóstico
            if ("electricidad".equals(meta.getTipo())) {
                List<Electricity> allRecords = electricityRepository.findByUserId(currentUser.getId());
                logger.info("Registros totales de electricidad para el usuario: {}", allRecords.size());

                if (!allRecords.isEmpty()) {
                    // Ordenar los registros por fecha (descendente)
                    allRecords.sort((a, b) -> b.getDate().compareTo(a.getDate()));

                    Electricity first = allRecords.get(allRecords.size()-1);
                    Electricity last = allRecords.get(0);

                    logger.info("Muestra de registros - Primero: fecha={}, valor={} | Último: fecha={}, valor={}",
                            first.getDate(), first.getKilowatts(), last.getDate(), last.getKilowatts());

                    // ACTUALIZACIÓN DIRECTA: Usar el último valor como valor actual
                    meta.setValorActual(last.getKilowatts());
                    logger.info("Actualizando directamente valorActual a {} kWh (último registro)", last.getKilowatts());
                }
            }
            else if ("agua".equals(meta.getTipo())) {
                List<Water> allRecords = waterRepository.findByUserId(currentUser.getId());
                logger.info("Registros totales de agua para el usuario: {}", allRecords.size());

                if (!allRecords.isEmpty()) {
                    // Ordenar los registros por fecha (descendente)
                    allRecords.sort((a, b) -> b.getDate().compareTo(a.getDate()));

                    Water first = allRecords.get(allRecords.size()-1);
                    Water last = allRecords.get(0);

                    logger.info("Muestra de registros - Primero: fecha={}, valor={} | Último: fecha={}, valor={}",
                            first.getDate(), first.getLiters(), last.getDate(), last.getLiters());

                    // ACTUALIZACIÓN DIRECTA: Usar el último valor como valor actual
                    meta.setValorActual(last.getLiters());
                    logger.info("Actualizando directamente valorActual a {} litros (último registro)", last.getLiters());
                }
            } else if ("transporte".equals(meta.getTipo())) {
                List<Transport> allRecords = transportRepository.findByUserId(currentUser.getId());
                logger.info("Registros totales de transporte para el usuario: {}", allRecords.size());

                if (!allRecords.isEmpty()) {
                    // Ordenar los registros por fecha (descendente)
                    allRecords.sort((a, b) -> b.getDate().compareTo(a.getDate()));

                    Transport first = allRecords.get(allRecords.size()-1);
                    Transport last = allRecords.get(0);

                    logger.info("Muestra de registros - Primero: fecha={}, valor={} | Último: fecha={}, valor={}",
                            first.getDate(), first.getKilometers(), last.getDate(), last.getKilometers());

                    // ACTUALIZACIÓN DIRECTA: Usar el último valor como valor actual
                    meta.setValorActual(last.getKilometers());
                    logger.info("Actualizando directamente valorActual a {} km (último registro)", last.getKilometers());
                }
            }

            // También llamar al método de actualización normal
            metaService.updateAutomaticProgress(meta);

            // Guardar explícitamente la meta actualizada
            meta = metaRepository.saveAndFlush(meta);

            // Verificar que los valores se actualizaron correctamente
            logger.info("Meta actualizada correctamente. Nuevos valores: valorActual={}, estado={}",
                    meta.getValorActual(), meta.getEstado());
        } catch (Exception e) {
            logger.error("Error al actualizar la meta {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }

        // Convertir a DTO y retornar
        MetaDTO metaDTO = MetaDTO.builder()
                .id(meta.getId())
                .titulo(meta.getTitulo())
                .descripcion(meta.getDescripcion())
                .tipo(meta.getTipo())
                .valorObjetivo(meta.getValorObjetivo())
                .unidad(meta.getUnidad())
                .metrica(meta.getMetrica())
                .fechaInicio(meta.getFechaInicio())
                .fechaFin(meta.getFechaFin())
                .estado(meta.getEstado())
                .valorActual(meta.getValorActual())
                .valorInicial(meta.getValorInicial())
                .tipoEvaluacion(meta.getTipoEvaluacion())
                .createdAt(meta.getCreatedAt())
                .updatedAt(meta.getUpdatedAt())
                .build();

        return ResponseEntity.ok(metaDTO);
    }

    @GetMapping("/refresh-by-type/{tipo}")
    public ResponseEntity<List<MetaDTO>> refreshMetasByType(@PathVariable String tipo) {
        User currentUser = userService.getCurrentUser();

        try {
            List<MetaDTO> updatedMetas = metaService.updateAutomaticMetasForType(tipo);
            return ResponseEntity.ok(updatedMetas);
        } catch (Exception e) {
            logger.error("Error actualizando metas de tipo {}: {}", tipo, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // En backend/src/main/java/com/lilim/ecotracker/features/metas/controller/MetaController.java

    /**
     * Actualizar todas las metas automáticas del usuario actual
     * @param tipo Tipo de meta a actualizar (opcional)
     * @return Lista de metas actualizadas
     */
    @GetMapping("/refresh-all")
    public ResponseEntity<List<MetaDTO>> refreshAllMetas(
            @RequestParam(required = false) String tipo) {

        User currentUser = userService.getCurrentUser();

        try {
            List<MetaDTO> updatedMetas;

            if (tipo != null && !tipo.isEmpty()) {
                // Actualizar metas de un tipo específico
                updatedMetas = metaService.updateAutomaticMetasForType(tipo);
            } else {
                // Actualizar todas las metas automáticas
                metaService.updateAllAutomaticMetas();

                // Obtener las metas actualizadas
                updatedMetas = metaService.getAllMetas();
            }

            return ResponseEntity.ok(updatedMetas);
        } catch (Exception e) {
            logger.error("Error actualizando metas: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}