import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User, LoginRequest, SignupRequest, AuthResponse, UserScore } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  
  // NUEVO: Sistema de caché para la puntuación
  private scoreCache: { value: number; timestamp: number } | null = null;
  private readonly CACHE_DURATION = 5000; // 5 segundos en milisegundos

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Intentar recuperar el usuario del localStorage al iniciar
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();

    // Log para depuración
    console.log('AuthService iniciado, usuario almacenado:',
      storedUser ? JSON.parse(storedUser)?.username : 'ninguno');
  }

  /**
   * Obtener el valor actual del usuario
   */
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  signup(request: SignupRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/signup`, request);
  }

  login(request: LoginRequest): Observable<User> {
    console.log('Intentando login con:', request.username);

    return this.http.post<AuthResponse>(`${this.API_URL}/signin`, request)
      .pipe(
        map(response => {
          console.log('Respuesta completa del login:', response);

          // Verificar que recibimos un token
          if (!response.token) {
            console.error('No se recibió token en la respuesta');
            throw new Error('No se recibió un token válido del servidor');
          }

          // Asegurar formato correcto del token
          const token = response.token.startsWith('Bearer ')
            ? response.token
            : `Bearer ${response.token}`;

          console.log('Token formateado: ' + token.substring(0, 20) + '...');

          // Crear usuario y guardarlo
          const user: User = {
            id: response.id,
            username: response.username,
            email: response.email,
            name: response.name || response.username,
            puntuacion: 0, // Inicializar puntuación en 0
            roles: response.roles,
            token: token
          };

          // Guardar en localStorage
          localStorage.setItem('currentUser', JSON.stringify(user));
          console.log('Usuario guardado en localStorage');

          // Actualizar el estado
          this.currentUserSubject.next(user);

          // NUEVO: Invalidar caché al hacer login
          this.invalidateScoreCache();

          return user;
        })
      );
  }

  logout(): void {
    // Eliminar usuario del localStorage
    localStorage.removeItem('currentUser');

    // Actualizar el BehaviorSubject
    this.currentUserSubject.next(null);

    console.log('Usuario desconectado');

    // NUEVO: Limpiar caché
    this.scoreCache = null;

    // Redirigir al login
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const user = this.currentUserValue;
    return !!user && !!user.token;
  }

  refreshToken(): Observable<any> {
    return new Observable(observer => {
      observer.next(null);
      observer.complete();
    });
  }

  /**
   * Obtener la puntuación actual del usuario
   */
  getUserScore(): Observable<UserScore> {
    // Verificar si el caché es válido
    const now = Date.now();
    if (this.scoreCache && (now - this.scoreCache.timestamp) < this.CACHE_DURATION) {
      console.log('Devolviendo puntuación desde caché:', this.scoreCache.value);
      return of({ 
        message: 'Puntuación obtenida desde caché',
        puntuacion: this.scoreCache.value 
      });
    }
    
    // Si no hay caché válido, hacer la llamada HTTP
    console.log('Obteniendo puntuación desde el servidor...');
    return this.http.get<UserScore>(`${this.API_URL}/user/score`).pipe(
      tap(response => {
        // Actualizar el caché
        this.scoreCache = { 
          value: response.puntuacion, 
          timestamp: now 
        };
        console.log('Puntuación almacenada en caché:', response.puntuacion);
      })
    );
  }

  /**
   * Actualizar la puntuación del usuario actual en el estado local
   */
  updateUserScore(nuevaPuntuacion: number): void {
    const currentUser = this.currentUserValue;
    if (currentUser) {
      const updatedUser = { ...currentUser, puntuacion: nuevaPuntuacion };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
      
      // NUEVO: Actualizar también el caché
      this.scoreCache = {
        value: nuevaPuntuacion,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Obtener la puntuación del usuario actual desde el estado local
   */
  getCurrentUserScore(): number {
    const currentUser = this.currentUserValue;
    return currentUser?.puntuacion || 0;
  }

  /**
   * NUEVO: Invalidar el caché de puntuación
   * Útil cuando sabemos que la puntuación ha cambiado
   */
  invalidateScoreCache(): void {
    this.scoreCache = null;
    console.log('Caché de puntuación invalidado');
  }
}
