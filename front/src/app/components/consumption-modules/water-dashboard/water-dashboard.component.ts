import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { KpiCardComponent } from '../../kpi-cards/kpi-card/kpi-card.component';
import { KpiPaginationComponent } from '../../kpi-cards/kpi-pagination/kpi-pagination.component';
import { ConsumptionService } from '../../../services/consumption.service';
import { WaterAnalyticsService } from '../../../services/analytics/water-analytics.service';
import { SparklineService } from '../../../services/visualization/sparkline.service';
import { WaterConsumption } from '../../../models/consumption.model';
import { KpiData } from '../../../models/kpi.model';

/**
 * Componente para el módulo de dashboard de agua
 * Muestra KPIs y recomendaciones para el consumo de agua
 */
@Component({
  selector: 'app-water-dashboard',
  templateUrl: './water-dashboard.component.html',
  styleUrls: ['./water-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    KpiCardComponent,
    KpiPaginationComponent
  ]
})
export class WaterDashboardComponent implements OnInit {
  @Input() activeTabName: string = 'agua';

  waterConsumption: WaterConsumption[] = [];
  waterKpis: KpiData[] = [];
  currentKpiPage = 0;

  constructor(
    private consumptionService: ConsumptionService,
    private waterAnalyticsService: WaterAnalyticsService,
    private sparklineService: SparklineService
  ) {}

  ngOnInit(): void {
    this.loadWaterData();
  }

  /**
   * Carga los datos de consumo de agua y procesa los KPIs
   */
  private loadWaterData(): void {
    this.consumptionService.getWaterConsumption().subscribe({
      next: (data) => {
        this.waterConsumption = this.sortByDate(data);
        this.processWaterKpis();
      },
      error: (error) => {
        console.error('Error cargando datos de consumo de agua:', error);
        // Cargar datos de ejemplo para desarrollo/pruebas
        this.waterConsumption = this.consumptionService.getMockWaterData();
        this.processWaterKpis();
      }
    });
  }

  /**
   * Procesa los datos de consumo de agua en métricas KPI
   * Ahora delega al servicio WaterAnalyticsService
   */
  private processWaterKpis(): void {
    this.waterKpis = this.waterAnalyticsService.generateWaterKpis(
      this.waterConsumption,
      this.sparklineService
    );
  }

  /**
   * Cambiar la página KPI actual
   */
  onPageChange(page: number): void {
    this.currentKpiPage = page;
  }

  /**
   * Ordenar datos por fecha (más recientes primero)
   */
  private sortByDate<T extends { date: Date }>(data: T[]): T[] {
    return [...data].sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}
