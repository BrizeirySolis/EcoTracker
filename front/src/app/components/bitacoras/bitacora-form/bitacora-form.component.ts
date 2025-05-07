import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BitacoraService } from '../../../services/bitacora.service';
import { NavbarComponent } from '../../navbar/navbar.component';
import { ImageUploadComponent } from '../../shared/image-upload/image-upload.component';
import { Bitacora, CAMPOS_ADICIONALES_POR_CATEGORIA, CATEGORIAS, CampoAdicional } from '../../../models/bitacora.model';
import { finalize } from 'rxjs';

/**
 * Component for creating and editing bitácoras
 * Handles form submission with dynamic fields based on category
 */
@Component({
  selector: 'app-bitacora-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NavbarComponent,
    ImageUploadComponent
  ],
  template: `
    <app-navbar></app-navbar>

    <div class="container">
      <!-- Page header -->
      <div class="page-header">
        <h2>{{ isEditMode ? 'Editar' : 'Crear' }} Bitácora</h2>
        <a [routerLink]="['/bitacoras']" class="btn-back">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Volver
        </a>
      </div>

      <!-- Loading state -->
      <div *ngIf="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>{{ isEditMode ? 'Cargando bitácora...' : 'Preparando formulario...' }}</p>
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
        <button *ngIf="isEditMode" (click)="loadBitacora()" class="btn-retry">Reintentar</button>
      </div>

      <!-- Form -->
      <form *ngIf="!loading && bitacoraForm" [formGroup]="bitacoraForm" (ngSubmit)="onSubmit()" class="bitacora-form">
        <div class="form-grid">
          <!-- Left column - Main fields -->
          <div class="form-column">
            <div class="form-group">
              <label for="titulo" class="form-label">Título <span class="required">*</span></label>
              <input
                type="text"
                id="titulo"
                formControlName="titulo"
                class="form-control"
                [class.is-invalid]="isSubmitted && f['titulo'].errors">
              <div *ngIf="isSubmitted && f['titulo'].errors" class="invalid-feedback">
                <div *ngIf="f['titulo'].errors['required']">El título es obligatorio</div>
                <div *ngIf="f['titulo'].errors['maxlength']">El título no puede exceder los 100 caracteres</div>
              </div>
            </div>

            <div class="form-group">
              <label for="descripcion" class="form-label">Descripción</label>
              <textarea
                id="descripcion"
                formControlName="descripcion"
                class="form-control"
                rows="4"></textarea>
            </div>

            <div class="form-group">
              <label for="fecha" class="form-label">Fecha <span class="required">*</span></label>
              <input
                type="date"
                id="fecha"
                formControlName="fecha"
                class="form-control"
                [class.is-invalid]="isSubmitted && f['fecha'].errors">
              <div *ngIf="isSubmitted && f['fecha'].errors" class="invalid-feedback">
                <div *ngIf="f['fecha'].errors['required']">La fecha es obligatoria</div>
              </div>
            </div>

            <div class="form-group">
              <label for="categoria" class="form-label">Categoría <span class="required">*</span></label>
              <select
                id="categoria"
                formControlName="categoria"
                class="form-control"
                [class.is-invalid]="isSubmitted && f['categoria'].errors"
                (change)="onCategoriaChange()">
                <option value="">Seleccionar categoría</option>
                <option *ngFor="let cat of categoriaEntries" [value]="cat[0]">{{ cat[1] }}</option>
              </select>
              <div *ngIf="isSubmitted && f['categoria'].errors" class="invalid-feedback">
                <div *ngIf="f['categoria'].errors['required']">La categoría es obligatoria</div>
              </div>
            </div>
          </div>

          <!-- Right column - Image upload & additional fields -->
          <div class="form-column">
            <div class="form-group">
              <label class="form-label">Imagen</label>
              <app-image-upload
                [existingImageUrl]="existingImageUrl ?? undefined"
                (imageSelected)="onImageSelected($event)"
                (imageRemoved)="onImageRemoved()">
              </app-image-upload>
            </div>

            <!-- Dynamic additional fields based on category -->
            <div *ngIf="selectedCamposAdicionales.length > 0" class="additional-fields">
              <h3>Información adicional</h3>

              <div *ngFor="let campo of selectedCamposAdicionales" class="form-group"
                   [formGroupName]="'camposAdicionales'">
                <label [for]="campo.nombre" class="form-label">
                  {{ campo.etiqueta }}
                  <span *ngIf="campo.requerido" class="required">*</span>
                </label>

                <!-- Text input -->
                <input
                  *ngIf="campo.tipo === 'texto'"
                  [type]="'text'"
                  [id]="campo.nombre"
                  [formControlName]="campo.nombre"
                  class="form-control"
                  [placeholder]="campo.placeholder || ''"
                  [class.is-invalid]="isSubmitted && camposAdicionales[campo.nombre].errors">

                <!-- Number input -->
                <input
                  *ngIf="campo.tipo === 'numero'"
                  type="number"
                  [id]="campo.nombre"
                  [formControlName]="campo.nombre"
                  class="form-control"
                  [class.is-invalid]="isSubmitted && camposAdicionales[campo.nombre].errors">

                <!-- Date input -->
                <input
                  *ngIf="campo.tipo === 'fecha'"
                  type="date"
                  [id]="campo.nombre"
                  [formControlName]="campo.nombre"
                  class="form-control"
                  [class.is-invalid]="isSubmitted && camposAdicionales[campo.nombre].errors">

                <!-- Select dropdown -->
                <select
                  *ngIf="campo.tipo === 'seleccion'"
                  [id]="campo.nombre"
                  [formControlName]="campo.nombre"
                  class="form-control"
                  [class.is-invalid]="isSubmitted && camposAdicionales[campo.nombre].errors">
                  <option value="">Seleccionar</option>
                  <option *ngFor="let opcion of campo.opciones" [value]="opcion">{{ opcion }}</option>
                </select>

                <!-- Validation errors -->
                <div *ngIf="isSubmitted && camposAdicionales && camposAdicionales[campo.nombre]?.errors?.['required']">
                  Este campo es obligatorio
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form actions -->
        <div class="form-actions">
          <button type="button" class="btn-cancel" [routerLink]="['/bitacoras']">Cancelar</button>
          <button type="submit" class="btn-save" [disabled]="submitting">
            <svg *ngIf="!submitting" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span class="loading-spinner-small" *ngIf="submitting"></span>
            {{ submitting ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h2 {
      color: #00b359;
      margin: 0;
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

    .loading-spinner-small {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
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

    .bitacora-form {
      background-color: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }

    .required {
      color: #dc3545;
    }

    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-control:focus {
      border-color: #00b359;
      outline: none;
    }

    .form-control.is-invalid {
      border-color: #dc3545;
    }

    textarea.form-control {
      resize: vertical;
      min-height: 100px;
    }

    .invalid-feedback {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 4px;
    }

    .additional-fields {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }

    .additional-fields h3 {
      font-size: 1.2rem;
      margin-bottom: 16px;
      color: #333;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }

    .btn-cancel, .btn-save {
      padding: 10px 20px;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-cancel {
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      color: #212529;
      text-decoration: none;
    }

    .btn-save {
      background-color: #00b359;
      border: 1px solid #00b359;
      color: white;
    }

    .btn-cancel:hover {
      background-color: #e2e6ea;
    }

    .btn-save:hover {
      background-color: #009649;
    }

    .btn-save:disabled {
      background-color: #6acf9a;
      border-color: #6acf9a;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `
})
export class BitacoraFormComponent implements OnInit {
  bitacoraForm: FormGroup | null = null;
  loading = false;
  submitting = false;
  error: string | null = null;
  isSubmitted = false;
  isEditMode = false;
  bitacoraId?: number;

  selectedImage: File | null = null;
  existingImageUrl: string | null = null;
  selectedCamposAdicionales: CampoAdicional[] = [];

  // Category options
  categoriaEntries: [string, string][] = Object.entries(CATEGORIAS);

  constructor(
    private fb: FormBuilder,
    private bitacoraService: BitacoraService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.bitacoraId = +this.route.snapshot.paramMap.get('id')!;
    this.isEditMode = !isNaN(this.bitacoraId) && this.bitacoraId > 0;

    if (this.isEditMode) {
      this.loadBitacora();
    } else {
      this.initForm();
    }
  }

  /**
   * Get form controls for easier access in template
   */
  get f() {
    return this.bitacoraForm?.controls ?? {};
  }

  /**
   * Get camposAdicionales form group for validation
   */
get camposAdicionales() {
  const control = this.f['camposAdicionales'];
  return control instanceof FormGroup ? control.controls : {};
}

  /**
   * Load existing bitácora for editing
   */
  loadBitacora(): void {
    this.loading = true;
    this.error = null;

    this.bitacoraService.getBitacoraById(this.bitacoraId!)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (bitacora) => {
          this.initForm(bitacora);

          // Set existing image URL if present
          if (bitacora.imagenUrl) {
            this.existingImageUrl = this.bitacoraService.getImageUrl(bitacora.imagenUrl);
          }

          // Update additional fields based on category
          this.updateAdditionalFields(bitacora.categoria);
        },
        error: (error) => {
          this.error = error.message || 'Error al cargar la bitácora';
        }
      });
  }

  /**
   * Initialize form with defaults or existing values
   */
  initForm(bitacora?: Bitacora): void {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];

    this.bitacoraForm = this.fb.group({
      titulo: [bitacora?.titulo || '', [Validators.required, Validators.maxLength(100)]],
      descripcion: [bitacora?.descripcion || ''],
      fecha: [bitacora?.fecha ? new Date(bitacora.fecha).toISOString().split('T')[0] : formattedDate, Validators.required],
      categoria: [bitacora?.categoria || '', Validators.required],
      camposAdicionales: this.fb.group({})
    });

    // If editing, update additional fields
    if (bitacora?.categoria) {
      this.updateAdditionalFields(bitacora.categoria, bitacora.camposAdicionales);
    }
  }

  /**
   * Handle category change - update additional fields
   */
  onCategoriaChange(): void {
    const categoria = this.f['categoria']?.value;

    if (categoria) {
      this.updateAdditionalFields(categoria);
    } else {
      this.selectedCamposAdicionales = [];

      // Reset campos adicionales form group
      const camposGroup = this.bitacoraForm?.get('camposAdicionales') as FormGroup;

      if (camposGroup) {
        Object.keys(camposGroup.controls).forEach(key => {
          camposGroup.removeControl(key);
        });
      }
    }
  }

  /**
   * Update form with additional fields based on category
   */
  updateAdditionalFields(categoria: string, existingValues?: Record<string, any>): void {
    // Get fields configuration for selected category
    this.selectedCamposAdicionales = CAMPOS_ADICIONALES_POR_CATEGORIA[categoria] || [];

    // Reset campos adicionales form group
    const camposGroup = this.bitacoraForm?.get('camposAdicionales') as FormGroup;

    if (camposGroup) {
      // Remove existing controls
      Object.keys(camposGroup.controls).forEach(key => {
        camposGroup.removeControl(key);
      });

      // Add controls for the selected category
      this.selectedCamposAdicionales.forEach(campo => {
        const value = existingValues?.[campo.nombre] || '';
        const validators = campo.requerido ? [Validators.required] : [];

        camposGroup.addControl(campo.nombre, this.fb.control(value, validators));
      });
    }
  }

  /**
   * Handle image selection
   */
  onImageSelected(file: File): void {
    this.selectedImage = file;
  }

  /**
   * Handle image removal
   */
  onImageRemoved(): void {
    this.selectedImage = null;
    this.existingImageUrl = null;
  }

  /**
   * Form submission handler
   */
// Modifica el método onSubmit() en BitacoraFormComponent
  onSubmit(): void {
    this.isSubmitted = true;

    if (this.bitacoraForm?.invalid) {
      // Scroll to first invalid element
      const invalidControls = document.querySelectorAll('.is-invalid');
      if (invalidControls.length > 0) {
        (invalidControls[0] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    this.submitting = true;
    this.error = null;

    // Prepare data from form values
    const formData = this.bitacoraForm!.value;

    // Formatear la fecha correctamente para el backend, eliminando la parte de zona horaria
    const fechaFormateada = new Date(formData.fecha);
    const fechaString = fechaFormateada.toISOString().split('T')[0] + 'T00:00:00';

    const bitacora: Bitacora = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      fecha: new Date(formData.fecha), // Este es para uso local
      categoria: formData.categoria,
      camposAdicionales: formData.camposAdicionales
    };

    // Create or update based on mode
    const request = this.isEditMode
      ? this.bitacoraService.updateBitacora(this.bitacoraId!, bitacora, this.selectedImage || undefined, fechaString)
      : this.bitacoraService.createBitacora(bitacora, this.selectedImage || undefined, fechaString);

    request
      .pipe(
        finalize(() => this.submitting = false)
      )
      .subscribe({
        next: () => {
          // Navigate back to list on success
          this.router.navigate(['/bitacoras']);
        },
        error: (error) => {
          this.error = error.message || `Error al ${this.isEditMode ? 'actualizar' : 'crear'} la bitácora`;
          // Scroll to error message
          setTimeout(() => {
            const errorEl = document.querySelector('.error-message');
            if (errorEl) {
              errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }
      });
  }
}
