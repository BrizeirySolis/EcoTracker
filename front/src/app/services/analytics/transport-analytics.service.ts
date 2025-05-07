import { Injectable } from '@angular/core';
import { TransportUsage } from '../../models/consumption.model';
import { KpiData } from '../../models/kpi.model';
import { SparklineService } from '../visualization/sparkline.service';
import { StatusType, TrendInfo } from '../../components/kpi-cards/kpi-card/kpi-card.component';

/**
 * Service responsible for analyzing transport usage data
 * and generating relevant KPIs for the dashboard
 */
@Injectable({
  providedIn: 'root'
})
export class TransportAnalyticsService {
  // Constants for analysis and CO2 emissions
  private readonly CO2_PER_KM_CAR = 0.192; // kg CO2 per km (car)
  private readonly CO2_PER_KM_BUS = 0.105; // kg CO2 per km (bus)
  private readonly CO2_PER_KM_BICYCLE = 0; // kg CO2 per km (bicycle)
  private readonly CO2_PER_KM_WALK = 0; // kg CO2 per km (walk)
  private readonly CO2_PER_KM_OTHER = 0.150; // kg CO2 per km (other)

  // Average monthly transport usage benchmarks
  private readonly AVG_MONTHLY_KM = 300; // km per month (average)
  private readonly SUSTAINABLE_TRANSPORT_TARGET = 0.4; // 40% of transport should be sustainable

  constructor() {
  }

  /**
   * Generate KPI data for transport usage dashboard
   * @param transportUsage Array of transport usage records
   * @param sparklineService Service to generate sparkline visualizations
   * @returns Array of KPI data objects for the dashboard
   */
  generateTransportKpis(transportUsage: TransportUsage[], sparklineService: SparklineService): KpiData[] {
    if (!transportUsage || transportUsage.length === 0) {
      return this.generateEmptyKpis();
    }

    // Sort data by date (oldest first)
    const sortedData = [...transportUsage].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Group data into monthly periods
    const monthlyGroups = this.groupMonthlyData(sortedData);

    // Extract usage values for each monthly period
    const monthlyKilometers = monthlyGroups.map(group =>
      group.reduce((sum, item) => sum + item.kilometers, 0)
    );

    // Extract costs for each monthly period
    const monthlyCosts = monthlyGroups.map(group =>
      group.reduce((sum, item) => sum + item.cost, 0)
    );

    // Calculate CO2 emissions for each usage
    const monthlyEmissions = monthlyGroups.map(group =>
      group.reduce((sum, item) => sum + this.calculateCO2(item), 0)
    );

    // Calculate moving averages
    const movingAverages = this.calculateMovingAverages(monthlyKilometers);

    // Current and previous period values
    const currentKilometers = monthlyKilometers[monthlyKilometers.length - 1] || 0;
    const previousKilometers = monthlyKilometers.length > 1
      ? monthlyKilometers[monthlyKilometers.length - 2]
      : currentKilometers;

    // Calculate percent change
    const percentChange = previousKilometers > 0
      ? ((currentKilometers - previousKilometers) / previousKilometers) * 100
      : 0;

    // Current cost and emissions
    const currentCost = monthlyCosts[monthlyCosts.length - 1] || 0;
    const currentEmissions = monthlyEmissions[monthlyEmissions.length - 1] || 0;

    // Calculate sustainable transport usage
    const latestGroup = monthlyGroups[monthlyGroups.length - 1] || [];
    const sustainableKilometers = latestGroup
      .filter(item => item.transportType === 'bicycle' || item.transportType === 'walk')
      .reduce((sum, item) => sum + item.kilometers, 0);

    const sustainablePercentage = currentKilometers > 0
      ? (sustainableKilometers / currentKilometers) * 100
      : 0;

    // Current moving average
    const currentMovingAvg = movingAverages.length > 0
      ? movingAverages[movingAverages.length - 1]
      : currentKilometers;

    const movingAvgDeviation = currentMovingAvg > 0
      ? ((currentKilometers - currentMovingAvg) / currentMovingAvg) * 100
      : 0;

    // Calculate transport type distribution for latest period
    const transportTypes = this.calculateTransportTypeDistribution(latestGroup);

    // Generate trend data
    const distanceTrend: TrendInfo = {
      value: percentChange,
      direction: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'neutral',
      isPositive: percentChange <= 5 // Small increases or decreases are positive
    };

    const emissionsTrend = this.calculateEmissionsTrend(monthlyEmissions);

    // Generate sparkline data
    const kilometersSparklinePath = sparklineService.generateSparklinePath(monthlyKilometers);
    const kilometersEndPoint = sparklineService.getSparklineEndPoint(monthlyKilometers);

    const costSparklinePath = sparklineService.generateSparklinePath(monthlyCosts);
    const costEndPoint = sparklineService.getSparklineEndPoint(monthlyCosts);

    const emissionsSparklinePath = sparklineService.generateSparklinePath(monthlyEmissions);
    const emissionsEndPoint = sparklineService.getSparklineEndPoint(monthlyEmissions);

    // Create KPI objects
    return [
      // KPI 1: Distance Traveled
      {
        title: 'Kilómetros Recorridos',
        primaryValue: currentKilometers.toFixed(1),
        primaryUnit: 'km',
        secondaryValue: percentChange.toFixed(1) + '%',
        secondaryUnit: 'vs anterior',
        status: Math.abs(percentChange) < 20 ? 'info' : (percentChange > 0 ? 'warning' : 'success'),
        trend: distanceTrend,
        footerText: 'Último mes',
        sparklinePath: kilometersSparklinePath,
        sparklineEndPoint: kilometersEndPoint
      },

      // KPI 2: Transport Cost
      {
        title: 'Costo de Transporte',
        primaryValue: currentCost.toFixed(0),
        primaryUnit: 'MXN',
        status: currentCost > currentMovingAvg * 1.2 ? 'danger' :
          currentCost < currentMovingAvg * 0.8 ? 'success' : 'warning',
        footerText: 'Total del último mes',
        sparklinePath: costSparklinePath,
        sparklineEndPoint: costEndPoint
      },

      // KPI 3: CO2 Emissions
      {
        title: 'Emisiones CO2',
        primaryValue: currentEmissions.toFixed(1),
        primaryUnit: 'kg',
        status: emissionsTrend.isPositive ? 'success' : 'danger',
        trend: emissionsTrend,
        footerText: 'Basado en tipos de transporte',
        sparklinePath: emissionsSparklinePath,
        sparklineEndPoint: emissionsEndPoint
      },

      // KPI 4: Sustainable Transport
      {
        title: 'Transporte Sostenible',
        primaryValue: sustainablePercentage.toFixed(1),
        primaryUnit: '%',
        secondaryValue: `${sustainableKilometers.toFixed(1)} km`,
        secondaryUnit: 'bicicleta/a pie',
        status: sustainablePercentage >= this.SUSTAINABLE_TRANSPORT_TARGET * 100 ? 'success' :
          sustainablePercentage >= this.SUSTAINABLE_TRANSPORT_TARGET * 50 ? 'warning' : 'danger',
        footerText: 'Meta: 40% del total'
      },

      // KPI 5: Transport Distribution
      {
        title: 'Distribución de Transporte',
        primaryValue: transportTypes.primary.type,
        primaryUnit: `${transportTypes.primary.percentage.toFixed(0)}%`,
        secondaryValue: transportTypes.secondary.type,
        secondaryUnit: `${transportTypes.secondary.percentage.toFixed(0)}%`,
        status: (transportTypes.primary.type === 'bicycle' || transportTypes.primary.type === 'walk') ? 'success' :
          transportTypes.primary.type === 'bus' ? 'info' : 'warning',
        footerText: 'Tipos de transporte más usados'
      },

      // KPI 6: Efficiency
      {
        title: 'Eficiencia de Transporte',
        primaryValue: (currentEmissions / currentKilometers).toFixed(2),
        primaryUnit: 'kg CO2/km',
        status: (currentEmissions / currentKilometers) < 0.1 ? 'success' :
          (currentEmissions / currentKilometers) < 0.15 ? 'warning' : 'danger',
        footerText: 'Menor valor = mayor eficiencia'
      }
    ];
  }

  /**
   * Generate empty KPIs when no data is available
   */
  private generateEmptyKpis(): KpiData[] {
    return [
      {
        title: 'Kilómetros Recorridos',
        primaryValue: '0',
        primaryUnit: 'km',
        status: 'neutral',
        footerText: 'No hay datos disponibles'
      },
      {
        title: 'Costo de Transporte',
        primaryValue: '0',
        primaryUnit: 'MXN',
        status: 'neutral',
        footerText: 'No hay datos disponibles'
      },
      {
        title: 'Emisiones CO2',
        primaryValue: '0',
        primaryUnit: 'kg',
        status: 'neutral',
        footerText: 'No hay datos disponibles'
      },
      {
        title: 'Transporte Sostenible',
        primaryValue: '0',
        primaryUnit: '%',
        status: 'neutral',
        footerText: 'No hay datos para analizar'
      },
      {
        title: 'Distribución de Transporte',
        primaryValue: 'N/A',
        primaryUnit: '',
        status: 'neutral',
        footerText: 'No hay datos disponibles'
      },
      {
        title: 'Eficiencia de Transporte',
        primaryValue: '0',
        primaryUnit: 'kg CO2/km',
        status: 'neutral',
        footerText: 'No hay datos disponibles'
      }
    ];
  }

  /**
   * Group transport usage data into monthly periods
   * @param data Array of transport usage records
   * @returns Array of arrays, each containing records for a monthly period
   */
  groupMonthlyData(data: TransportUsage[]): TransportUsage[][] {
    if (data.length === 0) return [];

    const groups: TransportUsage[][] = [];
    let currentGroup: TransportUsage[] = [];
    let currentMonth = -1;

    for (const item of data) {
      const date = new Date(item.date);
      // Calculate month period
      const month = date.getMonth() + (date.getFullYear() * 12);

      if (currentMonth === -1) {
        currentMonth = month;
        currentGroup.push(item);
      } else if (month === currentMonth) {
        currentGroup.push(item);
      } else {
        groups.push([...currentGroup]);
        currentGroup = [item];
        currentMonth = month;
      }
    }

    // Add the last group
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }

  /**
   * Calculate CO2 emissions for a transport usage
   * @param usage Transport usage record
   * @returns CO2 emissions in kg
   */
  private calculateCO2(usage: TransportUsage): number {
    let emissionFactor = 0;

    switch (usage.transportType) {
      case 'car':
        emissionFactor = this.CO2_PER_KM_CAR;
        break;
      case 'bus':
        emissionFactor = this.CO2_PER_KM_BUS;
        break;
      case 'bicycle':
        emissionFactor = this.CO2_PER_KM_BICYCLE;
        break;
      case 'walk':
        emissionFactor = this.CO2_PER_KM_WALK;
        break;
      case 'other':
        emissionFactor = this.CO2_PER_KM_OTHER;
        break;
    }

    return usage.kilometers * emissionFactor;
  }

  /**
   * Calculate moving averages over the last 3 monthly periods
   * @param values Array of usage values
   * @returns Array of moving averages
   */
  private calculateMovingAverages(values: number[]): number[] {
    const movingAverages: number[] = [];

    for (let i = 0; i < values.length; i++) {
      // Calculate moving average over current and up to 2 previous periods
      const windowStart = Math.max(0, i - 2);
      const window = values.slice(windowStart, i + 1);
      const sum = window.reduce((acc, val) => acc + val, 0);
      movingAverages.push(sum / window.length);
    }

    return movingAverages;
  }

  /**
   * Calculate transport type distribution for a period
   * @param usages Array of transport usage records
   * @returns Object with primary and secondary transport types and percentages
   */
  private calculateTransportTypeDistribution(usages: TransportUsage[]): {
    primary: { type: string, percentage: number },
    secondary: { type: string, percentage: number }
  } {
    if (usages.length === 0) {
      return {
        primary: {type: 'N/A', percentage: 0},
        secondary: {type: 'N/A', percentage: 0}
      };
    }

    // Calculate total kilometers
    const totalKm = usages.reduce((sum, item) => sum + item.kilometers, 0);

    // Group by transport type
    const typeGroups: Record<string, number> = {};

    for (const usage of usages) {
      const typeName = this.getTransportTypeDisplayName(usage.transportType);
      typeGroups[typeName] = (typeGroups[typeName] || 0) + usage.kilometers;
    }

    // Convert to array and sort by kilometers
    const sortedTypes = Object.entries(typeGroups)
      .map(([type, km]) => ({type, km, percentage: (km / totalKm) * 100}))
      .sort((a, b) => b.km - a.km);

    return {
      primary: {
        type: sortedTypes[0]?.type || 'N/A',
        percentage: sortedTypes[0]?.percentage || 0
      },
      secondary: {
        type: sortedTypes[1]?.type || 'N/A',
        percentage: sortedTypes[1]?.percentage || 0
      }
    };
  }

  /**
   * Calculate emissions trend based on monthly emissions data
   * @param emissions Array of monthly CO2 emissions
   * @returns Trend information
   */
  private calculateEmissionsTrend(emissions: number[]): TrendInfo {
    if (emissions.length < 2) {
      return {
        value: 0,
        direction: 'neutral',
        isPositive: true
      };
    }

    const current = emissions[emissions.length - 1];
    const previous = emissions[emissions.length - 2];

    const percentChange = previous > 0
      ? ((current - previous) / previous) * 100
      : 0;

    return {
      value: percentChange,
      direction: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'neutral',
      isPositive: percentChange <= 0 // Lower emissions are positive
    };
  }

  /**
   * Get display name for transport type
   * @param type Transport type code
   * @returns User-friendly display name
   */
  private getTransportTypeDisplayName(type: string): string {
    switch (type) {
      case 'car':
        return 'Automóvil';
      case 'bus':
        return 'Autobús';
      case 'bicycle':
        return 'Bicicleta';
      case 'walk':
        return 'A pie';
      case 'other':
        return 'Otro';
      default:
        return type;
    }
  }
}
