import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Verificar si el usuario está autenticado
    if (this.authService.isLoggedIn()) {
      // Verificar permisos de rol si es necesario
      if (route.data['roles'] && route.data['roles'].length) {
        const userRoles = this.authService.currentUserValue?.roles || [];
        const requiredRoles = route.data['roles'];

        // Verificar si el usuario tiene alguno de los roles requeridos
        const hasRequiredRole = requiredRoles.some((role: string) => userRoles.includes(role));

        if (!hasRequiredRole) {
          // Si no tiene los permisos, redirigir a la página de inicio
          this.router.navigate(['/home']);
          return false;
        }
      }

      // Autorizado
      return true;
    }

    // No autenticado, redirigir a login
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
