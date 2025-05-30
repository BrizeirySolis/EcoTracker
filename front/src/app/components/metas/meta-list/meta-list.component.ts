// front/src/app/components/metas/meta-list/meta-list.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../navbar/navbar.component';
import { MetaService } from '../../../services/meta.service';
import { Meta, TIPOS_META, UNIDADES_META, calcularPorcentajeMeta } from '../../../models/meta.model';
import {catchError, finalize, of, Subscription} from 'rxjs';

@Component({
  selector: 'app-meta-list',
  templateUrl: './meta-list.component.html',
  styleUrls: ['./meta-list.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent]
})
export class MetaListComponent implements OnInit, OnDestroy {
  metas: Meta[] = [];
  loading = true;
  error: string | null = null;
  selectedTipo = '';
  tipoEntries: [string, string][] = Object.entries(TIPOS_META);

  // Delete confirmation
  showDeleteModal = false;
  metaToDelete: Meta | null = null;
  deleting = false;

  // Suscripciones
  private metasSubscription: Subscription | null = null;
  private consumptionSubscription: Subscription | null = null;

  constructor(private metaService: MetaService) { }

  ngOnInit(): void {
    // Suscribirse al observable de metas para actualizaciones automáticas
    this.metasSubscription = this.metaService.metas$
      .subscribe(metas => {
        this.metas = metas;
        this.loading = false;
      });

    // Cargar las metas inicialmente
    this.loadAndUpdateMetas();
  }

  ngOnDestroy(): void {
    if (this.metasSubscription) {
      this.metasSubscription.unsubscribe();
    }
    if (this.consumptionSubscription) {
      this.consumptionSubscription.unsubscribe();
    }
  }

  /**
   * Carga las metas y luego actualiza automáticamente su progreso
   */
  loadAndUpdateMetas(): void {
    this.loading = true;
    this.error = null;

    // Cargar metas (esto actualiza automáticamente el observable)
    this.metaService.getAllMetas(true, this.selectedTipo)
      .subscribe({
        next: (metas) => {
          // Las metas se actualizan automáticamente vía el observable
          // Ahora actualizar el progreso de todas las metas
          this.updateAllMetasProgress();
        },
        error: (error) => {
          this.error = error.message || 'Error al cargar las metas';
          this.loading = false;
        }
      });
  }

  /**
   * Actualiza el progreso de todas las metas cargadas
   */
  updateAllMetasProgress(): void {
    // Filtrar solo las metas automáticas en progreso
    const metasToUpdate = this.metas.filter(meta =>
      meta.tipoEvaluacion === 'automatica' && meta.estado === 'en_progreso'
    );

    if (metasToUpdate.length === 0) {
      this.loading = false;
      return;
    }

    this.metaService.refreshMultipleMetas(metasToUpdate)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (updatedMetas) => {
          console.log('Metas actualizadas automáticamente:', updatedMetas);
          // Las metas se actualizan automáticamente vía el observable
        },
        error: (error) => {
          console.error('Error al actualizar metas:', error);
          // El loading se desactiva en el finalize
        }
      });
  }

  /**
   * Cargar metas con actualización automática
   */
  loadMetasWithRefresh(): void {
    this.loading = true;
    this.error = null;

    // Primero actualizar todas las metas automáticas
    this.metaService.refreshAllMetas(this.selectedTipo)
      .subscribe({
        next: () => {
          // Después de actualizar, cargar las metas
          this.loadMetas();
        },
        error: (error) => {
          console.error('Error al actualizar las metas:', error);
          // Si hay un error, intentar cargar las metas de todos modos
          this.loadMetas();
        }
      });
  }

  /**
   * Cargar metas del servicio
   */
  loadMetas(): void {
    this.loading = true;
    this.error = null;

    // Cargar metas (esto actualiza automáticamente el observable)
    this.metaService.getAllMetas(true, this.selectedTipo)
      .subscribe({
        next: (metas) => {
          // Las metas se actualizan automáticamente vía el observable
        },
        error: (error) => {
          this.error = error.message || 'Error al cargar las metas';
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  /**
   * Manejar cambio en el filtro de tipo
   */
  onTipoFilterChange(): void {
    // Usar la nueva función para actualizar y cargar
    this.loadMetasWithRefresh();
  }

  /**
   * Obtener nombre descriptivo del tipo de meta
   */
  getTipoName(tipo: string): string {
    return TIPOS_META[tipo] || tipo;
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
   * Calcular porcentaje de progreso para una meta
   */
  calcularPorcentaje(meta: Meta): number {
    return calcularPorcentajeMeta(meta);
  }

  /**
   * Truncar texto a una longitud específica
   */
  truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + '...';
  }

  /**
   * Mostrar modal de confirmación de eliminación
   */
  confirmDelete(meta: Meta): void {
    this.metaToDelete = meta;
    this.showDeleteModal = true;
  }

  /**
   * Ocultar modal de confirmación
   */
  cancelDelete(): void {
    this.showDeleteModal = false;
    this.metaToDelete = null;
  }

  /**
   * Eliminar la meta seleccionada
   */
  deleteMeta(): void {
    if (!this.metaToDelete || this.deleting) {
      return;
    }

    this.deleting = true;

    this.metaService.deleteMeta(this.metaToDelete.id!)
      .pipe(
        finalize(() => {
          this.deleting = false;
          this.showDeleteModal = false;
          this.metaToDelete = null;
        })
      )
      .subscribe({
        next: () => {
          // La eliminación se refleja automáticamente vía el observable
          console.log('Meta eliminada exitosamente');
        },
        error: (error) => {
          this.error = error.message || 'Error al eliminar la meta';
        }
      });
  }
}
