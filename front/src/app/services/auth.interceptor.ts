// src/app/services/auth.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

// Interceptor en formato funcional para Angular 17
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Inyectamos el servicio de autenticación
  const authService = inject(AuthService);

  console.log('Interceptando solicitud a:', req.url);

  // Obtenemos el usuario actual
  const currentUser = authService.currentUserValue;

  // Si hay un usuario logueado y tiene token, añadirlo a la solicitud
  if (currentUser && currentUser.token) {
    console.log('Token encontrado, añadiendo a la solicitud');

    // Asegurarse de que el token tenga el prefijo Bearer
    const authToken = currentUser.token.startsWith('Bearer ')
      ? currentUser.token
      : `Bearer ${currentUser.token}`;

    // Clonar la solicitud y añadir el token con formato correcto
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: authToken
      }
    });

    // Verificar que la cabecera se ha añadido correctamente
    console.log('Authorization header añadido:',
      clonedRequest.headers.get('Authorization')?.substring(0, 25) + '...');

    return next(clonedRequest);
  }

  // Si no hay token, continuar sin modificar la solicitud
  console.log('No hay token disponible, continuando sin Authorization');
  return next(req);
};
