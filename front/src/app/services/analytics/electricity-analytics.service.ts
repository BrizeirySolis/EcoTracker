import { Injectable } from '@angular/core';
import { ElectricityConsumption } from '../../models/consumption.model';
import { KpiData } from '../../models/kpi.model';
import { SparklineService } from '../visualization/sparkline.service';
import { StatusType, TrendInfo } from '../../components/kpi-cards/kpi-card/kpi-card.component';

/**
 * Service responsible for analyzing electricity consumption data
 * and generating relevant KPIs for the dashboard
 */
@Injectable({
  providedIn: 'root'
})
export class ElectricityAnalyticsService {
  // Constants for analysis
  private readonly STATE_BENCHMARK_ELECTRICITY = 280.0; // kWh (estimated)
  private readonly NATIONAL_BENCHMARK_ELECTRICITY = 250.0; // kWh (estimated)
  private readonly CO2_PER_KWH = 0.527; // kg CO2 per kWh (estimated)

  constructor() { }

  /**
   * Generate KPI data for electricity consumption dashboard
   * @param electricityConsumption Array of electricity consumption records
   * @param sparklineService Service to generate sparkline visualizations
   * @returns Array of KPI data objects for the dashboard
   */
  generateElectricityKpis(electricityConsumption: ElectricityConsumption[], sparklineService: SparklineService): KpiData[] {
    if (!electricityConsumption || electricityConsumption.length === 0) {
      return this.generateEmptyKpis();
    }

    // Sort data by date (oldest first)
    const sortedData = [...electricityConsumption].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Group data into bimonthly periods
    const bimonthlyGroups = this.groupBimonthlyData(sortedData);

    // Extract consumption values for each bimonthly period
    const bimonthlyConsumption = bimonthlyGroups.map(group =>
      group.reduce((sum, item) => sum + item.kilowatts, 0)
    );

    // Extract costs for each bimonthly period
    const bimonthlyCosts = bimonthlyGroups.map(group =>
      group.reduce((sum, item) => sum + item.cost, 0)
    );

    // Calculate moving averages (over 3 bimonthly periods)
    const movingAverages = this.calculateMovingAverages(bimonthlyConsumption);

    // Current and previous period values
    const currentConsumption = bimonthlyConsumption[bimonthlyConsumption.length - 1] || 0;
    const previousConsumption = bimonthlyConsumption.length > 1
      ? bimonthlyConsumption[bimonthlyConsumption.length - 2]
      : currentConsumption;

    // Calculate percent change
    const percentChange = previousConsumption > 0
      ? ((currentConsumption - previousConsumption) / previousConsumption) * 100
      : 0;

    // Current cost metrics
    const currentCost = bimonthlyCosts[bimonthlyCosts.length - 1] || 0;
    const currentUnitCost = currentConsumption > 0
      ? currentCost / currentConsumption
      : 0;

    // Calculate historical unit costs
    const unitCosts = bimonthlyConsumption.map((consumption, index) => {
      const cost = bimonthlyCosts[index];
      return consumption > 0 ? cost / consumption : 0;
    }).filter(cost => cost > 0);

    const avgHistoricalUnitCost = unitCosts.length > 0
      ? unitCosts.reduce((sum, value) => sum + value, 0) / unitCosts.length
      : 0;

    const unitCostPercentChange = avgHistoricalUnitCost > 0
      ? ((currentUnitCost - avgHistoricalUnitCost) / avgHistoricalUnitCost) * 100
      : 0;

    // Current moving average
    const currentMovingAvg = movingAverages.length > 0
      ? movingAverages[movingAverages.length - 1]
      : currentConsumption;

    const movingAvgDeviation = currentMovingAvg > 0
      ? ((currentConsumption - currentMovingAvg) / currentMovingAvg) * 100
      : 0;

    // Benchmark comparison
    const benchmarkStatus = this.getBenchmarkStatus(
      currentConsumption,
      this.STATE_BENCHMARK_ELECTRICITY,
      this.NATIONAL_BENCHMARK_ELECTRICITY
    );

    // Generate trend data
    const consumptionTrend: TrendInfo = {
      value: percentChange,
      direction: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'neutral',
      isPositive: percentChange <= 0 // Lower consumption is positive
    };

    const movingAvgTrend: TrendInfo = {
      value: movingAvgDeviation,
      direction: movingAvgDeviation > 0 ? 'up' : movingAvgDeviation < 0 ? 'down' : 'neutral',
      isPositive: movingAvgDeviation <= 10 && movingAvgDeviation >= -10 // Staying close to average is positive
    };

    // Detect anomalies (consumption > 20% above moving average)
    const anomalyCount = bimonthlyConsumption.filter((consumption, index) => {
      const movingAvg = movingAverages[index];
      return movingAvg && consumption > movingAvg * 1.2;
    }).length;

    // Calculate CO2 savings
    const co2Savings = Math.max(0, (currentMovingAvg - currentConsumption) * this.CO2_PER_KWH);

    // Generate sparkline data
    const consumptionSparklinePath = sparklineService.generateSparklinePath(bimonthlyConsumption);
    const consumptionEndPoint = sparklineService.getSparklineEndPoint(bimonthlyConsumption);

    const costSparklinePath = sparklineService.generateSparklinePath(bimonthlyCosts);
    const costEndPoint = sparklineService.getSparklineEndPoint(bimonthlyCosts);

    const movingAvgSparklinePath = sparklineService.generateSparklinePath(movingAverages);
    const movingAvgEndPoint = sparklineService.getSparklineEndPoint(movingAverages);

    // Create KPI objects
    return [
      // KPI 1: Current Consumption
      {
        title: 'Consumo Actual',
        primaryValue: currentConsumption.toFixed(1),
        primaryUnit: 'kWh',
        secondaryValue: percentChange.toFixed(1) + '%',
        secondaryUnit: 'vs anterior',
        status: this.getStatusFromPercentChange(percentChange, false),
        trend: consumptionTrend,
        footerText: 'Último periodo bimestral',
        sparklinePath: consumptionSparklinePath,
        sparklineEndPoint: consumptionEndPoint
      },

      // KPI 2: Cost
      {
        title: 'Costo Energético',
        primaryValue: currentCost.toFixed(0),
        primaryUnit: 'MXN',
        secondaryValue: currentUnitCost.toFixed(2),
        secondaryUnit: 'MXN/kWh',
        status: this.getStatusFromPercentChange(unitCostPercentChange, false),
        trend: {
          value: unitCostPercentChange,
          direction: unitCostPercentChange > 0 ? 'up' : unitCostPercentChange < 0 ? 'down' : 'neutral',
          isPositive: unitCostPercentChange <= 0
        },
        footerText: `Promedio histórico: ${avgHistoricalUnitCost.toFixed(2)} MXN/kWh`,
        sparklinePath: costSparklinePath,
        sparklineEndPoint: costEndPoint
      },

      // KPI 3: Moving Average
      {
        title: 'Promedio Móvil',
        primaryValue: currentMovingAvg.toFixed(1),
        primaryUnit: 'kWh',
        secondaryValue: Math.abs(movingAvgDeviation).toFixed(1) + '%',
        secondaryUnit: movingAvgDeviation >= 0 ? 'por encima' : 'por debajo',
        status: this.getStatusFromDeviation(movingAvgDeviation),
        trend: movingAvgTrend,
        footerText: 'Basado en los últimos 3 periodos',
        sparklinePath: movingAvgSparklinePath,
        sparklineEndPoint: movingAvgEndPoint
      },

      // KPI 4: Benchmark
      {
        title: 'Comparativa',
        primaryValue: currentConsumption.toFixed(1),
        primaryUnit: 'kWh',
        secondaryValue: this.NATIONAL_BENCHMARK_ELECTRICITY.toFixed(1),
        secondaryUnit: 'kWh (promedio nacional)',
        status: benchmarkStatus,
        footerText: currentConsumption < this.NATIONAL_BENCHMARK_ELECTRICITY
          ? 'Tu consumo está por debajo del promedio nacional'
          : 'Tu consumo está por encima del promedio nacional'
      },

      // KPI 5: Anomalies
      {
        title: 'Anomalías Detectadas',
        primaryValue: anomalyCount.toString(),
        primaryUnit: anomalyCount === 1 ? 'periodo' : 'periodos',
        status: this.getStatusFromAnomalyCount(anomalyCount),
        footerText: anomalyCount > 0
          ? 'Periodos con consumo inusualmente alto'
          : 'No se detectaron consumos anormales'
      },

      // KPI 6: CO2 Savings
      {
        title: 'Ahorro de CO2',
        primaryValue: co2Savings.toFixed(1),
        primaryUnit: 'kg',
        status: co2Savings > 0 ? 'success' : 'neutral',
        footerText: co2Savings > 0
          ? 'CO2 no emitido vs. promedio'
          : 'Sin ahorro respecto al promedio'
      }
    ];
  }

  /**
   * Generate empty KPIs when no data is available
   */
  private generateEmptyKpis(): KpiData[] {
    return [
      {
        title: 'Consumo Actual',
        primaryValue: '0',
        primaryUnit: 'kWh',
        status: 'neutral',
        footerText: 'No hay datos disponibles'
      },
      {
        title: 'Costo Energético',
        primaryValue: '0',
        primaryUnit: 'MXN',
        status: 'neutral',
        footerText: 'No hay datos disponibles'
      },
      {
        title: 'Promedio Móvil',
        primaryValue: '0',
        primaryUnit: 'kWh',
        status: 'neutral',
        footerText: 'No hay datos disponibles'
      },
      {
        title: 'Comparativa',
        primaryValue: '0',
        primaryUnit: 'kWh',
        secondaryValue: this.NATIONAL_BENCHMARK_ELECTRICITY.toFixed(1),
        secondaryUnit: 'kWh (promedio nacional)',
        status: 'neutral',
        footerText: 'No hay datos para comparar'
      },
      {
        title: 'Anomalías Detectadas',
        primaryValue: '0',
        primaryUnit: 'periodos',
        status: 'neutral',
        footerText: 'No hay datos para analizar'
      },
      {
        title: 'Ahorro de CO2',
        primaryValue: '0',
        primaryUnit: 'kg',
        status: 'neutral',
        footerText: 'No hay datos disponibles'
      }
    ];
  }

  /**
   * Group electricity consumption data into bimonthly periods
   * @param data Array of electricity consumption records
   * @returns Array of arrays, each containing records for a bimonthly period
   */
  groupBimonthlyData(data: ElectricityConsumption[]): ElectricityConsumption[][] {
    if (data.length === 0) return [];

    const groups: ElectricityConsumption[][] = [];
    let currentGroup: ElectricityConsumption[] = [];
    let currentBimonth = -1;

    for (const item of data) {
      const date = new Date(item.date);
      // Calculate bimonthly period (Jan-Feb = 0, Mar-Apr = 1, etc.)
      const bimonth = Math.floor(date.getMonth() / 2) + (date.getFullYear() * 6);

      if (currentBimonth === -1) {
        currentBimonth = bimonth;
        currentGroup.push(item);
      } else if (bimonth === currentBimonth) {
        currentGroup.push(item);
      } else {
        groups.push([...currentGroup]);
        currentGroup = [item];
        currentBimonth = bimonth;
      }
    }

    // Add the last group
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }

  /**
   * Calculate moving averages over the last 3 bimonthly periods
   * @param values Array of consumption values
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
   * Determine status color based on percent change
   * @param percentChange Percentage change
   * @param isPositive Whether positive change is good
   * @returns Status type
   */
  private getStatusFromPercentChange(percentChange: number, isPositive: boolean): StatusType {
    if (isPositive) {
      return percentChange > 10 ? 'success' : percentChange < 0 ? 'danger' : 'warning';
    } else {
      return percentChange < 0 ? 'success' : percentChange > 10 ? 'danger' : 'warning';
    }
  }

  /**
   * Determine status color based on deviation from moving average
   * @param deviation Percent deviation from moving average
   * @returns Status type
   */
  private getStatusFromDeviation(deviation: number): StatusType {
    return Math.abs(deviation) <= 10 ? 'success' : 'warning';
  }

  /**
   * Determine status color based on benchmark comparison
   * @param value Current consumption value
   * @param stateBenchmark State average benchmark
   * @param nationalBenchmark National average benchmark
   * @returns Status type
   */
  private getBenchmarkStatus(value: number, stateBenchmark: number, nationalBenchmark: number): StatusType {
    return value < stateBenchmark ? 'success' :
      value > nationalBenchmark ? 'danger' : 'warning';
  }

  /**
   * Determine status color based on anomaly count
   * @param count Number of detected anomalies
   * @returns Status type
   */
  private getStatusFromAnomalyCount(count: number): StatusType {
    return count === 0 ? 'success' : count > 2 ? 'danger' : 'warning';
  }
}
