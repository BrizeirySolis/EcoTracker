import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Bitacora, Categoria, CATEGORIAS } from '../models/bitacora.model';

/**
 * Service for managing Bitácora operations
 * Handles all API interactions for environmental activity logs
 */
@Injectable({
  providedIn: 'root'
})
export class BitacoraService {
  private readonly API_URL = 'http://localhost:8080/api/bitacoras';

  // Observable source for bitácoras data
  private bitacorasSubject = new BehaviorSubject<Bitacora[]>([]);

  // Store filtered results for each category
  private filteredBitacorasCache: Record<string, Bitacora[]> = {};

  // Exposed observable for components to subscribe to
  public bitacoras$ = this.bitacorasSubject.asObservable();

  // Track if data has been loaded to avoid redundant requests
  private dataLoaded = false;

  constructor(private http: HttpClient) { }

  /**
   * Get all categorías available for bitácoras
   * @returns Observable of categoría map
   */
  getCategorias(): Observable<Record<string, string>> {
    return this.http.get<Record<string, string>>(`${this.API_URL}/categorias`).pipe(
      catchError(error => {
        console.error('Error fetching categorías:', error);
        // Retornar un observable con el tipo correcto
        return new Observable<Record<string, string>>(observer => {
          observer.next(CATEGORIAS);
          observer.complete();
        });
      })
    );
  }

  /**
   * Get all bitácoras, optionally filtered by categoría
   * Caches results to avoid redundant API calls
   * @param forceRefresh Force a refresh of data from API
   * @param categoria Optional category filter
   * @returns Observable of bitácoras array
   */
  getAllBitacoras(forceRefresh = false, categoria?: string): Observable<Bitacora[]> {
    console.log('⭐ getAllBitacoras - categoria:', categoria, 'forceRefresh:', forceRefresh); // Debug

    // Si hay una categoría seleccionada
    if (categoria && categoria !== '') {
      console.log('🔍 Filtrando por categoría:', categoria); // Debug

      // Comprobar si la categoría existe en el modelo
      const categoriaExisteEnModelo = Object.keys(CATEGORIAS).includes(categoria);
      console.log('Categoría existe en modelo:', categoriaExisteEnModelo, 'Categorías disponibles:', Object.keys(CATEGORIAS)); // Debug

      // Si tenemos cache para esta categoría y no se solicita refresco, devolverlo
      if (!forceRefresh && this.filteredBitacorasCache[categoria]) {
        console.log('✅ Usando caché para categoría:', categoria); // Debug
        return new Observable<Bitacora[]>(observer => {
          observer.next(this.filteredBitacorasCache[categoria]);
          observer.complete();
        });
      }

      // En caso contrario, hacer la petición al servidor
      let params = new HttpParams().set('categoria', categoria);

      console.log('🌐 Petición HTTP con parámetros:', params.toString()); // Debug

      return this.http.get<Bitacora[]>(this.API_URL, { params }).pipe(
        map(bitacoras => {
          console.log('📊 Datos recibidos del servidor:', bitacoras.length, 'bitácoras'); // Debug
          console.log('Categorías recibidas:', bitacoras.map(b => b.categoria).join(', ')); // Debug
          return this.processBitacorasDateFields(bitacoras);
        }),
        tap(bitacoras => {
          // Guardar en el cache de esta categoría
          this.filteredBitacorasCache[categoria] = bitacoras;
          console.log('💾 Guardado en caché para categoría:', categoria); // Debug
        }),
        catchError(error => {
          console.error('❌ Error fetching filtered bitácoras:', error);
          return throwError(() => new Error('Failed to load bitácoras. Please try again later.'));
        })
      );
    }

    // Si no hay categoría, devolvemos todas las bitácoras
    else {
      console.log('🔍 Obteniendo todas las bitácoras');

      // Return cached data if available and no refresh requested
      if (this.dataLoaded && !forceRefresh) {
        console.log('✅ Usando caché general de bitácoras'); // Debug
        return this.bitacoras$;
      }

      // En caso contrario, hacemos la petición al servidor
      console.log('🌐 Petición HTTP sin filtros'); // Debug

      return this.http.get<Bitacora[]>(this.API_URL).pipe(
        map(bitacoras => {
          console.log('📊 Datos recibidos del servidor:', bitacoras.length, 'bitácoras'); // Debug
          return this.processBitacorasDateFields(bitacoras);
        }),
        tap(bitacoras => {
          this.bitacorasSubject.next(bitacoras);
          this.dataLoaded = true;
          console.log('💾 Guardado en caché general'); // Debug
        }),
        catchError(error => {
          console.error('❌ Error fetching all bitácoras:', error);
          return throwError(() => new Error('Failed to load bitácoras. Please try again later.'));
        })
      );
    }
  }

  /**
   * Filtrar manualmente las bitácoras por categoría
   * @param bitacoras Lista de bitácoras a filtrar
   * @param categoria Categoría por la que filtrar
   * @returns Bitácoras filtradas
   */
  private filtrarBitacorasPorCategoria(bitacoras: Bitacora[], categoria: string): Bitacora[] {
    if (!categoria || categoria === '') {
      return bitacoras;
    }

    // Filtrar exactamente por el código de categoría
    return bitacoras.filter(b => b.categoria === categoria);
  }

  /**
   * Get a specific bitácora by ID
   * @param id Bitácora ID
   * @returns Observable of single bitácora
   */
  getBitacoraById(id: number): Observable<Bitacora> {
    // Validar ID antes de hacer la solicitud
    if (id === undefined || isNaN(id) || id <= 0) {
      console.error('ID de bitácora inválido:', id);
      return throwError(() => new Error('ID de bitácora inválido. Por favor, intente nuevamente con un ID válido.'));
    }

    return this.http.get<Bitacora>(`${this.API_URL}/${id}`).pipe(
      map(bitacora => this.processBitacoraDateFields(bitacora)),
      catchError(error => {
        console.error(`Error fetching bitácora ID ${id}:`, error);
        return throwError(() => new Error('Failed to load the requested bitácora. Please try again later.'));
      })
    );
  }

  /**
   * Create a new bitácora with image upload support
   * @param bitacora Bitácora data
   * @param image Optional image file
   * @returns Observable of created bitácora
   */
  createBitacora(bitacora: Bitacora, image?: File, fechaFormateada?: string): Observable<Bitacora> {
    const formData = new FormData();
    formData.append('titulo', bitacora.titulo);

    if (bitacora.descripcion) {
      formData.append('descripcion', bitacora.descripcion);
    }

    // Usar la fecha formateada en lugar de toISOString()
    formData.append('fecha', fechaFormateada || bitacora.fecha.toISOString());
    formData.append('categoria', bitacora.categoria);

    if (bitacora.camposAdicionales) {
      formData.append('camposAdicionales', JSON.stringify(bitacora.camposAdicionales));
    }

    if (image) {
      formData.append('imagen', image);
    }

    return this.http.post<Bitacora>(this.API_URL, formData).pipe(
      map(bitacora => this.processBitacoraDateFields(bitacora)),
      tap(newBitacora => {
        // Update the local cache
        const currentBitacoras = this.bitacorasSubject.value;
        this.bitacorasSubject.next([newBitacora, ...currentBitacoras]);

        // Invalidate filtered caches
        this.filteredBitacorasCache = {};
      }),
      catchError(error => {
        console.error('Error creating bitácora:', error);
        return throwError(() => new Error('Failed to create bitácora. Please try again later.'));
      })
    );
  }

  /**
   * Update an existing bitácora
   * @param id Bitácora ID
   * @param bitacora Updated bitácora data
   * @param image Optional new image file
   * @returns Observable of updated bitácora
   */
  updateBitacora(id: number, bitacora: Bitacora, image?: File, fechaFormateada?: string): Observable<Bitacora> {
    const formData = new FormData();
    formData.append('titulo', bitacora.titulo);

    if (bitacora.descripcion) {
      formData.append('descripcion', bitacora.descripcion);
    }

    // Usar la fecha formateada en lugar de toISOString()
    formData.append('fecha', fechaFormateada || bitacora.fecha.toISOString());
    formData.append('categoria', bitacora.categoria);

    if (bitacora.camposAdicionales) {
      formData.append('camposAdicionales', JSON.stringify(bitacora.camposAdicionales));
    }

    if (image) {
      formData.append('imagen', image);
    }

    return this.http.put<Bitacora>(`${this.API_URL}/${id}`, formData).pipe(
      map(bitacora => this.processBitacoraDateFields(bitacora)),
      tap(updatedBitacora => {
        // Update the local cache
        const currentBitacoras = this.bitacorasSubject.value;
        const index = currentBitacoras.findIndex(b => b.id === updatedBitacora.id);

        if (index !== -1) {
          const updatedBitacoras = [...currentBitacoras];
          updatedBitacoras[index] = updatedBitacora;
          this.bitacorasSubject.next(updatedBitacoras);
        }

        // Invalidate filtered caches
        this.filteredBitacorasCache = {};
      }),
      catchError(error => {
        console.error(`Error updating bitácora ID ${id}:`, error);
        return throwError(() => new Error('Failed to update bitácora. Please try again later.'));
      })
    );
  }

  /**
   * Delete a bitácora
   * @param id Bitácora ID
   * @returns Observable of the operation result
   */
  deleteBitacora(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        // Update the local cache
        const currentBitacoras = this.bitacorasSubject.value;
        const updatedBitacoras = currentBitacoras.filter(b => b.id !== id);
        this.bitacorasSubject.next(updatedBitacoras);

        // Invalidate filtered caches
        this.filteredBitacorasCache = {};
      }),
      catchError(error => {
        console.error(`Error deleting bitácora ID ${id}:`, error);
        return throwError(() => new Error('Failed to delete bitácora. Please try again later.'));
      })
    );
  }

  /**
   * Get full image URL from a stored image path
   * @param imagePath Relative image path
   * @returns Absolute URL to the image
   */
  getImageUrl(imagePath: string): string {
    if (!imagePath) {
      return '';
    }

    // Check if the URL is already absolute
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    return `http://localhost:8080/bitacoras-images/${imagePath}`;
  }

  /**
   * Process date fields in a bitácora to convert strings to Date objects
   * @param bitacora Bitácora with string dates
   * @returns Bitácora with Date objects
   */
  private processBitacoraDateFields(bitacora: any): Bitacora {
    return {
      ...bitacora,
      fecha: bitacora.fecha ? new Date(bitacora.fecha) : new Date(),
      createdAt: bitacora.createdAt ? new Date(bitacora.createdAt) : undefined
    };
  }

  /**
   * Process date fields in an array of bitácoras
   * @param bitacoras Array of bitácoras with string dates
   * @returns Array of bitácoras with Date objects
   */
  private processBitacorasDateFields(bitacoras: any[]): Bitacora[] {
    return bitacoras.map(b => this.processBitacoraDateFields(b));
  }

  /**
   * Reset cached data (useful after operaciones importantes)
   */
  resetCache(): void {
    this.dataLoaded = false;
    this.filteredBitacorasCache = {};
  }
}
