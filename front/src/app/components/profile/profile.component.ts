import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container">
      <div class="profile-card">
        <h2>Mi Perfil</h2>

        <div class="profile-info" *ngIf="currentUser">
          <div class="profile-field">
            <label>Nombre:</label>
            <p>{{ currentUser.name }}</p>
          </div>

          <div class="profile-field">
            <label>Usuario:</label>
            <p>{{ currentUser.username }}</p>
          </div>

          <div class="profile-field">
            <label>Correo electrónico:</label>
            <p>{{ currentUser.email }}</p>
          </div>

          <div class="profile-field">
            <label>Roles:</label>
            <p>{{ currentUser.roles.join(', ') }}</p>
          </div>
        </div>

        <div class="actions">
          <button class="btn-primary">Editar Perfil</button>
          <button class="btn-danger" (click)="logout()">Cerrar Sesión</button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .profile-card {
      background-color: white;
      border-radius: 12px;
      padding: 30px;
      margin-top: 30px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #00b359;
    }

    .profile-info {
      margin-bottom: 30px;
    }

    .profile-field {
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }

    .profile-field label {
      display: block;
      font-weight: bold;
      color: #555;
      margin-bottom: 5px;
    }

    .profile-field p {
      margin: 0;
      font-size: 1.1rem;
    }

    .actions {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
    }

    .btn-primary, .btn-danger {
      padding: 12px 24px;
      border: none;
      border-radius: 24px;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-primary {
      background-color: #00b359;
      color: white;
    }

    .btn-primary:hover {
      background-color: #00833c;
    }

    .btn-danger {
      background-color: #e53935;
      color: white;
    }

    .btn-danger:hover {
      background-color: #c62828;
    }
  `
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}
