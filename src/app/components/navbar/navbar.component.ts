import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/**
 * Navbar component that provides navigation for the application
 * This component is used in the main app layout
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <ul class="nav-items">
        <li><a routerLink="/home" routerLinkActive="active">Home</a></li>
        <li><a routerLink="/habitos" routerLinkActive="active">Hábitos</a></li>
        <li><a routerLink="/bitacoras" routerLinkActive="active">Bitacoras</a></li>
        <li><a routerLink="/metas" routerLinkActive="active">Metas</a></li>
        <li><a routerLink="/educacion" routerLinkActive="active">Eduacación</a></li>
      </ul>
    </nav>
  `,
  styles: `
    .navbar {
      background-color: #00b359;
      padding: 16px;
      color: white;
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
  `
})
export class NavbarComponent {}
