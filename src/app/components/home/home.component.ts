import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { ConsumptionService } from '../../services/consumption.service';
import { ConsumptionSummary } from '../../models/consumption.model';

/**
 * Home component that displays the dashboard with consumption summary
 * and ecological impact statistics
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container">
      <div class="dashboard-grid">
        <div class="impact-summary">
          <h2>Resumen de Impacto</h2>

          <!-- Simple SVG Pie Chart -->
          <div class="pie-chart">
            <svg width="300" height="300" viewBox="0 0 300 300">
              <!-- Base circle -->
              <circle cx="150" cy="150" r="100" fill="#f0f0f0" />

              <!-- Pie segments - hardcoded for demo -->
              <path *ngFor="let segment of pieSegments; let i = index"
                [attr.d]="segment.path"
                [attr.fill]="getColor(i)"
                stroke="#fff"
                stroke-width="1" />

              <!-- Center circle (optional) -->
              <circle cx="150" cy="150" r="60" fill="white" />
            </svg>

            <!-- Legend -->
            <div class="legend">
              <div *ngFor="let item of summary; let i = index" class="legend-item">
                <span [style.background-color]="getColor(i)" class="legend-color"></span>
                <span>{{ item.label }} {{ item.percentage }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="statistics">
          <h2>Estadísticas</h2>

          <div class="stat-item">
            <h3>Electricidad: XX</h3>
          </div>

          <div class="stat-item">
            <h3>Transporte: XX</h3>
          </div>

          <div class="stat-item">
            <h3>Agua: XX</h3>
          </div>

          <div class="consumption-level">
            <h3>Nivel de Consumo</h3>
            <div class="level-indicator">
              <div class="level-bar">
                <div class="level-progress" [style.width.%]="30"></div>
              </div>
              <div class="level-marker" [style.left.%]="30">
                <div class="marker"></div>
              </div>
            </div>
          </div>

          <div class="tip-of-day">
            <h3>Tip del día: XXXXXXX</h3>
            <p>Apaga los dispositivos electrónicos cuando no los estés utilizando para ahorrar energía.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }

    .impact-summary, .statistics {
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 20px;
    }

    h2 {
      color: #333;
      margin-top: 0;
      margin-bottom: 20px;
    }

    .pie-chart {
      text-align: center;
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 20px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      margin: 5px 10px;
    }

    .legend-color {
      width: 16px;
      height: 16px;
      display: inline-block;
      margin-right: 8px;
      border-radius: 3px;
    }

    .stat-item {
      margin-bottom: 15px;
    }

    .consumption-level {
      margin: 25px 0;
    }

    .level-indicator {
      position: relative;
      margin-top: 10px;
    }

    .level-bar {
      height: 12px;
      background: linear-gradient(to right, #4CAF50, #FFEB3B, #F44336);
      border-radius: 6px;
    }

    .level-progress {
      height: 12px;
      background-color: rgba(255, 255, 255, 0.7);
      border-radius: 6px;
    }

    .level-marker {
      position: absolute;
      top: -5px;
      transform: translateX(-50%);
    }

    .marker {
      width: 20px;
      height: 20px;
      background-color: white;
      border: 2px solid #333;
      border-radius: 50%;
    }

    .tip-of-day {
      margin-top: 25px;
      padding: 15px;
      background-color: #e8f5e9;
      border-radius: 8px;
    }

    .tip-of-day h3 {
      color: #2e7d32;
      margin-top: 0;
    }

    .tip-of-day p {
      color: #1b5e20;
    }
  `
})
export class HomeComponent implements OnInit {
  summary: ConsumptionSummary[] = [];
  pieSegments: { path: string }[] = [];

  constructor(private consumptionService: ConsumptionService) {}

  ngOnInit(): void {
    // Get consumption summary data
    this.consumptionService.getConsumptionSummary().subscribe(data => {
      this.summary = data;
      this.generatePieChart();
    });
  }

  /**
   * Generate SVG paths for pie chart segments
   */
  generatePieChart(): void {
    this.pieSegments = [];
    let startAngle = 0;

    this.summary.forEach(item => {
      // Calculate the angle for this segment
      const angle = (item.percentage / 100) * 360;
      const endAngle = startAngle + angle;

      // Calculate the SVG path for this segment
      const path = this.describeArc(150, 150, 100, startAngle, endAngle);
      this.pieSegments.push({ path });

      // Update start angle for next segment
      startAngle = endAngle;
    });
  }

  /**
   * Create SVG arc path
   */
  describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
    // Convert angles to radians
    const start = this.degToRad(startAngle);
    const end = this.degToRad(endAngle);

    // Calculate points
    const startX = x + radius * Math.cos(start);
    const startY = y + radius * Math.sin(start);
    const endX = x + radius * Math.cos(end);
    const endY = y + radius * Math.sin(end);

    // Determine if the arc should be drawn as a large arc
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    // Create SVG path
    return [
      'M', x, y,
      'L', startX, startY,
      'A', radius, radius, 0, largeArcFlag, 1, endX, endY,
      'Z'
    ].join(' ');
  }

  /**
   * Convert degrees to radians
   */
  degToRad(angle: number): number {
    // Subtract 90 to start from the top instead of right
    return ((angle - 90) * Math.PI) / 180;
  }

  /**
   * Get color for chart segment based on index
   */
  getColor(index: number): string {
    const colors = [
      '#4CAF50', // Green
      '#FFC107', // Amber
      '#2196F3', // Blue
      '#9C27B0', // Purple
      '#FF5722'  // Deep Orange
    ];

    return colors[index % colors.length];
  }
}
