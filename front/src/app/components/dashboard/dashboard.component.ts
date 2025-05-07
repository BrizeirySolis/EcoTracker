import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsumptionTabComponent } from '../consumption-tab/consumption-tab.component';
import { WaterDashboardComponent } from '../consumption-modules/water-dashboard/water-dashboard.component';
import { ElectricityDashboardComponent } from '../consumption-modules/electricity-dashboard/electricity-dashboard.component';
import { TransportDashboardComponent } from '../consumption-modules/transport-dashboard/transport-dashboard.component';

import { ConsumptionTabType } from '../../models/dashboard.model';

/**
 * Dashboard component that serves as the container for all consumption modules
 * Handles tab selection and state management for child components
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ConsumptionTabComponent,
    WaterDashboardComponent,
    ElectricityDashboardComponent,
    TransportDashboardComponent
  ]
})
export class DashboardComponent implements OnInit {
  activeTab: ConsumptionTabType = 'agua';

  ngOnInit(): void {
    // Initialize dashboard state
  }

  /**
   * Changes the active consumption tab
   * Explicitly typed to prevent Event object from being passed
   */
  setActiveTab(tab: ConsumptionTabType): void {
    this.activeTab = tab;
  }

  /**
   * Returns the display name for the active tab
   */
  get activeTabName(): string {
    const names: Record<ConsumptionTabType, string> = {
      'agua': 'agua',
      'electricidad': 'electricidad',
      'transporte': 'transporte'
    };
    return names[this.activeTab];
  }
}
