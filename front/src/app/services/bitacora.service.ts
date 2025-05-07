import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, BehaviorSubject, throwError} from 'rxjs';
import {map, catchError, tap} from 'rxjs/operators';
import {Bitacora, Categoria, CATEGORIAS} from '../models/bitacora.model';

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

  // Exposed observable for components to subscribe to
  public bitacoras$ = this.bitacorasSubject.asObservable();

  // Track if data has been loaded to avoid redundant requests
  private dataLoaded = false;

  constructor(private http: HttpClient) {
  }

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

    console.log('BitacoraService: Solicitando bitácoras, forzarRefresh:', forceRefresh,
      'categoría:', categoria);

    // Return cached data if available and no refresh requested
    if (this.dataLoaded && !forceRefresh && !categoria) {
      return this.bitacoras$;
    }

    // Build query parameters
    let params = new HttpParams();
    if (categoria) {
      params = params.set('categoria', categoria);
    }

    return this.http.get<Bitacora[]>(this.API_URL, {params}).pipe(
      map(bitacoras => {
        const processed = this.processBitacorasDateFields(bitacoras);
        console.log('BitacoraService: Respuesta del servidor procesada, total bitácoras:',
          processed.length);
        console.log('BitacoraService: Ejemplo de la primera bitácora (si existe):',
          processed.length > 0 ? {
            id: processed[0].id,
            titulo: processed[0].titulo,
            fecha_tipo: typeof processed[0].fecha,
            fecha_valor: processed[0].fecha
          } : 'No hay bitácoras');
        return processed;
      }),
      catchError(error => {
        console.error('Error fetching bitácoras:', error);
        return throwError(() => new Error('Failed to load bitácoras. Please try again later.'));
      })
    );
  }

  /**
   * Get a specific bitácora by ID
   * @param id Bitácora ID
   * @returns Observable of single bitácora
   */
  /**
   * Get a specific bitácora by ID
   * @param id Bitácora ID
   * @returns Observable of single bitácora
   */
  getBitacoraById(id: number): Observable<Bitacora> {
    // Validar ID antes de hacer la solicitud
    if (id === undefined || id === null || isNaN(id) || id <= 0) {
      console.error('ID de bitácora inválido:', id, typeof id);
      return throwError(() => new Error('ID de bitácora inválido'));
    }

    // Convertir explícitamente a número para asegurar el tipo correcto
    const numericId = Number(id);

    console.log('BitacoraService: Solicitando bitácora por ID:', numericId, typeof numericId);

    return this.http.get<Bitacora>(`${this.API_URL}/${numericId}`).pipe(
      map(bitacora => {
        console.log('BitacoraService: Bitácora obtenida del servidor:', bitacora?.id, typeof bitacora?.id);
        return this.processBitacoraDateFields(bitacora);
      }),
      catchError(error => {
        console.error(`Error fetching bitácora ID ${numericId}:`, error);
        return throwError(() => new Error('No se pudo cargar la bitácora solicitada. Por favor, intente de nuevo más tarde.'));
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
  /**
   * Process date fields in a bitácora to convert strings to Date objects
   * Also ensures ID is a proper number
   * @param bitacora Bitácora with string dates
   * @returns Bitácora with Date objects and properly typed ID
   */
  private processBitacoraDateFields(bitacora: any): Bitacora {
    // Log para depuración
    console.log('processBitacoraDateFields - ID antes de procesar:', bitacora?.id, typeof bitacora?.id);

    // Procesamos el ID para asegurar que sea un número válido
    let processedId: number | undefined = undefined;

    if (bitacora?.id !== undefined && bitacora?.id !== null) {
      processedId = Number(bitacora.id);
      if (isNaN(processedId)) {
        console.warn('ID de bitácora no es un número válido:', bitacora.id, typeof bitacora.id);
        processedId = undefined;
      }
    }

    // Log para depuración
    console.log('processBitacoraDateFields - ID después de procesar:', processedId, typeof processedId);

    return {
      ...bitacora,
      id: processedId, // ID procesado como número
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
}
