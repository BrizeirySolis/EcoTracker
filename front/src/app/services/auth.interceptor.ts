// front/src/app/services/auth.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Log de depuración
  console.log(`Interceptando solicitud a: ${req.url}`);

  // Obtener el usuario actual desde localStorage directamente para verificar
  const storedUser = localStorage.getItem('currentUser');
  console.log('Usuario en localStorage:', storedUser ? 'Presente' : 'Ausente');

  // Verificar también a través del servicio
  const currentUser = authService.currentUserValue;
  console.log('Usuario en servicio:', currentUser ? 'Presente' : 'Ausente');

  // Solo para solicitudes a la API
  if (req.url.includes('/api/')) {
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user && user.token) {
        const authToken = user.token.startsWith('Bearer ') ? user.token : `Bearer ${user.token}`;

        console.log(`Añadiendo token a solicitud: ${authToken.substring(0, 20)}...`);

        const authReq = req.clone({
          headers: req.headers.set('Authorization', authToken)
        });

        return next(authReq).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              console.error('Error 401: Token inválido o expirado');
              // Limpiamos el localStorage y redirigimos al login
              localStorage.removeItem('currentUser');
              authService.logout();
              router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
            }
            return throwError(() => error);
          })
        );
      }
    }
  }

  console.log('Solicitud sin token de autorización');
  return next(req);
};
