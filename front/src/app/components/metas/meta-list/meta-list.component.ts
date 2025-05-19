// front/src/app/components/metas/meta-list/meta-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../navbar/navbar.component';
import { MetaService } from '../../../services/meta.service';
import { Meta, TIPOS_META, UNIDADES_META, calcularPorcentajeMeta } from '../../../models/meta.model';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-meta-list',
  templateUrl: './meta-list.component.html',
  styleUrls: ['./meta-list.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent]
})
export class MetaListComponent implements OnInit {
  metas: Meta[] = [];
  loading = true;
  error: string | null = null;
  selectedTipo = '';
  tipoEntries: [string, string][] = Object.entries(TIPOS_META);

  // Delete confirmation
  showDeleteModal = false;
  metaToDelete: Meta | null = null;
  deleting = false;

  constructor(private metaService: MetaService) { }

  ngOnInit(): void {
    this.loadMetas();
  }

  /**
   * Cargar metas del servicio
   */
  loadMetas(): void {
    this.loading = true;
    this.error = null;

    this.metaService.getAllMetas(true, this.selectedTipo)
      .pipe(
        catchError(error => {
          this.error = error.message || 'Error al cargar las metas';
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(metas => {
        this.metas = metas;
      });
  }

  /**
   * Manejar cambio en el filtro de tipo
   */
  onTipoFilterChange(): void {
    this.loadMetas();
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
          // El éxito se maneja a través del BehaviorSubject en el servicio
        },
        error: (error) => {
          this.error = error.message || 'Error al eliminar la meta';
        }
      });
  }
}
