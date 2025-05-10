import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User, LoginRequest, SignupRequest, AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api/auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    // Obtener el usuario del localStorage al iniciar
    const storedUser = localStorage.getItem('currentUser');

    // Inicializar el BehaviorSubject con el usuario almacenado o null
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );

    // Exponer el observable para que los componentes puedan suscribirse
    this.currentUser = this.currentUserSubject.asObservable();

    // Log para depuración
    console.log('AuthService iniciado, usuario almacenado:',
      storedUser ? JSON.parse(storedUser)?.username : 'ninguno');
  }

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
            roles: response.roles,
            token: token
          };

          // Guardar en localStorage
          localStorage.setItem('currentUser', JSON.stringify(user));
          console.log('Usuario guardado en localStorage');

          // Actualizar el estado
          this.currentUserSubject.next(user);

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
}
