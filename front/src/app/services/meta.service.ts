// front/src/app/services/meta.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Meta, MetaCreateRequest } from '../models/meta.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  private readonly API_URL = `${environment.apiUrl}/metas`;

  // Observable source para los datos de metas
  private metasSubject = new BehaviorSubject<Meta[]>([]);

  // Store filtered results for each tipo
  private filteredMetasCache: Record<string, Meta[]> = {};

  // Exposed observable for components to subscribe to
  public metas$ = this.metasSubject.asObservable();

  // Track if data has been loaded to avoid redundant requests
  private dataLoaded = false;

  constructor(private http: HttpClient) { }

  /**
   * Obtener todas las metas, opcionalmente filtradas por tipo
   * Cachea resultados para evitar llamadas API redundantes
   * @param forceRefresh Forzar una actualización de datos desde API
   * @param tipo Filtro opcional por tipo
   * @returns Observable de array de metas
   */
  getAllMetas(forceRefresh = false, tipo?: string): Observable<Meta[]> {
    // Si hay un tipo seleccionado
    if (tipo && tipo !== '') {
      // Si tenemos cache para este tipo y no se solicita refresco, devolverlo
      if (!forceRefresh && this.filteredMetasCache[tipo]) {
        return new Observable<Meta[]>(observer => {
          observer.next(this.filteredMetasCache[tipo]);
          observer.complete();
        });
      }

      // En caso contrario, hacer la petición al servidor
      let params = new HttpParams().set('tipo', tipo);

      return this.http.get<Meta[]>(this.API_URL, { params }).pipe(
        map(metas => this.processMetasDateFields(metas)),
        tap(metas => {
          // Guardar en el cache de este tipo
          this.filteredMetasCache[tipo] = metas;
        }),
        catchError(error => {
          console.error('Error fetching filtered metas:', error);
          return throwError(() => new Error('Error al cargar las metas. Por favor, inténtalo de nuevo.'));
        })
      );
    }

    // Si no hay tipo, devolvemos todas las metas
    else {
      // Return cached data if available and no refresh requested
      if (this.dataLoaded && !forceRefresh) {
        return this.metas$;
      }

      // En caso contrario, hacemos la petición al servidor
      return this.http.get<Meta[]>(this.API_URL).pipe(
        map(metas => this.processMetasDateFields(metas)),
        tap(metas => {
          this.metasSubject.next(metas);
          this.dataLoaded = true;
        }),
        catchError(error => {
          console.error('Error fetching all metas:', error);
          return throwError(() => new Error('Error al cargar las metas. Por favor, inténtalo de nuevo.'));
        })
      );
    }
  }

  /**
   * Obtener una meta específica por ID
   * @param id ID de la meta
   * @returns Observable de la meta
   */
  getMetaById(id: number): Observable<Meta> {
    // Validar ID antes de hacer la solicitud
    if (id === undefined || isNaN(id) || id <= 0) {
      console.error('ID de meta inválido:', id);
      return throwError(() => new Error('ID de meta inválido. Por favor, intente nuevamente con un ID válido.'));
    }

    return this.http.get<Meta>(`${this.API_URL}/${id}`).pipe(
      map(meta => this.processMetaDateFields(meta)),
      catchError(error => {
        console.error(`Error fetching meta ID ${id}:`, error);
        return throwError(() => new Error('Error al cargar la meta solicitada. Por favor, inténtalo de nuevo.'));
      })
    );
  }

  /**
   * Crear una nueva meta
   * @param meta Datos de la meta
   * @returns Observable de la meta creada
   */
  createMeta(meta: MetaCreateRequest): Observable<Meta> {
    return this.http.post<Meta>(this.API_URL, meta).pipe(
      map(meta => this.processMetaDateFields(meta)),
      tap(newMeta => {
        // Update the local cache
        const currentMetas = this.metasSubject.value;
        this.metasSubject.next([newMeta, ...currentMetas]);

        // Invalidate filtered caches
        this.filteredMetasCache = {};
      }),
      catchError(error => {
        console.error('Error creating meta:', error);
        return throwError(() => new Error('Error al crear la meta. Por favor, inténtalo de nuevo.'));
      })
    );
  }

  /**
   * Actualizar una meta existente
   * @param id ID de la meta
   * @param meta Datos actualizados
   * @returns Observable de la meta actualizada
   */
  updateMeta(id: number, meta: MetaCreateRequest): Observable<Meta> {
    return this.http.put<Meta>(`${this.API_URL}/${id}`, meta).pipe(
      map(meta => this.processMetaDateFields(meta)),
      tap(updatedMeta => {
        // Update the local cache
        const currentMetas = this.metasSubject.value;
        const index = currentMetas.findIndex(m => m.id === updatedMeta.id);

        if (index !== -1) {
          const updatedMetas = [...currentMetas];
          updatedMetas[index] = updatedMeta;
          this.metasSubject.next(updatedMetas);
        }

        // Invalidate filtered caches
        this.filteredMetasCache = {};
      }),
      catchError(error => {
        console.error(`Error updating meta ID ${id}:`, error);
        return throwError(() => new Error('Error al actualizar la meta. Por favor, inténtalo de nuevo.'));
      })
    );
  }

  /**
   * Actualizar el progreso de una meta
   * @param id ID de la meta
   * @param valorActual Nuevo valor actual
   * @returns Observable de la meta actualizada
   */
  updateMetaProgress(id: number, valorActual: number): Observable<Meta> {
    return this.http.patch<Meta>(`${this.API_URL}/${id}/progreso`, { valorActual }).pipe(
      map(meta => this.processMetaDateFields(meta)),
      tap(updatedMeta => {
        // Update the local cache
        const currentMetas = this.metasSubject.value;
        const index = currentMetas.findIndex(m => m.id === updatedMeta.id);

        if (index !== -1) {
          const updatedMetas = [...currentMetas];
          updatedMetas[index] = updatedMeta;
          this.metasSubject.next(updatedMetas);
        }

        // Invalidate filtered caches
        this.filteredMetasCache = {};
      }),
      catchError(error => {
        console.error(`Error updating meta progress ${id}:`, error);
        return throwError(() => new Error('Error al actualizar el progreso. Por favor, inténtalo de nuevo.'));
      })
    );
  }

  /**
   * Eliminar una meta
   * @param id ID de la meta
   * @returns Observable del resultado de la operación
   */
  deleteMeta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        // Update the local cache
        const currentMetas = this.metasSubject.value;
        const updatedMetas = currentMetas.filter(m => m.id !== id);
        this.metasSubject.next(updatedMetas);

        // Invalidate filtered caches
        this.filteredMetasCache = {};
      }),
      catchError(error => {
        console.error(`Error deleting meta ID ${id}:`, error);
        return throwError(() => new Error('Error al eliminar la meta. Por favor, inténtalo de nuevo.'));
      })
    );
  }

  /**
   * Procesar campos de fecha en una meta para convertir strings a objetos Date
   * @param meta Meta con fechas string
   * @returns Meta con objetos Date
   */
  private processMetaDateFields(meta: any): Meta {
    return {
      ...meta,
      fechaInicio: meta.fechaInicio ? new Date(meta.fechaInicio) : new Date(),
      fechaFin: meta.fechaFin ? new Date(meta.fechaFin) : new Date(),
      createdAt: meta.createdAt ? new Date(meta.createdAt) : undefined
    };
  }

  /**
   * Procesar campos de fecha en un array de metas
   * @param metas Array de metas con fechas string
   * @returns Array de metas con objetos Date
   */
  private processMetasDateFields(metas: any[]): Meta[] {
    return metas.map(m => this.processMetaDateFields(m));
  }

  /**
   * Resetear la caché de datos (útil tras operaciones importantes)
   */
  resetCache(): void {
    this.dataLoaded = false;
    this.filteredMetasCache = {};
  }

  /**
   * Obtener recomendaciones para metas basadas en el historial
   * @param tipo Tipo de meta para la recomendación
   * @returns Observable con recomendaciones para el valor objetivo
   */
  getMetaRecommendations(tipo: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/recomendaciones/${tipo}`).pipe(
      catchError(error => {
        console.error(`Error fetching recommendations for ${tipo}:`, error);
        return throwError(() => new Error('Error al obtener recomendaciones. Utilizando valores predeterminados.'));
      })
    );
  }
}
