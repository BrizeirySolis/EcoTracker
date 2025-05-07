import { Injectable } from '@angular/core';
import { WaterConsumption } from '../../models/consumption.model';
import { KpiData } from '../../models/kpi.model';
import { SparklineService } from '../visualization/sparkline.service';
import { StatusType, TrendInfo } from '../../components/kpi-cards/kpi-card/kpi-card.component';

/**
 * Servicio responsable de analizar datos de consumo de agua
 * y generar KPIs relevantes para el dashboard
 */
@Injectable({
  providedIn: 'root'
})
export class WaterAnalyticsService {
  // Constantes para análisis
  private readonly STATE_BENCHMARK_WATER = 13.8; // m³ (Zacatecas)
  private readonly NATIONAL_BENCHMARK_WATER = 14.4; // m³ (Mexico)
  private readonly CO2_PER_M3_WATER = 0.376; // kg CO2 por m³ (estimado)

  constructor() { }

  /**
   * Genera datos KPI para el dashboard de consumo de agua
   * @param waterConsumption Array de registros de consumo de agua
   * @param sparklineService Servicio para generar visualizaciones de sparkline
   * @returns Array de objetos KPI para el dashboard
   */
  generateWaterKpis(waterConsumption: WaterConsumption[], sparklineService: SparklineService): KpiData[] {
    if (!waterConsumption || waterConsumption.length === 0) {
      return this.generateEmptyKpis();
    }

    // Ordenar datos por fecha (más antiguos primero)
    const sortedData = [...waterConsumption].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Agrupar datos en periodos bimestrales
    const bimonthlyGroups = this.groupBimonthlyData(sortedData);

    // Extraer valores de consumo para cada periodo bimestral
    const bimonthlyConsumption = bimonthlyGroups.map(group =>
      group.reduce((sum, item) => sum + item.liters, 0)
    );

    // Extraer costos para cada periodo bimestral
    const bimonthlyCosts = bimonthlyGroups.map(group =>
      group.reduce((sum, item) => sum + item.cost, 0)
    );

    // Calcular promedios móviles (sobre 3 periodos bimestrales)
    const movingAverages = this.calculateMovingAverages(bimonthlyConsumption);

    // Valores actuales y anteriores
    const currentConsumption = bimonthlyConsumption[bimonthlyConsumption.length - 1] || 0;
    const previousConsumption = bimonthlyConsumption.length > 1
      ? bimonthlyConsumption[bimonthlyConsumption.length - 2]
      : currentConsumption;

    // Calcular cambio porcentual
    const percentChange = previousConsumption > 0
      ? ((currentConsumption - previousConsumption) / previousConsumption) * 100
      : 0;

    // Métricas de costo actual
    const currentCost = bimonthlyCosts[bimonthlyCosts.length - 1] || 0;
    const currentUnitCost = currentConsumption > 0
      ? currentCost / currentConsumption
      : 0;

    // Calcular costos unitarios históricos
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

    // Promedio móvil actual
    const currentMovingAvg = movingAverages.length > 0
      ? movingAverages[movingAverages.length - 1]
      : currentConsumption;

    const movingAvgDeviation = currentMovingAvg > 0
      ? ((currentConsumption - currentMovingAvg) / currentMovingAvg) * 100
      : 0;

    // Comparación con benchmarks
    const benchmarkStatus = this.getBenchmarkStatus(
      currentConsumption,
      this.STATE_BENCHMARK_WATER,
      this.NATIONAL_BENCHMARK_WATER
    );

    // Generar datos de tendencia
    const consumptionTrend: TrendInfo = {
      value: percentChange,
      direction: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'neutral',
      isPositive: percentChange <= 0 // Menor consumo es positivo
    };

    const movingAvgTrend: TrendInfo = {
      value: movingAvgDeviation,
      direction: movingAvgDeviation > 0 ? 'up' : movingAvgDeviation < 0 ? 'down' : 'neutral',
      isPositive: movingAvgDeviation <= 10 && movingAvgDeviation >= -10 // Estar cerca del promedio es positivo
    };

    // Detectar anomalías (consumo > 20% sobre el promedio móvil)
    const anomalyCount = bimonthlyConsumption.filter((consumption, index) => {
      const movingAvg = movingAverages[index];
      return movingAvg && consumption > movingAvg * 1.2;
    }).length;

    // Calcular ahorro de CO2
    const co2Savings = Math.max(0, (currentMovingAvg - currentConsumption) * this.CO2_PER_M3_WATER);

    // Generar datos de sparkline
    const consumptionSparklinePath = sparklineService.generateSparklinePath(bimonthlyConsumption);
    const consumptionEndPoint = sparklineService.getSparklineEndPoint(bimonthlyConsumption);

    const costSparklinePath = sparklineService.generateSparklinePath(bimonthlyCosts);
    const costEndPoint = sparklineService.getSparklineEndPoint(bimonthlyCosts);

    const movingAvgSparklinePath = sparklineService.generateSparklinePath(movingAverages);
    const movingAvgEndPoint = sparklineService.getSparklineEndPoint(movingAverages);

    // Crear array de objetos KPI
    return [
      // KPI 1: Consumo Actual
      {
        title: 'Consumo Actual',
        primaryValue: currentConsumption.toFixed(1),
        primaryUnit: 'm³',
        secondaryValue: Math.abs(percentChange).toFixed(1) + '%',
        secondaryUnit: 'vs anterior',
        status: this.getStatusFromPercentChange(percentChange, false),
        trend: consumptionTrend,
        footerText: 'Último periodo bimestral',
        sparklinePath: consumptionSparklinePath,
        sparklineEndPoint: consumptionEndPoint
      },

      // KPI 2: Costo
      {
        title: 'Costo del Agua',
        primaryValue: currentCost.toFixed(0),
        primaryUnit: 'MXN',
        secondaryValue: currentUnitCost.toFixed(2),
        secondaryUnit: 'MXN/m³',
        status: this.getStatusFromPercentChange(unitCostPercentChange, false),
        trend: {
          value: unitCostPercentChange,
          direction: unitCostPercentChange > 0 ? 'up' : unitCostPercentChange < 0 ? 'down' : 'neutral',
          isPositive: unitCostPercentChange <= 0
        },
        footerText: `Promedio histórico: ${avgHistoricalUnitCost.toFixed(2)} MXN/m³`,
        sparklinePath: costSparklinePath,
        sparklineEndPoint: costEndPoint
      },

      // KPI 3: Promedio Móvil
      {
        title: 'Promedio Móvil',
        primaryValue: currentMovingAvg.toFixed(1),
        primaryUnit: 'm³',
        secondaryValue: Math.abs(movingAvgDeviation).toFixed(1) + '%',
        secondaryUnit: movingAvgDeviation >= 0 ? 'por encima' : 'por debajo',
        status: this.getStatusFromDeviation(movingAvgDeviation),
        trend: movingAvgTrend,
        footerText: 'Basado en los últimos 3 periodos',
        sparklinePath: movingAvgSparklinePath,
        sparklineEndPoint: movingAvgEndPoint
      },

      // KPI 4: Comparativa
      {
        title: 'Comparativa',
        primaryValue: currentConsumption.toFixed(1),
        primaryUnit: 'm³',
        secondaryValue: this.NATIONAL_BENCHMARK_WATER.toFixed(1),
        secondaryUnit: 'm³ (promedio nacional)',
        status: benchmarkStatus,
        footerText: currentConsumption < this.NATIONAL_BENCHMARK_WATER
          ? 'Tu consumo está por debajo del promedio nacional'
          : 'Tu consumo está por encima del promedio nacional'
      },

      // KPI 5: Anomalías detectadas
      {
        title: 'Anomalías Detectadas',
        primaryValue: anomalyCount.toString(),
        primaryUnit: anomalyCount === 1 ? 'periodo' : 'periodos',
        status: this.getStatusFromAnomalyCount(anomalyCount),
        footerText: anomalyCount > 0
          ? 'Periodos con consumo inusualmente alto'
          : 'No se detectaron consumos anormales'
      },

      // KPI 6: Ahorro de CO2
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
   * Genera KPIs vacíos cuando no hay datos disponibles
   */
  private generateEmptyKpis(): KpiData[] {
    return [
      {
        title: 'Consumo Actual',
        primaryValue: '0',
        primaryUnit: 'm³',
        status: 'neutral',
        footerText: 'No hay datos disponibles'
      },
      {
        title: 'Costo del Agua',
        primaryValue: '0',
        primaryUnit: 'MXN',
        status: 'neutral',
        footerText: 'No hay datos disponibles'
      },
      {
        title: 'Promedio Móvil',
        primaryValue: '0',
        primaryUnit: 'm³',
        status: 'neutral',
        footerText: 'No hay datos disponibles'
      },
      {
        title: 'Comparativa',
        primaryValue: '0',
        primaryUnit: 'm³',
        secondaryValue: this.NATIONAL_BENCHMARK_WATER.toFixed(1),
        secondaryUnit: 'm³ (promedio nacional)',
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
   * Agrupar datos de consumo de agua en periodos bimestrales
   */
  groupBimonthlyData(data: WaterConsumption[]): WaterConsumption[][] {
    if (data.length === 0) return [];

    const groups: WaterConsumption[][] = [];
    let currentGroup: WaterConsumption[] = [];
    let currentBimonth = -1;

    for (const item of data) {
      const date = new Date(item.date);
      // Calcular periodo bimestral (Ene-Feb = 0, Mar-Abr = 1, etc.)
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

    // Añadir el último grupo
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }

  /**
   * Calcular promedios móviles sobre los últimos 3 periodos bimestrales
   */
  private calculateMovingAverages(values: number[]): number[] {
    const movingAverages: number[] = [];

    for (let i = 0; i < values.length; i++) {
      // Calcular promedio móvil sobre actual y hasta 2 periodos anteriores
      const windowStart = Math.max(0, i - 2);
      const window = values.slice(windowStart, i + 1);
      const sum = window.reduce((acc, val) => acc + val, 0);
      movingAverages.push(sum / window.length);
    }

    return movingAverages;
  }

  /**
   * Determinar color de estado basado en el cambio porcentual
   */
  private getStatusFromPercentChange(percentChange: number, isPositive: boolean): StatusType {
    if (isPositive) {
      return percentChange > 10 ? 'success' : percentChange < 0 ? 'danger' : 'warning';
    } else {
      return percentChange < 0 ? 'success' : percentChange > 10 ? 'danger' : 'warning';
    }
  }

  /**
   * Determinar color de estado basado en la desviación del promedio móvil
   */
  private getStatusFromDeviation(deviation: number): StatusType {
    return Math.abs(deviation) <= 10 ? 'success' : 'warning';
  }

  /**
   * Determinar color de estado basado en la comparación con benchmarks
   */
  private getBenchmarkStatus(value: number, stateBenchmark: number, nationalBenchmark: number): StatusType {
    return value < stateBenchmark ? 'success' :
      value > nationalBenchmark ? 'danger' : 'warning';
  }

  /**
   * Determinar color de estado basado en el recuento de anomalías
   */
  private getStatusFromAnomalyCount(count: number): StatusType {
    return count === 0 ? 'success' : count > 2 ? 'danger' : 'warning';
  }
}
