import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { KpiCardComponent } from '../../kpi-cards/kpi-card/kpi-card.component';
import { KpiPaginationComponent } from '../../kpi-cards/kpi-pagination/kpi-pagination.component';
import { ConsumptionService } from '../../../services/consumption.service';
import { ElectricityAnalyticsService } from '../../../services/analytics/electricity-analytics.service';
import { SparklineService } from '../../../services/visualization/sparkline.service';
import { ElectricityConsumption } from '../../../models/consumption.model';
import { KpiData } from '../../../models/kpi.model';

/**
 * Component for the electricity dashboard module
 * Displays KPIs and recommendations for electricity consumption
 */
@Component({
  selector: 'app-electricity-dashboard',
  templateUrl: './electricity-dashboard.component.html',
  styleUrls: ['./electricity-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    KpiCardComponent,
    KpiPaginationComponent
  ]
})
export class ElectricityDashboardComponent implements OnInit {
  @Input() activeTabName: string = 'electricidad';

  electricityConsumption: ElectricityConsumption[] = [];
  electricityKpis: KpiData[] = [];
  currentKpiPage = 0;

  constructor(
    private consumptionService: ConsumptionService,
    private electricityAnalyticsService: ElectricityAnalyticsService,
    private sparklineService: SparklineService
  ) {}

  ngOnInit(): void {
    this.loadElectricityData();
  }

  /**
   * Load electricity consumption data and process KPIs
   */
  private loadElectricityData(): void {
    this.consumptionService.getElectricityConsumption().subscribe({
      next: (data) => {
        this.electricityConsumption = this.sortByDate(data);
        this.processElectricityKpis();
      },
      error: (error) => {
        console.error('Error loading electricity consumption data:', error);
        // Optional: Load mock data for development/testing
        this.electricityConsumption = this.consumptionService.getMockElectricityData();
        this.processElectricityKpis();
      }
    });
  }

  /**
   * Process electricity consumption data into KPI metrics
   * This delegates to the ElectricityAnalyticsService
   */
  private processElectricityKpis(): void {
    this.electricityKpis = this.electricityAnalyticsService.generateElectricityKpis(
      this.electricityConsumption,
      this.sparklineService
    );
  }

  /**
   * Change the current KPI page
   */
  onPageChange(page: number): void {
    this.currentKpiPage = page;
  }

  /**
   * Helper to sort consumption data by date (newest first)
   */
  private sortByDate<T extends { date: Date }>(data: T[]): T[] {
    return [...data].sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}
