import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
  FormControl
} from '@angular/forms';
import { BitacoraService } from '../../../services/bitacora.service';
import { NavbarComponent } from '../../navbar/navbar.component';
import { ImageUploadComponent } from '../../shared/image-upload/image-upload.component';
import { Bitacora, CAMPOS_ADICIONALES_POR_CATEGORIA, CATEGORIAS, CampoAdicional } from '../../../models/bitacora.model';
import { finalize } from 'rxjs';

/**
 * Validador personalizado para números enteros positivos
 * Verifica que el valor sea un número, entero y mayor que cero
 */
function positiveIntegerValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // Si el campo está vacío, lo marcamos como inválido
    if (control.value === null || control.value === undefined || control.value === '') {
      return { required: true };
    }

    const value = Number(control.value);

    // Verificar si es un número
    if (isNaN(value)) {
      return { notNumber: true };
    }

    // Verificar si es un entero
    if (!Number.isInteger(value)) {
      return { notInteger: true };
    }

    // Verificar si es positivo (mayor que cero)
    if (value <= 0) {
      return { notPositive: true };
    }

    return null;
  };
}

/**
 * Validador personalizado para números decimales positivos
 * Verifica que el valor sea un número y mayor que cero, permitiendo decimales
 */
function positiveDecimalValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // Si el campo está vacío, lo marcamos como inválido
    if (control.value === null || control.value === undefined || control.value === '') {
      return { required: true };
    }

    const value = Number(control.value);

    // Verificar si es un número
    if (isNaN(value)) {
      return { notNumber: true };
    }

    // Verificar si es positivo (mayor que cero)
    if (value <= 0) {
      return { notPositive: true };
    }

    return null;
  };
}

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
  templateUrl: './bitacora-form.component.html',
  styleUrls: ['./bitacora-form.component.css']
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

  // Categorías que permiten números decimales positivos
  categoriasConDecimales: string[] = [
    'reciclaje',
    'limpieza_ambiental',
    'limpieza-ambiental',
    'limpieza',
    'limpieza ambiental'
  ];

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
          this.updateAdditionalFields(bitacora.categoria, bitacora.camposAdicionales);
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
    // Depuración: verificar el identificador exacto de la categoría
    console.log('Categoría seleccionada:', categoria);
    console.log('¿Permite decimales?', this.categoriasConDecimales.includes(categoria));

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
   * Applies correct validators for numeric fields based on category
   */
  updateAdditionalFields(categoria: string, existingValues?: Record<string, any>): void {
    // Get fields configuration for selected category
    this.selectedCamposAdicionales = CAMPOS_ADICIONALES_POR_CATEGORIA[categoria] || [];

    // Log para depuración
    console.log('Actualizando campos para categoría:', categoria);
    console.log('¿Permite decimales?', this.categoriasConDecimales.includes(categoria));

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
        const validators: ValidatorFn[] = [];

        // Para campos de tipo número, aplicamos el validador apropiado según la categoría
        if (campo.tipo === 'numero') {
          // Log para depuración
          console.log('Campo numérico encontrado:', campo.nombre);

          // Determinar si esta categoría permite decimales
          if (this.categoriasConDecimales.includes(categoria)) {
            // Para categorías que permiten decimales (reciclaje y limpieza ambiental)
            console.log('Aplicando validador de decimales para:', campo.nombre);
            validators.push(positiveDecimalValidator());
          } else {
            // Para categorías que requieren enteros (plantación, educación ambiental, etc.)
            console.log('Aplicando validador de enteros para:', campo.nombre);
            validators.push(positiveIntegerValidator());
          }
        } else if (campo.requerido) {
          // Para los campos no numéricos, usamos el validador estándar required si es necesario
          validators.push(Validators.required);
        }

        camposGroup.addControl(campo.nombre, new FormControl(value, validators));
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
