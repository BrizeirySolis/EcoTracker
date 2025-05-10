import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Bitacora, Categoria, CATEGORIAS } from '../models/bitacora.model';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

/**
 * Service for managing Bitácora operations
 * Handles all API interactions for environmental activity logs
 */
@Injectable({
  providedIn: 'root'
})
export class BitacoraService {
  private readonly API_URL = 'http://localhost:8080/api/bitacoras';
  private bitacorasSubject = new BehaviorSubject<Bitacora[]>([]);
  public bitacoras$ = this.bitacorasSubject.asObservable();
  private dataLoaded = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) { }

  private getAuthHeaders(): HttpHeaders {
    // Obtener el usuario directamente del localStorage para mayor seguridad
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user && user.token) {
        const token = user.token.startsWith('Bearer ') ? user.token : `Bearer ${user.token}`;
        console.log('Usando token para solicitud: ' + token.substring(0, 20) + '...');
        return new HttpHeaders().set('Authorization', token);
      }
    }

    console.warn('No se encontró token para la solicitud');
    return new HttpHeaders();
  }

  getCategorias(): Observable<Record<string, string>> {
    const headers = this.getAuthHeaders();
    return this.http.get<Record<string, string>>(`${this.API_URL}/categorias`, { headers }).pipe(
      catchError(error => {
        console.error('Error al obtener categorías:', error);
        if (error.status === 401) {
          this.handleAuthError();
        }
        return throwError(() => new Error('Error al obtener categorías'));
      })
    );
  }

  getAllBitacoras(forceRefresh = false, categoria?: string): Observable<Bitacora[]> {
    if (this.dataLoaded && !forceRefresh && !categoria) {
      return this.bitacoras$;
    }

    let params = new HttpParams();
    if (categoria) {
      params = params.set('categoria', categoria);
    }

    const headers = this.getAuthHeaders();
    console.log('Solicitando bitácoras con headers:', headers);

    return this.http.get<Bitacora[]>(this.API_URL, { headers, params }).pipe(
      map(bitacoras => this.processBitacorasDateFields(bitacoras)),
      tap(bitacoras => {
        if (!categoria) {
          this.bitacorasSubject.next(bitacoras);
          this.dataLoaded = true;
        }
      }),
      catchError(error => {
        console.error('Error al obtener bitácoras:', error);
        if (error.status === 401) {
          this.handleAuthError();
        }
        return throwError(() => new Error('Error al cargar las bitácoras'));
      })
    );
  }

  private handleAuthError(): void {
    console.error('Error de autenticación detectado');
    this.authService.logout();
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.router.url }
    });
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
  deleteBitacora(id: number): Observable<boolean> {
    // First, check if the bitácora exists in our local cache
    const currentBitacoras = this.bitacorasSubject.value;
    const bitacoraExists = currentBitacoras.some(b => b.id === id);

    if (!bitacoraExists) {
      console.warn(`Attempting to delete bitácora ID ${id} which is not in local cache`);
    }

    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      // Map to boolean for success indicator
      map(() => true),

      // Update internal state on success
      tap(() => {
        console.log(`Bitácora ID ${id} deleted successfully on server`);

        // Only update the local cache if we have data
        if (currentBitacoras.length > 0) {
          const updatedBitacoras = currentBitacoras.filter(b => b.id !== id);

          // Force a new array reference to trigger change detection
          this.bitacorasSubject.next([...updatedBitacoras]);

          console.log(`Local cache updated, removed bitácora ID ${id}`);

          // Force data loaded status to ensure subscribers get updated
          this.dataLoaded = true;
        }
      }),

      // Improved error handling
      catchError(error => {
        console.error(`Error deleting bitácora ID ${id}:`, error);

        // If it's an authorization error, provide a specific message
        if (error.status === 401 || error.status === 403) {
          return throwError(() => new Error('Error de autorización. Por favor, inicie sesión nuevamente.'));
        }

        return throwError(() => new Error('No se pudo eliminar la bitácora. Por favor, intente nuevamente.'));
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
