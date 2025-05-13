package com.lilim.ecotracker.features.summary.service;

import com.lilim.ecotracker.features.electricity.model.Electricity;
import com.lilim.ecotracker.features.electricity.repository.ElectricityRepository;
import com.lilim.ecotracker.features.summary.dto.ConsumptionAnalyticsDTO;
import com.lilim.ecotracker.features.transport.model.Transport;
import com.lilim.ecotracker.features.transport.repository.TransportRepository;
import com.lilim.ecotracker.features.water.model.Water;
import com.lilim.ecotracker.features.water.repository.WaterRepository;
import com.lilim.ecotracker.security.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para análisis avanzado de consumo de recursos.
 * <p>
 * Este servicio proporciona análisis detallados de patrones de consumo para agua, electricidad
 * y transporte, generando métricas e insights para el dashboard del usuario. Transforma
 * datos brutos en métricas que permiten a los usuarios comprender y optimizar su impacto ambiental.
 * </p>
 * <p>
 * El servicio calcula:
 * <ul>
 *   <li>Consumo bimestral y tendencias</li>
 *   <li>Métricas de costo (total, unitario, tendencias)</li>
 *   <li>Promedios móviles y detección de anomalías</li>
 *   <li>Comparación con benchmarks estatales y nacionales</li>
 *   <li>Emisiones de CO2 y ahorros estimados</li>
 *   <li>Pronósticos de consumo futuro</li>
 * </ul>
 * </p>
 *
 * @author EcoTracker Team
 * @version 1.0
 */
@Service
public class ConsumptionAnalyticsService {

    private final WaterRepository waterRepository;
    private final ElectricityRepository electricityRepository;
    private final TransportRepository transportRepository;

    // Constants for benchmarks and calculations
    /**
     * Consumo promedio de agua mensual en el estado de Zacatecas (m³)
     */
    private static final double STATE_BENCHMARK_WATER = 13.8;

    /**
     * Consumo promedio de agua mensual a nivel nacional en México (m³)
     */
    private static final double NATIONAL_BENCHMARK_WATER = 14.4;

    /**
     * Consumo promedio de electricidad mensual en el estado de Zacatecas (kWh)
     */
    private static final double STATE_BENCHMARK_ELECTRICITY = 280.0;

    /**
     * Consumo promedio de electricidad mensual a nivel nacional en México (kWh)
     */
    private static final double NATIONAL_BENCHMARK_ELECTRICITY = 250.0;

    /**
     * Factor de emisión de CO2 por metro cúbico de agua consumida (kg CO2 por m³)
     */
    private static final double CO2_PER_M3_WATER = 0.376;

    /**
     * Factor de emisión de CO2 por kilowatt-hora de electricidad (kg CO2 por kWh)
     * Basado en la matriz energética mexicana
     */
    private static final double CO2_PER_KWH = 0.527;

    /**
     * Factor de emisión de CO2 por kilómetro recorrido en automóvil (kg CO2 por km)
     */
    private static final double CO2_PER_KM_CAR = 0.192;

    /**
     * Construye una nueva instancia del servicio de análisis de consumo.
     *
     * @param waterRepository Repositorio para acceder a datos de consumo de agua
     * @param electricityRepository Repositorio para acceder a datos de consumo de electricidad
     * @param transportRepository Repositorio para acceder a datos de uso de transporte
     */
    @Autowired
    public ConsumptionAnalyticsService(
            WaterRepository waterRepository,
            ElectricityRepository electricityRepository,
            TransportRepository transportRepository) {
        this.waterRepository = waterRepository;
        this.electricityRepository = electricityRepository;
        this.transportRepository = transportRepository;
    }

    /**
     * Genera análisis completo del consumo de agua del usuario.
     * <p>
     * Este método procesa todos los registros de consumo de agua del usuario,
     * los agrupa en períodos bimestrales y calcula diversas métricas de consumo,
     * costo, eficiencia y emisiones. Detecta anomalías y proporciona pronósticos.
     * </p>
     * <p>
     * El flujo de procesamiento incluye:
     * <ol>
     *   <li>Recuperación de datos del repositorio</li>
     *   <li>Ordenación cronológica</li>
     *   <li>Agrupación bimestral</li>
     *   <li>Cálculo de métricas de consumo y costo</li>
     *   <li>Cálculo de promedios móviles</li>
     *   <li>Detección de anomalías</li>
     *   <li>Cálculo de emisiones de CO2</li>
     *   <li>Pronóstico para el siguiente período</li>
     * </ol>
     * </p>
     *
     * @param user Usuario actual para el que se genera el análisis
     * @return DTO con análisis completo de consumo de agua
     */
    public ConsumptionAnalyticsDTO getWaterAnalytics(User user) {
        List<Water> waterConsumption = waterRepository.findByUserId(user.getId());

        if (waterConsumption.isEmpty()) {
            return createEmptyWaterAnalytics();
        }

        // Sort by date (oldest first)
        waterConsumption.sort(Comparator.comparing(Water::getDate));

        // Group data into bimonthly periods
        List<List<Water>> bimonthlyGroups = groupWaterBimonthlyData(waterConsumption);

        // Extract consumption values for each bimonthly period
        List<Double> bimonthlyConsumption = bimonthlyGroups.stream()
                .map(group -> group.stream().mapToDouble(Water::getLiters).sum())
                .collect(Collectors.toList());

        // Extract costs for each bimonthly period
        List<Double> bimonthlyCosts = bimonthlyGroups.stream()
                .map(group -> group.stream().mapToDouble(Water::getCost).sum())
                .collect(Collectors.toList());

        // Calculate moving averages (over 3 bimonthly periods)
        List<Double> movingAverages = calculateMovingAverages(bimonthlyConsumption);

        // Calculate metrics for current bimonthly period
        double currentConsumption = bimonthlyConsumption.isEmpty() ? 0 :
                bimonthlyConsumption.get(bimonthlyConsumption.size() - 1);
        double previousConsumption = bimonthlyConsumption.size() > 1 ?
                bimonthlyConsumption.get(bimonthlyConsumption.size() - 2) : currentConsumption;
        double percentChange = previousConsumption > 0 ?
                ((currentConsumption - previousConsumption) / previousConsumption) * 100 : 0;

        // Current cost metrics
        double currentCost = bimonthlyCosts.isEmpty() ? 0 :
                bimonthlyCosts.get(bimonthlyCosts.size() - 1);
        double currentUnitCost = currentConsumption > 0 ? currentCost / currentConsumption : 0;

        // Calculate historical unit costs
        List<Double> unitCosts = new ArrayList<>();
        for (int i = 0; i < bimonthlyConsumption.size(); i++) {
            double consumption = bimonthlyConsumption.get(i);
            double cost = bimonthlyCosts.get(i);
            if (consumption > 0) {
                unitCosts.add(cost / consumption);
            }
        }

        double avgHistoricalUnitCost = unitCosts.isEmpty() ? 0 :
                unitCosts.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        double unitCostPercentChange = avgHistoricalUnitCost > 0 ?
                ((currentUnitCost - avgHistoricalUnitCost) / avgHistoricalUnitCost) * 100 : 0;

        // Current moving average
        double currentMovingAvg = movingAverages.isEmpty() ? currentConsumption :
                movingAverages.get(movingAverages.size() - 1);
        double movingAvgDeviation = currentMovingAvg > 0 ?
                ((currentConsumption - currentMovingAvg) / currentMovingAvg) * 100 : 0;

        // Benchmark comparison
        String efficiencyRating = currentConsumption < STATE_BENCHMARK_WATER ? "more efficient" :
                currentConsumption > NATIONAL_BENCHMARK_WATER ? "less efficient" : "average";

        // Detect anomalies (consumptions >20% above moving average)
        List<ConsumptionAnalyticsDTO.AnomalyDetailDTO> anomalyDetails = new ArrayList<>();
        int anomalyCount = 0;

        for (int i = 0; i < bimonthlyConsumption.size() && i < movingAverages.size(); i++) {
            double consumption = bimonthlyConsumption.get(i);
            double movingAvg = movingAverages.get(i);

            if (consumption > movingAvg * 1.2) {
                anomalyCount++;

                // Get date from first entry in this bimonthly group
                LocalDateTime anomalyDate = bimonthlyGroups.get(i).get(0).getDate();

                anomalyDetails.add(
                        ConsumptionAnalyticsDTO.AnomalyDetailDTO.builder()
                                .date(anomalyDate)
                                .value(consumption)
                                .expectedValue(movingAvg)
                                .percentDeviation(((consumption - movingAvg) / movingAvg) * 100)
                                .build()
                );
            }
        }

        // Calculate CO2 savings
        double co2Savings = Math.max(0, (currentMovingAvg - currentConsumption) * CO2_PER_M3_WATER);

        // Forecast next period
        double avgTrend = bimonthlyConsumption.size() >= 3 ?
                ((bimonthlyConsumption.get(bimonthlyConsumption.size() - 1) -
                        bimonthlyConsumption.get(bimonthlyConsumption.size() - 3)) /
                        bimonthlyConsumption.get(bimonthlyConsumption.size() - 3)) / 2 * 100 :
                percentChange;
        double forecastConsumption = currentConsumption * (1 + avgTrend / 100);

        // Historical data points for charts
        List<ConsumptionAnalyticsDTO.ConsumptionDataPointDTO> historicalData = new ArrayList<>();
        for (int i = 0; i < bimonthlyGroups.size(); i++) {
            List<Water> group = bimonthlyGroups.get(i);
            if (!group.isEmpty()) {
                double consumption = bimonthlyConsumption.get(i);
                double cost = bimonthlyCosts.get(i);
                double co2 = consumption * CO2_PER_M3_WATER;

                historicalData.add(
                        ConsumptionAnalyticsDTO.ConsumptionDataPointDTO.builder()
                                .date(group.get(0).getDate())
                                .consumption(consumption)
                                .cost(cost)
                                .co2Emissions(co2)
                                .build()
                );
            }
        }

        // Build and return the complete analytics DTO
        return ConsumptionAnalyticsDTO.builder()
                .bimonthlyConsumption(
                        ConsumptionAnalyticsDTO.BimonthlyConsumptionDTO.builder()
                                .currentValue(currentConsumption)
                                .unit("m³")
                                .percentChange(percentChange)
                                .status(getStatusFromPercentChange(percentChange, false))
                                .build()
                )
                .costMetrics(
                        ConsumptionAnalyticsDTO.CostMetricsDTO.builder()
                                .totalCost(currentCost)
                                .unitCost(currentUnitCost)
                                .unitCostUnit("MXN/m³")
                                .unitCostPercentChange(unitCostPercentChange)
                                .historicalAverageUnitCost(avgHistoricalUnitCost)
                                .build()
                )
                .movingAverage(
                        ConsumptionAnalyticsDTO.MovingAverageDTO.builder()
                                .value(currentMovingAvg)
                                .unit("m³")
                                .percentDeviation(movingAvgDeviation)
                                .status(getStatusFromDeviation(movingAvgDeviation))
                                .historicalValues(movingAverages)
                                .build()
                )
                .benchmark(
                        ConsumptionAnalyticsDTO.BenchmarkDTO.builder()
                                .currentValue(currentConsumption)
                                .stateAverage(STATE_BENCHMARK_WATER)
                                .nationalAverage(NATIONAL_BENCHMARK_WATER)
                                .status(getStatusFromBenchmark(currentConsumption, STATE_BENCHMARK_WATER, NATIONAL_BENCHMARK_WATER))
                                .efficiencyRating(efficiencyRating)
                                .build()
                )
                .anomalies(
                        ConsumptionAnalyticsDTO.AnomaliesDTO.builder()
                                .count(anomalyCount)
                                .status(getStatusFromAnomalyCount(anomalyCount))
                                .details(anomalyDetails)
                                .build()
                )
                .co2Metrics(
                        ConsumptionAnalyticsDTO.CO2MetricsDTO.builder()
                                .co2Savings(co2Savings)
                                .forecastValue(forecastConsumption)
                                .forecastUnit("m³")
                                .forecastPercentChange(avgTrend)
                                .status(getStatusFromPercentChange(avgTrend, false))
                                .build()
                )
                .historicalData(historicalData)
                .build();
    }

    /**
     * Genera análisis completo del consumo de electricidad del usuario.
     * <p>
     * Este método procesa todos los registros de consumo eléctrico del usuario,
     * los agrupa en períodos bimestrales y calcula diversas métricas relacionadas
     * con el consumo, costo, eficiencia y emisiones de CO2. También detecta
     * anomalías en el consumo y proporciona pronósticos para períodos futuros.
     * </p>
     * <p>
     * La lógica es similar a getWaterAnalytics, pero adaptada para electricidad.
     * </p>
     *
     * @param user Usuario actual para el que se genera el análisis
     * @return DTO con análisis completo de consumo eléctrico
     */
    public ConsumptionAnalyticsDTO getElectricityAnalytics(User user) {
        // Implementation similar to getWaterAnalytics but for electricity data
        List<Electricity> electricityConsumption = electricityRepository.findByUserId(user.getId());

        if (electricityConsumption.isEmpty()) {
            return createEmptyElectricityAnalytics();
        }

        // Sort by date (oldest first)
        electricityConsumption.sort(Comparator.comparing(Electricity::getDate));

        // Group data into bimonthly periods
        List<List<Electricity>> bimonthlyGroups = groupElectricityBimonthlyData(electricityConsumption);

        // Extract consumption values for each bimonthly period
        List<Double> bimonthlyConsumption = bimonthlyGroups.stream()
                .map(group -> group.stream().mapToDouble(Electricity::getKilowatts).sum())
                .collect(Collectors.toList());

        // Extract costs for each bimonthly period
        List<Double> bimonthlyCosts = bimonthlyGroups.stream()
                .map(group -> group.stream().mapToDouble(Electricity::getCost).sum())
                .collect(Collectors.toList());

        // Calculate moving averages (over 3 bimonthly periods)
        List<Double> movingAverages = calculateMovingAverages(bimonthlyConsumption);

        // Calculate metrics for current bimonthly period
        double currentConsumption = bimonthlyConsumption.isEmpty() ? 0 :
                bimonthlyConsumption.get(bimonthlyConsumption.size() - 1);
        double previousConsumption = bimonthlyConsumption.size() > 1 ?
                bimonthlyConsumption.get(bimonthlyConsumption.size() - 2) : currentConsumption;
        double percentChange = previousConsumption > 0 ?
                ((currentConsumption - previousConsumption) / previousConsumption) * 100 : 0;

        // Current cost metrics
        double currentCost = bimonthlyCosts.isEmpty() ? 0 :
                bimonthlyCosts.get(bimonthlyCosts.size() - 1);
        double currentUnitCost = currentConsumption > 0 ? currentCost / currentConsumption : 0;

        // Calculate historical unit costs
        List<Double> unitCosts = new ArrayList<>();
        for (int i = 0; i < bimonthlyConsumption.size(); i++) {
            double consumption = bimonthlyConsumption.get(i);
            double cost = bimonthlyCosts.get(i);
            if (consumption > 0) {
                unitCosts.add(cost / consumption);
            }
        }

        double avgHistoricalUnitCost = unitCosts.isEmpty() ? 0 :
                unitCosts.stream().mapToDouble(Double::doubleValue).average().orElse(0);
        double unitCostPercentChange = avgHistoricalUnitCost > 0 ?
                ((currentUnitCost - avgHistoricalUnitCost) / avgHistoricalUnitCost) * 100 : 0;

        // Current moving average
        double currentMovingAvg = movingAverages.isEmpty() ? currentConsumption :
                movingAverages.get(movingAverages.size() - 1);
        double movingAvgDeviation = currentMovingAvg > 0 ?
                ((currentConsumption - currentMovingAvg) / currentMovingAvg) * 100 : 0;

        // Benchmark comparison
        String efficiencyRating = currentConsumption < STATE_BENCHMARK_ELECTRICITY ? "more efficient" :
                currentConsumption > NATIONAL_BENCHMARK_ELECTRICITY ? "less efficient" : "average";

        // Detect anomalies
        List<ConsumptionAnalyticsDTO.AnomalyDetailDTO> anomalyDetails = new ArrayList<>();
        int anomalyCount = 0;

        for (int i = 0; i < bimonthlyConsumption.size() && i < movingAverages.size(); i++) {
            double consumption = bimonthlyConsumption.get(i);
            double movingAvg = movingAverages.get(i);

            if (consumption > movingAvg * 1.2) {
                anomalyCount++;

                // Get date from first entry in this bimonthly group
                LocalDateTime anomalyDate = bimonthlyGroups.get(i).get(0).getDate();

                anomalyDetails.add(
                        ConsumptionAnalyticsDTO.AnomalyDetailDTO.builder()
                                .date(anomalyDate)
                                .value(consumption)
                                .expectedValue(movingAvg)
                                .percentDeviation(((consumption - movingAvg) / movingAvg) * 100)
                                .build()
                );
            }
        }

        // Calculate CO2 savings
        double co2Savings = Math.max(0, (currentMovingAvg - currentConsumption) * CO2_PER_KWH);

        // Forecast next period
        double avgTrend = bimonthlyConsumption.size() >= 3 ?
                ((bimonthlyConsumption.get(bimonthlyConsumption.size() - 1) -
                        bimonthlyConsumption.get(bimonthlyConsumption.size() - 3)) /
                        bimonthlyConsumption.get(bimonthlyConsumption.size() - 3)) / 2 * 100 :
                percentChange;
        double forecastConsumption = currentConsumption * (1 + avgTrend / 100);

        // Historical data points for charts
        List<ConsumptionAnalyticsDTO.ConsumptionDataPointDTO> historicalData = new ArrayList<>();
        for (int i = 0; i < bimonthlyGroups.size(); i++) {
            List<Electricity> group = bimonthlyGroups.get(i);
            if (!group.isEmpty()) {
                double consumption = bimonthlyConsumption.get(i);
                double cost = bimonthlyCosts.get(i);
                double co2 = consumption * CO2_PER_KWH;

                historicalData.add(
                        ConsumptionAnalyticsDTO.ConsumptionDataPointDTO.builder()
                                .date(group.get(0).getDate())
                                .consumption(consumption)
                                .cost(cost)
                                .co2Emissions(co2)
                                .build()
                );
            }
        }

        // Build and return the complete analytics DTO
        return ConsumptionAnalyticsDTO.builder()
                .bimonthlyConsumption(
                        ConsumptionAnalyticsDTO.BimonthlyConsumptionDTO.builder()
                                .currentValue(currentConsumption)
                                .unit("kWh")
                                .percentChange(percentChange)
                                .status(getStatusFromPercentChange(percentChange, false))
                                .build()
                )
                .costMetrics(
                        ConsumptionAnalyticsDTO.CostMetricsDTO.builder()
                                .totalCost(currentCost)
                                .unitCost(currentUnitCost)
                                .unitCostUnit("MXN/kWh")
                                .unitCostPercentChange(unitCostPercentChange)
                                .historicalAverageUnitCost(avgHistoricalUnitCost)
                                .build()
                )
                .movingAverage(
                        ConsumptionAnalyticsDTO.MovingAverageDTO.builder()
                                .value(currentMovingAvg)
                                .unit("kWh")
                                .percentDeviation(movingAvgDeviation)
                                .status(getStatusFromDeviation(movingAvgDeviation))
                                .historicalValues(movingAverages)
                                .build()
                )
                .benchmark(
                        ConsumptionAnalyticsDTO.BenchmarkDTO.builder()
                                .currentValue(currentConsumption)
                                .stateAverage(STATE_BENCHMARK_ELECTRICITY)
                                .nationalAverage(NATIONAL_BENCHMARK_ELECTRICITY)
                                .status(getStatusFromBenchmark(currentConsumption, STATE_BENCHMARK_ELECTRICITY, NATIONAL_BENCHMARK_ELECTRICITY))
                                .efficiencyRating(efficiencyRating)
                                .build()
                )
                .anomalies(
                        ConsumptionAnalyticsDTO.AnomaliesDTO.builder()
                                .count(anomalyCount)
                                .status(getStatusFromAnomalyCount(anomalyCount))
                                .details(anomalyDetails)
                                .build()
                )
                .co2Metrics(
                        ConsumptionAnalyticsDTO.CO2MetricsDTO.builder()
                                .co2Savings(co2Savings)
                                .forecastValue(forecastConsumption)
                                .forecastUnit("kWh")
                                .forecastPercentChange(avgTrend)
                                .status(getStatusFromPercentChange(avgTrend, false))
                                .build()
                )
                .historicalData(historicalData)
                .build();
    }

    /**
     * Genera análisis completo del uso de transporte del usuario.
     * <p>
     * Este método está destinado a procesar los registros de uso de transporte
     * del usuario para calcular distancias recorridas, emisiones de CO2 asociadas
     * y patrones de uso. Actualmente, la implementación es un placeholder que
     * retorna un análisis vacío.
     * </p>
     * <p>
     * La implementación completa seguiría un patrón similar a getWaterAnalytics
     * y getElectricityAnalytics, pero con métricas específicas para transporte.
     * </p>
     *
     * @param user Usuario actual para el que se genera el análisis
     * @return DTO con análisis de uso de transporte
     */
    public ConsumptionAnalyticsDTO getTransportAnalytics(User user) {
        // Implementation similar to getWaterAnalytics but for transport data
        List<Transport> transportUsage = transportRepository.findByUserId(user.getId());

        if (transportUsage.isEmpty()) {
            return createEmptyTransportAnalytics();
        }

        // Implementation would follow similar pattern to getWaterAnalytics and getElectricityAnalytics
        // with transport-specific calculations and metrics

        // Create placeholder return
        return createEmptyTransportAnalytics();
    }

    /**
     * Agrupa datos en períodos bimestrales (Ene-Feb, Mar-Abr, etc.)
     * <p>
     * Este método genérico toma una lista de registros de cualquier tipo y los agrupa
     * en períodos bimestrales basados en la fecha asociada a cada registro. Esto permite
     * normalizar el análisis y comparar períodos equivalentes.
     * </p>
     *
     * @param <T> Tipo de entidad a agrupar
     * @param data Lista de registros a agrupar
     * @param dateExtractor Función para extraer la fecha de cada registro
     * @return Lista de listas, donde cada lista interna contiene registros de un período bimestral
     */
    private <T> List<List<T>> groupBimonthlyData(List<T> data, java.util.function.Function<T, LocalDateTime> dateExtractor) {
        if (data.isEmpty()) return Collections.emptyList();

        List<List<T>> groups = new ArrayList<>();
        List<T> currentGroup = new ArrayList<>();
        int currentBimonth = -1;

        for (T item : data) {
            LocalDateTime date = dateExtractor.apply(item);
            // Calculate bimonthly period (Jan-Feb = 0, Mar-Apr = 1, etc.)
            int bimonth = date.getMonthValue() / 2 + (date.getYear() * 6);

            if (currentBimonth == -1) {
                currentBimonth = bimonth;
                currentGroup.add(item);
            } else if (bimonth == currentBimonth) {
                currentGroup.add(item);
            } else {
                groups.add(new ArrayList<>(currentGroup));
                currentGroup.clear();
                currentGroup.add(item);
                currentBimonth = bimonth;
            }
        }

        // Add the last group
        if (!currentGroup.isEmpty()) {
            groups.add(currentGroup);
        }

        return groups;
    }

    /**
     * Agrupa datos de consumo de agua en períodos bimestrales.
     * <p>
     * Método específico para agrupar registros de consumo de agua.
     * </p>
     *
     * @param data Lista de registros de consumo de agua
     * @return Lista agrupada por períodos bimestrales
     */
    private List<List<Water>> groupWaterBimonthlyData(List<Water> data) {
        return groupBimonthlyData(data, Water::getDate);
    }

    /**
     * Agrupa datos de consumo de electricidad en períodos bimestrales.
     * <p>
     * Método específico para agrupar registros de consumo eléctrico.
     * </p>
     *
     * @param data Lista de registros de consumo eléctrico
     * @return Lista agrupada por períodos bimestrales
     */
    private List<List<Electricity>> groupElectricityBimonthlyData(List<Electricity> data) {
        return groupBimonthlyData(data, Electricity::getDate);
    }

    /**
     * Agrupa datos de uso de transporte en períodos bimestrales.
     * <p>
     * Método específico para agrupar registros de uso de transporte.
     * </p>
     *
     * @param data Lista de registros de uso de transporte
     * @return Lista agrupada por períodos bimestrales
     */
    private List<List<Transport>> groupTransportBimonthlyData(List<Transport> data) {
        return groupBimonthlyData(data, Transport::getDate);
    }

    /**
     * Calcula promedios móviles sobre los últimos 3 períodos bimestrales.
     * <p>
     * Este método toma una lista de valores de consumo y calcula el promedio móvil
     * para cada punto, considerando hasta 3 períodos previos. Proporciona una referencia
     * más estable para detectar tendencias y anomalías.
     * </p>
     *
     * @param values Lista de valores de consumo
     * @return Lista de promedios móviles calculados
     */
    private List<Double> calculateMovingAverages(List<Double> values) {
        List<Double> movingAverages = new ArrayList<>();

        for (int i = 0; i < values.size(); i++) {
            // Calculate moving average over current and 2 previous periods (if available)
            int windowStart = Math.max(0, i - 2);
            List<Double> window = values.subList(windowStart, i + 1);
            double sum = window.stream().mapToDouble(Double::doubleValue).sum();
            movingAverages.add(sum / window.size());
        }

        return movingAverages;
    }

    /**
     * Determina el estado basado en el porcentaje de cambio.
     * <p>
     * Este método evalúa el porcentaje de cambio en un valor y determina si representa
     * una situación positiva, neutra o negativa. El comportamiento puede invertirse
     * según el parámetro isPositive para métricas donde un aumento es deseable.
     * </p>
     *
     * @param percentChange Porcentaje de cambio a evaluar
     * @param isPositive Indica si un cambio positivo se considera favorable
     * @return Cadena de estado ("success", "warning", "danger")
     */
    private String getStatusFromPercentChange(double percentChange, boolean isPositive) {
        if (isPositive) {
            return percentChange > 10 ? "success" : percentChange < 0 ? "danger" : "warning";
        } else {
            return percentChange < 0 ? "success" : percentChange > 10 ? "danger" : "warning";
        }
    }

    /**
     * Determina el estado basado en la desviación del promedio móvil.
     * <p>
     * Este método evalúa qué tan lejos está el consumo actual del promedio móvil
     * y asigna un estado en función de esa desviación. Desviaciones menores indican
     * estabilidad, mientras que desviaciones mayores podrían señalar anomalías.
     * </p>
     *
     * @param deviation Porcentaje de desviación del promedio móvil
     * @return Cadena de estado ("success", "warning")
     */
    private String getStatusFromDeviation(double deviation) {
        return Math.abs(deviation) <= 10 ? "success" : "warning";
    }

    /**
     * Determina el estado basado en la comparación con benchmarks.
     * <p>
     * Este método compara el valor actual con referencias estatales y nacionales
     * para asignar un estado que indique si el consumo es eficiente, promedio o
     * ineficiente en comparación con estos benchmarks.
     * </p>
     *
     * @param value Valor actual a comparar
     * @param stateBenchmark Valor de referencia estatal
     * @param nationalBenchmark Valor de referencia nacional
     * @return Cadena de estado ("success", "warning", "danger")
     */
    private String getStatusFromBenchmark(double value, double stateBenchmark, double nationalBenchmark) {
        return value < stateBenchmark ? "success" :
                value > nationalBenchmark ? "danger" : "warning";
    }

    /**
     * Determina el estado basado en el número de anomalías detectadas.
     * <p>
     * Este método asigna un estado en función de cuántas anomalías se han detectado
     * en el consumo. La ausencia de anomalías se considera óptima, mientras que
     * múltiples anomalías pueden indicar problemas sistemáticos.
     * </p>
     *
     * @param count Número de anomalías detectadas
     * @return Cadena de estado ("success", "warning", "danger")
     */
    private String getStatusFromAnomalyCount(int count) {
        return count == 0 ? "success" : count > 2 ? "danger" : "warning";
    }

    /**
     * Crea un objeto DTO de análisis de agua vacío.
     * <p>
     * Este método genera un objeto DTO con valores predeterminados para usuarios
     * que no tienen datos de consumo de agua registrados. Proporciona una estructura
     * completa pero con valores inicializados a cero o listas vacías.
     * </p>
     *
     * @return DTO de análisis de agua con valores predeterminados
     */
    private ConsumptionAnalyticsDTO createEmptyWaterAnalytics() {
        return ConsumptionAnalyticsDTO.builder()
                .bimonthlyConsumption(
                        ConsumptionAnalyticsDTO.BimonthlyConsumptionDTO.builder()
                                .currentValue(0)
                                .unit("m³")
                                .percentChange(0)
                                .status("neutral")
                                .build()
                )
                .costMetrics(
                        ConsumptionAnalyticsDTO.CostMetricsDTO.builder()
                                .totalCost(0)
                                .unitCost(0)
                                .unitCostUnit("MXN/m³")
                                .unitCostPercentChange(0)
                                .historicalAverageUnitCost(0)
                                .build()
                )
                .movingAverage(
                        ConsumptionAnalyticsDTO.MovingAverageDTO.builder()
                                .value(0)
                                .unit("m³")
                                .percentDeviation(0)
                                .status("neutral")
                                .historicalValues(Collections.emptyList())
                                .build()
                )
                .benchmark(
                        ConsumptionAnalyticsDTO.BenchmarkDTO.builder()
                                .currentValue(0)
                                .stateAverage(STATE_BENCHMARK_WATER)
                                .nationalAverage(NATIONAL_BENCHMARK_WATER)
                                .status("neutral")
                                .efficiencyRating("no data")
                                .build()
                )
                .anomalies(
                        ConsumptionAnalyticsDTO.AnomaliesDTO.builder()
                                .count(0)
                                .status("neutral")
                                .details(Collections.emptyList())
                                .build()
                )
                .co2Metrics(
                        ConsumptionAnalyticsDTO.CO2MetricsDTO.builder()
                                .co2Savings(0)
                                .forecastValue(0)
                                .forecastUnit("m³")
                                .forecastPercentChange(0)
                                .status("neutral")
                                .build()
                )
                .historicalData(Collections.emptyList())
                .build();
    }

    /**
     * Crea un objeto DTO de análisis de electricidad vacío.
     * <p>
     * Este método genera un objeto DTO con valores predeterminados para usuarios
     * que no tienen datos de consumo eléctrico registrados. Proporciona una estructura
     * completa pero con valores inicializados a cero o listas vacías.
     * </p>
     *
     * @return DTO de análisis de electricidad con valores predeterminados
     */
    private ConsumptionAnalyticsDTO createEmptyElectricityAnalytics() {
        return ConsumptionAnalyticsDTO.builder()
                .bimonthlyConsumption(
                        ConsumptionAnalyticsDTO.BimonthlyConsumptionDTO.builder()
                                .currentValue(0)
                                .unit("kWh")
                                .percentChange(0)
                                .status("neutral")
                                .build()
                )
                .costMetrics(
                        ConsumptionAnalyticsDTO.CostMetricsDTO.builder()
                                .totalCost(0)
                                .unitCost(0)
                                .unitCostUnit("MXN/kWh")
                                .unitCostPercentChange(0)
                                .historicalAverageUnitCost(0)
                                .build()
                )
                .movingAverage(
                        ConsumptionAnalyticsDTO.MovingAverageDTO.builder()
                                .value(0)
                                .unit("kWh")
                                .percentDeviation(0)
                                .status("neutral")
                                .historicalValues(Collections.emptyList())
                                .build()
                )
                .benchmark(
                        ConsumptionAnalyticsDTO.BenchmarkDTO.builder()
                                .currentValue(0)
                                .stateAverage(STATE_BENCHMARK_ELECTRICITY)
                                .nationalAverage(NATIONAL_BENCHMARK_ELECTRICITY)
                                .status("neutral")
                                .efficiencyRating("no data")
                                .build()
                )
                .anomalies(
                        ConsumptionAnalyticsDTO.AnomaliesDTO.builder()
                                .count(0)
                                .status("neutral")
                                .details(Collections.emptyList())
                                .build()
                )
                .co2Metrics(
                        ConsumptionAnalyticsDTO.CO2MetricsDTO.builder()
                                .co2Savings(0)
                                .forecastValue(0)
                                .forecastUnit("kWh")
                                .forecastPercentChange(0)
                                .status("neutral")
                                .build()
                )
                .historicalData(Collections.emptyList())
                .build();
    }

    /**
     * Crea un objeto DTO de análisis de transporte vacío.
     * <p>
     * Este método genera un objeto DTO con valores predeterminados para usuarios
     * que no tienen datos de uso de transporte registrados. Proporciona una estructura
     * completa pero con valores inicializados a cero o listas vacías.
     * </p>
     *
     * @return DTO de análisis de transporte con valores predeterminados
     */
    private ConsumptionAnalyticsDTO createEmptyTransportAnalytics() {
        return ConsumptionAnalyticsDTO.builder()
                .bimonthlyConsumption(
                        ConsumptionAnalyticsDTO.BimonthlyConsumptionDTO.builder()
                                .currentValue(0)
                                .unit("km")
                                .percentChange(0)
                                .status("neutral")
                                .build()
                )
                .costMetrics(
                        ConsumptionAnalyticsDTO.CostMetricsDTO.builder()
                                .totalCost(0)
                                .unitCost(0)
                                .unitCostUnit("MXN/km")
                                .unitCostPercentChange(0)
                                .historicalAverageUnitCost(0)
                                .build()
                )
                .movingAverage(
                        ConsumptionAnalyticsDTO.MovingAverageDTO.builder()
                                .value(0)
                                .unit("km")
                                .percentDeviation(0)
                                .status("neutral")
                                .historicalValues(Collections.emptyList())
                                .build()
                )
                .benchmark(
                        ConsumptionAnalyticsDTO.BenchmarkDTO.builder()
                                .currentValue(0)
                                .stateAverage(0)
                                .nationalAverage(0)
                                .status("neutral")
                                .efficiencyRating("no data")
                                .build()
                )
                .anomalies(
                        ConsumptionAnalyticsDTO.AnomaliesDTO.builder()
                                .count(0)
                                .status("neutral")
                                .details(Collections.emptyList())
                                .build()
                )
                .co2Metrics(
                        ConsumptionAnalyticsDTO.CO2MetricsDTO.builder()
                                .co2Savings(0)
                                .forecastValue(0)
                                .forecastUnit("km")
                                .forecastPercentChange(0)
                                .status("neutral")
                                .build()
                )
                .historicalData(Collections.emptyList())
                .build();
    }
}