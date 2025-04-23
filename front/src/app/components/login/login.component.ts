import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { first } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-form">
        <h2>Iniciar Sesión</h2>

        <div class="alert alert-danger" *ngIf="error">
          {{ error }}
        </div>

        <div class="form-group">
          <label for="username">Usuario</label>
          <input
            type="text"
            id="username"
            name="username"
            [(ngModel)]="loginRequest.username"
            class="form-control"
            required
          >
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            [(ngModel)]="loginRequest.password"
            class="form-control"
            required
          >
        </div>

        <div class="button-group">
          <button (click)="login()" class="btn-login" [disabled]="loading">
            {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>
        </div>

        <div class="register-link">
          ¿No tienes cuenta? <a routerLink="/register">Regístrate aquí</a>
        </div>
      </div>
    </div>
  `,
  styles: `
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 20px;
    }

    .login-form {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 30px;
      width: 100%;
      max-width: 450px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #00b359;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: bold;
      color: #333;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      background-color: #fff;
      font-size: 1rem;
    }

    .button-group {
      margin-top: 30px;
    }

    .btn-login {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 6px;
      background-color: #00b359;
      color: white;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-login:hover {
      background-color: #00833c;
    }

    .btn-login:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    .register-link {
      margin-top: 20px;
      text-align: center;
    }

    .register-link a {
      color: #00b359;
      text-decoration: none;
      font-weight: bold;
    }

    .register-link a:hover {
      text-decoration: underline;
    }

    .alert {
      padding: 12px;
      margin-bottom: 20px;
      border-radius: 6px;
    }

    .alert-danger {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
  `
})
export class LoginComponent implements OnInit {
  loginRequest: LoginRequest = {
    username: '',
    password: ''
  };
  loading = false;
  error = '';
  returnUrl: string = '/home';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener la URL de retorno o usar la homepage como predeterminada
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';

    // Si ya está autenticado, redirigir a la homepage
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }
  }

  login(): void {
    this.loading = true;
    this.error = '';

    if (!this.loginRequest.username || !this.loginRequest.password) {
      this.error = 'Por favor, completa todos los campos';
      this.loading = false;
      return;
    }

    this.authService.login(this.loginRequest)
      .pipe(first())
      .subscribe({
        next: () => {
          this.router.navigate([this.returnUrl]);
        },
        error: error => {
          this.error = error.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }
}
