import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.model';
import { Subscription, interval } from 'rxjs';

/**
 * Navbar component that provides navigation for the application
 * This component is used in the main app layout
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar">
      <div class="brand">
        <a routerLink="/home">EcoTracker</a>
      </div>

      <ul class="nav-items">
        <li><a routerLink="/home" routerLinkActive="active">Home</a></li>
        <li *ngIf="isLoggedIn"><a routerLink="/habitos" routerLinkActive="active">Hábitos</a></li>
        <li *ngIf="isLoggedIn"><a routerLink="/bitacoras" routerLinkActive="active">Bitacoras</a></li>
        <li *ngIf="isLoggedIn"><a routerLink="/metas" routerLinkActive="active">Metas</a></li>
        <li *ngIf="isLoggedIn"><a routerLink="/educacion" routerLinkActive="active">Eduacación</a></li>
      </ul>

      <div class="auth-section">
        <ng-container *ngIf="!isLoggedIn">
          <a routerLink="/login" class="auth-link">Iniciar sesión</a>
          <a routerLink="/register" class="auth-link register">Registrarse</a>
        </ng-container>

        <div *ngIf="isLoggedIn" class="user-menu">
          <!-- Mostrar puntuación -->
          <div class="user-score">
            <span class="score-icon">⭐</span>
            <span class="score-value">{{ userScore }}</span>
            <span class="score-label">pts</span>
          </div>
          
          <div class="user-info" (click)="toggleUserMenu()">
            <span>{{ currentUser?.name }}</span>
            <span class="dropdown-icon">▼</span>
          </div>

          <div class="dropdown-menu" *ngIf="showUserMenu">
            <a routerLink="/profile">Mi Perfil</a>
            <a (click)="logout()" class="logout-link">Cerrar Sesión</a>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: `
    .navbar {
      background-color: #00b359;
      padding: 16px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand {
      font-size: 1.5rem;
      font-weight: bold;
    }

    .brand a {
      color: white;
      text-decoration: none;
    }

    .nav-items {
      display: flex;
      list-style-type: none;
      margin: 0;
      padding: 0;
    }

    .nav-items li {
      margin-right: 24px;
    }

    .nav-items a {
      color: white;
      text-decoration: none;
      font-weight: bold;
      font-size: 1.2rem;
    }

    .active {
      text-decoration: underline !important;
    }

    .auth-section {
      display: flex;
      align-items: center;
    }

    .auth-link {
      color: white;
      text-decoration: none;
      margin-left: 20px;
      font-weight: bold;
      padding: 8px 16px;
    }

    .auth-link.register {
      background-color: white;
      color: #00b359;
      border-radius: 20px;
    }

    .user-menu {
      position: relative;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .user-score {
      display: flex;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.15);
      padding: 6px 12px;
      border-radius: 16px;
      font-weight: bold;
      gap: 4px;
    }

    .score-icon {
      font-size: 1.2rem;
    }

    .score-value {
      font-size: 1.1rem;
      color: #FFD700;
    }

    .score-label {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 8px 16px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
    }

    .dropdown-icon {
      margin-left: 8px;
      font-size: 0.8rem;
    }

    .dropdown-menu {
      position: absolute;
      right: 0;
      top: 100%;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      min-width: 150px;
      z-index: 100;
      margin-top: 8px;
    }

    .dropdown-menu a {
      display: block;
      padding: 12px 16px;
      color: #333;
      text-decoration: none;
      transition: background-color 0.3s;
    }

    .dropdown-menu a:hover {
      background-color: #f5f5f5;
    }

    .logout-link {
      color: #e53935 !important;
      border-top: 1px solid #eee;
      cursor: pointer;
    }

    @media (max-width: 768px) {
      .navbar {
        flex-direction: column;
        align-items: flex-start;
      }

      .nav-items {
        margin-top: 16px;
        width: 100%;
        flex-wrap: wrap;
      }

      .nav-items li {
        margin-bottom: 8px;
      }

      .auth-section {
        margin-top: 16px;
        width: 100%;
        justify-content: flex-end;
      }

      .user-menu {
        flex-direction: column;
        gap: 8px;
      }
    }
  `
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  currentUser: User | null = null;
  showUserMenu = false;
  userScore = 0;
  private subscriptions: Subscription = new Subscription();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Suscribirse a los cambios en el estado de autenticación
    this.subscriptions.add(
      this.authService.currentUser.subscribe(
        user => {
          this.currentUser = user;
          this.isLoggedIn = !!user;
          this.userScore = user?.puntuacion || 0;
          
          // Obtener puntuación actualizada del servidor si el usuario está logueado
          if (user) {
            this.updateUserScore();
          }
        }
      )
    );

    // Actualizar puntuación cada 30 segundos si el usuario está logueado
    this.subscriptions.add(
      interval(30000).subscribe(() => {
        if (this.isLoggedIn) {
          this.updateUserScore();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private updateUserScore(): void {
    this.authService.getUserScore().subscribe({
      next: (response) => {
        this.userScore = response.puntuacion;
        this.authService.updateUserScore(response.puntuacion);
      },
      error: (error) => {
        console.error('Error al obtener puntuación:', error);
      }
    });
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/home'; // Recargar la aplicación
  }
}
