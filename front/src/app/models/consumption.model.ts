/**
 * Base interface for all consumption entries
 */
export interface BaseConsumption {
  id?: number;
  date: Date;
  cost: number;
}

/**
 * Interface for electricity consumption entries
 */
export interface ElectricityConsumption extends BaseConsumption {
  kilowatts: number;
}

/**
 * Interface for water consumption entries
 */
export interface WaterConsumption extends BaseConsumption {
  liters: number;
}

/**
 * Interface for transport usage entries
 */
export interface TransportUsage extends BaseConsumption {
  kilometers: number;
  transportType: 'car' | 'bus' | 'bicycle' | 'walk' | 'other';
}

/**
 * Type for consumption summary to display in charts
 */
export interface ConsumptionSummary {
  label: string;
  value: number;
  percentage: number;
}
