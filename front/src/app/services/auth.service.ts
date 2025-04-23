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
    const storedUser = localStorage.getItem('currentUser');
    console.log('Usuario almacenado en localStorage:', storedUser);

    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    const user = this.currentUserSubject.value;
    console.log('Obteniendo currentUserValue:', user);
    return user;
  }

  signup(request: SignupRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/signup`, request);
  }

  login(request: LoginRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${this.API_URL}/signin`, request)
      .pipe(
        map(response => {
          console.log('Respuesta completa del login:', response);

          // Crear objeto de usuario con los datos recibidos
          const user: User = {
            id: response.id,
            username: response.username,
            email: response.email,
            name: response.name || response.username,
            roles: response.roles,
            token: response.token
          };

          console.log('Usuario creado para almacenar:', user);

          // Guardar usuario en localStorage
          localStorage.setItem('currentUser', JSON.stringify(user));
          console.log('Usuario guardado en localStorage');

          this.currentUserSubject.next(user);
          return user;
        })
      );
  }

  logout(): void {
    console.log('Cerrando sesión y eliminando usuario de localStorage');
    // Eliminar usuario de localStorage
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    const user = this.currentUserValue;
    const isLoggedIn = !!user && !!user.token;
    console.log('isLoggedIn:', isLoggedIn, 'User:', user);
    return isLoggedIn;
  }

  isAdmin(): boolean {
    return this.currentUserValue?.roles.includes('ROLE_ADMIN') || false;
  }
}
