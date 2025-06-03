package com.lilim.ecotracker.features.metas.service.calculation;

import com.lilim.ecotracker.features.metas.model.Meta;
import com.lilim.ecotracker.features.transport.model.Transport;
import com.lilim.ecotracker.features.transport.repository.TransportRepository;
import com.lilim.ecotracker.security.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Servicio de cálculo específico para metas de transporte
 * Maneja la lógica compleja de actualización de progreso y cálculo de valores para transporte
 */
@Service
public class TransportMetaCalculationService implements MetaProgressCalculationService {

    private static final Logger logger = LoggerFactory.getLogger(TransportMetaCalculationService.class);

    private final TransportRepository transportRepository;

    @Autowired
    public TransportMetaCalculationService(TransportRepository transportRepository) {
        this.transportRepository = transportRepository;
    }

    @Override
    public void updateProgress(Meta meta) {
        User user = meta.getUser();
        logger.info("Actualizando progreso de meta de transporte ID: {}", meta.getId());

        // Obtener fecha de creación de la meta
        LocalDateTime fechaCreacionMeta = meta.getCreatedAt();
        if (fechaCreacionMeta == null) {
            fechaCreacionMeta = LocalDateTime.now().minus(1, ChronoUnit.DAYS);
            logger.warn("Meta ID {}: No tiene fecha de creación, usando fecha actual - 1 día", meta.getId());
        }

        // Obtener la métrica específica - si no existe, usar un valor predeterminado
        String metrica = meta.getMetrica();
        if (metrica == null || metrica.isEmpty()) {
            metrica = determinarMetricaPorDefecto(meta.getUnidad());
            logger.info("Meta ID {}: No tiene métrica definida, usando '{}' como predeterminada",
                    meta.getId(), metrica);
        }

        logger.info("Actualizando meta ID {}: tipo={}, métrica={}, unidad={}, valorInicial={}, valorActual={}, valorObjetivo={}",
                meta.getId(), meta.getTipo(), metrica, meta.getUnidad(), meta.getValorInicial(),
                meta.getValorActual(), meta.getValorObjetivo());

        try {
            // Asegurar que siempre tengamos un valor inicial válido
            if (meta.getValorInicial() == null || meta.getValorInicial() <= 0.1) {
                Double valorInicial = calcularValorInicial(user, fechaCreacionMeta, metrica, meta.getValorObjetivo());
                meta.setValorInicial(valorInicial);
                logger.info("Valor inicial calculado y establecido: {} {}", valorInicial, meta.getUnidad());
            }

            // Obtener registros SOLO desde la creación de la meta
            List<Transport> registrosDesdeCreacion = transportRepository.findByUserIdAndDateAfter(
                    user.getId(), fechaCreacionMeta);
            logger.info("Encontrados {} registros posteriores a la creación de la meta ({})",
                    registrosDesdeCreacion.size(), fechaCreacionMeta);

            // Calcular el valor actual como suma de registros posteriores a la creación
            double valorActual = calcularValorSegunMetrica(registrosDesdeCreacion, metrica);
            meta.setValorActual(valorActual);
            logger.info("Valor actual actualizado a: {} {} (suma de {} registros)",
                    valorActual, meta.getUnidad(), registrosDesdeCreacion.size());

        } catch (Exception e) {
            logger.error("Error al actualizar meta de transporte ID {}: {}", meta.getId(), e.getMessage(), e);
        }
    }

    @Override
    public Double obtenerValorInicial(User user, String metrica) {
        try {
            LocalDateTime ahora = LocalDateTime.now();
            LocalDateTime unMesAtras = ahora.minus(1, ChronoUnit.MONTHS);

            if ("reduccion_combustion".equals(metrica)) {
                // Obtener kilómetros recorridos en vehículos de combustión en el último mes
                Double kmCombustion = transportRepository.sumKilometersByUserIdAndTransportTypeAndDateBetween(
                        user.getId(), "car", unMesAtras, ahora);

                if (kmCombustion != null && kmCombustion > 0) {
                    logger.info("Valor inicial (último mes) para reducción combustión: {} km", kmCombustion);
                    return kmCombustion;
                }
            } else if ("porcentaje_sostenible".equals(metrica)) {
                // Calcular porcentaje actual de transporte sostenible
                List<Transport> transportesUltimoMes = transportRepository.findByUserIdAndDateBetween(
                        user.getId(), unMesAtras, ahora);

                double kmTotales = transportesUltimoMes.stream()
                        .mapToDouble(Transport::getKilometers)
                        .sum();

                double kmSostenibles = transportesUltimoMes.stream()
                        .filter(t -> "bicycle".equals(t.getTransportType()) || "walk".equals(t.getTransportType()))
                        .mapToDouble(Transport::getKilometers)
                        .sum();

                if (kmTotales > 0) {
                    Double porcentaje = (kmSostenibles / kmTotales) * 100;
                    logger.info("Valor inicial (último mes) para transporte sostenible: {}%", porcentaje);
                    return porcentaje;
                } else {
                    return 0.0;
                }
            } else if ("costo".equals(metrica)) {
                // Obtener costo total de transporte del último mes
                Double costoUltimoMes = transportRepository.sumCostByUserIdAndDateBetween(
                        user.getId(), unMesAtras, ahora);

                if (costoUltimoMes != null && costoUltimoMes > 0) {
                    logger.info("Valor inicial (último mes) para costo de transporte: {} MXN", costoUltimoMes);
                    return costoUltimoMes;
                }
            }
        } catch (Exception e) {
            logger.error("Error al obtener valor inicial para transporte: {}", e.getMessage());
        }

        return 0.1; // Valor por defecto
    }

    @Override
    public Double obtenerValorActual(User user, String metrica) {
        // Para métricas de reducción como "reduccion_combustion"
        List<Transport> consumos = transportRepository.findByUserIdOrderByDateDesc(user.getId());
        if (!consumos.isEmpty()) {
            // Filtrar según la métrica específica
            // Por ejemplo, para reducción de combustión, sumar solo viajes en carro
            return consumos.stream()
                    .filter(t -> "car".equals(t.getTransportType()))
                    .mapToDouble(Transport::getKilometers)
                    .sum();
        }
        return 0.0; // Valor por defecto si no hay datos
    }

    @Override
    public boolean canHandle(String tipo) {
        return "transporte".equals(tipo);
    }

    @Override
    public boolean isReductionMetric(String metrica) {
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

    /**
     * Calcula el valor según la métrica especificada
     */
    public double calcularValorSegunMetrica(List<Transport> registros, String metrica) {
        if (registros.isEmpty()) {
            return 0.0;
        }

        switch (metrica) {
            case "reduccion_combustion":
                // Kilómetros en vehículos de combustión
                return registros.stream()
                        .filter(t -> "car".equals(t.getTransportType()))
                        .mapToDouble(Transport::getKilometers)
                        .sum();

            case "porcentaje_sostenible":
                // Porcentaje de transporte sostenible
                double kmTotales = registros.stream()
                        .mapToDouble(Transport::getKilometers)
                        .sum();
                double kmSostenibles = registros.stream()
                        .filter(t -> "bicycle".equals(t.getTransportType()) || "walk".equals(t.getTransportType()))
                        .mapToDouble(Transport::getKilometers)
                        .sum();
                return kmTotales > 0 ? (kmSostenibles / kmTotales) * 100 : 0.0;

            case "km_bicicleta":
            case "uso_bicicleta":
                // Kilómetros en bicicleta
                return registros.stream()
                        .filter(t -> "bicycle".equals(t.getTransportType()))
                        .mapToDouble(Transport::getKilometers)
                        .sum();

            case "costo":
                // Costo total
                return registros.stream()
                        .mapToDouble(Transport::getCost)
                        .sum();

            default:
                // Por defecto, kilómetros totales
                return registros.stream()
                        .mapToDouble(Transport::getKilometers)
                        .sum();
        }
    }

    /**
     * Determina la métrica basándose en la unidad si no está explícitamente definida
     */
    public String determinarMetricaPorDefecto(String unidad) {
        switch (unidad) {
            case "km":
                return "reduccion_combustion"; // Por defecto, asumimos reducción
            case "porcentaje":
                return "porcentaje_sostenible";
            case "costo":
                return "costo";
            default:
                return "reduccion_combustion";
        }
    }

    /**
     * Evalúa el estado específicamente para metas de transporte
     * Simplifica la lógica para ser más intuitiva
     */
    public String evaluarEstadoTransporte(Meta meta) {
        LocalDateTime hoy = LocalDateTime.now();
        LocalDateTime fechaFin = meta.getFechaFin();
        boolean fechaVencida = fechaFin != null && fechaFin.isBefore(hoy);

        // Agregar logging adicional para depurar
        logger.info("=== EVALUANDO ESTADO TRANSPORTE META ID {} ===", meta.getId());
        logger.info("Métrica: {}", meta.getMetrica());
        logger.info("Unidad: {}", meta.getUnidad());
        logger.info("Fecha actual: {}, Fecha fin: {}, ¿Vencida?: {}", hoy, fechaFin, fechaVencida);

        // Si no hay métrica definida, inferirla de la unidad
        String metrica = meta.getMetrica();
        if (metrica == null || metrica.isEmpty()) {
            metrica = determinarMetricaPorDefecto(meta.getUnidad());
            logger.info("Métrica no definida, usando por defecto: {}", metrica);
        }

        boolean esReduccion = isReductionMetric(metrica);
        logger.info("¿Es métrica de reducción?: {}", esReduccion);

        if (meta.getValorActual() == null || meta.getValorObjetivo() == null) {
            return "en_progreso"; // Si faltan datos, asumir en progreso
        }

        if (esReduccion) {
            // LÓGICA PARA METAS DE REDUCCIÓN (ej: máximo 250 km en auto)

            // Si ya se excedió el límite, la meta está fallida inmediatamente
            if (meta.getValorActual() >= meta.getValorObjetivo()) {
                logger.info("Meta de transporte ID {}: FALLIDA - Se excedió el límite (actual {} >= objetivo {})",
                        meta.getId(), meta.getValorActual(), meta.getValorObjetivo());
                return "fallida";
            }

            // Si la fecha venció y NO se excedió el límite, está completada
            if (fechaVencida) {
                logger.info("Meta de transporte ID {}: COMPLETADA - Fecha vencida sin exceder límite (actual {} < objetivo {})",
                        meta.getId(), meta.getValorActual(), meta.getValorObjetivo());
                return "completada";
            }

            // Si no ha vencido y no se ha excedido, está en progreso
            logger.info("Meta de transporte ID {}: EN PROGRESO - No vencida y sin exceder límite (actual {} < objetivo {})",
                    meta.getId(), meta.getValorActual(), meta.getValorObjetivo());
            return "en_progreso";

        } else {
            // LÓGICA PARA METAS DE INCREMENTO (ej: mínimo 100 km en bicicleta)

            // Si ya se alcanzó el objetivo, está completada
            if (meta.getValorActual() >= meta.getValorObjetivo()) {
                logger.info("Meta de transporte ID {}: COMPLETADA - Se alcanzó el objetivo de incremento (actual {} >= objetivo {})",
                        meta.getId(), meta.getValorActual(), meta.getValorObjetivo());
                return "completada";
            }

            // Si la fecha venció sin alcanzar el objetivo, está fallida
            if (fechaVencida) {
                logger.info("Meta de transporte ID {}: FALLIDA - Fecha vencida sin alcanzar objetivo (actual {} < objetivo {})",
                        meta.getId(), meta.getValorActual(), meta.getValorObjetivo());
                return "fallida";
            }

            // Si no ha vencido y no se ha alcanzado, está en progreso
            logger.info("Meta de transporte ID {}: EN PROGRESO - No vencida y sin alcanzar objetivo (actual {} < objetivo {})",
                    meta.getId(), meta.getValorActual(), meta.getValorObjetivo());
            return "en_progreso";
        }
    }

    /**
     * Calcula el valor inicial para una meta de transporte basado en registros anteriores
     */
    private Double calcularValorInicial(User user, LocalDateTime fechaCreacionMeta, String metrica, Double valorObjetivo) {
        // Calcular del último mes antes de crear la meta
        LocalDateTime unMesAtras = fechaCreacionMeta.minus(1, ChronoUnit.MONTHS);
        List<Transport> transportesUltimoMes = transportRepository.findByUserIdAndDateBetween(
                user.getId(), unMesAtras, fechaCreacionMeta);

        Double valorInicial = calcularValorInicialTransporte(transportesUltimoMes, metrica);

        // Para metas de reducción, asegurar un valor inicial mínimo razonable
        if (isReductionMetric(metrica) && valorInicial < valorObjetivo) {
            // Si el valor inicial es menor que el objetivo, usar el objetivo + 20% como inicial
            valorInicial = valorObjetivo * 1.2;
            logger.info("Ajustando valor inicial a {} para permitir reducción desde objetivo", valorInicial);
        }

        // Asegurar un valor mínimo para evitar problemas de división por cero
        if (valorInicial <= 0) {
            valorInicial = valorObjetivo > 0 ? valorObjetivo * 1.1 : 10.0;
        }

        return valorInicial;
    }

    /**
     * Calcula el valor inicial para una meta de transporte basado en registros anteriores
     */
    private double calcularValorInicialTransporte(List<Transport> registrosAnteriores, String metrica) {
        if (registrosAnteriores.isEmpty()) {
            return 0.1; // Valor por defecto si no hay datos previos
        }

        if ("reduccion_combustion".equals(metrica)) {
            // Usar kilómetros totales de vehículos de combustión
            return registrosAnteriores.stream()
                    .filter(t -> "car".equals(t.getTransportType()))
                    .mapToDouble(Transport::getKilometers)
                    .sum();
        } else if ("porcentaje_sostenible".equals(metrica)) {
            double kmTotales = registrosAnteriores.stream()
                    .mapToDouble(Transport::getKilometers)
                    .sum();

            double kmSostenibles = registrosAnteriores.stream()
                    .filter(t -> "bicycle".equals(t.getTransportType()) || "walk".equals(t.getTransportType()))
                    .mapToDouble(Transport::getKilometers)
                    .sum();

            return kmTotales > 0 ? (kmSostenibles / kmTotales) * 100 : 0.0;
        } else if ("costo".equals(metrica)) {
            return registrosAnteriores.stream()
                    .mapToDouble(Transport::getCost)
                    .sum();
        }

        // Valor por defecto
        return registrosAnteriores.stream()
                .mapToDouble(Transport::getKilometers)
                .sum();
    }
} 