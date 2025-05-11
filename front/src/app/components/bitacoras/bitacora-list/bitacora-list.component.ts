import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BitacoraService } from '../../../services/bitacora.service';
import { NavbarComponent } from '../../navbar/navbar.component';
import { Bitacora, CATEGORIAS } from '../../../models/bitacora.model';
import { catchError, filter, finalize, of, Subscription } from 'rxjs';

/**
 * Component for displaying a list of all user's bitácoras
 * Provides filtering, and access to create, edit, and delete operations
 */
@Component({
  selector: 'app-bitacora-list',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container">
      <div class="bitacoras-header">
        <h2>Mis Bitácoras Ambientales</h2>
        <div class="actions">
          <div class="filter-container">
            <label for="categoria-filter">Filtrar por:</label>
            <select
              id="categoria-filter"
              [(ngModel)]="selectedCategoria"
              (change)="onCategoriaFilterChange()"
              class="categoria-select">
              <option value="">Todas las categorías</option>
              <option *ngFor="let cat of categoriaEntries" [value]="cat[0]">{{ cat[1] }}</option>
            </select>
          </div>
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
      <div *ngIf="!loading && bitacoras.length === 0" class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
        <h3>No hay bitácoras disponibles</h3>
        <p *ngIf="selectedCategoria">No hay bitácoras en la categoría seleccionada.</p>
        <p *ngIf="!selectedCategoria">Comienza registrando tus actividades ambientales.</p>
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

      <!-- Bitácoras grid -->
      <div *ngIf="!loading && bitacoras.length > 0" class="bitacoras-grid">
        <div *ngFor="let bitacora of bitacoras" class="bitacora-card">
          <div class="bitacora-image">
            <img *ngIf="bitacora.imagenUrl" [src]="getImageUrl(bitacora.imagenUrl)" [alt]="bitacora.titulo">
            <div *ngIf="!bitacora.imagenUrl" class="no-image">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
          </div>
          <div class="bitacora-content">
            <div class="bitacora-category" [attr.data-category]="bitacora.categoria">
              {{ getCategoriaName(bitacora.categoria) }}
            </div>
            <h3 class="bitacora-title">{{ bitacora.titulo }}</h3>
            <p class="bitacora-date">{{ bitacora.fecha | date:'dd/MM/yyyy' }}</p>
            <p *ngIf="bitacora.descripcion" class="bitacora-description">
              {{ truncateText(bitacora.descripcion, 100) }}
            </p>
            <div class="bitacora-actions">
              <a [routerLink]="['/bitacoras', bitacora.id]" class="btn-view">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Ver
              </a>
              <a [routerLink]="['/bitacoras/edit', bitacora.id]" class="btn-edit">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                </svg>
                Editar
              </a>
              <button (click)="confirmDelete(bitacora)" class="btn-delete">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>



      <!-- Delete confirmation modal -->
      <div *ngIf="showDeleteModal" class="modal-overlay">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h3>Confirmar eliminación</h3>
              <button (click)="cancelDelete()" class="btn-close">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <p>¿Estás seguro de que deseas eliminar la bitácora <strong>"{{ bitacoraToDelete?.titulo }}"</strong>?</p>
              <p class="warning-text">Esta acción no se puede deshacer.</p>
            </div>
            <div class="modal-footer">
              <button (click)="cancelDelete()" class="btn-cancel">Cancelar</button>
              <button (click)="deleteBitacora()" class="btn-confirm-delete" [disabled]="deleting">
                <span *ngIf="!deleting">Eliminar</span>
                <span *ngIf="deleting">Eliminando...</span>
              </button>
            </div>
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

    .bitacoras-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .bitacoras-header h2 {
      color: #00b359;
      margin: 0;
    }

    .actions {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filter-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .categoria-select {
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background-color: white;
      font-size: 0.9rem;
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

    .bitacoras-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .bitacora-card {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      background-color: white;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .bitacora-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .bitacora-image {
      height: 180px;
      background-color: #f8f9fa;
      position: relative;
      overflow: hidden;
    }

    .bitacora-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .bitacora-card:hover .bitacora-image img {
      transform: scale(1.05);
    }

    .no-image {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      background-color: #f0f0f0;
      color: #aaa;
    }

    .bitacora-content {
      padding: 16px;
    }

    .bitacora-category {
      display: inline-block;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 4px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .bitacora-category[data-category="plantacion"] {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .bitacora-category[data-category="reciclaje"] {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .bitacora-category[data-category="conservacion"] {
      background-color: #e0f7fa;
      color: #00838f;
    }

    .bitacora-category[data-category="educacion"] {
      background-color: #fff8e1;
      color: #ff8f00;
    }

    .bitacora-category[data-category="ahorro"] {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .bitacora-category[data-category="consumo"] {
      background-color: #fff3e0;
      color: #e65100;
    }

    .bitacora-category[data-category="limpieza"] {
      background-color: #e8eaf6;
      color: #3949ab;
    }

    .bitacora-category[data-category="otro"] {
      background-color: #f5f5f5;
      color: #616161;
    }

    .bitacora-title {
      font-size: 1.2rem;
      margin: 0 0 4px 0;
      color: #333;
    }

    .bitacora-date {
      font-size: 0.9rem;
      color: #666;
      margin: 0 0 8px 0;
    }

    .bitacora-description {
      font-size: 0.95rem;
      color: #555;
      margin: 0 0 16px 0;
      line-height: 1.5;
    }

    .bitacora-actions {
      display: flex;
      gap: 8px;
    }

    .btn-view, .btn-edit, .btn-delete {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
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

    .btn-delete {
      background-color: #ffebee;
      color: #c62828;
      border: 1px solid #ffcdd2;
    }

    .btn-view:hover {
      background-color: #bbdefb;
    }

    .btn-edit:hover {
      background-color: #ffe082;
    }

    .btn-delete:hover {
      background-color: #ffcdd2;
    }

    .timeline-link-container {
      text-align: center;
      margin: 32px 0;
    }

    .timeline-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background-color: #f5f5f5;
      color: #333;
      text-decoration: none;
      padding: 10px 16px;
      border-radius: 4px;
      font-weight: 500;
      transition: background-color 0.3s ease;
    }

    .timeline-link:hover {
      background-color: #e0e0e0;
    }

    /* Modal styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-dialog {
      width: 100%;
      max-width: 500px;
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #eee;
    }

    .modal-header h3 {
      margin: 0;
      color: #333;
    }

    .btn-close {
      background: none;
      border: none;
      cursor: pointer;
      color: #666;
    }

    .modal-body {
      padding: 16px;
    }

    .warning-text {
      color: #dc3545;
      font-weight: 500;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px;
      border-top: 1px solid #eee;
    }

    .btn-cancel, .btn-confirm-delete {
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
    }

    .btn-cancel {
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      color: #212529;
    }

    .btn-confirm-delete {
      background-color: #dc3545;
      border: 1px solid #dc3545;
      color: white;
    }

    .btn-cancel:hover {
      background-color: #e2e6ea;
    }

    .btn-confirm-delete:hover {
      background-color: #c82333;
    }

    .btn-confirm-delete:disabled {
      background-color: #e4606d;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .bitacoras-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .actions {
        width: 100%;
        justify-content: space-between;
      }

      .bitacoras-grid {
        grid-template-columns: 1fr;
      }
    }
  `
})
export class BitacoraListComponent implements OnInit {
  bitacoras: Bitacora[] = [];
  loading = true;
  error: string | null = null;
  selectedCategoria = '';
  categoriaEntries: [string, string][] = Object.entries(CATEGORIAS);

  // Delete confirmation
  showDeleteModal = false;
  bitacoraToDelete: Bitacora | null = null;
  deleting = false;

  // Subscriptions to manage
  private bitacorasSubscription: Subscription | null = null;
  private routerSubscription: Subscription | null = null;

  constructor(
    private bitacoraService: BitacoraService,
    private router: Router
  ) {}

// En BitacoraListComponent:

ngOnInit(): void {
  // Suscríbete al observable de bitácoras del servicio
  this.bitacorasSubscription = this.bitacoraService.bitacoras$
    .subscribe(bitacoras => {
      console.log(`Received ${bitacoras.length} bitácoras from service`);
      this.bitacoras = bitacoras;
    });

  // Carga inicial de datos
  this.loadBitacoras();
}

// Si el componente no se está refrescando, asegúrate de que el servicio emita correctamente
// Modifica loadBitacoras para forzar refresco:
  /**
   * Load bitácoras from the service
   * Handles loading state and error handling
   */
  loadBitacoras(): void {
    this.loading = true;
    this.error = null;

    console.log("Filtrando por categoría:", this.selectedCategoria); // Debug

    this.bitacoraService.getAllBitacoras(true, this.selectedCategoria)
      .pipe(
        catchError(error => {
          this.error = error.message || 'Error al cargar las bitácoras';
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(bitacoras => {
        console.log("Bitácoras recibidas:", bitacoras.length); // Debug
        console.log("Categorías recibidas:", bitacoras.map(b => b.categoria).join(', ')); // Debug
        this.bitacoras = bitacoras;
      });
  }

  /**
   * Handle category filter change
   * Reloads bitácoras with the selected filter
   */
  onCategoriaFilterChange(): void {
    console.log("Categoría seleccionada:", this.selectedCategoria); // Debug
    this.loadBitacoras();
  }

  /**
   * Get image URL for a bitácora
   * @param imagePath Relative image path
   * @returns Absolute image URL
   */
  getImageUrl(imagePath: string): string {
    return this.bitacoraService.getImageUrl(imagePath);
  }

  /**
   * Get category display name
   * @param categoryCode Category code
   * @returns Display name
   */
  getCategoriaName(categoryCode: string): string {
    return CATEGORIAS[categoryCode] || categoryCode;
  }

  /**
   * Truncate text to a specific length
   * @param text Text to truncate
   * @param maxLength Maximum length
   * @returns Truncated text
   */
  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + '...';
  }

  /**
   * Show delete confirmation modal
   * @param bitacora Bitácora to delete
   */
  confirmDelete(bitacora: Bitacora): void {
    this.bitacoraToDelete = bitacora;
    this.showDeleteModal = true;
  }

  /**
   * Hide delete confirmation modal
   */
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.bitacoraToDelete = null;
  }

  /**
   * Delete the selected bitácora
   */
  deleteBitacora(): void {
    if (!this.bitacoraToDelete || this.deleting) {
      return;
    }

    this.deleting = true;

    this.bitacoraService.deleteBitacora(this.bitacoraToDelete.id!)
      .pipe(
        finalize(() => {
          this.deleting = false;
          this.showDeleteModal = false;
          this.bitacoraToDelete = null;
        })
      )
      .subscribe({
        next: () => {
          // Success is handled by the service through BehaviorSubject
        },
        error: (error) => {
          this.error = error.message || 'Error al eliminar la bitácora';
        }
      });
  }
}
