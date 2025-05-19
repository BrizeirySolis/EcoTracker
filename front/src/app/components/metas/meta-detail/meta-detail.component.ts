// front/src/app/components/metas/meta-detail/meta-detail.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar.component';
import { MetaService } from '../../../services/meta.service';
import {
  Meta,
  TIPOS_META,
  UNIDADES_META,
  calcularPorcentajeMeta,
  obtenerEstadoMeta
} from '../../../models/meta.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-meta-detail',
  templateUrl: './meta-detail.component.html',
  styleUrls: ['./meta-detail.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent
  ]
})
export class MetaDetailComponent implements OnInit {
  meta: Meta | null = null;
  loading = true;
  error: string | null = null;

  // Para actualización de progreso
  newValorActual = 0;
  updating = false;
  isManualEvaluation = false;

  // Para confirmación de eliminación
  showDeleteModal = false;
  deleting = false;

  constructor(
    private metaService: MetaService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadMeta();
  }

  /**
   * Cargar la meta desde el servicio
   */
  loadMeta(): void {
    this.loading = true;
    this.error = null;

    const id = +this.route.snapshot.paramMap.get('id')!;

    if (isNaN(id) || id <= 0) {
      this.error = 'ID de meta inválido';
      this.loading = false;
      return;
    }

    this.metaService.getMetaById(id)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (meta) => {
          this.meta = meta;
          this.newValorActual = meta.valorActual;
          this.isManualEvaluation = this.determinarTipoEvaluacion(meta.tipo) === 'manual';
        },
        error: (error) => {
          this.error = error.message || 'Error al cargar la meta';
        }
      });
  }

  /**
   * Obtener el nombre descriptivo del tipo de meta
   */
  getTipoName(tipo: string): string {
    return TIPOS_META[tipo] || tipo;
  }

  /**
   * Calcular porcentaje de progreso de la meta
   */
  calcularPorcentaje(meta: Meta): number {
    return calcularPorcentajeMeta(meta);
  }

  /**
   * Obtener clase CSS según el estado de la meta
   */
  getEstadoClass(meta: Meta): string {
    const estado = this.getEstadoMeta(meta);
    return `status-${estado}`;
  }

  /**
   * Obtener estado de la meta para visualización
   */
  getEstadoMeta(meta: Meta): string {
    return obtenerEstadoMeta(meta);
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

  /**
   * Determinar si la meta es de evaluación manual o automática
   */
  private determinarTipoEvaluacion(tipo: string): 'manual' | 'automatica' {
    // Por defecto todas las metas son automáticas, excepto las de "otro"
    return tipo === 'otro' ? 'manual' : 'automatica';
  }

  /**
   * Actualizar el progreso de la meta
   */
  updateProgress(): void {
    if (!this.meta || this.updating) {
      return;
    }

    // Validar que el valor sea un número válido
    if (isNaN(+this.newValorActual) || +this.newValorActual < 0) {
      this.error = 'Por favor, introduce un valor válido para el progreso';
      return;
    }

    this.updating = true;
    this.error = null;

    this.metaService.updateMetaProgress(this.meta.id!, +this.newValorActual)
      .pipe(
        finalize(() => this.updating = false)
      )
      .subscribe({
        next: (updatedMeta) => {
          this.meta = updatedMeta;
          this.error = null;
        },
        error: (error) => {
          this.error = error.message || 'Error al actualizar el progreso';
        }
      });
  }

  /**
   * Mostrar modal de confirmación de eliminación
   */
  confirmDelete(): void {
    this.showDeleteModal = true;
  }

  /**
   * Ocultar modal de confirmación
   */
  cancelDelete(): void {
    this.showDeleteModal = false;
  }

  /**
   * Eliminar la meta actual
   */
  deleteMeta(): void {
    if (!this.meta || this.deleting) {
      return;
    }

    this.deleting = true;
    this.error = null;

    this.metaService.deleteMeta(this.meta.id!)
      .pipe(
        finalize(() => {
          this.deleting = false;
          this.showDeleteModal = false;
        })
      )
      .subscribe({
        next: () => {
          // Navegar a la lista de metas tras la eliminación exitosa
          this.router.navigate(['/metas']);
        },
        error: (error) => {
          this.error = error.message || 'Error al eliminar la meta';
        }
      });
  }

  forceRefresh(): void {
    this.loading = true;

    this.metaService.refreshMetaProgress(this.meta!.id!)
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (meta) => {
          this.meta = meta;
          this.newValorActual = meta.valorActual;
        },
        error: (error) => {
          this.error = error.message || 'Error al actualizar la meta';
        }
      });
  }
}
