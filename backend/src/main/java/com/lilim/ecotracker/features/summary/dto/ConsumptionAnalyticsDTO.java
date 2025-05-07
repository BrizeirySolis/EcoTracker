package com.lilim.ecotracker.features.summary.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Data Transfer Object for consumption analytics
 * Provides comprehensive metrics for dashboard visualization
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsumptionAnalyticsDTO {
    
    /**
     * Summary of bimonthly consumption metrics
     */
    private BimonthlyConsumptionDTO bimonthlyConsumption;
    
    /**
     * Cost metrics including unit costs and trend analysis
     */
    private CostMetricsDTO costMetrics;
    
    /**
     * Moving average calculations over multiple periods
     */
    private MovingAverageDTO movingAverage;
    
    /**
     * Benchmark comparison against regional and national averages
     */
    private BenchmarkDTO benchmark;
    
    /**
     * Detected consumption anomalies
     */
    private AnomaliesDTO anomalies;
    
    /**
     * CO2 emission metrics and forecasts
     */
    private CO2MetricsDTO co2Metrics;
    
    /**
     * Historical data series for charts and trend analysis
     */
    private List<ConsumptionDataPointDTO> historicalData;

    /**
     * DTO for bimonthly consumption metrics
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BimonthlyConsumptionDTO {
        private double currentValue;
        private String unit;
        private double percentChange;
        private String status; // "success", "warning", "danger"
    }

    /**
     * DTO for cost metrics
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CostMetricsDTO {
        private double totalCost;
        private double unitCost;
        private String unitCostUnit; // e.g., "MXN/m³"
        private double unitCostPercentChange;
        private double historicalAverageUnitCost;
    }

    /**
     * DTO for moving average calculations
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MovingAverageDTO {
        private double value;
        private String unit;
        private double percentDeviation; // Deviation from current consumption
        private String status; // "success", "warning", "danger"
        private List<Double> historicalValues; // For sparkline
    }

    /**
     * DTO for benchmark comparisons
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BenchmarkDTO {
        private double currentValue;
        private double stateAverage;
        private double nationalAverage;
        private String status; // "success", "warning", "danger"
        private String efficiencyRating; // "more efficient", "less efficient", "average"
    }

    /**
     * DTO for consumption anomalies
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnomaliesDTO {
        private int count;
        private String status; // "success", "warning", "danger"
        private List<AnomalyDetailDTO> details;
    }

    /**
     * DTO for anomaly details
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnomalyDetailDTO {
        private LocalDateTime date;
        private double value;
        private double expectedValue;
        private double percentDeviation;
    }

    /**
     * DTO for CO2 metrics
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CO2MetricsDTO {
        private double co2Savings;
        private double forecastValue;
        private String forecastUnit;
        private double forecastPercentChange;
        private String status; // "success", "warning", "danger"
    }

    /**
     * DTO for historical data points
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConsumptionDataPointDTO {
        private LocalDateTime date;
        private double consumption;
        private double cost;
        private double co2Emissions;
    }
}