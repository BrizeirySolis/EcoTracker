import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SignupRequest } from '../../models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="register-form">
        <h2>Registro de Usuario</h2>

        <div class="alert alert-danger" *ngIf="error">
          {{ error }}
        </div>

        <div class="alert alert-success" *ngIf="success">
          {{ success }}
        </div>

        <div class="form-group">
          <label for="name">Nombre Completo</label>
          <input
            type="text"
            id="name"
            name="name"
            [(ngModel)]="signupRequest.name"
            class="form-control"
            required
          >
        </div>

        <div class="form-group">
          <label for="username">Nombre de Usuario</label>
          <input
            type="text"
            id="username"
            name="username"
            [(ngModel)]="signupRequest.username"
            class="form-control"
            required
          >
        </div>

        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            [(ngModel)]="signupRequest.email"
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
            [(ngModel)]="signupRequest.password"
            class="form-control"
            required
          >
        </div>

        <div class="button-group">
          <button (click)="register()" class="btn-register" [disabled]="loading">
            {{ loading ? 'Registrando...' : 'Registrarse' }}
          </button>
        </div>

        <div class="login-link">
          ¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión aquí</a>
        </div>
      </div>
    </div>
  `,
  styles: `
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 20px;
    }

    .register-form {
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

    .btn-register {
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

    .btn-register:hover {
      background-color: #00833c;
    }

    .btn-register:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    .login-link {
      margin-top: 20px;
      text-align: center;
    }

    .login-link a {
      color: #00b359;
      text-decoration: none;
      font-weight: bold;
    }

    .login-link a:hover {
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

    .alert-success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
  `
})
export class RegisterComponent {
  signupRequest: SignupRequest = {
    name: '',
    username: '',
    email: '',
    password: ''
  };
  loading = false;
  error = '';
  success = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    // Validación básica
    if (!this.signupRequest.name || !this.signupRequest.username ||
      !this.signupRequest.email || !this.signupRequest.password) {
      this.error = 'Por favor, completa todos los campos';
      this.loading = false;
      return;
    }

    this.authService.signup(this.signupRequest)
      .subscribe({
        next: response => {
          this.success = 'Registro exitoso. Ahora puedes iniciar sesión.';
          this.loading = false;
          // Redirigir a login después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: error => {
          this.error = error.error?.message || 'Error en el registro. Inténtalo de nuevo.';
          this.loading = false;
        }
      });
  }
}
