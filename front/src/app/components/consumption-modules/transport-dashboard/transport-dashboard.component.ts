import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { KpiCardComponent } from '../../kpi-cards/kpi-card/kpi-card.component';
import { KpiPaginationComponent } from '../../kpi-cards/kpi-pagination/kpi-pagination.component';
import { ConsumptionService } from '../../../services/consumption.service';
import { TransportAnalyticsService } from '../../../services/analytics/transport-analytics.service';
import { SparklineService } from '../../../services/visualization/sparkline.service';
import { TransportUsage } from '../../../models/consumption.model';
import { KpiData } from '../../../models/kpi.model';

/**
 * Component for the transport dashboard module
 * Displays KPIs and recommendations for transport usage
 */
@Component({
  selector: 'app-transport-dashboard',
  templateUrl: './transport-dashboard.component.html',
  styleUrls: ['./transport-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    KpiCardComponent,
    KpiPaginationComponent
  ]
})
export class TransportDashboardComponent implements OnInit {
  @Input() activeTabName: string = 'transporte';

  transportUsage: TransportUsage[] = [];
  transportKpis: KpiData[] = [];
  currentKpiPage = 0;

  constructor(
    private consumptionService: ConsumptionService,
    private transportAnalyticsService: TransportAnalyticsService,
    private sparklineService: SparklineService
  ) {}

  ngOnInit(): void {
    this.loadTransportData();
  }

  /**
   * Load transport usage data and process KPIs
   */
  private loadTransportData(): void {
    this.consumptionService.getTransportUsage().subscribe({
      next: (data) => {
        this.transportUsage = this.sortByDate(data);
        this.processTransportKpis();
      },
      error: (error) => {
        console.error('Error loading transport usage data:', error);
        // Optional: Load mock data for development/testing
        this.transportUsage = this.consumptionService.getMockTransportData();
        this.processTransportKpis();
      }
    });
  }

  /**
   * Process transport usage data into KPI metrics
   * This delegates to the TransportAnalyticsService
   */
  private processTransportKpis(): void {
    this.transportKpis = this.transportAnalyticsService.generateTransportKpis(
      this.transportUsage,
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
   * Helper to sort usage data by date (newest first)
   */
  private sortByDate<T extends { date: Date }>(data: T[]): T[] {
    return [...data].sort((a, b) => b.date.getTime() - a.date.getTime());
  }
}
