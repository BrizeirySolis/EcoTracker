/**
 * Interface for consumption analytics data from the backend
 */
export interface ConsumptionAnalyticsDTO {
  bimonthlyConsumption?: {
    currentValue: number;
    unit: string;
    percentChange: number;
    status: string;
  };
  costMetrics?: {
    totalCost: number;
    unitCost: number;
    unitCostUnit: string;
    unitCostPercentChange: number;
    historicalAverageUnitCost: number;
  };
  movingAverage?: {
    value: number;
    unit: string;
    percentDeviation: number;
    status: string;
    historicalValues: number[];
  };
  benchmark?: {
    currentValue: number;
    stateAverage: number;
    nationalAverage: number;
    status: string;
    efficiencyRating: string;
  };
  anomalies?: {
    count: number;
    status: string;
    details: AnomalyDetailDTO[];
  };
  co2Metrics?: {
    co2Savings: number;
    forecastValue: number;
    forecastUnit: string;
    forecastPercentChange: number;
    status: string;
  };
  historicalData?: ConsumptionDataPointDTO[];
}

/**
 * Interface for anomaly details
 */
export interface AnomalyDetailDTO {
  date: Date;
  value: number;
  expectedValue: number;
  percentDeviation: number;
}

/**
 * Interface for consumption data points
 */
export interface ConsumptionDataPointDTO {
  date: Date;
  consumption: number;
  cost: number;
  co2Emissions: number;
}
