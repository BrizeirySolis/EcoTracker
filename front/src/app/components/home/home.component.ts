import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { ConsumptionService } from '../../services/consumption.service';
import { ConsumptionSummary } from '../../models/consumption.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterLink],
  template: `
    <app-navbar></app-navbar>

    <!-- Welcome Section para usuarios no autenticados -->
    <div class="welcome-section" *ngIf="!isLoggedIn">
      <div class="container">
        <div class="hero">
          <h1>Bienvenido a EcoTracker</h1>
          <p class="subtitle">Monitorea tu impacto ambiental y contribuye a un futuro más sostenible</p>

          <div class="call-to-action">
            <a routerLink="/register" class="btn-get-started">Comenzar Ahora</a>
            <a routerLink="/login" class="btn-login">Iniciar Sesión</a>
          </div>
        </div>

        <div class="features">
          <div class="feature-card">
            <div class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
                <path fill="#00b359" d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"/>
              </svg>
            </div>
            <h3>Monitorea tu Energía</h3>
            <p>Registra y analiza tu consumo de electricidad para identificar áreas de mejora.</p>
          </div>

          <div class="feature-card">
            <div class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
                <path fill="#00b359" d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/>
              </svg>
            </div>
            <h3>Gestiona tu Agua</h3>
            <p>Registra tu consumo de agua y recibe recomendaciones para reducir su uso.</p>
          </div>

          <div class="feature-card">
            <div class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48">
                <path fill="#00b359" d="M4 16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-6H4v6zm16-10H4c-1.1 0-2 .9-2 2v2h20v-2c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <h3>Seguimiento de Transporte</h3>
            <p>Registra tus viajes y calcula tu huella de carbono relacionada con el transporte.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard para usuarios autenticados -->
    <div class="container" *ngIf="isLoggedIn">
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
            <h3>Tip del día: Ahorra Energía</h3>
            <p>Apaga los dispositivos electrónicos cuando no los estés utilizando para ahorrar energía.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    /* Estilos para la página de bienvenida */
    .welcome-section {
      background-color: #f9f9f9;
      padding: 40px 0;
    }

    .hero {
      text-align: center;
      margin-bottom: 60px;
    }

    h1 {
      color: #00b359;
      font-size: 2.5rem;
      margin-bottom: 16px;
    }

    .subtitle {
      font-size: 1.2rem;
      color: #555;
      max-width: 600px;
      margin: 0 auto 30px;
    }

    .call-to-action {
      display: flex;
      justify-content: center;
      gap: 16px;
    }

    .btn-get-started, .btn-login {
      display: inline-block;
      padding: 12px 24px;
      border-radius: 24px;
      font-weight: bold;
      text-decoration: none;
      transition: background-color 0.3s;
    }

    .btn-get-started {
      background-color: #00b359;
      color: white;
    }

    .btn-get-started:hover {
      background-color: #00833c;
    }

    .btn-login {
      background-color: white;
      color: #00b359;
      border: 2px solid #00b359;
    }

    .btn-login:hover {
      background-color: #f0f0f0;
    }

    .features {
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      gap: 30px;
    }

    .feature-card {
      background-color: white;
      border-radius: 12px;
      padding: 30px;
      width: 300px;
      text-align: center;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .icon {
      margin-bottom: 20px;
    }

    .feature-card h3 {
      color: #00b359;
      margin-bottom: 12px;
    }

    .feature-card p {
      color: #666;
    }

    /* Estilos del dashboard */
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

      .features {
        flex-direction: column;
        align-items: center;
      }

      .feature-card {
        width: 100%;
        max-width: 300px;
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
  isLoggedIn = false;
  summary: ConsumptionSummary[] = [];
  pieSegments: { path: string }[] = [];

  constructor(
    private consumptionService: ConsumptionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar si el usuario está autenticado
    this.isLoggedIn = this.authService.isLoggedIn();

    // Solo cargar los datos del dashboard si el usuario está autenticado
    if (this.isLoggedIn) {
      this.loadDashboardData();
    }
  }

  loadDashboardData(): void {
    // Get consumption summary data
    this.consumptionService.getConsumptionSummary().subscribe({
      next: data => {
        this.summary = data;
        this.generatePieChart();
      },
      error: error => {
        console.error('Error al cargar los datos del resumen', error);

        // Si hay un error de autenticación (token expirado), hacer logout
        if (error.status === 401) {
          console.log('Error de autenticación. Cerrando sesión...');
          this.authService.logout();
          this.router.navigate(['/login'], {
            queryParams: {
              returnUrl: this.router.url,
              authError: 'Tu sesión ha expirado o no es válida. Por favor, inicia sesión nuevamente.'
            }
          });
        }
      }
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
