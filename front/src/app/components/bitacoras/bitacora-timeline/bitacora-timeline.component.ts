import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BitacoraService } from '../../../services/bitacora.service';
import { NavbarComponent } from '../../navbar/navbar.component';
import { Bitacora, CATEGORIAS } from '../../../models/bitacora.model';
import { catchError, finalize, of } from 'rxjs';

/**
 * Interface for timeline entries grouped by month and year
 */
interface TimelineGroup {
  monthYear: string;
  year: number;
  month: number;
  displayText: string;
  bitacoras: Bitacora[];
}

/**
 * Component that displays bitácoras in a chronological timeline view
 * Groups entries by month/year for better visualization
 */
@Component({
  selector: 'app-bitacora-timeline',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container">
      <div class="page-header">
        <h2>Línea de Tiempo de Bitácoras</h2>
        <div class="header-actions">
          <a [routerLink]="['/bitacoras']" class="btn-back">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Ver vista de lista
          </a>
          <a [routerLink]="['/bitacoras/new']" class="btn-create">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Crear Bitácora
          </a>
        </div>
      </div>

      <!-- Loading indicator -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando bitácoras...</p>
      </div>

      <!-- Empty state -->
      <div *ngIf="!loading && (!timelineGroups || timelineGroups.length === 0)" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
        <h3>No hay bitácoras disponibles</h3>
        <p>Comienza registrando tus actividades ambientales.</p>
        <a [routerLink]="['/bitacoras/new']" class="btn-create-empty">Crear primera bitácora</a>
      </div>

      <!-- Error message -->
      <div *ngIf="error" class="error-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>{{ error }}</p>
        <button (click)="loadBitacoras()" class="btn-retry">Reintentar</button>
      </div>

      <!-- Filter options -->
      <div *ngIf="!loading && timelineGroups && timelineGroups.length > 0" class="filter-container">
        <div class="filter-group">
          <label for="categoria-filter">Filtrar por categoría:</label>
          <select
            id="categoria-filter"
            [(ngModel)]="selectedCategoria"
            (change)="onCategoriaFilterChange()"
            class="categoria-select">
            <option value="">Todas las categorías</option>
            <option *ngFor="let cat of categoriaEntries" [value]="cat[0]">{{ cat[1] }}</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="year-filter">Filtrar por año:</label>
          <select
            id="year-filter"
            [(ngModel)]="selectedYear"
            (change)="onYearFilterChange()"
            class="year-select">
            <option value="0">Todos los años</option>
            <option *ngFor="let year of availableYears" [value]="year">{{ year }}</option>
          </select>
        </div>
      </div>

      <!-- Timeline -->
      <div *ngIf="!loading && timelineGroups && timelineGroups.length > 0" class="timeline-container">
        <div class="timeline">
          <div *ngFor="let group of timelineGroups; let first = first; let last = last" class="timeline-group">
            <!-- Month/Year Label -->
            <div class="timeline-group-label">
              <div class="timeline-date">{{ group.displayText }}</div>
              <div class="timeline-count">{{ group.bitacoras.length }} {{ group.bitacoras.length === 1 ? 'actividad' : 'actividades' }}</div>
            </div>

            <!-- Timeline entries - with fixed links -->
            <div class="timeline-entries">
              <div *ngFor="let bitacora of group.bitacoras; let i = index" class="timeline-entry"
                   [class.first-entry]="i === 0" [class.last-entry]="i === group.bitacoras.length - 1">
                <div class="timeline-marker" [attr.data-category]="bitacora.categoria"></div>

                <div class="timeline-content">
                  <!-- Other content -->

                  <h3 class="timeline-title">
                    <!-- Only create a link if ID is valid -->
                    <a *ngIf="isValidId(bitacora.id)" [routerLink]="['/bitacoras', bitacora.id]">
                      {{ bitacora.titulo }}
                    </a>
                    <!-- Show plain text if ID is invalid -->
                    <span *ngIf="!isValidId(bitacora.id)">{{ bitacora.titulo }}</span>
                  </h3>

                  <!-- Other content -->

                  <div class="timeline-actions">
                    <!-- Only show view button if ID is valid -->
                    <a *ngIf="isValidId(bitacora.id)" [routerLink]="['/bitacoras', bitacora.id]" class="btn-view">
                      <!-- View button content -->
                      Ver
                    </a>
                    <!-- Only show edit button if ID is valid -->
                    <a *ngIf="isValidId(bitacora.id)" [routerLink]="['/bitacoras/edit', bitacora.id]" class="btn-edit">
                      <!-- Edit button content -->
                      Editar
                    </a>
                    <!-- Display disabled buttons if ID is invalid -->
                    <span *ngIf="!isValidId(bitacora.id)" class="btn-view disabled">Ver</span>
                    <span *ngIf="!isValidId(bitacora.id)" class="btn-edit disabled">Editar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .container {
      padding: 20px;
      max-width: 900px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .page-header h2 {
      color: #00b359;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background-color: #f5f5f5;
      color: #333;
      border-radius: 4px;
      text-decoration: none;
      transition: background-color 0.3s ease;
    }

    .btn-back:hover {
      background-color: #e0e0e0;
    }

    .btn-create {
      display: inline-flex;
      align-items: center;
      background-color: #00b359;
      color: white;
      text-decoration: none;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 500;
      gap: 8px;
      transition: background-color 0.3s ease;
    }

    .btn-create:hover {
      background-color: #00994d;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 0;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(0, 179, 89, 0.2);
      border-radius: 50%;
      border-top-color: #00b359;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 48px 0;
      color: #666;
    }

    .empty-state svg {
      color: #aaa;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin-bottom: 12px;
      color: #333;
    }

    .btn-create-empty {
      display: inline-block;
      background-color: #00b359;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 4px;
      font-weight: 500;
      margin-top: 16px;
      transition: background-color 0.3s ease;
    }

    .btn-create-empty:hover {
      background-color: #00994d;
    }

    .error-message {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      padding: 16px;
      margin-bottom: 24px;
      color: #721c24;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-retry {
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 12px;
      cursor: pointer;
      margin-left: auto;
    }

    .filter-container {
      display: flex;
      gap: 20px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .categoria-select, .year-select {
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background-color: white;
      font-size: 0.9rem;
    }

    /* Timeline styles */
    .timeline-container {
      position: relative;
    }

    .timeline {
      position: relative;
      padding-top: 16px;
    }

    .timeline::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 16px;
      width: 2px;
      background-color: #e0e0e0;
    }

    .timeline-group {
      margin-bottom: 32px;
    }

    .timeline-group-label {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      position: relative;
      z-index: 2;
    }

    .timeline-date {
      font-size: 1.2rem;
      font-weight: 600;
      color: #333;
      background-color: #f5f5f5;
      padding: 8px 12px;
      border-radius: 4px;
      margin-left: 24px;
    }

    .timeline-count {
      font-size: 0.9rem;
      color: #666;
      margin-left: 12px;
    }

    .timeline-entries {
      position: relative;
    }

    .timeline-entry {
      position: relative;
      padding-left: 36px;
      margin-bottom: 24px;
    }

    .timeline-entry:last-child {
      margin-bottom: 0;
    }

    .timeline-marker {
      position: absolute;
      top: 4px;
      left: 8px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: #999;
      z-index: 2;
    }

    .timeline-marker[data-category="plantacion"] {
      background-color: #2e7d32;
    }

    .timeline-marker[data-category="reciclaje"] {
      background-color: #1976d2;
    }

    .timeline-marker[data-category="conservacion"] {
      background-color: #00838f;
    }

    .timeline-marker[data-category="educacion"] {
      background-color: #ff8f00;
    }

    .timeline-marker[data-category="ahorro"] {
      background-color: #7b1fa2;
    }

    .timeline-marker[data-category="consumo"] {
      background-color: #e65100;
    }

    .timeline-marker[data-category="limpieza"] {
      background-color: #3949ab;
    }

    .timeline-marker[data-category="otro"] {
      background-color: #616161;
    }

    .timeline-content {
      background-color: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .timeline-category {
      display: inline-block;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .timeline-category[data-category="plantacion"] {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .timeline-category[data-category="reciclaje"] {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .timeline-category[data-category="conservacion"] {
      background-color: #e0f7fa;
      color: #00838f;
    }

    .timeline-category[data-category="educacion"] {
      background-color: #fff8e1;
      color: #ff8f00;
    }

    .timeline-category[data-category="ahorro"] {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .timeline-category[data-category="consumo"] {
      background-color: #fff3e0;
      color: #e65100;
    }

    .timeline-category[data-category="limpieza"] {
      background-color: #e8eaf6;
      color: #3949ab;
    }

    .timeline-category[data-category="otro"] {
      background-color: #f5f5f5;
      color: #616161;
    }

    .timeline-date-small {
      font-size: 0.9rem;
      color: #666;
    }

    .timeline-title {
      font-size: 1.2rem;
      margin: 0 0 8px 0;
    }

    .timeline-title a {
      color: #333;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .timeline-title a:hover {
      color: #00b359;
    }

    .timeline-description {
      font-size: 0.95rem;
      color: #555;
      margin: 0 0 16px 0;
      line-height: 1.5;
    }

    .timeline-image {
      margin-bottom: 16px;
      border-radius: 6px;
      overflow: hidden;
    }

    .timeline-image img {
      width: 100%;
      max-height: 200px;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .timeline-image img:hover {
      transform: scale(1.02);
    }

    .timeline-actions {
      display: flex;
      gap: 8px;
    }

    .btn-view, .btn-edit {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 0.9rem;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-view {
      background-color: #e3f2fd;
      color: #1976d2;
      border: 1px solid #bbdefb;
    }

    .btn-edit {
      background-color: #fff8e1;
      color: #ff8f00;
      border: 1px solid #ffe082;
    }

    .btn-view:hover {
      background-color: #bbdefb;
    }

    .btn-edit:hover {
      background-color: #ffe082;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .header-actions {
        width: 100%;
        justify-content: space-between;
      }

      .filter-container {
        flex-direction: column;
        align-items: flex-start;
      }

      .filter-group {
        width: 100%;
      }

      .categoria-select, .year-select {
        flex-grow: 1;
      }

      .btn-view.disabled, .btn-edit.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
        background-color: #f0f0f0;
      }

    }
  `
})
export class BitacoraTimelineComponent implements OnInit {
  bitacoras: Bitacora[] = [];
  timelineGroups: TimelineGroup[] = [];
  loading = true;
  error: string | null = null;

  // Filters
  selectedCategoria = '';
  selectedYear: number = 0;

  // Category options
  categoriaEntries: [string, string][] = Object.entries(CATEGORIAS);

  // Available years for filtering
  availableYears: number[] = [];

  constructor(private bitacoraService: BitacoraService) { }

  ngOnInit(): void {
    this.loadBitacoras();
  }

  /**
   * Load bitácoras from the service
   */
  loadBitacoras(): void {
    this.loading = true;
    this.error = null;

    console.log('BitacoraTimelineComponent: Solicitando bitácoras, categoría:', this.selectedCategoria);

    this.bitacoraService.getAllBitacoras(true, this.selectedCategoria)
      .pipe(
        catchError(error => {
          this.error = error.message || 'Error al cargar las bitácoras';
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(bitacoras => {

        console.log('BitacoraTimelineComponent: Bitácoras recibidas:', bitacoras);
        console.log('BitacoraTimelineComponent: Detalles de la primera bitácora (si existe):',
          bitacoras.length > 0 ? {
            id: bitacoras[0].id,
            titulo: bitacoras[0].titulo,
            fecha: bitacoras[0].fecha,
            categoria: bitacoras[0].categoria,
            tipo_id: typeof bitacoras[0].id
          } : 'No hay bitácoras');

        // Asegurarse de que todos los objetos bitácora tengan un ID válido antes de procesarlos
        this.bitacoras = bitacoras.filter(b => this.hasValidId(b));

        // Log para depuración
        console.log('Bitácoras cargadas:', this.bitacoras.length);
        console.log('Ejemplos de IDs:', this.bitacoras.slice(0, 3).map(b => b.id));

        this.extractYears();
        this.groupBitacorasByMonthYear();
      });
  }

  /**
   * Extract available years from bitácoras for filtering
   */
  extractYears(): void {
    const yearsSet = new Set<number>();

    this.bitacoras.forEach(bitacora => {
      const year = new Date(bitacora.fecha).getFullYear();
      yearsSet.add(year);
    });

    this.availableYears = Array.from(yearsSet).sort((a, b) => b - a); // Sort descending
  }

  /**
   * Group bitácoras by month and year for timeline display
   */
  groupBitacorasByMonthYear(): void {
    console.log('BitacoraTimelineComponent: Iniciando agrupación por mes/año, total bitácoras:',
      this.bitacoras.length);

    const groups: Record<string, TimelineGroup> = {};

    // Filter by year if selected
    const filteredBitacoras = this.selectedYear > 0
      ? this.bitacoras.filter(b => new Date(b.fecha).getFullYear() === this.selectedYear)
      : this.bitacoras;

    console.log('BitacoraTimelineComponent: Bitácoras después de filtro por año:',
      filteredBitacoras.length, 'Año seleccionado:', this.selectedYear);

    filteredBitacoras.forEach(bitacora => {
      // Asegúrate de que la bitácora tiene un ID válido
      if (!this.hasValidId(bitacora)) {
        console.warn('Skipping bitácora without valid ID:', bitacora);
        return;
      }

      const date = new Date(bitacora.fecha);
      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${month}`;

      if (!groups[key]) {
        groups[key] = {
          monthYear: key,
          year,
          month,
          displayText: this.getMonthYearDisplay(month, year),
          bitacoras: []
        };
      }

      groups[key].bitacoras.push(bitacora);
    });

    console.log('BitacoraTimelineComponent: Total de grupos creados:',
      Object.keys(groups).length);

    // Sort groups by date (newest first)
    this.timelineGroups = Object.values(groups)
      .sort((a, b) => {
        if (a.year !== b.year) {
          return b.year - a.year; // Descending by year
        }
        return b.month - a.month; // Descending by month
      });

    // Sort bitácoras within each group by date (newest first)
    this.timelineGroups.forEach(group => {
      group.bitacoras.sort((a, b) =>
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
    });

    // Después de crear this.timelineGroups
    console.log('BitacoraTimelineComponent: Grupos ordenados:',
      this.timelineGroups.map(g => `${g.displayText}: ${g.bitacoras.length} bitácoras`));

    // Log para depuración
    console.log('Grupos de timeline generados:', this.timelineGroups.length);
    if (this.timelineGroups.length > 0) {
      console.log('Ejemplo del primer grupo:',
        this.timelineGroups[0].displayText,
        this.timelineGroups[0].bitacoras.length);
    }
  }

  /**
   * Format month and year for display
   */
  getMonthYearDisplay(month: number, year: number): string {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return `${monthNames[month]} ${year}`;
  }

  /**
   * Handle category filter change
   */
  onCategoriaFilterChange(): void {
    this.loadBitacoras();
  }

  /**
   * Handle year filter change
   */
  onYearFilterChange(): void {
    this.groupBitacorasByMonthYear();
  }

  /**
   * Get image URL for a bitácora
   */
  getImageUrl(imagePath: string): string {
    return this.bitacoraService.getImageUrl(imagePath);
  }

  /**
   * Get category display name
   */
  getCategoriaName(categoryCode: string): string {
    return CATEGORIAS[categoryCode] || categoryCode;
  }

  /**
   * Truncate text to a specific length
   */
  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + '...';
  }

  /**
   * Check if a bitácora has a valid ID
   * @param bitacora Bitácora to check
   * @returns true if the bitácora has a valid ID
   */
  hasValidId(bitacora: Bitacora): boolean {
    return bitacora?.id !== undefined &&
      bitacora?.id !== null &&
      !isNaN(Number(bitacora.id)) &&
      Number(bitacora.id) > 0;
  }

  /**
   * Get router link for viewing a bitácora
   * Ensures invalid IDs don't cause errors
   */
  getBitacoraLink(bitacora: Bitacora): any[] {
    // Validar explícitamente que el ID sea un número válido
    const id = bitacora?.id;

    if (id !== undefined && id !== null && !isNaN(Number(id)) && Number(id) > 0) {
      // Convertir explícitamente a string
      return ['/bitacoras', String(id)];
    } else {
      console.warn('Intentando crear enlace para bitácora con ID inválido:', id, typeof id, bitacora);
      // Redireccionar a la lista de bitácoras
      return ['/bitacoras'];
    }
  }

  /**
   * Get router link for editing a bitácora
   * Ensures invalid IDs don't cause errors
   */
  getEditLink(bitacora: Bitacora): any[] {
    // Validar explícitamente que el ID sea un número válido
    const id = bitacora?.id;

    if (id !== undefined && id !== null && !isNaN(Number(id)) && Number(id) > 0) {
      // Convertir explícitamente a string
      return ['/bitacoras/edit', String(id)];
    } else {
      console.warn('Intentando crear enlace de edición para bitácora con ID inválido:', id, typeof id, bitacora);
      // Redireccionar a la lista de bitácoras
      return ['/bitacoras'];
    }
  }

  /**
   * Comprueba si un ID es válido
   * @param id ID a validar
   * @returns true si es un ID válido
   */
  isValidId(id: any): boolean {
    return id !== undefined && id !== null && !isNaN(Number(id)) && Number(id) > 0;
  }

}
