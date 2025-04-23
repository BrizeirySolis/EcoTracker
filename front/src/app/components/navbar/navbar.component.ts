import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.model';

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
    }
  `
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  currentUser: User | null = null;
  showUserMenu = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Suscribirse a los cambios en el estado de autenticación
    this.authService.currentUser.subscribe(
      user => {
        this.currentUser = user;
        this.isLoggedIn = !!user;
      }
    );
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/home'; // Recargar la aplicación
  }
}
