import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {BitacoraService} from '../../../services/bitacora.service';
import {NavbarComponent} from '../../navbar/navbar.component';
import {Bitacora, CAMPOS_ADICIONALES_POR_CATEGORIA, CATEGORIAS} from '../../../models/bitacora.model';
import {finalize} from 'rxjs';

/**
 * Component for displaying detailed view of a single bitácora
 * Shows all information and provides edit/delete actions
 */
@Component({
  selector: 'app-bitacora-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container">
      <!-- Page header with navigation -->
      <div class="page-header">
        <div class="header-navigation">
          <a [routerLink]="['/bitacoras']" class="btn-back">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Volver a la lista
          </a>
        </div>

        <div class="header-actions" *ngIf="bitacora">
          <a [routerLink]="['/bitacoras/edit', bitacora.id]" class="btn-edit">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
            Editar
          </a>
          <button (click)="confirmDelete()" class="btn-delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Eliminar
          </button>
        </div>
      </div>

      <!-- Loading state -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Cargando bitácora...</p>
      </div>

      <!-- Error message -->
      <div *ngIf="error" class="error-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>{{ error }}</p>
        <button (click)="loadBitacora()" class="btn-retry">Reintentar</button>
      </div>

      <!-- Bitácora detail content -->
      <div *ngIf="!loading && bitacora" class="bitacora-detail">
        <div class="bitacora-category" [attr.data-category]="bitacora.categoria">
          {{ getCategoriaName(bitacora.categoria) }}
        </div>

        <h1 class="bitacora-title">{{ bitacora.titulo }}</h1>

        <div class="bitacora-date">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>{{ bitacora.fecha | date:'longDate' }}</span>
        </div>

        <div class="bitacora-content">
          <div class="bitacora-image-container" *ngIf="bitacora.imagenUrl">
            <img [src]="getImageUrl(bitacora.imagenUrl)" [alt]="bitacora.titulo" class="bitacora-image">
          </div>

          <div class="bitacora-text">
            <p *ngIf="bitacora.descripcion" class="bitacora-description">{{ bitacora.descripcion }}</p>

            <!-- Additional fields -->
            <div *ngIf="hasAdditionalFields" class="additional-fields">
              <h3>Información adicional</h3>

              <div class="additional-fields-grid">
                <div *ngFor="let field of additionalFieldsEntries" class="additional-field">
                  <div class="field-label">{{ getAdditionalFieldLabel(field[0]) }}</div>
                  <div class="field-value">{{ field[1] }}</div>
                </div>
              </div>
            </div>

            <!-- Creation info -->
            <div class="creation-info">
              <p>Creado el {{ bitacora.createdAt | date:'medium' }}</p>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <p>¿Estás seguro de que deseas eliminar la bitácora <strong>"{{ bitacora?.titulo }}"</strong>?</p>
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
      max-width: 1000px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header-navigation, .header-actions {
      display: flex;
      gap: 12px;
    }

    .btn-back, .btn-edit, .btn-delete {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 500;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .btn-back {
      background-color: #f5f5f5;
      color: #333;
      text-decoration: none;
    }

    .btn-edit {
      background-color: #fff8e1;
      color: #ff8f00;
      border: 1px solid #ffe082;
      text-decoration: none;
    }

    .btn-delete {
      background-color: #ffebee;
      color: #c62828;
      border: 1px solid #ffcdd2;
    }

    .btn-back:hover {
      background-color: #e0e0e0;
    }

    .btn-edit:hover {
      background-color: #ffe082;
    }

    .btn-delete:hover {
      background-color: #ffcdd2;
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
      to {
        transform: rotate(360deg);
      }
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

    .bitacora-detail {
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .bitacora-category {
      display: inline-block;
      font-size: 0.9rem;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 4px;
      margin: 20px 20px 0;
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
      font-size: 2rem;
      margin: 12px 20px 16px;
      color: #333;
    }

    .bitacora-date {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      margin: 0 20px 20px;
    }

    .bitacora-content {
      padding: 0 0 24px;
    }

    .bitacora-image-container {
      margin-bottom: 24px;
      overflow: hidden;
      max-height: 500px;
    }

    .bitacora-image {
      width: 100%;
      object-fit: cover;
    }

    .bitacora-text {
      padding: 0 20px;
    }

    .bitacora-description {
      font-size: 1.1rem;
      line-height: 1.6;
      color: #333;
      margin-bottom: 24px;
      white-space: pre-line;
    }

    .additional-fields {
      background-color: #f9f9f9;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 24px;
    }

    .additional-fields h3 {
      font-size: 1.2rem;
      margin-bottom: 16px;
      color: #333;
    }

    .additional-fields-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .additional-field {
      margin-bottom: 8px;
    }

    .field-label {
      font-weight: 600;
      color: #555;
      margin-bottom: 4px;
    }

    .field-value {
      color: #333;
    }

    .creation-info {
      color: #777;
      font-size: 0.9rem;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #eee;
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
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
    }
  `
})
export class BitacoraDetailComponent implements OnInit {
  bitacora: Bitacora | null = null;
  loading = true;
  error: string | null = null;
  bitacoraId: number = 0;

  // Delete confirmation
  showDeleteModal = false;
  deleting = false;

  constructor(
    private bitacoraService: BitacoraService,
    private route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.bitacoraId = +this.route.snapshot.paramMap.get('id')!;

    if (isNaN(this.bitacoraId) || this.bitacoraId <= 0) {
      this.error = 'ID de bitácora inválido';
      this.loading = false;
      return;
    }

    this.loadBitacora();
  }

  /**
   * Load bitácora details from service
   */
  loadBitacora(): void {
    this.loading = true;
    this.error = null;

    this.bitacoraService.getBitacoraById(this.bitacoraId)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (bitacora) => {
          this.bitacora = bitacora;
        },
        error: (error) => {
          this.error = error.message || 'Error al cargar la bitácora';
        }
      });
  }

  /**
   * Get image URL from service
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
   * Check if bitácora has additional fields
   */
  get hasAdditionalFields(): boolean {
    return !!this.bitacora?.camposAdicionales &&
      Object.keys(this.bitacora.camposAdicionales ?? {}).length > 0;
  }

  /**
   * Get additional fields as entries for iteration
   */
  get additionalFieldsEntries(): [string, any][] {
    if (!this.bitacora?.camposAdicionales) {
      return [];
    }

    return Object.entries(this.bitacora.camposAdicionales);
  }

  /**
   * Get human-readable label for additional field
   */
  getAdditionalFieldLabel(fieldName: string): string {
    if (!this.bitacora?.categoria) {
      return fieldName;
    }

    const fields = CAMPOS_ADICIONALES_POR_CATEGORIA[this.bitacora.categoria] || [];
    const field = fields.find(f => f.nombre === fieldName);

    return field?.etiqueta || fieldName;
  }

  /**
   * Show delete confirmation modal
   */
  confirmDelete(): void {
    this.showDeleteModal = true;
  }

  /**
   * Hide delete confirmation modal
   */
  cancelDelete(): void {
    this.showDeleteModal = false;
  }

  /**
   * Delete the bitácora
   */
  deleteBitacora(): void {
    if (!this.bitacora || this.deleting) {
      return;
    }
  
    this.deleting = true;
    const bitacoraId = this.bitacora.id!;
  
    this.bitacoraService.deleteBitacora(bitacoraId)
      .subscribe({
        next: (success) => {
          this.deleting = false;
          this.showDeleteModal = false;
          
          if (success) {
            // Forcefully navigate to the list page with skipLocationChange to avoid browser history issues
            // This ensures a clean navigation without adding to browser history
            this.router.navigateByUrl('/bitacoras', { skipLocationChange: true }).then(() => {
              // Then navigate again normally to ensure the URL is correct
              this.router.navigate(['/bitacoras']);
            });
          } else {
            this.error = 'La operación de eliminación no pudo completarse correctamente';
          }
        },
        error: (error) => {
          this.deleting = false;
          this.showDeleteModal = false;
          this.error = error.message || 'Error al eliminar la bitácora';
          
          // Log detailed error for debugging
          console.error('Error al eliminar bitácora:', error);
          
          // If it's an authorization error, suggest logging in again
          if (error.message && error.message.includes('autorización')) {
            this.error += ' Por favor, inicie sesión nuevamente.';
            
            // Optional: Could auto-redirect to login page
            // this.router.navigate(['/login']);
          }
        }
      });
  }
}
