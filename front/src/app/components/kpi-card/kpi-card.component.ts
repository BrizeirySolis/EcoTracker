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
 * Supports various display modes and status indicators
 */
@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpi-card" [ngClass]="'status-' + status">
      <div class="kpi-header">
        <h4 class="kpi-title">{{ title }}</h4>

        <!-- Status indicator (traffic light) -->
        <div *ngIf="status !== 'neutral'" class="status-indicator">
          <div class="status-dot"></div>
        </div>
      </div>

      <div class="kpi-body">
        <!-- Primary value display -->
        <div class="kpi-value-container">
          <div class="kpi-value">{{ primaryValue }}</div>
          <div *ngIf="primaryUnit" class="kpi-unit">{{ primaryUnit }}</div>
        </div>

        <!-- Secondary value (if provided) -->
        <div *ngIf="secondaryValue" class="kpi-secondary">
          <div class="secondary-value">{{ secondaryValue }}</div>
          <div *ngIf="secondaryUnit" class="secondary-unit">{{ secondaryUnit }}</div>
        </div>

        <!-- Trend indicator (if provided) -->
        <div *ngIf="trend" class="kpi-trend" [ngClass]="{
          'trend-up': trend.direction === 'up',
          'trend-down': trend.direction === 'down',
          'trend-positive': trend.isPositive,
          'trend-negative': !trend.isPositive
        }">
          <div class="trend-arrow">
            <svg *ngIf="trend.direction === 'up'" viewBox="0 0 24 24" width="16" height="16">
              <path d="M7 14l5-5 5 5z"></path>
            </svg>
            <svg *ngIf="trend.direction === 'down'" viewBox="0 0 24 24" width="16" height="16">
              <path d="M7 10l5 5 5-5z"></path>
            </svg>
            <svg *ngIf="trend.direction === 'neutral'" viewBox="0 0 24 24" width="16" height="16">
              <path d="M5 12h14"></path>
            </svg>
          </div>
          <div class="trend-value">{{ trend.value >= 0 ? '+' : '' }}{{ trend.value.toFixed(1) }}%</div>
        </div>
      </div>

      <!-- Footer content (if provided) -->
      <div *ngIf="footerText" class="kpi-footer">
        {{ footerText }}
      </div>

      <!-- Optional chart/sparkline -->
      <div *ngIf="sparklinePath" class="kpi-sparkline">
        <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none">
          <path [attr.d]="sparklinePath" class="sparkline-path"></path>
          <circle *ngIf="sparklineEndPoint"
                  [attr.cx]="sparklineEndPoint.x"
                  [attr.cy]="sparklineEndPoint.y"
                  r="2"
                  class="sparkline-point"></circle>
        </svg>
      </div>
    </div>
  `,
  styles: `
    .kpi-card {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      min-height: 160px;
      transition: all 0.3s ease;
    }

    .kpi-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    /* Status variants */
    .kpi-card.status-success {
      border-left: 4px solid #4CAF50;
    }

    .kpi-card.status-warning {
      border-left: 4px solid #FFC107;
    }

    .kpi-card.status-danger {
      border-left: 4px solid #F44336;
    }

    .kpi-card.status-info {
      border-left: 4px solid #2196F3;
    }

    .kpi-card.status-neutral {
      border-left: 4px solid #9E9E9E;
    }

    /* Header styles */
    .kpi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .kpi-title {
      font-size: 1rem;
      font-weight: 600;
      color: #555;
      margin: 0;
    }

    .status-indicator {
      display: flex;
      align-items: center;
    }

    .status-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .status-success .status-dot {
      background-color: #4CAF50;
    }

    .status-warning .status-dot {
      background-color: #FFC107;
    }

    .status-danger .status-dot {
      background-color: #F44336;
    }

    .status-info .status-dot {
      background-color: #2196F3;
    }

    /* Body styles */
    .kpi-body {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    .kpi-value-container {
      display: flex;
      align-items: baseline;
    }

    .kpi-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #333;
    }

    .kpi-unit {
      font-size: 1rem;
      color: #666;
      margin-left: 4px;
    }

    .kpi-secondary {
      display: flex;
      align-items: center;
      margin-top: 8px;
    }

    .secondary-value {
      font-size: 1.1rem;
      font-weight: 600;
      color: #555;
    }

    .secondary-unit {
      font-size: 0.9rem;
      color: #777;
      margin-left: 4px;
    }

    /* Trend indicator */
    .kpi-trend {
      display: flex;
      align-items: center;
      margin-top: 8px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .trend-arrow {
      margin-right: 4px;
      display: flex;
      align-items: center;
    }

    .trend-up.trend-positive,
    .trend-down.trend-negative {
      color: #4CAF50;
    }

    .trend-up.trend-negative,
    .trend-down.trend-positive {
      color: #F44336;
    }

    .trend-up.trend-positive svg,
    .trend-down.trend-negative svg {
      fill: #4CAF50;
    }

    .trend-up.trend-negative svg,
    .trend-down.trend-positive svg {
      fill: #F44336;
    }

    /* Footer */
    .kpi-footer {
      font-size: 0.8rem;
      color: #777;
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid #eee;
    }

    /* Sparkline */
    .kpi-sparkline {
      margin-top: 12px;
      height: 40px;
    }

    .sparkline-path {
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .status-success .sparkline-path,
    .status-success .sparkline-point {
      stroke: #4CAF50;
      fill: #4CAF50;
    }

    .status-warning .sparkline-path,
    .status-warning .sparkline-point {
      stroke: #FFC107;
      fill: #FFC107;
    }

    .status-danger .sparkline-path,
    .status-danger .sparkline-point {
      stroke: #F44336;
      fill: #F44336;
    }

    .status-info .sparkline-path,
    .status-info .sparkline-point {
      stroke: #2196F3;
      fill: #2196F3;
    }

    .status-neutral .sparkline-path,
    .status-neutral .sparkline-point {
      stroke: #9E9E9E;
      fill: #9E9E9E;
    }
  `
})
export class KpiCardComponent {
  @Input() title: string = '';
  @Input() primaryValue: string = '';
  @Input() primaryUnit: string = '';
  @Input() secondaryValue?: string = '';
  @Input() secondaryUnit?: string = '';
  @Input() status: StatusType = 'neutral';
  @Input() trend?: TrendInfo;
  @Input() footerText?: string = '';

  // Sparkline properties
  @Input() sparklinePath?: string = '';
  @Input() sparklineEndPoint?: { x: number, y: number };
}
