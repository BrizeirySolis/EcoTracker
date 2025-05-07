import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Types of KPI traffic light status indicators
 */
export type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/**
 * Data structure for KPI trend direction
 */
export interface TrendInfo {
  value: number;       // Percentage change
  direction: 'up' | 'down' | 'neutral';
  isPositive: boolean; // Whether the direction is good (e.g., reduced consumption is positive)
}

/**
 * Reusable component for displaying KPI metrics in a card format
 */
@Component({
  selector: 'app-kpi-card',
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class KpiCardComponent {
  @Input() title: string = '';
  @Input() primaryValue: string = '';
  @Input() primaryUnit: string = '';
  @Input() secondaryValue?: string;
  @Input() secondaryUnit?: string;
  @Input() status: StatusType = 'neutral';
  @Input() trend?: TrendInfo;
  @Input() footerText?: string = '';

  // Sparkline properties
  @Input() sparklinePath?: string = '';
  @Input() sparklineEndPoint?: { x: number, y: number };
}
