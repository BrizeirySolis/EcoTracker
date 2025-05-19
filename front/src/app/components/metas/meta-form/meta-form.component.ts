// front/src/app/components/metas/meta-form/meta-form.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../../navbar/navbar.component';
import { MetaService } from '../../../services/meta.service';
import {
  Meta,
  TIPOS_META,
  UNIDADES_META,
  METRICAS_POR_TIPO,
  TipoEvaluacion
} from '../../../models/meta.model';
import { finalize } from 'rxjs';

interface UnidadOption {
  value: string;
  label: string;
}

interface Recommendation {
  descripcion: string;
  valor: number;
  unidad: string;
}

@Component({
  selector: 'app-meta-form',
  templateUrl: './meta-form.component.html',
  styleUrls: ['./meta-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NavbarComponent
  ]
})
export class MetaFormComponent implements OnInit {
  metaForm!: FormGroup;
  loading = false;
  submitting = false;
  error: string | null = null;
  isSubmitted = false;
  isEditMode = false;
  metaId?: number;

  // Opciones para selects
  tipoEntries: [string, string][] = Object.entries(TIPOS_META);
  metricasDisponibles: { metrica: string; descripcion: string; unidad: string }[] = [];
  unidadesDisponibles: UnidadOption[] = [];

  // Recomendaciones basadas en histórico
  recommendations: Recommendation[] = [];

  constructor(
    private fb: FormBuilder,
    private metaService: MetaService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.metaId = +this.route.snapshot.paramMap.get('id')!;
    this.isEditMode = !isNaN(this.metaId) && this.metaId > 0;

    if (this.isEditMode) {
      this.loadMeta();
    } else {
      this.initForm();
    }
  }

  /**
   * Obtener controles del formulario para acceso fácil en template
   */
  get f() {
    return this.metaForm?.controls;
  }

  /**
   * Cargar meta existente para edición
   */
  loadMeta(): void {
    this.loading = true;
    this.error = null;

    this.metaService.getMetaById(this.metaId!)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (meta) => {
          this.initForm(meta);

          // Actualizar métricas disponibles según el tipo
          this.updateMetricasDisponibles(meta.tipo);

          // Actualizar unidades disponibles según la métrica
          this.updateUnidadesDisponibles(meta.tipo);
        },
        error: (error) => {
          this.error = error.message || 'Error al cargar la meta';
        }
      });
  }

  /**
   * Inicializar formulario con valores por defecto o existentes
   */
  initForm(meta?: Meta): void {
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);

    const formattedToday = this.formatDate(today);
    const formattedThreeMonthsLater = this.formatDate(threeMonthsLater);

    this.metaForm = this.fb.group({
      titulo: [meta?.titulo || '', [Validators.required, Validators.maxLength(100)]],
      descripcion: [meta?.descripcion || ''],
      tipo: [meta?.tipo || '', Validators.required],
      metrica: ['', Validators.required],
      valorObjetivo: [meta?.valorObjetivo || 0, [Validators.required, Validators.min(0)]],
      unidad: [meta?.unidad || '', Validators.required],
      fechaInicio: [meta?.fechaInicio ? this.formatDate(new Date(meta.fechaInicio)) : formattedToday, Validators.required],
      fechaFin: [meta?.fechaFin ? this.formatDate(new Date(meta.fechaFin)) : formattedThreeMonthsLater, Validators.required],
      tipoEvaluacion: [meta?.tipo ? this.determinarTipoEvaluacion(meta.tipo) : 'automatica', Validators.required]
    });

    // Si es edición y ya tenemos tipo, actualizar métricas
    if (meta?.tipo) {
      this.updateMetricasDisponibles(meta.tipo);

      // Intentar determinar la métrica basada en la unidad
      const metricaEncontrada = this.determinarMetrica(meta.tipo, meta.unidad);

      if (metricaEncontrada) {
        this.metaForm.patchValue({ metrica: metricaEncontrada.metrica });
      }
    }

    // Suscribirse a cambios en el tipo para actualizar métricas y unidades
    this.f['tipo'].valueChanges.subscribe(tipo => {
      if (tipo) {
        this.updateMetricasDisponibles(tipo);
        this.loadRecommendations(tipo);

        // Resetear metrica y unidad
        this.metaForm.patchValue({
          metrica: '',
          unidad: ''
        });
      }
    });

    // Suscribirse a cambios en la métrica para actualizar unidades
    this.f['metrica'].valueChanges.subscribe(metrica => {
      if (metrica) {
        this.updateUnidadFromMetrica(metrica);
      }
    });
  }

  /**
   * Actualizar métricas disponibles según el tipo seleccionado
   */
  updateMetricasDisponibles(tipo: string): void {
    this.metricasDisponibles = METRICAS_POR_TIPO[tipo] || [];
  }

  /**
   * Actualizar unidades disponibles según el tipo
   */
  updateUnidadesDisponibles(tipo: string): void {
    // Creamos un conjunto de unidades únicas para este tipo
    const unidadesUnicas = new Set<string>();

    // Añadimos todas las unidades de las métricas de este tipo
    if (METRICAS_POR_TIPO[tipo]) {
      METRICAS_POR_TIPO[tipo].forEach(metrica => {
        unidadesUnicas.add(metrica.unidad);
      });
    }

    // Convertimos a array de opciones para el select
    this.unidadesDisponibles = Array.from(unidadesUnicas).map(unidad => ({
      value: unidad,
      label: UNIDADES_META[unidad] || unidad
    }));
  }

  /**
   * Actualizar la unidad basada en la métrica seleccionada
   */
  updateUnidadFromMetrica(metricaId: string): void {
    const tipo = this.f['tipo'].value;

    // Buscar la métrica seleccionada
    const metricaSeleccionada = METRICAS_POR_TIPO[tipo]?.find(m => m.metrica === metricaId);

    if (metricaSeleccionada) {
      // Actualizar la unidad automáticamente
      this.metaForm.patchValue({ unidad: metricaSeleccionada.unidad });
    }
  }

  /**
   * Manejar cambio en el tipo de meta
   */
  onTipoChange(): void {
    const tipo = this.f['tipo'].value;
    if (tipo) {
      this.updateMetricasDisponibles(tipo);
      this.loadRecommendations(tipo);
    }
  }

  /**
   * Manejar cambio en la métrica
   */
  onMetricaChange(): void {
    const metrica = this.f['metrica'].value;
    if (metrica) {
      this.updateUnidadFromMetrica(metrica);
    }
  }

  /**
   * Cargar recomendaciones basadas en el histórico
   */
  loadRecommendations(tipo: string): void {
    this.metaService.getMetaRecommendations(tipo)
      .subscribe({
        next: (data) => {
          this.recommendations = data.recommendations || [];
        },
        error: () => {
          // En caso de error, podemos proporcionar algunas recomendaciones predeterminadas
          this.setDefaultRecommendations(tipo);
        }
      });
  }

  /**
   * Establecer recomendaciones predeterminadas por tipo
   */
  setDefaultRecommendations(tipo: string): void {
    switch (tipo) {
      case 'agua':
        this.recommendations = [
          { descripcion: 'Reducir consumo un 10%', valor: 10, unidad: 'porcentaje' },
          { descripcion: 'Reducir consumo un 15%', valor: 15, unidad: 'porcentaje' },
          { descripcion: 'Reducir a 12 m³ bimestrales', valor: 12, unidad: 'm3' }
        ];
        break;
      case 'electricidad':
        this.recommendations = [
          { descripcion: 'Reducir consumo un 10%', valor: 10, unidad: 'porcentaje' },
          { descripcion: 'Reducir consumo un 15%', valor: 15, unidad: 'porcentaje' },
          { descripcion: 'Reducir a 180 kWh mensuales', valor: 180, unidad: 'kwh' }
        ];
        break;
      case 'transporte':
        this.recommendations = [
          { descripcion: 'Aumentar transporte sostenible a 40%', valor: 40, unidad: 'porcentaje' },
          { descripcion: 'Reducir emisiones CO2 un 20%', valor: 20, unidad: 'porcentaje' },
          { descripcion: 'Usar bicicleta al menos 60 km mensuales', valor: 60, unidad: 'km' }
        ];
        break;
      case 'combinada':
        this.recommendations = [
          { descripcion: 'Reducir huella de carbono en 15%', valor: 15, unidad: 'porcentaje' },
          { descripcion: 'Ahorrar $500 en servicios', valor: 500, unidad: 'costo' }
        ];
        break;
      default:
        this.recommendations = [];
    }
  }

  /**
   * Aplicar una recomendación al formulario
   */
  applyRecommendation(recommendation: Recommendation): void {
    // Buscar la métrica que corresponde a esta recomendación
    const tipo = this.f['tipo'].value;
    const metricaEncontrada = METRICAS_POR_TIPO[tipo]?.find(m => m.unidad === recommendation.unidad);

    if (metricaEncontrada) {
      this.metaForm.patchValue({
        valorObjetivo: recommendation.valor,
        unidad: recommendation.unidad,
        metrica: metricaEncontrada.metrica
      });
    } else {
      // Si no encontramos una métrica exacta, solo actualizamos valor y unidad
      this.metaForm.patchValue({
        valorObjetivo: recommendation.valor,
        unidad: recommendation.unidad
      });
    }
  }

  /**
   * Enviar formulario
   */
  onSubmit(): void {
    this.isSubmitted = true;

    if (this.metaForm.invalid) {
      // Scroll al primer elemento inválido
      const invalidControls = document.querySelectorAll('.is-invalid');
      if (invalidControls.length > 0) {
        (invalidControls[0] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    this.submitting = true;
    this.error = null;

    // Preparar datos del formulario
    const formData = this.metaForm.value;

    // Convertir fechas a objetos Date
    const fechaInicio = new Date(formData.fechaInicio);
    const fechaFin = new Date(formData.fechaFin);

    // Crear objeto de meta
    const metaData = {
      titulo: formData.titulo,
      descripcion: formData.descripcion,
      tipo: formData.tipo,
      valorObjetivo: formData.valorObjetivo,
      unidad: formData.unidad,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin
    };

    // Crear o actualizar según el modo
    const request = this.isEditMode
      ? this.metaService.updateMeta(this.metaId!, metaData)
      : this.metaService.createMeta(metaData);

    request
      .pipe(
        finalize(() => this.submitting = false)
      )
      .subscribe({
        next: () => {
          // Redirigir a la lista en caso de éxito
          this.router.navigate(['/metas']);
        },
        error: (error) => {
          this.error = error.message || `Error al ${this.isEditMode ? 'actualizar' : 'crear'} la meta`;
          // Scroll al mensaje de error
          setTimeout(() => {
            const errorEl = document.querySelector('.error-message');
            if (errorEl) {
              errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }
      });
  }

  /**
   * Determinar la métrica basada en el tipo y unidad
   */
  private determinarMetrica(tipo: string, unidad: string): { metrica: string; descripcion: string; unidad: string } | undefined {
    return METRICAS_POR_TIPO[tipo]?.find(m => m.unidad === unidad);
  }

  /**
   * Determinar el tipo de evaluación basado en el tipo de meta
   */
  private determinarTipoEvaluacion(tipo: string): TipoEvaluacion {
    // Por defecto todas las metas son automáticas, excepto las de "otro"
    return tipo === 'otro' ? 'manual' : 'automatica';
  }

  /**
   * Formatear fecha para campos de fecha
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Obtener abreviatura de la unidad para mostrar
   */
  getUnidadAbreviada(unidad: string): string {
    switch (unidad) {
      case 'm3':
        return 'm³';
      case 'kwh':
        return 'kWh';
      case 'km':
        return 'km';
      case 'porcentaje':
        return '%';
      case 'co2':
        return 'kg CO₂';
      case 'costo':
        return 'MXN';
      case 'unidad':
        return 'uds';
      default:
        return unidad;
    }
  }
}
