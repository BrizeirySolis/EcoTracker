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
 * Service for advanced consumption analytics
 * Provides comprehensive metrics for dashboard visualization
 */
@Service
public class ConsumptionAnalyticsService {

    private final WaterRepository waterRepository;
    private final ElectricityRepository electricityRepository;
    private final TransportRepository transportRepository;
    
    // Constants for benchmarks and calculations
    private static final double STATE_BENCHMARK_WATER = 13.8; // m³ (Zacatecas)
    private static final double NATIONAL_BENCHMARK_WATER = 14.4; // m³ (Mexico)
    private static final double STATE_BENCHMARK_ELECTRICITY = 280.0; // kWh (estimated)
    private static final double NATIONAL_BENCHMARK_ELECTRICITY = 250.0; // kWh (estimated)
    private static final double CO2_PER_M3_WATER = 0.376; // kg CO2 per m³ (estimated)
    private static final double CO2_PER_KWH = 0.527; // kg CO2 per kWh (estimated)
    private static final double CO2_PER_KM_CAR = 0.192; // kg CO2 per km (car, estimated)

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
     * Generate comprehensive water consumption analytics
     * @param user The current user
     * @return Water consumption analytics DTO
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
     * Generate comprehensive electricity consumption analytics
     * @param user The current user
     * @return Electricity consumption analytics DTO
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
     * Generate comprehensive transport usage analytics
     * @param user The current user
     * @return Transport usage analytics DTO
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
     * Group data into bimonthly periods (Jan-Feb, Mar-Apr, etc.)
     * @param data List of consumption records
     * @return List of bimonthly grouped data
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
     * Group water consumption data into bimonthly periods
     */
    private List<List<Water>> groupWaterBimonthlyData(List<Water> data) {
        return groupBimonthlyData(data, Water::getDate);
    }
    
    /**
     * Group electricity consumption data into bimonthly periods
     */
    private List<List<Electricity>> groupElectricityBimonthlyData(List<Electricity> data) {
        return groupBimonthlyData(data, Electricity::getDate);
    }
    
    /**
     * Group transport usage data into bimonthly periods
     */
    private List<List<Transport>> groupTransportBimonthlyData(List<Transport> data) {
        return groupBimonthlyData(data, Transport::getDate);
    }

    /**
     * Calculate moving averages over the last 3 bimonthly periods
     * @param values List of consumption values
     * @return List of moving averages
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
     * Determine status color based on percent change
     * @param percentChange Percentage change
     * @param isPositive Whether positive change is good
     * @return Status string ("success", "warning", "danger")
     */
    private String getStatusFromPercentChange(double percentChange, boolean isPositive) {
        if (isPositive) {
            return percentChange > 10 ? "success" : percentChange < 0 ? "danger" : "warning";
        } else {
            return percentChange < 0 ? "success" : percentChange > 10 ? "danger" : "warning";
        }
    }

    /**
     * Determine status color based on deviation from moving average
     * @param deviation Percent deviation from moving average
     * @return Status string
     */
    private String getStatusFromDeviation(double deviation) {
        return Math.abs(deviation) <= 10 ? "success" : "warning";
    }

    /**
     * Determine status color based on benchmark comparison
     */
    private String getStatusFromBenchmark(double value, double stateBenchmark, double nationalBenchmark) {
        return value < stateBenchmark ? "success" : 
               value > nationalBenchmark ? "danger" : "warning";
    }

    /**
     * Determine status color based on anomaly count
     */
    private String getStatusFromAnomalyCount(int count) {
        return count == 0 ? "success" : count > 2 ? "danger" : "warning";
    }

    /**
     * Create empty water analytics for users with no data
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
     * Create empty electricity analytics for users with no data
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
     * Create empty transport analytics for users with no data
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