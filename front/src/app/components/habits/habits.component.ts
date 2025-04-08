import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

/**
 * Habits component that displays the available tracking options
 * for different types of ecological consumption
 */
@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="container">
      <div class="habits-grid">
        <div class="habit-card">
          <div class="icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64">
              <path d="M0 0h24v24H0z" fill="none"/>
              <path fill="#000" d="M4 16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-6H4v6zm16-10H4c-1.1 0-2 .9-2 2v2h20v-2c0-1.1-.9-2-2-2zm-5 4h4v4h-4v-4zm0 5h4v2h-4v-2z"/>
            </svg>
          </div>
          <h2>Transporte</h2>
          <a routerLink="/transporte" class="register-button">Registrar</a>
        </div>

        <div class="habit-card">
          <div class="icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64">
              <path d="M0 0h24v24H0z" fill="none"/>
              <path fill="#000" d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"/>
            </svg>
          </div>
          <h2>Luz</h2>
          <a routerLink="/luz" class="register-button">Registrar</a>
        </div>

        <div class="habit-card">
          <div class="icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64">
              <path d="M0 0h24v24H0z" fill="none"/>
              <path fill="#000" d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2zm-4-8c0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4-4 1.79-4 4z"/>
            </svg>
          </div>
          <h2>Agua</h2>
          <a routerLink="/agua" class="register-button">Registrar</a>
        </div>
      </div>
    </div>
  `,
  styles: `
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .habits-grid {
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      gap: 30px;
      margin-top: 40px;
    }

    .habit-card {
      background-color: #8AE68A;
      border-radius: 16px;
      padding: 30px;
      width: 250px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .icon-container {
      background-color: #8AE68A;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }

    .icon-container svg {
      width: 60px;
      height: 60px;
    }

    h2 {
      font-size: 1.5rem;
      margin-bottom: 30px;
      color: #333;
    }

    .register-button {
      background-color: #333;
      color: white;
      text-decoration: none;
      padding: 10px 30px;
      border-radius: 20px;
      font-weight: bold;
      transition: background-color 0.3s;
    }

    .register-button:hover {
      background-color: #555;
    }
  `
})
export class HabitsComponent {}
