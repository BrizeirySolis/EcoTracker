package com.lilim.ecotracker.features.metas.service;

import com.lilim.ecotracker.features.metas.dto.MetaDTO;
import com.lilim.ecotracker.features.metas.dto.MetaRecommendationDTO;
import com.lilim.ecotracker.features.metas.mapper.MetaMapper;
import com.lilim.ecotracker.features.metas.model.Meta;
import com.lilim.ecotracker.features.metas.repository.MetaRepository;
import com.lilim.ecotracker.features.metas.service.automation.MetaAutomationCoordinator;
import com.lilim.ecotracker.features.metas.service.calculation.MetaCalculationCoordinator;
import com.lilim.ecotracker.features.metas.service.recommendation.MetaRecommendationCoordinator;
import com.lilim.ecotracker.security.model.User;
import com.lilim.ecotracker.security.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Implementación principal del servicio de metas ambientales
 * 
 * Este servicio actúa como un orquestador central que delega responsabilidades específicas
 * a coordinadores especializados para mantener la separación de responsabilidades:
 * 
 * - MetaMapper: Conversión entre entidades y DTOs
 * - MetaCalculationCoordinator: Cálculos de progreso y valores
 * - MetaRecommendationCoordinator: Generación de recomendaciones
 * - MetaAutomationCoordinator: Automatización y evaluación de estados
 * 
 * Después de la refactorización, este servicio se enfoca únicamente en:
 * - Operaciones CRUD básicas
 * - Validaciones de acceso y seguridad
 * - Orquestación entre coordinadores especializados
 * 
 * @author EcoTracker Team
 * @version 2.0 - Refactorizada para mejorar mantenibilidad
 */
@Service
public class MetaServiceImp implements MetaService {

    private static final Logger logger = LoggerFactory.getLogger(MetaServiceImp.class);

    private final MetaRepository metaRepository;
    private final UserService userService;
    private final MetaMapper metaMapper;
    private final MetaCalculationCoordinator calculationCoordinator;
    private final MetaRecommendationCoordinator recommendationCoordinator;
    private final MetaAutomationCoordinator automationCoordinator;

    @Autowired
    public MetaServiceImp(
            MetaRepository metaRepository,
            UserService userService,
            MetaMapper metaMapper,
            MetaCalculationCoordinator calculationCoordinator,
            MetaRecommendationCoordinator recommendationCoordinator,
            MetaAutomationCoordinator automationCoordinator) {
        this.metaRepository = metaRepository;
        this.userService = userService;
        this.metaMapper = metaMapper;
        this.calculationCoordinator = calculationCoordinator;
        this.recommendationCoordinator = recommendationCoordinator;
        this.automationCoordinator = automationCoordinator;
    }

    /**
     * Obtiene todas las metas del usuario actual ordenadas por fecha de creación descendente.
     * Responsabilidad: Listar todas las metas del usuario autenticado para mostrar en el frontend.
     */
    @Override
    public List<MetaDTO> getAllMetas() {
        User currentUser = userService.getCurrentUser();
        List<Meta> metas = metaRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        return metaMapper.convertToDTOList(metas);
    }

    /**
     * Obtiene todas las metas del usuario actual filtradas por tipo.
     * Responsabilidad: Permitir filtrar metas por tipo (agua, electricidad, etc.) en la vista.
     */
    @Override
    public List<MetaDTO> getMetasByTipo(String tipo) {
        User currentUser = userService.getCurrentUser();
        List<Meta> metas = metaRepository.findByUserIdAndTipoOrderByCreatedAtDesc(currentUser.getId(), tipo);
        return metaMapper.convertToDTOList(metas);
    }

    /**
     * Obtiene una meta específica por su ID, validando que pertenezca al usuario actual.
     * Responsabilidad: Permitir ver el detalle de una meta concreta.
     */
    @Override
    public Optional<MetaDTO> getMetaById(Long id) {
        User currentUser = userService.getCurrentUser();
        return metaRepository.findByIdAndUserId(id, currentUser.getId())
                .map(metaMapper::convertToDTO);
    }

    /**
     * Crea una nueva meta ambiental para el usuario actual.
     * Responsabilidad: Validar, inicializar y persistir una nueva meta, delegando cálculos y automatización según corresponda.
     */
    @Override
    @Transactional
    public MetaDTO createMeta(MetaDTO metaDTO) {
        User currentUser = userService.getCurrentUser();

        Meta meta = new Meta();
        configureBasicProperties(meta, metaDTO);
        initializeMetaValues(meta, metaDTO, currentUser);
        meta.setUser(currentUser);

        Meta savedMeta = metaRepository.save(meta);

        // Actualización automática inicial solo para metas no-transporte
        if ("automatica".equals(savedMeta.getTipoEvaluacion()) && !"transporte".equals(savedMeta.getTipo())) {
            automationCoordinator.updateMetaProgress(savedMeta);
        }

        return metaMapper.convertToDTO(savedMeta);
    }

    /**
     * Configura las propiedades básicas de una meta a partir del DTO recibido.
     * Responsabilidad: Asignar los valores simples (título, descripción, fechas, etc.) a la entidad Meta.
     */
    private void configureBasicProperties(Meta meta, MetaDTO metaDTO) {
        meta.setTitulo(metaDTO.getTitulo());
        meta.setDescripcion(metaDTO.getDescripcion());
        meta.setTipo(metaDTO.getTipo());
        meta.setUnidad(metaDTO.getUnidad());
        meta.setMetrica(metaDTO.getMetrica());
        meta.setFechaInicio(metaDTO.getFechaInicio());
        meta.setFechaFin(metaDTO.getFechaFin());
        meta.setEstado("en_progreso");
    }

    /**
     * Inicializa los valores de la meta (valor inicial, objetivo, tipo de evaluación, etc.)
     * Responsabilidad: Aplicar reglas de negocio y cálculos históricos para dejar la meta lista para ser guardada.
     */
    private void initializeMetaValues(Meta meta, MetaDTO metaDTO, User currentUser) {
        // Determinar el valor inicial basado en datos históricos
        Double valorInicial = obtenerValorInicial(metaDTO.getTipo(), metaDTO.getMetrica());
        meta.setValorInicial(valorInicial);

        // Establecer valor objetivo proporcionado por el usuario
        meta.setValorObjetivo(metaDTO.getValorObjetivo());
        logger.info("Estableciendo valor objetivo de la meta: {}", metaDTO.getValorObjetivo());

        // Configurar valor actual inicial según el tipo de meta
        configureInitialCurrentValue(meta, metaDTO.getTipo(), metaDTO.getMetrica(), valorInicial);

        // Determinar tipo de evaluación
        meta.setTipoEvaluacion(metaDTO.getTipoEvaluacion() != null ?
                metaDTO.getTipoEvaluacion() : determinarTipoEvaluacion(metaDTO.getTipo()));
    }

    /**
     * Configura el valor actual inicial de la meta según su tipo y métrica.
     * Responsabilidad: Asegurar que el valorActual inicial sea coherente con el tipo de meta (reducción/incremento/transporte).
     */
    private void configureInitialCurrentValue(Meta meta, String tipo, String metrica, Double valorInicial) {
        if ("transporte".equals(tipo)) {
            meta.setValorActual(0.0);
            logger.info("Meta de transporte: valor actual inicial = 0");
        } else if (isIncrementMetric(tipo, metrica)) {
            meta.setValorActual(0.0);
            logger.info("Meta de incremento: valor actual inicial = 0");
        } else {
            // Para metas de reducción (agua, electricidad), partimos del valor inicial
            meta.setValorActual(valorInicial);
            logger.info("Meta de reducción: valor actual inicial = {}", valorInicial);
        }
    }

    /**
     * Determina si una métrica es de incremento (más es mejor) usando el coordinador de cálculos.
     * Responsabilidad: Abstraer la lógica de negocio para distinguir entre metas de reducción e incremento.
     */
    private boolean isIncrementMetric(String tipo, String metrica) {
        // Delegar al coordinador - negar el resultado de isReductionMetric
        return !calculationCoordinator.isReductionMetric(tipo, metrica);
    }

    /**
     * Obtiene el valor inicial de consumo basado en datos históricos del usuario.
     * Responsabilidad: Consultar el coordinador de cálculos para obtener el punto de partida de la meta.
     */
    private Double obtenerValorInicial(String tipo, String metrica) {
        User currentUser = userService.getCurrentUser();
        
        try {
            // Delegar al coordinador de cálculos
            return calculationCoordinator.obtenerValorInicial(currentUser, tipo, metrica);
        } catch (Exception e) {
            logger.error("Error al obtener valor inicial para tipo {}: {}", tipo, e.getMessage());
        }

        // Asegurar que tenemos un valor positivo (para evitar divisiones por cero)
        return 0.1;
    }

    /**
     * Actualiza una meta existente, validando que pertenezca al usuario actual.
     * Responsabilidad: Permitir la edición de metas, aplicando reglas de negocio y recalculando progreso si es automática.
     */
    @Override
    @Transactional
    public MetaDTO updateMeta(Long id, MetaDTO metaDTO) throws IllegalArgumentException {
        User currentUser = userService.getCurrentUser();

        Meta meta = metaRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Meta no encontrada o acceso denegado"));

        // Actualizar propiedades de la meta
        updateMetaProperties(meta, metaDTO);

        Meta updatedMeta = metaRepository.save(meta);

        // Si la meta es de evaluación automática, actualizar el progreso
        if ("automatica".equals(updatedMeta.getTipoEvaluacion())) {
            automationCoordinator.updateMetaProgress(updatedMeta);
        }

        return metaMapper.convertToDTO(updatedMeta);
    }

    /**
     * Actualiza las propiedades de una meta existente a partir del DTO recibido.
     * Responsabilidad: Sincronizar los cambios del usuario en la entidad antes de guardar.
     */
    private void updateMetaProperties(Meta meta, MetaDTO metaDTO) {
        meta.setTitulo(metaDTO.getTitulo());
        meta.setDescripcion(metaDTO.getDescripcion());
        meta.setTipo(metaDTO.getTipo());
        meta.setValorObjetivo(metaDTO.getValorObjetivo());
        meta.setUnidad(metaDTO.getUnidad());
        meta.setMetrica(metaDTO.getMetrica());
        meta.setFechaInicio(metaDTO.getFechaInicio());
        meta.setFechaFin(metaDTO.getFechaFin());
        meta.setTipoEvaluacion(metaDTO.getTipoEvaluacion() != null ?
                metaDTO.getTipoEvaluacion() : determinarTipoEvaluacion(metaDTO.getTipo()));
    }

    /**
     * Actualiza solo el progreso (valorActual) de una meta y su estado, validando pertenencia.
     * Responsabilidad: Permitir al usuario actualizar el avance de la meta y recalcular su estado.
     */
    @Override
    @Transactional
    public MetaDTO updateMetaProgreso(Long id, double valorActual) throws IllegalArgumentException {
        User currentUser = userService.getCurrentUser();

        Meta meta = metaRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Meta no encontrada o acceso denegado"));

        meta.setValorActual(valorActual);

        // Evaluar el estado usando el coordinador de automatización
        String nuevoEstado = automationCoordinator.evaluateMetaState(meta);
        meta.setEstado(nuevoEstado);

        Meta updatedMeta = metaRepository.save(meta);
        return metaMapper.convertToDTO(updatedMeta);
    }

    /**
     * Actualiza el progreso de una meta automática delegando al coordinador de automatización.
     * Responsabilidad: Permitir la actualización automática de metas según datos de consumo.
     */
    @Override
    @Transactional
    public void updateAutomaticProgress(Meta meta) {
        // Delegar al coordinador de automatización
        automationCoordinator.updateMetaProgress(meta);
    }

    /**
     * Elimina una meta del usuario actual por su ID.
     * Responsabilidad: Permitir al usuario borrar una meta propia.
     */
    @Override
    @Transactional
    public boolean deleteMeta(Long id) {
        User currentUser = userService.getCurrentUser();

        if (!metaRepository.existsByIdAndUserId(id, currentUser.getId())) {
            return false;
        }

        metaRepository.deleteById(id);
        return true;
    }

    /**
     * Obtiene recomendaciones para crear metas basadas en datos históricos del usuario.
     * Responsabilidad: Sugerir objetivos personalizados usando análisis de consumo previo.
     */
    @Override
    public Map<String, List<MetaRecommendationDTO>> getRecommendationsForTipo(String tipo) {
        User currentUser = userService.getCurrentUser();
        
        // Delegar al coordinador de recomendaciones
        return recommendationCoordinator.getRecommendationsForTipo(tipo, currentUser);
    }

    /**
     * Actualiza todas las metas automáticas del usuario actual.
     * Responsabilidad: Forzar la actualización de progreso y estado de todas las metas automáticas.
     */
    @Override
    @Transactional
    public void updateAllAutomaticMetas() {
        logger.info("Iniciando actualización masiva de todas las metas automáticas");
        // Delegar completamente al coordinador de automatización
        automationCoordinator.updateAllAutomaticMetas();
    }

    /**
     * Actualiza todas las metas automáticas de un tipo específico para el usuario actual.
     * Responsabilidad: Permitir la actualización masiva filtrada por tipo (agua, electricidad, etc.).
     */
    @Override
    @Transactional
    public List<MetaDTO> updateAutomaticMetasForType(String tipo) {
        User currentUser = userService.getCurrentUser();
        logger.info("Actualizando metas automáticas de tipo '{}' para usuario '{}'", tipo, currentUser.getUsername());
        
        // Delegar al coordinador de automatización
        return automationCoordinator.updateMetasByType(currentUser, tipo);
    }

    /**
     * Determina el tipo de evaluación predeterminado según el tipo de meta
     * 
     * Reglas de negocio:
     * - Metas de tipo "otro": evaluación manual (el usuario debe actualizar manualmente)
     * - Todos los demás tipos: evaluación automática (se actualizan basándose en datos de consumo)
     */
    private String determinarTipoEvaluacion(String tipo) {
        return "otro".equals(tipo) ? "manual" : "automatica";
    }
}